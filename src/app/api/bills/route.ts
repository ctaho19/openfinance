import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

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
  const { name, category, amount, dueDay, isRecurring, frequency, debtId, bankAccountId, notes } = body;

  if (!name || !amount || !dueDay) {
    return NextResponse.json(
      { error: "Name, amount, and due day are required" },
      { status: 400 }
    );
  }

  if (dueDay < 1 || dueDay > 31) {
    return NextResponse.json(
      { error: "Due day must be between 1 and 31" },
      { status: 400 }
    );
  }

  const bill = await prisma.bill.create({
    data: {
      userId: session.user.id,
      name,
      category: category || "OTHER",
      amount: parseFloat(amount),
      dueDay: parseInt(dueDay),
      isRecurring: isRecurring ?? true,
      frequency: frequency || "MONTHLY",
      debtId: debtId || null,
      bankAccountId: bankAccountId || null,
      notes: notes || null,
    },
  });

  return NextResponse.json(bill, { status: 201 });
}
