import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

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
  const { description, amount, paidAt, debtId, category, notes } = body;

  if (!description || !amount || !paidAt || !category) {
    return NextResponse.json(
      { error: "Description, amount, paidAt, and category are required" },
      { status: 400 }
    );
  }

  const validCategories = ["BNPL_CATCHUP", "DEBT_SURPLUS", "ONE_TIME", "OTHER"];
  if (!validCategories.includes(category)) {
    return NextResponse.json(
      { error: "Invalid category" },
      { status: 400 }
    );
  }

  if (debtId) {
    const debt = await prisma.debt.findFirst({
      where: { id: debtId, userId: session.user.id },
    });
    if (!debt) {
      return NextResponse.json(
        { error: "Debt not found" },
        { status: 404 }
      );
    }
  }

  const quickPayment = await prisma.quickPayment.create({
    data: {
      userId: session.user.id,
      description,
      amount: parseFloat(amount),
      paidAt: new Date(paidAt),
      debtId: debtId || null,
      category,
      notes: notes || null,
    },
    include: { debt: { select: { id: true, name: true, type: true } } },
  });

  return NextResponse.json(quickPayment, { status: 201 });
}
