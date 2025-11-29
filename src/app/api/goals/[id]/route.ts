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

  const goal = await prisma.savingsGoal.findFirst({
    where: { id, userId: session.user.id },
  });

  if (!goal) {
    return NextResponse.json({ error: "Goal not found" }, { status: 404 });
  }

  return NextResponse.json(goal);
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

  const existing = await prisma.savingsGoal.findFirst({
    where: { id, userId: session.user.id },
  });

  if (!existing) {
    return NextResponse.json({ error: "Goal not found" }, { status: 404 });
  }

  const body = await request.json();
  const { name, targetAmount, currentAmount, deadline, fooStep, notes } = body;

  const goal = await prisma.savingsGoal.update({
    where: { id },
    data: {
      ...(name !== undefined && { name }),
      ...(targetAmount !== undefined && { targetAmount: parseFloat(targetAmount) }),
      ...(currentAmount !== undefined && { currentAmount: parseFloat(currentAmount) }),
      ...(deadline !== undefined && { deadline: deadline ? new Date(deadline) : null }),
      ...(fooStep !== undefined && { fooStep: fooStep || null }),
      ...(notes !== undefined && { notes: notes || null }),
    },
  });

  return NextResponse.json(goal);
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

  const existing = await prisma.savingsGoal.findFirst({
    where: { id, userId: session.user.id },
  });

  if (!existing) {
    return NextResponse.json({ error: "Goal not found" }, { status: 404 });
  }

  await prisma.savingsGoal.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
