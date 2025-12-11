import { prisma } from "@/lib/db";
import type { FOOProgress, FOOStep, FOOStatus } from "@prisma/client";

export const FOO_STEPS: FOOStep[] = [
  "DEDUCTIBLES_COVERED",
  "EMPLOYER_MATCH",
  "HIGH_INTEREST_DEBT",
  "EMERGENCY_FUND",
  "ROTH_HSA",
  "MAX_RETIREMENT",
  "HYPERACCUMULATION",
  "PREPAY_FUTURE",
  "PREPAY_LOW_INTEREST",
];

export const FOO_STATUSES: FOOStatus[] = ["NOT_STARTED", "IN_PROGRESS", "COMPLETED"];

export const FOO_STEP_INFO: Record<FOOStep, { number: number; name: string; description: string }> = {
  DEDUCTIBLES_COVERED: { number: 1, name: "Cover Deductibles", description: "Save enough to cover insurance deductibles" },
  EMPLOYER_MATCH: { number: 2, name: "Get Employer Match", description: "Contribute enough to get full employer 401k match" },
  HIGH_INTEREST_DEBT: { number: 3, name: "Pay Off High-Interest Debt", description: "Pay off debts with interest rate > 6%" },
  EMERGENCY_FUND: { number: 4, name: "Build Emergency Fund", description: "Save 3-6 months of expenses" },
  ROTH_HSA: { number: 5, name: "Max Roth IRA & HSA", description: "Max out Roth IRA and HSA contributions" },
  MAX_RETIREMENT: { number: 6, name: "Max Out Retirement", description: "Max out all retirement account contributions" },
  HYPERACCUMULATION: { number: 7, name: "Hyperaccumulation", description: "Invest 25%+ of income in taxable accounts" },
  PREPAY_FUTURE: { number: 8, name: "Prepay Future Expenses", description: "Prepay known future expenses" },
  PREPAY_LOW_INTEREST: { number: 9, name: "Prepay Low-Interest Debt", description: "Prepay low-interest debts (< 6%)" },
};

export interface FOOProgressWithInfo extends FOOProgress {
  stepInfo: { number: number; name: string; description: string };
}

export interface UpdateFOOInput {
  status?: FOOStatus;
  targetAmount?: number | null;
  currentAmount?: number | null;
  notes?: string | null;
}

export async function getFOOProgress(userId: string): Promise<FOOProgressWithInfo[]> {
  const progress = await prisma.fOOProgress.findMany({
    where: { userId },
    orderBy: { step: "asc" },
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
      status: "NOT_STARTED" as FOOStatus,
      targetAmount: null,
      currentAmount: null,
      notes: null,
      completedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      stepInfo,
    };
  });
}

export async function updateFOOStep(
  userId: string,
  step: FOOStep,
  data: UpdateFOOInput
): Promise<FOOProgress> {
  if (!FOO_STEPS.includes(step)) {
    throw new Error("Invalid step");
  }

  if (data.status && !FOO_STATUSES.includes(data.status)) {
    throw new Error("Invalid status");
  }

  const completedAt =
    data.status === "COMPLETED" ? new Date() : data.status === "NOT_STARTED" ? null : undefined;

  return prisma.fOOProgress.upsert({
    where: {
      userId_step: {
        userId,
        step,
      },
    },
    update: {
      ...(data.status && { status: data.status }),
      ...(data.targetAmount !== undefined && { targetAmount: data.targetAmount }),
      ...(data.currentAmount !== undefined && { currentAmount: data.currentAmount }),
      ...(data.notes !== undefined && { notes: data.notes }),
      ...(completedAt !== undefined && { completedAt }),
    },
    create: {
      userId,
      step,
      status: data.status || "NOT_STARTED",
      targetAmount: data.targetAmount ?? null,
      currentAmount: data.currentAmount ?? null,
      notes: data.notes ?? null,
      completedAt: data.status === "COMPLETED" ? new Date() : null,
    },
  });
}
