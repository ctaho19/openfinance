import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { DebtType, BillCategory } from "@prisma/client";
import { generatePaymentSchedule, calculateEffectiveAPR } from "@/lib/bnpl-utils";

const debtTypeToBillCategory: Record<DebtType, BillCategory> = {
  [DebtType.CREDIT_CARD]: BillCategory.CREDIT_CARD,
  [DebtType.AUTO_LOAN]: BillCategory.LOAN,
  [DebtType.STUDENT_LOAN]: BillCategory.LOAN,
  [DebtType.PERSONAL_LOAN]: BillCategory.LOAN,
  [DebtType.BNPL]: BillCategory.BNPL,
  [DebtType.MORTGAGE]: BillCategory.LOAN,
  [DebtType.OTHER]: BillCategory.OTHER,
};

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Get sort parameter: 'apr' (default), 'effective', or 'balance'
  const sortBy = request.nextUrl.searchParams.get("sortBy") || "effective";

  let orderBy: Record<string, "asc" | "desc">;
  switch (sortBy) {
    case "apr":
      orderBy = { interestRate: "desc" };
      break;
    case "balance":
      orderBy = { currentBalance: "desc" };
      break;
    case "effective":
    default:
      // Sort by effective rate first, then stated APR
      // We'll sort in memory since effectiveRate can be null
      orderBy = { interestRate: "desc" };
      break;
  }

  const debts = await prisma.debt.findMany({
    where: { userId: session.user.id },
    orderBy,
  });

  // For effective rate sorting, sort in memory using the higher of effectiveRate or interestRate
  if (sortBy === "effective") {
    debts.sort((a, b) => {
      const aRate = Math.max(
        Number(a.effectiveRate) || 0,
        Number(a.interestRate) || 0
      );
      const bRate = Math.max(
        Number(b.effectiveRate) || 0,
        Number(b.interestRate) || 0
      );
      return bRate - aRate; // descending
    });
  }

  return NextResponse.json(debts);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const {
    name,
    type,
    currentBalance,
    originalBalance,
    interestRate,
    minimumPayment,
    dueDay,
    notes,
    numberOfPayments,
    firstPaymentDate,
    paymentFrequency,
    bankAccountId,
    totalRepayable,
  } = body;

  if (!name || !type || currentBalance === undefined || originalBalance === undefined || interestRate === undefined || minimumPayment === undefined || dueDay === undefined) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  if (!Object.values(DebtType).includes(type)) {
    return NextResponse.json({ error: "Invalid debt type" }, { status: 400 });
  }

  const isBNPL = type === DebtType.BNPL;

  if (isBNPL && (!numberOfPayments || !firstPaymentDate || !paymentFrequency)) {
    return NextResponse.json({ error: "BNPL debts require numberOfPayments, firstPaymentDate, and paymentFrequency" }, { status: 400 });
  }

  // Calculate effective rate for BNPL if total repayable is provided
  let effectiveRate = null;
  if (isBNPL && totalRepayable && totalRepayable !== currentBalance) {
    effectiveRate = calculateEffectiveAPR({
      principal: currentBalance,
      totalRepayable,
      numberOfPayments,
      frequency: paymentFrequency as 'weekly' | 'biweekly' | 'monthly',
    });
  }

  const debt = await prisma.debt.create({
    data: {
      userId: session.user.id,
      name,
      type,
      currentBalance,
      originalBalance,
      interestRate,
      effectiveRate,
      totalRepayable: totalRepayable || null,
      minimumPayment,
      dueDay,
      notes: notes || null,
      bankAccountId: bankAccountId || null,
    },
  });

  if (!isBNPL) {
    await prisma.bill.create({
      data: {
        userId: session.user.id,
        name: `${name} Payment`,
        category: debtTypeToBillCategory[type as DebtType],
        amount: minimumPayment,
        dueDay,
        isRecurring: true,
        frequency: "MONTHLY",
        debtId: debt.id,
        notes: `Auto-generated bill for ${name}`,
      },
    });
  }

  if (isBNPL) {
    const schedule = generatePaymentSchedule({
      totalAmount: currentBalance,
      numberOfPayments,
      firstPaymentDate: new Date(firstPaymentDate + "T00:00:00"),
      frequency: paymentFrequency as 'weekly' | 'biweekly' | 'monthly',
    });

    // Create scheduled payments for tracking
    for (let i = 0; i < schedule.paymentDates.length; i++) {
      const paymentDate = schedule.paymentDates[i];

      await prisma.scheduledPayment.create({
        data: {
          debtId: debt.id,
          dueDate: paymentDate,
          amount: schedule.paymentAmount,
          notes: `Payment ${i + 1} of ${numberOfPayments}`,
        },
      });
    }

    // Create bills for bill tracking
    for (let i = 0; i < schedule.paymentDates.length; i++) {
      const paymentDate = schedule.paymentDates[i];
      const paymentNumber = i + 1;

      const bill = await prisma.bill.create({
        data: {
          userId: session.user.id,
          name: `${name} - Payment ${paymentNumber} of ${numberOfPayments}`,
          category: "BNPL",
          amount: schedule.paymentAmount,
          dueDay: paymentDate.getDate(),
          isRecurring: false,
          frequency: "ONCE",
          debtId: debt.id,
          notes: `Auto-generated BNPL payment for ${name}`,
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
  }

  return NextResponse.json(debt, { status: 201 });
}
