import { p as prisma } from './auth-config_mz_UKjvQ.mjs';
import { c as calculateEffectiveAPR, g as generatePaymentSchedule } from './bnpl-utils_Dcl5EXrQ.mjs';

const debtTypeToBillCategory = {
  CREDIT_CARD: "CREDIT_CARD",
  AUTO_LOAN: "LOAN",
  STUDENT_LOAN: "LOAN",
  PERSONAL_LOAN: "LOAN",
  BNPL: "BNPL",
  MORTGAGE: "LOAN",
  OTHER: "OTHER"
};
async function listDebts(userId, sortBy = "effective") {
  let orderBy;
  switch (sortBy) {
    case "apr":
      orderBy = { interestRate: "desc" };
      break;
    case "balance":
      orderBy = { currentBalance: "desc" };
      break;
    case "effective":
    default:
      orderBy = { interestRate: "desc" };
      break;
  }
  const debts = await prisma.debt.findMany({
    where: { userId, isActive: true },
    orderBy
  });
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
      return bRate - aRate;
    });
  }
  return debts;
}
function serializeDebt(debt) {
  return {
    id: debt.id,
    userId: debt.userId,
    name: debt.name,
    type: debt.type,
    status: debt.status,
    currentBalance: Number(debt.currentBalance),
    originalBalance: Number(debt.originalBalance),
    interestRate: Number(debt.interestRate),
    effectiveRate: debt.effectiveRate ? Number(debt.effectiveRate) : null,
    totalRepayable: debt.totalRepayable ? Number(debt.totalRepayable) : null,
    minimumPayment: Number(debt.minimumPayment),
    pastDueAmount: debt.pastDueAmount ? Number(debt.pastDueAmount) : null,
    dueDay: debt.dueDay,
    startDate: debt.startDate.toISOString(),
    deferredUntil: debt.deferredUntil ? debt.deferredUntil.toISOString() : null,
    bankAccountId: debt.bankAccountId,
    isActive: debt.isActive,
    notes: debt.notes,
    createdAt: debt.createdAt.toISOString(),
    updatedAt: debt.updatedAt.toISOString(),
    payments: debt.payments.map((p) => ({
      id: p.id,
      debtId: p.debtId,
      date: p.date.toISOString(),
      amount: Number(p.amount),
      principal: Number(p.principal),
      interest: Number(p.interest),
      newBalance: Number(p.newBalance),
      notes: p.notes,
      createdAt: p.createdAt.toISOString()
    }))
  };
}
async function getDebt(userId, debtId) {
  const debt = await prisma.debt.findFirst({
    where: { id: debtId, userId },
    include: {
      payments: {
        orderBy: { date: "desc" }
      }
    }
  });
  if (!debt) {
    return null;
  }
  return serializeDebt(debt);
}
async function createDebt(userId, data) {
  const existingDebt = await prisma.debt.findFirst({
    where: { userId, name: data.name },
    select: { id: true }
  });
  if (existingDebt) {
    throw new Error(`A debt named "${data.name}" already exists`);
  }
  if (data.bankAccountId) {
    const bankAccount = await prisma.bankAccount.findFirst({
      where: { id: data.bankAccountId, userId },
      select: { id: true }
    });
    if (!bankAccount) {
      throw new Error("Invalid bank account reference");
    }
  }
  const isBNPL = data.type === "BNPL";
  if (isBNPL && (!data.numberOfPayments || !data.firstPaymentDate || !data.paymentFrequency)) {
    throw new Error("BNPL debts require numberOfPayments, firstPaymentDate, and paymentFrequency");
  }
  let effectiveRate = null;
  if (isBNPL && data.totalRepayable && data.totalRepayable !== data.currentBalance) {
    effectiveRate = calculateEffectiveAPR({
      principal: data.currentBalance,
      totalRepayable: data.totalRepayable,
      numberOfPayments: data.numberOfPayments,
      frequency: data.paymentFrequency
    });
  }
  const debt = await prisma.debt.create({
    data: {
      userId,
      name: data.name,
      type: data.type,
      currentBalance: data.currentBalance,
      originalBalance: data.originalBalance,
      interestRate: data.interestRate,
      effectiveRate,
      totalRepayable: data.totalRepayable || null,
      minimumPayment: data.minimumPayment,
      dueDay: data.dueDay,
      notes: data.notes || null,
      bankAccountId: data.bankAccountId || null
    }
  });
  if (!isBNPL) {
    await prisma.bill.create({
      data: {
        userId,
        name: `${data.name} Payment`,
        category: debtTypeToBillCategory[data.type],
        amount: data.minimumPayment,
        dueDay: data.dueDay,
        isRecurring: true,
        frequency: "MONTHLY",
        debtId: debt.id,
        bankAccountId: data.bankAccountId || null,
        notes: `Auto-generated bill for ${data.name}`
      }
    });
  }
  if (isBNPL) {
    const schedule = generatePaymentSchedule({
      totalAmount: data.currentBalance,
      numberOfPayments: data.numberOfPayments,
      firstPaymentDate: /* @__PURE__ */ new Date(data.firstPaymentDate + "T00:00:00"),
      frequency: data.paymentFrequency
    });
    for (let i = 0; i < schedule.paymentDates.length; i++) {
      const paymentDate = schedule.paymentDates[i];
      await prisma.scheduledPayment.create({
        data: {
          debtId: debt.id,
          dueDate: paymentDate,
          amount: schedule.paymentAmount,
          notes: `Payment ${i + 1} of ${data.numberOfPayments}`
        }
      });
    }
    for (let i = 0; i < schedule.paymentDates.length; i++) {
      const paymentDate = schedule.paymentDates[i];
      const paymentNumber = i + 1;
      const bill = await prisma.bill.create({
        data: {
          userId,
          name: `${data.name} - Payment ${paymentNumber} of ${data.numberOfPayments}`,
          category: "BNPL",
          amount: schedule.paymentAmount,
          dueDay: paymentDate.getDate(),
          isRecurring: false,
          frequency: "ONCE",
          debtId: debt.id,
          bankAccountId: data.bankAccountId || null,
          notes: `Auto-generated BNPL payment for ${data.name}`
        }
      });
      await prisma.billPayment.create({
        data: {
          billId: bill.id,
          dueDate: paymentDate,
          amount: schedule.paymentAmount,
          status: "UNPAID"
        }
      });
    }
  }
  return debt;
}
async function updateDebt(userId, debtId, data) {
  const existing = await prisma.debt.findFirst({
    where: { id: debtId, userId }
  });
  if (!existing) {
    throw new Error("Debt not found");
  }
  let effectiveRate = void 0;
  const isBNPL = (data.type || existing.type) === "BNPL";
  const balance = data.currentBalance !== void 0 ? data.currentBalance : Number(existing.currentBalance);
  if (isBNPL && data.totalRepayable !== void 0) {
    if (data.totalRepayable && data.totalRepayable !== balance && data.numberOfPayments && data.paymentFrequency) {
      effectiveRate = calculateEffectiveAPR({
        principal: balance,
        totalRepayable: data.totalRepayable,
        numberOfPayments: data.numberOfPayments,
        frequency: data.paymentFrequency
      });
    } else {
      effectiveRate = null;
    }
  }
  const debt = await prisma.debt.update({
    where: { id: debtId },
    data: {
      ...data.name !== void 0 && { name: data.name },
      ...data.type !== void 0 && { type: data.type },
      ...data.status !== void 0 && { status: data.status },
      ...data.currentBalance !== void 0 && { currentBalance: data.currentBalance },
      ...data.originalBalance !== void 0 && { originalBalance: data.originalBalance },
      ...data.interestRate !== void 0 && { interestRate: data.interestRate },
      ...effectiveRate !== void 0 && { effectiveRate },
      ...data.totalRepayable !== void 0 && { totalRepayable: data.totalRepayable || null },
      ...data.minimumPayment !== void 0 && { minimumPayment: data.minimumPayment },
      ...data.pastDueAmount !== void 0 && { pastDueAmount: data.pastDueAmount || null },
      ...data.dueDay !== void 0 && { dueDay: data.dueDay },
      ...data.deferredUntil !== void 0 && { deferredUntil: data.deferredUntil ? new Date(data.deferredUntil) : null },
      ...data.notes !== void 0 && { notes: data.notes },
      ...data.isActive !== void 0 && { isActive: data.isActive },
      ...data.bankAccountId !== void 0 && { bankAccountId: data.bankAccountId || null }
    }
  });
  if (isBNPL && data.regenerateSchedule && data.numberOfPayments && data.firstPaymentDate && data.paymentFrequency) {
    const totalAmount = data.totalRepayable || balance;
    const schedule = generatePaymentSchedule({
      totalAmount,
      numberOfPayments: data.numberOfPayments,
      firstPaymentDate: /* @__PURE__ */ new Date(data.firstPaymentDate + "T00:00:00"),
      frequency: data.paymentFrequency
    });
    await prisma.scheduledPayment.deleteMany({
      where: { debtId, isPaid: false }
    });
    const existingBills = await prisma.bill.findMany({
      where: { debtId },
      include: { payments: { where: { status: "UNPAID" } } }
    });
    for (const bill of existingBills) {
      if (bill.payments.length > 0) {
        await prisma.billPayment.deleteMany({
          where: { billId: bill.id, status: "UNPAID" }
        });
        const remainingPayments = await prisma.billPayment.count({
          where: { billId: bill.id }
        });
        if (remainingPayments === 0) {
          await prisma.bill.delete({ where: { id: bill.id } });
        }
      }
    }
    const debtName = data.name || existing.name;
    const debtBankAccountId = data.bankAccountId !== void 0 ? data.bankAccountId : existing.bankAccountId;
    for (let i = 0; i < schedule.paymentDates.length; i++) {
      const paymentDate = schedule.paymentDates[i];
      const paymentNumber = i + 1;
      await prisma.scheduledPayment.create({
        data: {
          debtId,
          dueDate: paymentDate,
          amount: schedule.paymentAmount,
          notes: `Payment ${paymentNumber} of ${data.numberOfPayments}`
        }
      });
      const bill = await prisma.bill.create({
        data: {
          userId,
          name: `${debtName} - Payment ${paymentNumber} of ${data.numberOfPayments}`,
          category: "BNPL",
          amount: schedule.paymentAmount,
          dueDay: paymentDate.getDate(),
          isRecurring: false,
          frequency: "ONCE",
          debtId,
          bankAccountId: debtBankAccountId || null,
          notes: `Auto-generated BNPL payment for ${debtName}`
        }
      });
      await prisma.billPayment.create({
        data: {
          billId: bill.id,
          dueDate: paymentDate,
          amount: schedule.paymentAmount,
          status: "UNPAID"
        }
      });
    }
    await prisma.debt.update({
      where: { id: debtId },
      data: { minimumPayment: schedule.paymentAmount }
    });
  }
  return debt;
}
async function recordPayment(userId, debtId, data) {
  const debt = await prisma.debt.findFirst({
    where: { id: debtId, userId }
  });
  if (!debt) {
    throw new Error("Debt not found");
  }
  const paymentAmount = data.amount;
  const currentBalance = Number(debt.currentBalance);
  const interestRate = Number(debt.interestRate);
  const monthlyRate = interestRate / 100 / 12;
  const interestPortion = currentBalance * monthlyRate;
  const principalPortion = Math.max(0, paymentAmount - interestPortion);
  const newBalance = Math.max(0, currentBalance - principalPortion);
  const [payment] = await prisma.$transaction([
    prisma.debtPayment.create({
      data: {
        debtId,
        date: new Date(data.date),
        amount: paymentAmount,
        principal: principalPortion,
        interest: Math.min(interestPortion, paymentAmount),
        newBalance,
        notes: data.notes || null
      }
    }),
    prisma.debt.update({
      where: { id: debtId },
      data: { currentBalance: newBalance }
    })
  ]);
  return payment;
}

export { createDebt as c, getDebt as g, listDebts as l, recordPayment as r, updateDebt as u };
//# sourceMappingURL=debts_CS0jnHWh.mjs.map
