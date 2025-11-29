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

  const payments = await prisma.debtPayment.findMany({
    where: { debtId: id },
    orderBy: { date: "desc" },
  });

  return NextResponse.json(payments);
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
  const { amount, date, notes } = body;

  if (amount === undefined || !date) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const paymentAmount = Number(amount);
  const currentBalance = Number(debt.currentBalance);
  const interestRate = Number(debt.interestRate);

  const monthlyRate = interestRate / 100 / 12;
  const interestPortion = currentBalance * monthlyRate;
  const principalPortion = Math.max(0, paymentAmount - interestPortion);
  const newBalance = Math.max(0, currentBalance - principalPortion);

  const [payment] = await prisma.$transaction([
    prisma.debtPayment.create({
      data: {
        debtId: id,
        date: new Date(date),
        amount: paymentAmount,
        principal: principalPortion,
        interest: Math.min(interestPortion, paymentAmount),
        newBalance,
        notes: notes || null,
      },
    }),
    prisma.debt.update({
      where: { id },
      data: { currentBalance: newBalance },
    }),
  ]);

  return NextResponse.json(payment, { status: 201 });
}
