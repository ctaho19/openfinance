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
        isActive: true,
        OR: [
          // Non-debt bills always show
          { debtId: null },
          // Debt-linked bills: show only if debt is active and not currently deferred
          {
            debt: {
              isActive: true,
              OR: [
                // Debt is not deferred at all
                { status: { not: "DEFERRED" } },
                // Debt was deferred but deferral has ended (deferredUntil is before period start)
                {
                  status: "DEFERRED",
                  deferredUntil: { lte: startDate },
                },
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
        const dateStart = new Date(payment.dueDate);
        dateStart.setDate(dateStart.getDate() - 3);
        const dateEnd = new Date(payment.dueDate);
        dateEnd.setDate(dateEnd.getDate() + 3);

        const scheduledPayment = await tx.scheduledPayment.findFirst({
          where: {
            debtId: debt.id,
            isPaid: false,
            dueDate: {
              gte: dateStart,
              lte: dateEnd,
            },
          },
          orderBy: { dueDate: "asc" },
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

  return prisma.$transaction(async (tx) => {
    if (payment.bill.debtId && payment.paidAt) {
      const debtPayment = await tx.debtPayment.findFirst({
        where: { 
          debtId: payment.bill.debtId,
          date: payment.paidAt,
          amount: Number(payment.amount)
        },
        orderBy: { createdAt: 'desc' }
      });
      
      if (debtPayment) {
        await tx.debt.update({
          where: { id: payment.bill.debtId },
          data: { currentBalance: { increment: Number(debtPayment.principal) } }
        });
        await tx.debtPayment.delete({ where: { id: debtPayment.id } });
      }
    }

    return tx.billPayment.update({
      where: { id: paymentId },
      data: {
        status: "UNPAID",
        paidAt: null,
      },
    });
  });
}

// Known BNPL lender keywords for canonical name extraction
const LENDER_KEYWORDS: { key: string; label: string }[] = [
  { key: "affirm", label: "Affirm" },
  { key: "afterpay", label: "Afterpay" },
  { key: "klarna", label: "Klarna" },
  { key: "sezzle", label: "Sezzle" },
  { key: "zip", label: "Zip" },
  { key: "paypal", label: "PayPal Pay Later" },
  { key: "apple pay later", label: "Apple Pay Later" },
  { key: "quadpay", label: "Zip" }, // QuadPay rebranded to Zip
  { key: "splitit", label: "Splitit" },
  { key: "perpay", label: "Perpay" },
];

/**
 * Extract canonical lender name from a debt/bill name string
 */
export function extractLenderName(raw: string): string {
  const lower = raw.toLowerCase();

  // 1) Keyword-based canonicalization
  for (const { key, label } of LENDER_KEYWORDS) {
    if (lower.includes(key)) return label;
  }

  // 2) Fallback: prefix before separators ("Affirm - 4 payments left")
  const separatorMatch = raw.split(/[-–—(]/)[0];
  const trimmed = separatorMatch?.trim();

  // 3) Final fallback: return trimmed or raw
  return trimmed || raw;
}

/**
 * Get lender name from a payment with bill/debt info
 */
export function getLenderNameFromPayment(payment: PaymentWithBill): string {
  const sourceName = payment.bill.debt?.name ?? payment.bill.name;
  return extractLenderName(sourceName);
}

export async function getPaymentStatus(
  userId: string,
  paymentId: string
): Promise<string> {
  const payment = await prisma.billPayment.findFirst({
    where: { id: paymentId },
    include: {
      bill: { select: { userId: true } },
    },
  });

  if (!payment) {
    throw new Error("Payment not found");
  }

  if (payment.bill.userId !== userId) {
    throw new Error("Unauthorized");
  }

  return payment.status;
}
