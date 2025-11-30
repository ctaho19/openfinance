import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const payment = await prisma.billPayment.findFirst({
    where: { id },
    include: {
      bill: {
        include: { debt: true },
      },
    },
  });

  if (!payment) {
    return NextResponse.json({ error: "Payment not found" }, { status: 404 });
  }

  if (payment.bill.userId !== session.user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { status } = body;
  const paidAt = status === "PAID" ? new Date() : null;

  // Use a transaction to update bill payment and optionally create debt payment
  const result = await prisma.$transaction(async (tx) => {
    const updatedPayment = await tx.billPayment.update({
      where: { id },
      data: {
        status,
        paidAt,
      },
      include: { bill: true },
    });

    // If bill is linked to a debt and we're marking as PAID, log a debt payment
    if (status === "PAID" && payment.bill.debtId && payment.bill.debt) {
      const debt = payment.bill.debt;
      const paymentAmount = Number(payment.amount);
      const interestRate = Number(debt.interestRate);
      const currentBalance = Number(debt.currentBalance);

      // Calculate interest/principal split based on debt type
      let interest = 0;
      let principal = paymentAmount;

      if (debt.type !== "BNPL" && interestRate > 0) {
        // For interest-bearing debts, calculate monthly interest
        const monthlyRate = interestRate / 100 / 12;
        interest = Math.min(currentBalance * monthlyRate, paymentAmount);
        principal = paymentAmount - interest;
      }

      const newBalance = Math.max(0, currentBalance - principal);

      // Create debt payment record
      await tx.debtPayment.create({
        data: {
          debtId: debt.id,
          date: paidAt!,
          amount: paymentAmount,
          principal,
          interest,
          newBalance,
          notes: `Auto-logged from bill payment: ${payment.bill.name}`,
        },
      });

      // Update debt balance
      await tx.debt.update({
        where: { id: debt.id },
        data: { currentBalance: newBalance },
      });

      // If BNPL, also mark the scheduled payment as paid if one exists for this date
      if (debt.type === "BNPL") {
        const scheduledPayment = await tx.scheduledPayment.findFirst({
          where: {
            debtId: debt.id,
            isPaid: false,
            dueDate: {
              gte: new Date(payment.dueDate.getTime() - 24 * 60 * 60 * 1000),
              lte: new Date(payment.dueDate.getTime() + 24 * 60 * 60 * 1000),
            },
          },
        });

        if (scheduledPayment) {
          await tx.scheduledPayment.update({
            where: { id: scheduledPayment.id },
            data: {
              isPaid: true,
              paidAt,
              paidAmount: paymentAmount,
            },
          });
        }
      }
    }

    return updatedPayment;
  });

  return NextResponse.json(result);
}
