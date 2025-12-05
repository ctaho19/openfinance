import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { DebtType, BillCategory } from "@prisma/client";
import { generatePaymentSchedule, calculateEffectiveAPR } from "@/lib/bnpl-utils";

const debtTypeToBillCategory: Record<DebtType, BillCategory> = {
  [DebtType.CREDIT_CARD]: BillCategory.CREDIT_CARD,
  [DebtType.AUTO_LOAN]: BillCategory.LOAN,
  [DebtType.STUDENT_LOAN]: BillCategory.LOAN,
  [DebtType.PERSONAL_LOAN]: BillCategory.LOAN,
  [DebtType.BNPL]: BillCategory.BNPL,
  [DebtType.MORTGAGE]: BillCategory.LOAN,
  [DebtType.OTHER]: BillCategory.OTHER,
};

const debtSchema = z.object({
  name: z.string().min(1),
  type: z.nativeEnum(DebtType),
  currentBalance: z.union([z.number(), z.string()]).transform(Number),
  originalBalance: z.union([z.number(), z.string()]).transform(Number),
  interestRate: z.union([z.number(), z.string()]).transform(Number),
  minimumPayment: z.union([z.number(), z.string()]).transform(Number),
  dueDay: z.union([z.number(), z.string()]).transform(Number).pipe(z.number().int().min(1).max(31)),
  notes: z.string().optional().nullable(),
  numberOfPayments: z.union([z.number(), z.string()]).transform(Number).optional(),
  firstPaymentDate: z.string().optional(),
  paymentFrequency: z.enum(["weekly", "biweekly", "monthly"]).optional(),
  bankAccountId: z.string().optional().nullable(),
  totalRepayable: z.union([z.number(), z.string()]).transform(Number).optional(),
});

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Get sort parameter: 'apr' (default), 'effective', or 'balance'
  const sortBy = request.nextUrl.searchParams.get("sortBy") || "effective";

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
      // Sort by effective rate first, then stated APR
      // We'll sort in memory since effectiveRate can be null
      orderBy = { interestRate: "desc" };
      break;
  }

  const debts = await prisma.debt.findMany({
    where: { userId: session.user.id },
    orderBy,
  });

  // For effective rate sorting, sort in memory using the higher of effectiveRate or interestRate
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
      return bRate - aRate; // descending
    });
  }

  return NextResponse.json(debts);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const result = debtSchema.safeParse(body);

  if (!result.success) {
    const errors = result.error.flatten();
    const fieldErrors = errors.fieldErrors;
    const errorMessages: string[] = [];
    
    if (fieldErrors.name) errorMessages.push(`Name: ${fieldErrors.name.join(", ")}`);
    if (fieldErrors.type) errorMessages.push(`Type: ${fieldErrors.type.join(", ")}`);
    if (fieldErrors.currentBalance) errorMessages.push(`Current Balance: ${fieldErrors.currentBalance.join(", ")}`);
    if (fieldErrors.originalBalance) errorMessages.push(`Original Balance: ${fieldErrors.originalBalance.join(", ")}`);
    if (fieldErrors.interestRate) errorMessages.push(`Interest Rate: ${fieldErrors.interestRate.join(", ")}`);
    if (fieldErrors.minimumPayment) errorMessages.push(`Minimum Payment: ${fieldErrors.minimumPayment.join(", ")}`);
    if (fieldErrors.dueDay) errorMessages.push(`Due Day: must be between 1 and 31`);
    
    const errorMessage = errorMessages.length > 0 
      ? errorMessages.join("; ") 
      : "Please fill in all required fields correctly";
    
    return NextResponse.json(
      { error: errorMessage, details: errors },
      { status: 400 }
    );
  }

  const {
    name,
    type,
    currentBalance,
    originalBalance,
    interestRate,
    minimumPayment,
    dueDay,
    notes,
    numberOfPayments,
    firstPaymentDate,
    paymentFrequency,
    bankAccountId,
    totalRepayable,
  } = result.data;

  // Check for duplicate debt name
  const existingDebt = await prisma.debt.findFirst({
    where: { userId: session.user.id, name },
    select: { id: true },
  });
  if (existingDebt) {
    return NextResponse.json({ error: `A debt named "${name}" already exists` }, { status: 400 });
  }

  if (bankAccountId) {
    const bankAccount = await prisma.bankAccount.findFirst({
      where: { id: bankAccountId, userId: session.user.id },
      select: { id: true },
    });
    if (!bankAccount) {
      return NextResponse.json({ error: "Invalid bank account reference" }, { status: 400 });
    }
  }

  const isBNPL = type === DebtType.BNPL;

  if (isBNPL && (!numberOfPayments || !firstPaymentDate || !paymentFrequency)) {
    return NextResponse.json({ error: "BNPL debts require numberOfPayments, firstPaymentDate, and paymentFrequency" }, { status: 400 });
  }

  // Calculate effective rate for BNPL if total repayable is provided
  let effectiveRate = null;
  if (isBNPL && totalRepayable && totalRepayable !== currentBalance) {
    effectiveRate = calculateEffectiveAPR({
      principal: currentBalance,
      totalRepayable,
      numberOfPayments: numberOfPayments!,
      frequency: paymentFrequency as 'weekly' | 'biweekly' | 'monthly',
    });
  }

  const debt = await prisma.debt.create({
    data: {
      userId: session.user.id,
      name,
      type,
      currentBalance,
      originalBalance,
      interestRate,
      effectiveRate,
      totalRepayable: totalRepayable || null,
      minimumPayment,
      dueDay,
      notes: notes || null,
      bankAccountId: bankAccountId || null,
    },
  });

  if (!isBNPL) {
    await prisma.bill.create({
      data: {
        userId: session.user.id,
        name: `${name} Payment`,
        category: debtTypeToBillCategory[type as DebtType],
        amount: minimumPayment,
        dueDay,
        isRecurring: true,
        frequency: "MONTHLY",
        debtId: debt.id,
        bankAccountId: bankAccountId || null,
        notes: `Auto-generated bill for ${name}`,
      },
    });
  }

  if (isBNPL) {
    const schedule = generatePaymentSchedule({
      totalAmount: currentBalance,
      numberOfPayments: numberOfPayments!,
      firstPaymentDate: new Date(firstPaymentDate + "T00:00:00"),
      frequency: paymentFrequency as 'weekly' | 'biweekly' | 'monthly',
    });

    // Create scheduled payments for tracking
    for (let i = 0; i < schedule.paymentDates.length; i++) {
      const paymentDate = schedule.paymentDates[i];

      await prisma.scheduledPayment.create({
        data: {
          debtId: debt.id,
          dueDate: paymentDate,
          amount: schedule.paymentAmount,
          notes: `Payment ${i + 1} of ${numberOfPayments}`,
        },
      });
    }

    // Create bills for bill tracking
    for (let i = 0; i < schedule.paymentDates.length; i++) {
      const paymentDate = schedule.paymentDates[i];
      const paymentNumber = i + 1;

      const bill = await prisma.bill.create({
        data: {
          userId: session.user.id,
          name: `${name} - Payment ${paymentNumber} of ${numberOfPayments}`,
          category: "BNPL",
          amount: schedule.paymentAmount,
          dueDay: paymentDate.getDate(),
          isRecurring: false,
          frequency: "ONCE",
          debtId: debt.id,
          bankAccountId: bankAccountId || null,
          notes: `Auto-generated BNPL payment for ${name}`,
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

  return NextResponse.json(debt, { status: 201 });
}
