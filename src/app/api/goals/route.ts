import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const goals = await prisma.savingsGoal.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(goals);
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { name, targetAmount, currentAmount, deadline, fooStep, notes } = body;

  if (!name || !targetAmount) {
    return NextResponse.json(
      { error: "Name and target amount are required" },
      { status: 400 }
    );
  }

  const goal = await prisma.savingsGoal.create({
    data: {
      userId: session.user.id,
      name,
      targetAmount: parseFloat(targetAmount),
      currentAmount: currentAmount ? parseFloat(currentAmount) : 0,
      deadline: deadline ? new Date(deadline) : null,
      fooStep: fooStep || null,
      notes: notes || null,
    },
  });

  return NextResponse.json(goal, { status: 201 });
}
