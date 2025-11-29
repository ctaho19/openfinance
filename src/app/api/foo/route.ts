import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import type { FOOStep, FOOStatus } from "@prisma/client";

const FOO_STEPS: FOOStep[] = [
  "DEDUCTIBLES_COVERED",
  "EMPLOYER_MATCH",
  "HIGH_INTEREST_DEBT",
  "EMERGENCY_FUND",
  "ROTH_HSA",
  "MAX_RETIREMENT",
  "HYPERACCUMULATION",
  "PREPAY_FUTURE",
  "PREPAY_LOW_INTEREST",
];

const FOO_STATUSES: FOOStatus[] = ["NOT_STARTED", "IN_PROGRESS", "COMPLETED"];

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const progress = await prisma.fOOProgress.findMany({
    where: { userId: session.user.id },
    orderBy: { step: "asc" },
  });

  return NextResponse.json(progress);
}

export async function PUT(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { step, status, targetAmount, currentAmount, notes } = body;

  if (!step || !FOO_STEPS.includes(step)) {
    return NextResponse.json({ error: "Invalid step" }, { status: 400 });
  }

  if (status && !FOO_STATUSES.includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const completedAt =
    status === "COMPLETED" ? new Date() : status === "NOT_STARTED" ? null : undefined;

  const progress = await prisma.fOOProgress.upsert({
    where: {
      userId_step: {
        userId: session.user.id,
        step: step as FOOStep,
      },
    },
    update: {
      ...(status && { status: status as FOOStatus }),
      ...(targetAmount !== undefined && { targetAmount }),
      ...(currentAmount !== undefined && { currentAmount }),
      ...(notes !== undefined && { notes }),
      ...(completedAt !== undefined && { completedAt }),
    },
    create: {
      userId: session.user.id,
      step: step as FOOStep,
      status: (status as FOOStatus) || "NOT_STARTED",
      targetAmount,
      currentAmount,
      notes,
      completedAt: status === "COMPLETED" ? new Date() : null,
    },
  });

  return NextResponse.json(progress);
}
