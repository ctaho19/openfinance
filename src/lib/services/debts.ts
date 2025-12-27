import { prisma } from "@/lib/db";
import { generatePaymentSchedule, calculateEffectiveAPR } from "@/lib/bnpl-utils";
import type { Debt, DebtPayment, DebtType, DebtStatus, BillCategory } from "@prisma/client";

export type DebtWithPayments = Debt & {
  payments: DebtPayment[];
};

export interface CreateDebtInput {
  name: string;
  type: DebtType;
  currentBalance: number;
  originalBalance: number;
  interestRate: number;
  minimumPayment: number;
  dueDay: number;
  notes?: string | null;
  numberOfPayments?: number;
  firstPaymentDate?: string;
  paymentFrequency?: "weekly" | "biweekly" | "monthly";
  bankAccountId?: string | null;
  totalRepayable?: number;
}

export interface UpdateDebtInput {
  name?: string;
  type?: DebtType;
  status?: DebtStatus;
  currentBalance?: number;
  originalBalance?: number;
  interestRate?: number;
  minimumPayment?: number;
  pastDueAmount?: number | null;
  dueDay?: number;
  deferredUntil?: string | null;
  notes?: string | null;
  isActive?: boolean;
  bankAccountId?: string | null;
  totalRepayable?: number | null;
  numberOfPayments?: number;
  firstPaymentDate?: string;
  paymentFrequency?: "weekly" | "biweekly" | "monthly";
  regenerateSchedule?: boolean;
}

export interface PaymentInput {
  amount: number;
  date: string;
  notes?: string | null;
}

const debtTypeToBillCategory: Record<DebtType, BillCategory> = {
  CREDIT_CARD: "CREDIT_CARD",
  AUTO_LOAN: "LOAN",
  STUDENT_LOAN: "LOAN",
  PERSONAL_LOAN: "LOAN",
  BNPL: "BNPL",
  MORTGAGE: "LOAN",
  OTHER: "OTHER",
};

export async function listDebts(userId: string, sortBy: string = "effective"): Promise<Debt[]> {
  let orderBy: Record<string, "asc" | "desc">;
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
    orderBy,
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

export interface SerializedDebt {
  id: string;
  userId: string;
  name: string;
  type: string;
  status: string;
  currentBalance: number;
  originalBalance: number;
  interestRate: number;
  effectiveRate: number | null;
  totalRepayable: number | null;
  minimumPayment: number;
  pastDueAmount: number | null;
  dueDay: number;
  paymentFrequency: string | null;
  startDate: string;
  deferredUntil: string | null;
  bankAccountId: string | null;
  isActive: boolean;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  payments: Array<{
    id: string;
    debtId: string;
    date: string;
    amount: number;
    principal: number;
    interest: number;
    newBalance: number;
    notes: string | null;
    createdAt: string;
  }>;
}

function serializeDebt(debt: DebtWithPayments): SerializedDebt {
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
      createdAt: p.createdAt.toISOString(),
    })),
  };
}

export async function getDebt(userId: string, debtId: string): Promise<SerializedDebt | null> {
  const debt = await prisma.debt.findFirst({
    where: { id: debtId, userId },
    include: {
      payments: {
        orderBy: { date: "desc" },
      },
    },
  });

  if (!debt) {
    return null;
  }

  return serializeDebt(debt);
}

export async function createDebt(userId: string, data: CreateDebtInput): Promise<Debt> {
  const existingDebt = await prisma.debt.findFirst({
    where: { userId, name: data.name },
    select: { id: true },
  });
  if (existingDebt) {
    throw new Error(`A debt named "${data.name}" already exists`);
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

  const isBNPL = data.type === "BNPL";

  if (isBNPL && (!data.numberOfPayments || !data.firstPaymentDate || !data.paymentFrequency)) {
    throw new Error("BNPL debts require numberOfPayments, firstPaymentDate, and paymentFrequency");
  }

  let effectiveRate = null;
  if (isBNPL && data.totalRepayable && data.totalRepayable !== data.currentBalance) {
    effectiveRate = calculateEffectiveAPR({
      principal: data.currentBalance,
      totalRepayable: data.totalRepayable,
      numberOfPayments: data.numberOfPayments!,
      frequency: data.paymentFrequency!,
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
      paymentFrequency: isBNPL ? data.paymentFrequency : null,
      notes: data.notes || null,
      bankAccountId: data.bankAccountId || null,
    },
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
        notes: `Auto-generated bill for ${data.name}`,
      },
    });
  }

  if (isBNPL) {
    const schedule = generatePaymentSchedule({
      totalAmount: data.currentBalance,
      numberOfPayments: data.numberOfPayments!,
      firstPaymentDate: new Date(data.firstPaymentDate + "T00:00:00"),
      frequency: data.paymentFrequency!,
    });

    for (let i = 0; i < schedule.paymentDates.length; i++) {
      const paymentDate = schedule.paymentDates[i];

      await prisma.scheduledPayment.create({
        data: {
          debtId: debt.id,
          dueDate: paymentDate,
          amount: schedule.paymentAmount,
          notes: `Payment ${i + 1} of ${data.numberOfPayments}`,
        },
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
          notes: `Auto-generated BNPL payment for ${data.name}`,
        },
      });

      await prisma.billPayment.create({
        data: {
          billId: bill.id,
          dueDate: paymentDate,
          amount: schedule.paymentAmount,
          status: "UNPAID",
        },
      });
    }
  }

  return debt;
}

