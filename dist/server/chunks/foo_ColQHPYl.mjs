import { p as prisma } from './auth-config_mz_UKjvQ.mjs';

const FOO_STEPS = [
  "DEDUCTIBLES_COVERED",
  "EMPLOYER_MATCH",
  "HIGH_INTEREST_DEBT",
  "EMERGENCY_FUND",
  "ROTH_HSA",
  "MAX_RETIREMENT",
  "HYPERACCUMULATION",
  "PREPAY_FUTURE",
  "PREPAY_LOW_INTEREST"
];
const FOO_STATUSES = ["NOT_STARTED", "IN_PROGRESS", "COMPLETED"];
const FOO_STEP_INFO = {
  DEDUCTIBLES_COVERED: { number: 1, name: "Cover Deductibles", description: "Save enough to cover insurance deductibles" },
  EMPLOYER_MATCH: { number: 2, name: "Get Employer Match", description: "Contribute enough to get full employer 401k match" },
  HIGH_INTEREST_DEBT: { number: 3, name: "Pay Off High-Interest Debt", description: "Pay off debts with interest rate > 6%" },
  EMERGENCY_FUND: { number: 4, name: "Build Emergency Fund", description: "Save 3-6 months of expenses" },
  ROTH_HSA: { number: 5, name: "Max Roth IRA & HSA", description: "Max out Roth IRA and HSA contributions" },
  MAX_RETIREMENT: { number: 6, name: "Max Out Retirement", description: "Max out all retirement account contributions" },
  HYPERACCUMULATION: { number: 7, name: "Hyperaccumulation", description: "Invest 25%+ of income in taxable accounts" },
  PREPAY_FUTURE: { number: 8, name: "Prepay Future Expenses", description: "Prepay known future expenses" },
  PREPAY_LOW_INTEREST: { number: 9, name: "Prepay Low-Interest Debt", description: "Prepay low-interest debts (< 6%)" }
};
async function getFOOProgress(userId) {
  const progress = await prisma.fOOProgress.findMany({
    where: { userId },
    orderBy: { step: "asc" }
  });
  const progressMap = new Map(progress.map((p) => [p.step, p]));
  return FOO_STEPS.map((step) => {
    const existing = progressMap.get(step);
    const stepInfo = FOO_STEP_INFO[step];
    if (existing) {
      return { ...existing, stepInfo };
    }
    return {
      id: "",
      userId,
      step,
      status: "NOT_STARTED",
      targetAmount: null,
      currentAmount: null,
      notes: null,
      completedAt: null,
      createdAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date(),
      stepInfo
    };
  });
}
async function updateFOOStep(userId, step, data) {
  if (!FOO_STEPS.includes(step)) {
    throw new Error("Invalid step");
  }
  if (data.status && !FOO_STATUSES.includes(data.status)) {
    throw new Error("Invalid status");
  }
  const completedAt = data.status === "COMPLETED" ? /* @__PURE__ */ new Date() : data.status === "NOT_STARTED" ? null : void 0;
  return prisma.fOOProgress.upsert({
    where: {
      userId_step: {
        userId,
        step
      }
    },
    update: {
      ...data.status && { status: data.status },
      ...data.targetAmount !== void 0 && { targetAmount: data.targetAmount },
      ...data.currentAmount !== void 0 && { currentAmount: data.currentAmount },
      ...data.notes !== void 0 && { notes: data.notes },
      ...completedAt !== void 0 && { completedAt }
    },
    create: {
      userId,
      step,
      status: data.status || "NOT_STARTED",
      targetAmount: data.targetAmount ?? null,
      currentAmount: data.currentAmount ?? null,
      notes: data.notes ?? null,
      completedAt: data.status === "COMPLETED" ? /* @__PURE__ */ new Date() : null
    }
  });
}

export { getFOOProgress as g, updateFOOStep as u };
//# sourceMappingURL=foo_ColQHPYl.mjs.map
