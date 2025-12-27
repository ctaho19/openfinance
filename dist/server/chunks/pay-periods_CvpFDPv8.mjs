import { p as prisma } from './auth-config_mz_UKjvQ.mjs';

async function getPaymentsForPeriod(userId, startDate, endDate) {
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
                  deferredUntil: { lte: startDate }
                }
              ]
            }
          }
        ]
      },
      dueDate: {
        gte: startDate,
        lte: endDate
      }
    },
    include: {
      bill: {
        include: {
          debt: {
            select: { id: true, name: true, type: true, status: true }
          }
        }
      }
    },
    orderBy: { dueDate: "asc" }
  });
}
async function markPaymentPaid(userId, paymentId) {
  const payment = await prisma.billPayment.findFirst({
    where: { id: paymentId },
    include: {
      bill: {
        include: { debt: true }
      }
    }
  });
  if (!payment) {
    throw new Error("Payment not found");
  }
  if (payment.bill.userId !== userId) {
    throw new Error("Unauthorized");
  }
  const paidAt = /* @__PURE__ */ new Date();
  let debtUpdated = false;
  const result = await prisma.$transaction(async (tx) => {
    const updatedPayment = await tx.billPayment.update({
      where: { id: paymentId },
      data: {
        status: "PAID",
        paidAt
      }
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
          notes: `Auto-logged from bill payment: ${payment.bill.name}`
        }
      });
      await tx.debt.update({
        where: { id: debt.id },
        data: { currentBalance: newBalance }
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
              lte: dateEnd
            }
          },
          orderBy: { dueDate: "asc" }
        });
        if (scheduledPayment) {
          await tx.scheduledPayment.update({
            where: { id: scheduledPayment.id },
            data: {
              isPaid: true,
              paidAt,
              paidAmount: paymentAmount
            }
          });
        }
      }
      debtUpdated = true;
    }
    return updatedPayment;
  });
  return { payment: result, debtUpdated };
}
async function markPaymentUnpaid(userId, paymentId) {
  const payment = await prisma.billPayment.findFirst({
    where: { id: paymentId },
    include: {
      bill: true
    }
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
        orderBy: { createdAt: "desc" }
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
        paidAt: null
      }
    });
  });
}
const LENDER_KEYWORDS = [
  { key: "affirm", label: "Affirm" },
  { key: "afterpay", label: "Afterpay" },
  { key: "klarna", label: "Klarna" },
  { key: "sezzle", label: "Sezzle" },
  { key: "zip", label: "Zip" },
  { key: "paypal", label: "PayPal Pay Later" },
  { key: "apple pay later", label: "Apple Pay Later" },
  { key: "quadpay", label: "Zip" },
  // QuadPay rebranded to Zip
  { key: "splitit", label: "Splitit" },
  { key: "perpay", label: "Perpay" }
];
function extractLenderName(raw) {
  const lower = raw.toLowerCase();
  for (const { key, label } of LENDER_KEYWORDS) {
    if (lower.includes(key)) return label;
  }
  const separatorMatch = raw.split(/[-–—(]/)[0];
  const trimmed = separatorMatch?.trim();
  return trimmed || raw;
}
function getLenderNameFromPayment(payment) {
  const sourceName = payment.bill.debt?.name ?? payment.bill.name;
  return extractLenderName(sourceName);
}
async function getPaymentStatus(userId, paymentId) {
  const payment = await prisma.billPayment.findFirst({
    where: { id: paymentId },
    include: {
      bill: { select: { userId: true } }
    }
  });
  if (!payment) {
    throw new Error("Payment not found");
  }
  if (payment.bill.userId !== userId) {
    throw new Error("Unauthorized");
  }
  return payment.status;
}

export { markPaymentPaid as a, getPaymentsForPeriod as b, getLenderNameFromPayment as c, getPaymentStatus as g, markPaymentUnpaid as m };
//# sourceMappingURL=pay-periods_CvpFDPv8.mjs.map
