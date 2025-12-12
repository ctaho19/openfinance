import { p as prisma } from './auth-config_mz_UKjvQ.mjs';

async function listBills(userId) {
  return prisma.bill.findMany({
    where: { userId, isActive: true },
    include: { debt: true, bankAccount: true },
    orderBy: [{ category: "asc" }, { dueDay: "asc" }]
  });
}
async function getBill(userId, billId) {
  return prisma.bill.findFirst({
    where: { id: billId, userId },
    include: { debt: true, bankAccount: true }
  });
}
async function createBill(userId, data) {
  if (data.debtId) {
    const debt = await prisma.debt.findFirst({
      where: { id: data.debtId, userId },
      select: { id: true }
    });
    if (!debt) {
      throw new Error("Invalid debt reference");
    }
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
  return prisma.bill.create({
    data: {
      userId,
      name: data.name,
      category: data.category || "OTHER",
      amount: data.amount,
      dueDay: data.dueDay,
      isRecurring: data.isRecurring ?? true,
      frequency: data.frequency || "MONTHLY",
      debtId: data.debtId || null,
      bankAccountId: data.bankAccountId || null,
      notes: data.notes || null
    }
  });
}
async function updateBill(userId, billId, data) {
  const existing = await prisma.bill.findFirst({
    where: { id: billId, userId }
  });
  if (!existing) {
    throw new Error("Bill not found");
  }
  return prisma.bill.update({
    where: { id: billId },
    data: {
      ...data.name !== void 0 && { name: data.name },
      ...data.category !== void 0 && { category: data.category },
      ...data.amount !== void 0 && { amount: data.amount },
      ...data.dueDay !== void 0 && { dueDay: data.dueDay },
      ...data.isRecurring !== void 0 && { isRecurring: data.isRecurring },
      ...data.frequency !== void 0 && { frequency: data.frequency },
      ...data.debtId !== void 0 && { debtId: data.debtId || null },
      ...data.bankAccountId !== void 0 && { bankAccountId: data.bankAccountId || null },
      ...data.notes !== void 0 && { notes: data.notes || null },
      ...data.isActive !== void 0 && { isActive: data.isActive }
    }
  });
}
async function deleteBill(userId, billId) {
  const existing = await prisma.bill.findFirst({
    where: { id: billId, userId }
  });
  if (!existing) {
    throw new Error("Bill not found");
  }
  return prisma.bill.update({
    where: { id: billId },
    data: { isActive: false }
  });
}

export { createBill as c, deleteBill as d, getBill as g, listBills as l, updateBill as u };
//# sourceMappingURL=bills_DrTPm3JP.mjs.map
