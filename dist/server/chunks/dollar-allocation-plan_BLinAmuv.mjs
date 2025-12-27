import { p as prisma } from './auth-config_mz_UKjvQ.mjs';
import { g as getCurrentPayPeriod } from './pay-periods_DoSYQF1E.mjs';
import { b as getPaymentsForPeriod } from './pay-periods_D_PB9Fr3.mjs';
import { l as listDebts } from './debts_ClTN3PuL.mjs';
import { format } from 'date-fns';

function checksPerYear(freq) {
  switch (freq) {
    case "weekly":
      return 52;
    case "biweekly":
      return 26;
    case "monthly":
      return 12;
    default:
      return 26;
  }
}
function getDiscretionaryPerPaycheck(discretionaryMonthly, paycheckFrequency) {
  if (!discretionaryMonthly || discretionaryMonthly <= 0) return 0;
  const paychecksPerYear = checksPerYear(paycheckFrequency);
  return discretionaryMonthly * 12 / paychecksPerYear;
}
function computeSurplusSplit(params) {
  const { paycheckAmount, billsDueThisPeriod, discretionary } = params;
  const baseNeeds = billsDueThisPeriod + discretionary;
  const surplusRaw = paycheckAmount - baseNeeds;
  if (surplusRaw <= 0) {
    return {
      surplus: surplusRaw,
      savingsAllocation: 0,
      debtAllocation: 0,
      isNegative: true
    };
  }
  const efRemaining = Math.max(
    0,
    params.emergencyFundTarget - params.currentEmergencyAmount
  );
  let savingsAllocation = 0;
  if (efRemaining > 0) {
    savingsAllocation = Math.min(
      surplusRaw * params.savingsSurplusPercent,
      efRemaining
    );
  }
  const debtAllocation = surplusRaw - savingsAllocation;
  return {
    surplus: surplusRaw,
    savingsAllocation,
    debtAllocation,
    isNegative: false
  };
}
function findAvalancheTarget(debts, bankAccounts) {
  const candidates = debts.filter(
    (d) => d.isActive && d.currentBalance > 0 && d.status !== "PAID_OFF" && d.status !== "DEFERRED"
  );
  if (!candidates.length) return void 0;
  candidates.sort((a, b) => {
    const aRate = Math.max(a.effectiveRate ?? 0, a.interestRate ?? 0);
    const bRate = Math.max(b.effectiveRate ?? 0, b.interestRate ?? 0);
    return bRate - aRate;
  });
  const top = candidates[0];
  const bankAccount = bankAccounts.find((ba) => ba.id === top.bankAccountId);
  return {
    debtId: top.id,
    debtName: top.name,
    bankAccountId: top.bankAccountId,
    bankAccountName: bankAccount?.name ?? null,
    interestRate: Math.max(top.effectiveRate ?? 0, top.interestRate),
    currentBalance: top.currentBalance
  };
}
function computePayoffProgress(user, currentDebt) {
  const { payoffStartDate, payoffStartTotalDebt, payoffTargetDate } = user;
  if (!payoffStartDate || !payoffStartTotalDebt || !payoffTargetDate) {
    return { currentDebt };
  }
  const now = /* @__PURE__ */ new Date();
  const debtPaid = Math.max(0, payoffStartTotalDebt - currentDebt);
  const debtAdded = Math.max(0, currentDebt - payoffStartTotalDebt);
  const adjustedStartDebt = payoffStartTotalDebt + debtAdded;
  const baselineStale = debtAdded > 0;
  const debtProgressPct = adjustedStartDebt > 0 ? Math.max(0, Math.min(1, debtPaid / adjustedStartDebt)) : 0;
  const totalMs = payoffTargetDate.getTime() - payoffStartDate.getTime();
  const elapsedMs = now.getTime() - payoffStartDate.getTime();
  const timeProgressPct = totalMs > 0 ? Math.max(0, Math.min(1, elapsedMs / totalMs)) : void 0;
  const remainingMs = Math.max(0, payoffTargetDate.getTime() - now.getTime());
  const monthsRemaining = Math.ceil(remainingMs / (30 * 24 * 60 * 60 * 1e3));
  const onTrack = timeProgressPct !== void 0 ? debtProgressPct >= timeProgressPct : void 0;
  return {
    startDate: payoffStartDate,
    targetDate: payoffTargetDate,
    startDebt: payoffStartTotalDebt,
    currentDebt,
    debtPaid,
    debtAdded,
    adjustedStartDebt,
    debtProgressPct,
    timeProgressPct,
    onTrack,
    monthsRemaining,
    baselineStale
  };
}
async function getDollarAllocationPlan(userId, forDate = /* @__PURE__ */ new Date()) {
  const period = getCurrentPayPeriod();
  const [user, payments, debts, bankAccounts, savingsGoals, pastDuePayments] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        paycheckAmount: true,
        paycheckFrequency: true,
        paycheckBankAccountId: true,
        spendingBankAccountId: true,
        discretionaryBudgetMonthly: true,
        emergencyFundTarget: true,
        debtSurplusPercent: true,
        savingsSurplusPercent: true,
        payoffStartDate: true,
        payoffStartTotalDebt: true,
        payoffTargetDate: true
      }
    }),
    getPaymentsForPeriod(userId, period.startDate, period.endDate),
    listDebts(userId, "effective"),
    prisma.bankAccount.findMany({ where: { userId } }),
    prisma.savingsGoal.findMany({ where: { userId } }),
    prisma.billPayment.findMany({
      where: {
        bill: { userId },
        dueDate: { lt: period.startDate },
        status: "UNPAID"
      },
      include: {
        bill: {
          include: {
            debt: { select: { id: true, name: true, type: true, status: true } }
          }
        }
      },
      orderBy: { dueDate: "asc" }
    })
  ]);
  if (!user) {
    throw new Error("User not found");
  }
  const unpaidPayments = payments.filter((p) => p.status === "UNPAID");
  const paidPayments = payments.filter((p) => p.status === "PAID");
  const totalBillsThisPeriod = payments.reduce(
    (sum, p) => sum + Number(p.amount),
    0
  );
  const billsRemainingThisPeriod = unpaidPayments.reduce(
    (sum, p) => sum + Number(p.amount),
    0
  );
  const billsPaidThisPeriod = paidPayments.reduce(
    (sum, p) => sum + Number(p.amount),
    0
  );
  const billsByAccount = {};
  for (const p of unpaidPayments) {
    const accountId = p.bill.bankAccountId ?? user.paycheckBankAccountId ?? "UNKNOWN";
    billsByAccount[accountId] = (billsByAccount[accountId] ?? 0) + Number(p.amount);
  }
  const paycheckAmount = Number(user.paycheckAmount ?? 0);
  const discretionaryMonthly = Number(user.discretionaryBudgetMonthly ?? 750);
  const discretionary = getDiscretionaryPerPaycheck(
    discretionaryMonthly,
    user.paycheckFrequency
  );
  const emergencyGoal = savingsGoals.find(
    (g) => g.fooStep === "EMERGENCY_FUND" || g.name.toLowerCase().includes("emergency")
  );
  const currentEmergencyAmount = emergencyGoal ? Number(emergencyGoal.currentAmount) : 0;
  const emergencyFundTarget = Number(user.emergencyFundTarget ?? 1e3);
  const debtSurplusPercent = Number(user.debtSurplusPercent ?? 0.8);
  const savingsSurplusPercent = Number(user.savingsSurplusPercent ?? 0.2);
  const surplusSplit = computeSurplusSplit({
    paycheckAmount,
    billsDueThisPeriod: totalBillsThisPeriod,
    discretionary,
    emergencyFundTarget,
    currentEmergencyAmount,
    savingsSurplusPercent
  });
  const serializedDebts = await Promise.all(
    debts.map(async (d) => {
      const debt = await prisma.debt.findUnique({
        where: { id: d.id },
        include: { payments: { orderBy: { date: "desc" } } }
      });
      if (!debt) return null;
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
        paymentFrequency: debt.paymentFrequency,
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
    })
  );
  const validDebts = serializedDebts.filter((d) => d !== null);
  const avalancheTarget = findAvalancheTarget(validDebts, bankAccounts);
  const totalDebt = validDebts.filter((d) => d.isActive).reduce((sum, d) => sum + d.currentBalance, 0);
  const payoffProgress = computePayoffProgress(
    {
      payoffStartDate: user.payoffStartDate,
      payoffStartTotalDebt: user.payoffStartTotalDebt ? Number(user.payoffStartTotalDebt) : null,
      payoffTargetDate: user.payoffTargetDate
    },
    totalDebt
  );
  const steps = [];
  const transfers = [];
  const billPayments = [];
  let extraDebtStep;
  let savingsStep;
  const paycheckAccount = bankAccounts.find(
    (ba) => ba.id === user.paycheckBankAccountId
  );
  bankAccounts.find(
    (ba) => ba.id === user.spendingBankAccountId
  );
  const paycheckAccountName = paycheckAccount?.name ?? "Income Account";
  const requiredFunding = {};
  for (const [accountId, amt] of Object.entries(billsByAccount)) {
    if (accountId !== user.paycheckBankAccountId && accountId !== "UNKNOWN") {
      if (!requiredFunding[accountId]) {
        requiredFunding[accountId] = { amount: 0, purposes: [] };
      }
      requiredFunding[accountId].amount += amt;
      requiredFunding[accountId].purposes.push("Bills");
    }
  }
  if (discretionary > 0 && user.spendingBankAccountId && user.spendingBankAccountId !== user.paycheckBankAccountId) {
    if (!requiredFunding[user.spendingBankAccountId]) {
      requiredFunding[user.spendingBankAccountId] = { amount: 0, purposes: [] };
    }
    requiredFunding[user.spendingBankAccountId].amount += discretionary;
    requiredFunding[user.spendingBankAccountId].purposes.push("Spending");
  }
  if (surplusSplit.debtAllocation > 0 && avalancheTarget?.bankAccountId && avalancheTarget.bankAccountId !== user.paycheckBankAccountId) {
    if (!requiredFunding[avalancheTarget.bankAccountId]) {
      requiredFunding[avalancheTarget.bankAccountId] = { amount: 0, purposes: [] };
    }
    requiredFunding[avalancheTarget.bankAccountId].amount += surplusSplit.debtAllocation;
    requiredFunding[avalancheTarget.bankAccountId].purposes.push("Extra Debt Payment");
  }
  let transferOrder = 100;
  for (const [accountId, { amount, purposes }] of Object.entries(requiredFunding)) {
    const targetAccount = bankAccounts.find((ba) => ba.id === accountId);
    const targetName = targetAccount?.name ?? "Account";
    const purposeStr = purposes.join(" & ");
    const transferStep = {
      id: `transfer-${accountId}`,
      type: "TRANSFER",
      order: transferOrder++,
      label: `Transfer $${amount.toFixed(2)} from ${paycheckAccountName} to ${targetName} for ${purposeStr}`,
      amount,
      fromAccountId: user.paycheckBankAccountId ?? void 0,
      fromAccountName: paycheckAccountName,
      toAccountId: accountId,
      toAccountName: targetName,
      purpose: purposeStr
    };
    transfers.push(transferStep);
    steps.push(transferStep);
  }
  let paymentOrder = 200;
  for (const payment of unpaidPayments) {
    const dueDate = new Date(payment.dueDate);
    const paymentAccount = bankAccounts.find(
      (ba) => ba.id === payment.bill.bankAccountId
    );
    const accountNote = paymentAccount ? ` (from ${paymentAccount.name})` : "";
    const billStep = {
      id: payment.id,
      type: "BILL_PAYMENT",
      order: paymentOrder++,
      label: `${format(dueDate, "MMM d")} — ${payment.bill.name} — $${Number(payment.amount).toFixed(2)}${accountNote}`,
      amount: Number(payment.amount),
      billPaymentId: payment.id,
      dueDate
    };
    billPayments.push(billStep);
    steps.push(billStep);
  }
  if (surplusSplit.debtAllocation > 0 && avalancheTarget) {
    extraDebtStep = {
      id: "extra-debt",
      type: "EXTRA_DEBT_PAYMENT",
      order: 300,
      label: `Send $${surplusSplit.debtAllocation.toFixed(2)} extra to ${avalancheTarget.debtName} (${avalancheTarget.interestRate.toFixed(2)}% APR)`,
      amount: surplusSplit.debtAllocation,
      debtId: avalancheTarget.debtId
    };
    steps.push(extraDebtStep);
  }
  if (surplusSplit.savingsAllocation > 0) {
    savingsStep = {
      id: "savings-ef",
      type: "SAVINGS_TRANSFER",
      order: 350,
      label: `Move $${surplusSplit.savingsAllocation.toFixed(2)} to Emergency Fund`,
      amount: surplusSplit.savingsAllocation,
      savingsGoalId: emergencyGoal?.id
    };
    steps.push(savingsStep);
  }
  steps.sort((a, b) => a.order - b.order);
  const bankAccountSummaries = Object.entries(requiredFunding).map(
    ([accountId, { amount, purposes }]) => {
      const account = bankAccounts.find((ba) => ba.id === accountId);
      return {
        id: accountId,
        name: account?.name ?? "Unknown",
        bank: account?.bank ?? "OTHER",
        requiredAmount: amount,
        purpose: purposes
      };
    }
  );
  return {
    period,
    paycheckAmount,
    totalBillsThisPeriod,
    billsRemainingThisPeriod,
    billsPaidThisPeriod,
    discretionaryThisPaycheck: discretionary,
    surplusSplit,
    avalancheTarget,
    steps,
    transfers,
    billPayments,
    extraDebtStep,
    savingsStep,
    payoffProgress,
    bankAccountSummaries,
    emergencyFundCurrent: currentEmergencyAmount,
    emergencyFundTarget,
    unpaidPayments: pastDuePayments,
    debtSurplusPercent,
    savingsSurplusPercent
  };
}
async function recordExtraDebtPayment(userId, debtId, amount) {
  const debt = await prisma.debt.findFirst({
    where: { id: debtId, userId }
  });
  if (!debt) {
    throw new Error("Debt not found");
  }
  const currentBalance = Number(debt.currentBalance);
  const interestRate = Number(debt.interestRate);
  let interest = 0;
  let principal = amount;
  if (debt.type !== "BNPL" && interestRate > 0) {
    const monthlyRate = interestRate / 100 / 12;
    interest = Math.min(currentBalance * monthlyRate, amount);
    principal = amount - interest;
  }
  const newBalance = Math.max(0, currentBalance - principal);
  await prisma.$transaction([
    prisma.debtPayment.create({
      data: {
        debtId,
        date: /* @__PURE__ */ new Date(),
        amount,
        principal,
        interest,
        newBalance,
        notes: "Extra payment from Dollar Allocation Plan"
      }
    }),
    prisma.debt.update({
      where: { id: debtId },
      data: { currentBalance: newBalance }
    }),
    prisma.quickPayment.create({
      data: {
        userId,
        description: `Extra payment to ${debt.name}`,
        amount,
        paidAt: /* @__PURE__ */ new Date(),
        debtId,
        category: "DEBT_SURPLUS",
        notes: "Extra payment from Dollar Allocation Plan (avalanche method)"
      }
    })
  ]);
  if (debt.type === "BNPL") {
    const nextScheduled = await prisma.scheduledPayment.findFirst({
      where: {
        debtId,
        isPaid: false,
        dueDate: { gte: /* @__PURE__ */ new Date() }
      },
      orderBy: { dueDate: "asc" }
    });
    if (nextScheduled && amount >= Number(nextScheduled.amount)) {
      await prisma.scheduledPayment.update({
        where: { id: nextScheduled.id },
        data: {
          isPaid: true,
          paidAt: /* @__PURE__ */ new Date(),
          paidAmount: amount,
          notes: (nextScheduled.notes || "") + " (Paid via extra avalanche payment)"
        }
      });
      const bill = await prisma.bill.findFirst({
        where: { debtId, isActive: true },
        include: {
          payments: {
            where: { status: "UNPAID" },
            orderBy: { dueDate: "asc" },
            take: 1
          }
        }
      });
      if (bill?.payments[0]) {
        await prisma.billPayment.update({
          where: { id: bill.payments[0].id },
          data: { status: "PAID", paidAt: /* @__PURE__ */ new Date() }
        });
      }
    }
  }
  return { success: true, newBalance };
}
async function updateEmergencyFund(userId, amount) {
  const savingsGoals = await prisma.savingsGoal.findMany({
    where: { userId }
  });
  let emergencyGoal = savingsGoals.find(
    (g) => g.fooStep === "EMERGENCY_FUND" || g.name.toLowerCase().includes("emergency")
  );
  if (!emergencyGoal) {
    emergencyGoal = await prisma.savingsGoal.create({
      data: {
        userId,
        name: "Emergency Fund",
        targetAmount: 1e3,
        currentAmount: amount,
        fooStep: "EMERGENCY_FUND"
      }
    });
    return { success: true, newAmount: amount };
  }
  const newAmount = Number(emergencyGoal.currentAmount) + amount;
  await prisma.savingsGoal.update({
    where: { id: emergencyGoal.id },
    data: { currentAmount: newAmount }
  });
  return { success: true, newAmount };
}
async function setupUserStrategy(userId, data) {
  await prisma.user.update({
    where: { id: userId },
    data: {
      ...data.paycheckBankAccountId !== void 0 && {
        paycheckBankAccountId: data.paycheckBankAccountId
      },
      ...data.spendingBankAccountId !== void 0 && {
        spendingBankAccountId: data.spendingBankAccountId
      },
      ...data.discretionaryBudgetMonthly !== void 0 && {
        discretionaryBudgetMonthly: data.discretionaryBudgetMonthly
      },
      ...data.emergencyFundTarget !== void 0 && {
        emergencyFundTarget: data.emergencyFundTarget
      },
      ...data.debtSurplusPercent !== void 0 && {
        debtSurplusPercent: data.debtSurplusPercent
      },
      ...data.savingsSurplusPercent !== void 0 && {
        savingsSurplusPercent: data.savingsSurplusPercent
      },
      ...data.payoffStartDate !== void 0 && {
        payoffStartDate: data.payoffStartDate
      },
      ...data.payoffStartTotalDebt !== void 0 && {
        payoffStartTotalDebt: data.payoffStartTotalDebt
      },
      ...data.payoffTargetDate !== void 0 && {
        payoffTargetDate: data.payoffTargetDate
      }
    }
  });
}
async function recalculatePayoffBaseline(userId, options = {}) {
  const [user, debts] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        payoffStartDate: true,
        payoffStartTotalDebt: true,
        payoffTargetDate: true
      }
    }),
    prisma.debt.findMany({
      where: { userId, isActive: true }
    })
  ]);
  const totalDebt = debts.reduce((sum, d) => sum + Number(d.currentBalance), 0);
  const newStartDate = options.preserveStartDate && user?.payoffStartDate ? user.payoffStartDate : /* @__PURE__ */ new Date();
  await prisma.user.update({
    where: { id: userId },
    data: {
      payoffStartTotalDebt: totalDebt,
      payoffStartDate: newStartDate
    }
  });
  return {
    previousStartDebt: user?.payoffStartTotalDebt ? Number(user.payoffStartTotalDebt) : null,
    newStartDebt: totalDebt,
    previousStartDate: user?.payoffStartDate ?? null,
    newStartDate
  };
}
async function getCurrentDebtTotal(userId) {
  const debts = await prisma.debt.findMany({
    where: { userId, isActive: true }
  });
  return debts.reduce((sum, d) => sum + Number(d.currentBalance), 0);
}

export { recalculatePayoffBaseline as a, getDollarAllocationPlan as b, getCurrentDebtTotal as g, recordExtraDebtPayment as r, setupUserStrategy as s, updateEmergencyFund as u };
//# sourceMappingURL=dollar-allocation-plan_BLinAmuv.mjs.map
