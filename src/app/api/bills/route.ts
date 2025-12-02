import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { BillCategory, BillFrequency } from "@prisma/client";

const billSchema = z.object({
  name: z.string().min(1, "Name is required"),
  amount: z.union([z.number(), z.string()]).transform((val) => {
    const num = typeof val === "string" ? parseFloat(val) : val;
    if (isNaN(num) || num <= 0) throw new Error("Amount must be a positive number");
    return num;
  }),
  dueDay: z.coerce.number().int().min(1, "Due day must be at least 1").max(31, "Due day must be at most 31"),
  category: z.nativeEnum(BillCategory).optional(),
  isRecurring: z.boolean().optional(),
  frequency: z.nativeEnum(BillFrequency).optional(),
  debtId: z.string().optional().nullable(),
  bankAccountId: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const bills = await prisma.bill.findMany({
    where: { userId: session.user.id },
    include: { debt: true },
    orderBy: [{ category: "asc" }, { dueDay: "asc" }],
  });

  return NextResponse.json(bills);
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const result = billSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json(
      { error: result.error.issues.map((i) => i.message).join(", ") },
      { status: 400 }
    );
  }

  const { name, category, amount, dueDay, isRecurring, frequency, debtId, bankAccountId, notes } = result.data;

  if (debtId) {
    const debt = await prisma.debt.findFirst({
      where: { id: debtId, userId: session.user.id },
      select: { id: true },
    });
    if (!debt) {
      return NextResponse.json({ error: "Invalid debt reference" }, { status: 400 });
    }
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

  const bill = await prisma.bill.create({
    data: {
      userId: session.user.id,
      name,
      category: category || "OTHER",
      amount,
      dueDay,
      isRecurring: isRecurring ?? true,
      frequency: frequency || "MONTHLY",
      debtId: debtId || null,
      bankAccountId: bankAccountId || null,
      notes: notes || null,
    },
  });

  return NextResponse.json(bill, { status: 201 });
}