export async function updateDebt(
  userId: string,
  debtId: string,
  data: UpdateDebtInput
): Promise<Debt> {
  const existing = await prisma.debt.findFirst({
    where: { id: debtId, userId },
  });

  if (!existing) {
    throw new Error("Debt not found");
  }

  let effectiveRate = undefined;
  const isBNPL = (data.type || existing.type) === "BNPL";
  const balance = data.currentBalance !== undefined ? data.currentBalance : Number(existing.currentBalance);

  if (isBNPL && data.totalRepayable !== undefined) {
    if (data.totalRepayable && data.totalRepayable !== balance && data.numberOfPayments && data.paymentFrequency) {
      effectiveRate = calculateEffectiveAPR({
        principal: balance,
        totalRepayable: data.totalRepayable,
        numberOfPayments: data.numberOfPayments,
        frequency: data.paymentFrequency,
      });
    } else {
      effectiveRate = null;
    }
  }

  const debt = await prisma.debt.update({
    where: { id: debtId },
    data: {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.type !== undefined && { type: data.type }),
      ...(data.status !== undefined && { status: data.status }),
      ...(data.currentBalance !== undefined && { currentBalance: data.currentBalance }),
      ...(data.originalBalance !== undefined && { originalBalance: data.originalBalance }),
      ...(data.interestRate !== undefined && { interestRate: data.interestRate }),
      ...(effectiveRate !== undefined && { effectiveRate }),
      ...(data.totalRepayable !== undefined && { totalRepayable: data.totalRepayable || null }),
      ...(data.minimumPayment !== undefined && { minimumPayment: data.minimumPayment }),
      ...(data.pastDueAmount !== undefined && { pastDueAmount: data.pastDueAmount || null }),
      ...(data.dueDay !== undefined && { dueDay: data.dueDay }),
      ...(data.paymentFrequency !== undefined && { paymentFrequency: data.paymentFrequency }),
      ...(data.deferredUntil !== undefined && { deferredUntil: data.deferredUntil ? new Date(data.deferredUntil) : null }),
      ...(data.notes !== undefined && { notes: data.notes }),
      ...(data.isActive !== undefined && { isActive: data.isActive }),
      ...(data.bankAccountId !== undefined && { bankAccountId: data.bankAccountId || null }),
    },
  });

  const billUpdates: Record<string, unknown> = {};
  if (data.minimumPayment !== undefined) {
    billUpdates.amount = data.minimumPayment;
  }
  if (data.dueDay !== undefined) {
    billUpdates.dueDay = data.dueDay;
  }
  if (Object.keys(billUpdates).length > 0) {
    await prisma.bill.updateMany({
      where: { debtId, userId },
      data: billUpdates,
    });
  }

  if (isBNPL && data.regenerateSchedule && data.numberOfPayments && data.firstPaymentDate && data.paymentFrequency) {
    const totalAmount = data.totalRepayable || balance;
    const schedule = generatePaymentSchedule({
      totalAmount,
      numberOfPayments: data.numberOfPayments,
      firstPaymentDate: new Date(data.firstPaymentDate + "T00:00:00"),
      frequency: data.paymentFrequency,
    });

    await prisma.scheduledPayment.deleteMany({
      where: { debtId, isPaid: false },
    });

    const existingBills = await prisma.bill.findMany({
      where: { debtId },
      include: { payments: { where: { status: "UNPAID" } } },
    });

    for (const bill of existingBills) {
      if (bill.payments.length > 0) {
        await prisma.billPayment.deleteMany({
          where: { billId: bill.id, status: "UNPAID" },
        });
        const remainingPayments = await prisma.billPayment.count({
          where: { billId: bill.id },
        });
        if (remainingPayments === 0) {
          await prisma.bill.delete({ where: { id: bill.id } });
        }
      }
    }

    const debtName = data.name || existing.name;
    const debtBankAccountId = data.bankAccountId !== undefined ? data.bankAccountId : existing.bankAccountId;

    for (let i = 0; i < schedule.paymentDates.length; i++) {
      const paymentDate = schedule.paymentDates[i];
      const paymentNumber = i + 1;

      await prisma.scheduledPayment.create({
        data: {
          debtId,
          dueDate: paymentDate,
          amount: schedule.paymentAmount,
          notes: `Payment ${paymentNumber} of ${data.numberOfPayments}`,
        },
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
          notes: `Auto-generated BNPL payment for ${debtName}`,
        },
      });

      await prisma.billPayment.create({
        data: {
          billId: bill.id,
          dueDate: paymentDate,
          amount: schedule.paymentAmount,
          status: "UNPAID",
        },
      });
    }

    await prisma.debt.update({
      where: { id: debtId },
      data: { minimumPayment: schedule.paymentAmount },
    });
  }

  return debt;
}

export async function recordPayment(
  userId: string,
  debtId: string,
  data: PaymentInput
): Promise<DebtPayment> {
  const debt = await prisma.debt.findFirst({
    where: { id: debtId, userId },
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
        notes: data.notes || null,
      },
    }),
    prisma.debt.update({
      where: { id: debtId },
      data: { currentBalance: newBalance },
    }),
  ]);

  const bill = await prisma.bill.findFirst({ where: { debtId, userId } });
  if (bill) {
    const paymentDate = new Date(data.date);
    const startOfMonth = new Date(paymentDate.getFullYear(), paymentDate.getMonth(), 1);
    const endOfMonth = new Date(paymentDate.getFullYear(), paymentDate.getMonth() + 1, 0);
    
    await prisma.billPayment.updateMany({
      where: { 
        billId: bill.id, 
        status: "UNPAID",
        dueDate: { gte: startOfMonth, lte: endOfMonth }
      },
      data: { status: "PAID", paidAt: paymentDate }
    });
  }

  return payment;
}
