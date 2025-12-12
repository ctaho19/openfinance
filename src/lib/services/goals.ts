import { prisma } from "@/lib/db";
import type { SavingsGoal, FOOStep } from "@prisma/client";

export interface CreateGoalInput {
  name: string;
  targetAmount: number;
  currentAmount?: number;
  deadline?: string | null;
  fooStep?: FOOStep | null;
  notes?: string | null;
}

export interface UpdateGoalInput {
  name?: string;
  targetAmount?: number;
  currentAmount?: number;
  deadline?: string | null;
  fooStep?: FOOStep | null;
  notes?: string | null;
}

export async function listGoals(userId: string): Promise<SavingsGoal[]> {
  return prisma.savingsGoal.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
}

export async function getGoal(userId: string, goalId: string): Promise<SavingsGoal | null> {
  return prisma.savingsGoal.findFirst({
    where: { id: goalId, userId },
  });
}

export async function createGoal(userId: string, data: CreateGoalInput): Promise<SavingsGoal> {
  if (!data.name || !data.targetAmount) {
    throw new Error("Name and target amount are required");
  }

  return prisma.savingsGoal.create({
    data: {
      userId,
      name: data.name,
      targetAmount: data.targetAmount,
      currentAmount: data.currentAmount ?? 0,
      deadline: data.deadline ? new Date(data.deadline) : null,
      fooStep: data.fooStep || null,
      notes: data.notes || null,
    },
  });
}

export async function updateGoal(
  userId: string,
  goalId: string,
  data: UpdateGoalInput
): Promise<SavingsGoal> {
  const existing = await prisma.savingsGoal.findFirst({
    where: { id: goalId, userId },
  });

  if (!existing) {
    throw new Error("Goal not found");
  }

  return prisma.savingsGoal.update({
    where: { id: goalId },
    data: {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.targetAmount !== undefined && { targetAmount: data.targetAmount }),
      ...(data.currentAmount !== undefined && { currentAmount: data.currentAmount }),
      ...(data.deadline !== undefined && { deadline: data.deadline ? new Date(data.deadline) : null }),
      ...(data.fooStep !== undefined && { fooStep: data.fooStep || null }),
      ...(data.notes !== undefined && { notes: data.notes || null }),
    },
  });
}

export async function deleteGoal(userId: string, goalId: string): Promise<SavingsGoal> {
  const existing = await prisma.savingsGoal.findFirst({
    where: { id: goalId, userId },
  });

  if (!existing) {
    throw new Error("Goal not found");
  }

  return prisma.savingsGoal.delete({ where: { id: goalId } });
}
