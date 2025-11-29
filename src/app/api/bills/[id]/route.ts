import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const bill = await prisma.bill.findFirst({
    where: { id, userId: session.user.id },
    include: { debt: true },
  });

  if (!bill) {
    return NextResponse.json({ error: "Bill not found" }, { status: 404 });
  }

  return NextResponse.json(bill);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const existing = await prisma.bill.findFirst({
    where: { id, userId: session.user.id },
  });

  if (!existing) {
    return NextResponse.json({ error: "Bill not found" }, { status: 404 });
  }

  const body = await request.json();
  const { name, category, amount, dueDay, isRecurring, frequency, debtId, notes, isActive } = body;

  const bill = await prisma.bill.update({
    where: { id },
    data: {
      ...(name !== undefined && { name }),
      ...(category !== undefined && { category }),
      ...(amount !== undefined && { amount: parseFloat(amount) }),
      ...(dueDay !== undefined && { dueDay: parseInt(dueDay) }),
      ...(isRecurring !== undefined && { isRecurring }),
      ...(frequency !== undefined && { frequency }),
      ...(debtId !== undefined && { debtId: debtId || null }),
      ...(notes !== undefined && { notes: notes || null }),
      ...(isActive !== undefined && { isActive }),
    },
  });

  return NextResponse.json(bill);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const existing = await prisma.bill.findFirst({
    where: { id, userId: session.user.id },
  });

  if (!existing) {
    return NextResponse.json({ error: "Bill not found" }, { status: 404 });
  }

  await prisma.bill.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
