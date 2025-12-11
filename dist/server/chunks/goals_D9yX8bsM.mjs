import { p as prisma } from './auth-config_mz_UKjvQ.mjs';

async function listGoals(userId) {
  return prisma.savingsGoal.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" }
  });
}
async function getGoal(userId, goalId) {
  return prisma.savingsGoal.findFirst({
    where: { id: goalId, userId }
  });
}
async function createGoal(userId, data) {
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
      notes: data.notes || null
    }
  });
}
async function updateGoal(userId, goalId, data) {
  const existing = await prisma.savingsGoal.findFirst({
    where: { id: goalId, userId }
  });
  if (!existing) {
    throw new Error("Goal not found");
  }
  return prisma.savingsGoal.update({
    where: { id: goalId },
    data: {
      ...data.name !== void 0 && { name: data.name },
      ...data.targetAmount !== void 0 && { targetAmount: data.targetAmount },
      ...data.currentAmount !== void 0 && { currentAmount: data.currentAmount },
      ...data.deadline !== void 0 && { deadline: data.deadline ? new Date(data.deadline) : null },
      ...data.fooStep !== void 0 && { fooStep: data.fooStep || null },
      ...data.notes !== void 0 && { notes: data.notes || null }
    }
  });
}
async function deleteGoal(userId, goalId) {
  const existing = await prisma.savingsGoal.findFirst({
    where: { id: goalId, userId }
  });
  if (!existing) {
    throw new Error("Goal not found");
  }
  return prisma.savingsGoal.delete({ where: { id: goalId } });
}

export { createGoal as c, deleteGoal as d, getGoal as g, listGoals as l, updateGoal as u };
//# sourceMappingURL=goals_D9yX8bsM.mjs.map
