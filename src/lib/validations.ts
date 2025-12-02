import { z } from "zod";
import { prisma } from "@/lib/db";

const amountSchema = z
  .union([z.string(), z.number()])
  .transform((val) => (typeof val === "string" ? parseFloat(val) : val))
  .refine((val) => !isNaN(val) && val > 0, { message: "Amount must be a positive number" });

const dueDaySchema = z
  .number()
  .int()
  .min(1, "Due day must be at least 1")
  .max(31, "Due day must be at most 31");

export const billSchema = z.object({
  name: z.string().min(1, "Name is required"),
  category: z.enum(["SUBSCRIPTION", "UTILITY", "LOAN", "BNPL", "INSURANCE", "CREDIT_CARD", "OTHER"]),
  amount: amountSchema,
  dueDay: dueDaySchema,
  isRecurring: z.boolean().optional().default(true),
  frequency: z.enum(["ONCE", "WEEKLY", "BIWEEKLY", "MONTHLY", "YEARLY"]).optional().default("MONTHLY"),
  debtId: z.string().nullish(),
  bankAccountId: z.string().nullish(),
  notes: z.string().nullish(),
  isActive: z.boolean().optional().default(true),
});

export const debtSchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.enum(["CREDIT_CARD", "AUTO_LOAN", "STUDENT_LOAN", "PERSONAL_LOAN", "BNPL", "MORTGAGE", "OTHER"]),
  status: z.enum(["CURRENT", "DEFERRED", "PAST_DUE", "IN_COLLECTIONS", "PAID_OFF"]).optional().default("CURRENT"),
  currentBalance: amountSchema,
  originalBalance: amountSchema,
  interestRate: z
    .union([z.string(), z.number()])
    .transform((val) => (typeof val === "string" ? parseFloat(val) : val))
    .refine((val) => !isNaN(val) && val >= 0, { message: "Interest rate must be non-negative" }),
  effectiveRate: z
    .union([z.string(), z.number()])
    .transform((val) => (typeof val === "string" ? parseFloat(val) : val))
    .refine((val) => !isNaN(val) && val >= 0, { message: "Effective rate must be non-negative" })
    .nullish(),
  totalRepayable: amountSchema.nullish(),
  minimumPayment: amountSchema,
  dueDay: dueDaySchema,
  startDate: z.coerce.date().optional(),
  deferredUntil: z.coerce.date().nullish(),
  bankAccountId: z.string().nullish(),
  isActive: z.boolean().optional().default(true),
  notes: z.string().nullish(),
});

export const bankAccountSchema = z.object({
  name: z.string().min(1, "Name is required"),
  bank: z.enum(["NAVY_FEDERAL", "PNC", "CAPITAL_ONE", "TRUIST", "CHASE", "BANK_OF_AMERICA", "WELLS_FARGO", "OTHER"]),
  lastFour: z
    .string()
    .length(4, "Last four must be exactly 4 digits")
    .regex(/^\d{4}$/, "Last four must be numeric")
    .nullish(),
  isDefault: z.boolean().optional().default(false),
});

export const quickPaymentSchema = z.object({
  description: z.string().min(1, "Description is required"),
  amount: amountSchema,
  paidAt: z.coerce.date(),
  debtId: z.string().nullish(),
  category: z.enum(["BNPL_CATCHUP", "DEBT_SURPLUS", "ONE_TIME", "OTHER"]),
  notes: z.string().nullish(),
});

export type BillInput = z.infer<typeof billSchema>;
export type DebtInput = z.infer<typeof debtSchema>;
export type BankAccountInput = z.infer<typeof bankAccountSchema>;
export type QuickPaymentInput = z.infer<typeof quickPaymentSchema>;

export async function validateOwnership(
  userId: string,
  { debtId, bankAccountId }: { debtId?: string | null; bankAccountId?: string | null }
): Promise<{ valid: boolean; error?: string }> {
  if (debtId) {
    const debt = await prisma.debt.findUnique({
      where: { id: debtId },
      select: { userId: true },
    });
    if (!debt) {
      return { valid: false, error: "Debt not found" };
    }
    if (debt.userId !== userId) {
      return { valid: false, error: "Debt does not belong to current user" };
    }
  }

  if (bankAccountId) {
    const bankAccount = await prisma.bankAccount.findUnique({
      where: { id: bankAccountId },
      select: { userId: true },
    });
    if (!bankAccount) {
      return { valid: false, error: "Bank account not found" };
    }
    if (bankAccount.userId !== userId) {
      return { valid: false, error: "Bank account does not belong to current user" };
    }
  }

  return { valid: true };
}
