import { prisma } from "@/lib/db";
import type { Bill, BillCategory, BillFrequency, Debt, BankAccount } from "@prisma/client";

export type BillWithRelations = Bill & {
  debt: Debt | null;
  bankAccount?: BankAccount | null;
};

export interface CreateBillInput {
  name: string;
  amount: number;
  dueDay: number;
  category?: BillCategory;
  isRecurring?: boolean;
  frequency?: BillFrequency;
  debtId?: string | null;
  bankAccountId?: string | null;
  notes?: string | null;
}

export interface UpdateBillInput {
  name?: string;
  amount?: number;
  dueDay?: number;
  dueDate?: string; // ISO date string for updating the actual BillPayment due date
  category?: BillCategory;
  isRecurring?: boolean;
  frequency?: BillFrequency;
  debtId?: string | null;
  bankAccountId?: string | null;
  notes?: string | null;
  isActive?: boolean;
}

export async function listBills(userId: string): Promise<BillWithRelations[]> {
  return prisma.bill.findMany({
    where: { userId, isActive: true },
    include: { debt: true, bankAccount: true },
    orderBy: [{ category: "asc" }, { dueDay: "asc" }],
  });
}

export async function getBill(userId: string, billId: string): Promise<BillWithRelations | null> {
  return prisma.bill.findFirst({
    where: { id: billId, userId },
    include: { debt: true, bankAccount: true },
  });
}

export async function createBill(userId: string, data: CreateBillInput): Promise<Bill> {
  if (data.debtId) {
    const debt = await prisma.debt.findFirst({
      where: { id: data.debtId, userId },
      select: { id: true },
    });
    if (!debt) {
      throw new Error("Invalid debt reference");
    }
  }

  if (data.bankAccountId) {
    const bankAccount = await prisma.bankAccount.findFirst({
      where: { id: data.bankAccountId, userId },
      select: { id: true },
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
      notes: data.notes || null,
    },
  });
}

export async function updateBill(
  userId: string,
  billId: string,
  data: UpdateBillInput
): Promise<Bill> {
  const existing = await prisma.bill.findFirst({
    where: { id: billId, userId },
  });

  if (!existing) {
    throw new Error("Bill not found");
  }

  // If dueDate is provided, update the unpaid BillPayment record(s)
  if (data.dueDate) {
    const newDueDate = new Date(data.dueDate);
    
    // Update all unpaid bill payments for this bill
    await prisma.billPayment.updateMany({
      where: {
        billId,
        status: "UNPAID",
      },
      data: {
        dueDate: newDueDate,
      },
    });

    // Also update dueDay to match the new date
    data.dueDay = newDueDate.getDate();
  }

  return prisma.bill.update({
    where: { id: billId },
    data: {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.category !== undefined && { category: data.category }),
      ...(data.amount !== undefined && { amount: data.amount }),
      ...(data.dueDay !== undefined && { dueDay: data.dueDay }),
      ...(data.isRecurring !== undefined && { isRecurring: data.isRecurring }),
      ...(data.frequency !== undefined && { frequency: data.frequency }),
      ...(data.debtId !== undefined && { debtId: data.debtId || null }),
      ...(data.bankAccountId !== undefined && { bankAccountId: data.bankAccountId || null }),
      ...(data.notes !== undefined && { notes: data.notes || null }),
      ...(data.isActive !== undefined && { isActive: data.isActive }),
    },
  });
}

export async function deleteBill(userId: string, billId: string): Promise<Bill> {
  const existing = await prisma.bill.findFirst({
    where: { id: billId, userId },
  });

  if (!existing) {
    throw new Error("Bill not found");
  }

  return prisma.bill.update({
    where: { id: billId },
    data: { isActive: false },
  });
}
