import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { DebtType, DebtStatus } from "@prisma/client";
import { calculateEffectiveAPR, generatePaymentSchedule } from "@/lib/bnpl-utils";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const debt = await prisma.debt.findFirst({
    where: { id, userId: session.user.id },
  });

  if (!debt) {
    return NextResponse.json({ error: "Debt not found" }, { status: 404 });
  }

  return NextResponse.json(debt);
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const existing = await prisma.debt.findFirst({
    where: { id, userId: session.user.id },
  });

  if (!existing) {
    return NextResponse.json({ error: "Debt not found" }, { status: 404 });
  }

  const body = await request.json();
  const {
    name,
    type,
    status,
    currentBalance,
    originalBalance,
    interestRate,
    minimumPayment,
    dueDay,
    deferredUntil,
    notes,
    isActive,
    bankAccountId,
    totalRepayable,
    numberOfPayments,
    firstPaymentDate,
    paymentFrequency,
    regenerateSchedule,
  } = body;

  if (type && !Object.values(DebtType).includes(type)) {
    return NextResponse.json({ error: "Invalid debt type" }, { status: 400 });
  }

  if (status && !Object.values(DebtStatus).includes(status)) {
    return NextResponse.json({ error: "Invalid debt status" }, { status: 400 });
  }

  // Calculate effective rate for BNPL if total repayable is provided
  let effectiveRate = undefined;
  const isBNPL = (type || existing.type) === DebtType.BNPL;
  const balance = currentBalance !== undefined ? currentBalance : Number(existing.currentBalance);
  
  if (isBNPL && totalRepayable !== undefined) {
    if (totalRepayable && totalRepayable !== balance && numberOfPayments && paymentFrequency) {
      effectiveRate = calculateEffectiveAPR({
        principal: balance,
        totalRepayable,
        numberOfPayments,
        frequency: paymentFrequency as 'weekly' | 'biweekly' | 'monthly',
      });
    } else {
      effectiveRate = null;
    }
  }

  const debt = await prisma.debt.update({
    where: { id },
    data: {
      ...(name !== undefined && { name }),
      ...(type !== undefined && { type }),
      ...(status !== undefined && { status }),
      ...(currentBalance !== undefined && { currentBalance }),
      ...(originalBalance !== undefined && { originalBalance }),
      ...(interestRate !== undefined && { interestRate }),
      ...(effectiveRate !== undefined && { effectiveRate }),
      ...(totalRepayable !== undefined && { totalRepayable: totalRepayable || null }),
      ...(minimumPayment !== undefined && { minimumPayment }),
      ...(dueDay !== undefined && { dueDay }),
      ...(deferredUntil !== undefined && { deferredUntil: deferredUntil ? new Date(deferredUntil) : null }),
      ...(notes !== undefined && { notes }),
      ...(isActive !== undefined && { isActive }),
      ...(bankAccountId !== undefined && { bankAccountId: bankAccountId || null }),
    },
  });

  // Regenerate BNPL schedule if requested
  if (isBNPL && regenerateSchedule && numberOfPayments && firstPaymentDate && paymentFrequency) {
    const totalAmount = totalRepayable || balance;
    const schedule = generatePaymentSchedule({
      totalAmount,
      numberOfPayments,
      firstPaymentDate: new Date(firstPaymentDate + "T00:00:00"),
      frequency: paymentFrequency as 'weekly' | 'biweekly' | 'monthly',
    });

    // Delete existing scheduled payments (only unpaid ones)
    await prisma.scheduledPayment.deleteMany({
      where: { debtId: id, isPaid: false },
    });

    // Delete existing unpaid bills and their bill payments for this debt
    const existingBills = await prisma.bill.findMany({
      where: { debtId: id },
      include: { payments: { where: { status: "UNPAID" } } },
    });

    for (const bill of existingBills) {
      // Only delete bills that have unpaid payments
      if (bill.payments.length > 0) {
        await prisma.billPayment.deleteMany({
          where: { billId: bill.id, status: "UNPAID" },
        });
        // Check if bill has any remaining payments
        const remainingPayments = await prisma.billPayment.count({
          where: { billId: bill.id },
        });
        if (remainingPayments === 0) {
          await prisma.bill.delete({ where: { id: bill.id } });
        }
      }
    }

    // Create new scheduled payments and bills
    const debtName = name || existing.name;
    const debtBankAccountId = bankAccountId !== undefined ? bankAccountId : existing.bankAccountId;

    for (let i = 0; i < schedule.paymentDates.length; i++) {
      const paymentDate = schedule.paymentDates[i];
      const paymentNumber = i + 1;

      // Create scheduled payment
      await prisma.scheduledPayment.create({
        data: {
          debtId: id,
          dueDate: paymentDate,
          amount: schedule.paymentAmount,
          notes: `Payment ${paymentNumber} of ${numberOfPayments}`,
        },
      });

      // Create bill and bill payment
      const bill = await prisma.bill.create({
        data: {
          userId: session.user.id,
          name: `${debtName} - Payment ${paymentNumber} of ${numberOfPayments}`,
          category: "BNPL",
          amount: schedule.paymentAmount,
          dueDay: paymentDate.getDate(),
          isRecurring: false,
          frequency: "ONCE",
          debtId: id,
          bankAccountId: debtBankAccountId || null,
          notes: `Auto-generated BNPL payment for ${debtName}`,
        },
      });

      await prisma.billPayment.create({
        data: {
          billId: bill.id,
          dueDate: paymentDate,
          amount: schedule.paymentAmount,
          status: "UNPAID",
        },
      });
    }

    // Update debt's minimum payment to new payment amount
    await prisma.debt.update({
      where: { id },
      data: { minimumPayment: schedule.paymentAmount },
    });
  }

  return NextResponse.json(debt);
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const existing = await prisma.debt.findFirst({
    where: { id, userId: session.user.id },
  });

  if (!existing) {
    return NextResponse.json({ error: "Debt not found" }, { status: 404 });
  }

  await prisma.debt.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
