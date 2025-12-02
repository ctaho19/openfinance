import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { QuickPaymentCategory } from "@prisma/client";

const quickPaymentSchema = z.object({
  description: z.string().min(1, "Description is required"),
  amount: z.union([z.number(), z.string()]).transform((val) => {
    const num = typeof val === "string" ? parseFloat(val) : val;
    if (isNaN(num) || num <= 0) throw new Error("Amount must be a positive number");
    return num;
  }),
  paidAt: z.coerce.date(),
  debtId: z.string().optional().nullable(),
  category: z.nativeEnum(QuickPaymentCategory),
  notes: z.string().optional().nullable(),
});

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");

  const where: {
    userId: string;
    paidAt?: { gte?: Date; lte?: Date };
  } = { userId: session.user.id };

  if (startDate || endDate) {
    where.paidAt = {};
    if (startDate) where.paidAt.gte = new Date(startDate);
    if (endDate) where.paidAt.lte = new Date(endDate);
  }

  const quickPayments = await prisma.quickPayment.findMany({
    where,
    include: { debt: { select: { id: true, name: true, type: true } } },
    orderBy: { paidAt: "desc" },
  });

  return NextResponse.json(quickPayments);
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const result = quickPaymentSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json(
      { error: result.error.issues.map((i) => i.message).join(", ") },
      { status: 400 }
    );
  }

  const { description, amount, paidAt, debtId, category, notes } = result.data;

  if (debtId) {
    const debt = await prisma.debt.findFirst({
      where: { id: debtId, userId: session.user.id },
    });
    if (!debt) {
      return NextResponse.json({ error: "Debt not found" }, { status: 404 });
    }
  }

  const quickPayment = await prisma.quickPayment.create({
    data: {
      userId: session.user.id,
      description,
      amount,
      paidAt,
      debtId: debtId || null,
      category,
      notes: notes || null,
    },
    include: { debt: { select: { id: true, name: true, type: true } } },
  });

  return NextResponse.json(quickPayment, { status: 201 });
}
