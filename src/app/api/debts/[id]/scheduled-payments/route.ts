import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const debt = await prisma.debt.findFirst({
    where: { id, userId: session.user.id },
  });

  if (!debt) {
    return NextResponse.json({ error: "Debt not found" }, { status: 404 });
  }

  const scheduledPayments = await prisma.scheduledPayment.findMany({
    where: { debtId: id },
    orderBy: { dueDate: "asc" },
  });

  return NextResponse.json(scheduledPayments);
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const debt = await prisma.debt.findFirst({
    where: { id, userId: session.user.id },
  });

  if (!debt) {
    return NextResponse.json({ error: "Debt not found" }, { status: 404 });
  }

  const body = await request.json();
  const { dueDate, amount, notes } = body;

  if (!dueDate || !amount) {
    return NextResponse.json({ error: "dueDate and amount are required" }, { status: 400 });
  }

  const scheduledPayment = await prisma.scheduledPayment.create({
    data: {
      debtId: id,
      dueDate: new Date(dueDate),
      amount,
      notes: notes || null,
    },
  });

  return NextResponse.json(scheduledPayment, { status: 201 });
}
