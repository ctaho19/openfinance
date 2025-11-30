import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { DebtType, DebtStatus } from "@prisma/client";

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

  return NextResponse.json(debt);
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const existing = await prisma.debt.findFirst({
    where: { id, userId: session.user.id },
  });

  if (!existing) {
    return NextResponse.json({ error: "Debt not found" }, { status: 404 });
  }

  const body = await request.json();
  const {
    name,
    type,
    status,
    currentBalance,
    originalBalance,
    interestRate,
    minimumPayment,
    dueDay,
    deferredUntil,
    notes,
    isActive,
  } = body;

  if (type && !Object.values(DebtType).includes(type)) {
    return NextResponse.json({ error: "Invalid debt type" }, { status: 400 });
  }

  if (status && !Object.values(DebtStatus).includes(status)) {
    return NextResponse.json({ error: "Invalid debt status" }, { status: 400 });
  }

  const debt = await prisma.debt.update({
    where: { id },
    data: {
      ...(name !== undefined && { name }),
      ...(type !== undefined && { type }),
      ...(status !== undefined && { status }),
      ...(currentBalance !== undefined && { currentBalance }),
      ...(originalBalance !== undefined && { originalBalance }),
      ...(interestRate !== undefined && { interestRate }),
      ...(minimumPayment !== undefined && { minimumPayment }),
      ...(dueDay !== undefined && { dueDay }),
      ...(deferredUntil !== undefined && { deferredUntil: deferredUntil ? new Date(deferredUntil) : null }),
      ...(notes !== undefined && { notes }),
      ...(isActive !== undefined && { isActive }),
    },
  });

  return NextResponse.json(debt);
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const existing = await prisma.debt.findFirst({
    where: { id, userId: session.user.id },
  });

  if (!existing) {
    return NextResponse.json({ error: "Debt not found" }, { status: 404 });
  }

  await prisma.debt.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
