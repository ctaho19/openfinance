import { prisma } from "@/lib/db";
import type { BillPayment, Bill } from "@prisma/client";

export {
  getCurrentPayPeriod,
  getNextPayPeriod,
  getPreviousPayPeriod,
  getPayPeriodForDate,
  getPayPeriods,
  isDateInPayPeriod,
  formatPayPeriod,
  getDueDatesInPeriod,
  type PayPeriod,
} from "@/lib/pay-periods";

export type PaymentWithBill = BillPayment & {
  bill: Bill & {
    debt: { id: string; name: string; type: string; status: string } | null;
  };
};

export interface MarkPaymentResult {
  payment: BillPayment;
  debtUpdated: boolean;
}

export async function getPaymentsForPeriod(
  userId: string,
  startDate: Date,
  endDate: Date
): Promise<PaymentWithBill[]> {
  return prisma.billPayment.findMany({
    where: {
      bill: {
        userId,
        OR: [
          { debtId: null },
          {
            debt: {
              OR: [
                { status: { not: "DEFERRED" } },
                { deferredUntil: null },
                { deferredUntil: { lte: endDate } },
              ],
            },
          },
        ],
      },
      dueDate: {
        gte: startDate,
        lte: endDate,
      },
    },
    include: {
      bill: {
        include: {
          debt: {
            select: { id: true, name: true, type: true, status: true },
          },
        },
      },
    },
    orderBy: { dueDate: "asc" },
  });
}

export async function markPaymentPaid(
  userId: string,
  paymentId: string
): Promise<MarkPaymentResult> {
  const payment = await prisma.billPayment.findFirst({
    where: { id: paymentId },
    include: {
      bill: {
        include: { debt: true },
      },
    },
  });

  if (!payment) {
    throw new Error("Payment not found");
  }

  if (payment.bill.userId !== userId) {
    throw new Error("Unauthorized");
  }

  const paidAt = new Date();
  let debtUpdated = false;

  const result = await prisma.$transaction(async (tx) => {
    const updatedPayment = await tx.billPayment.update({
      where: { id: paymentId },
      data: {
        status: "PAID",
        paidAt,
      },
    });

    if (payment.bill.debtId && payment.bill.debt) {
      const debt = payment.bill.debt;
      const paymentAmount = Number(payment.amount);
      const interestRate = Number(debt.interestRate);
      const currentBalance = Number(debt.currentBalance);

      let interest = 0;
      let principal = paymentAmount;

      if (debt.type !== "BNPL" && interestRate > 0) {
        const monthlyRate = interestRate / 100 / 12;
        interest = Math.min(currentBalance * monthlyRate, paymentAmount);
        principal = paymentAmount - interest;
      }

      const newBalance = Math.max(0, currentBalance - principal);

      await tx.debtPayment.create({
        data: {
          debtId: debt.id,
          date: paidAt,
          amount: paymentAmount,
          principal,
          interest,
          newBalance,
          notes: `Auto-logged from bill payment: ${payment.bill.name}`,
        },
      });

      await tx.debt.update({
        where: { id: debt.id },
        data: { currentBalance: newBalance },
      });

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

      debtUpdated = true;
    }

    return updatedPayment;
  });

  return { payment: result, debtUpdated };
}

export async function markPaymentUnpaid(
  userId: string,
  paymentId: string
): Promise<BillPayment> {
  const payment = await prisma.billPayment.findFirst({
    where: { id: paymentId },
    include: {
      bill: true,
    },
  });

  if (!payment) {
    throw new Error("Payment not found");
  }

  if (payment.bill.userId !== userId) {
    throw new Error("Unauthorized");
  }

  return prisma.billPayment.update({
    where: { id: paymentId },
    data: {
      status: "UNPAID",
      paidAt: null,
    },
  });
}
