import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

// GET: Preview what will be deleted
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Find BNPL bills with no linked debt (these show as "Unknown BNPL")
  const orphanedBnplBills = await prisma.bill.findMany({
    where: {
      userId: session.user.id,
      category: "BNPL",
      debtId: null,
    },
    include: {
      payments: true,
    },
  });

  return NextResponse.json({
    message: "Preview of BNPL bills with no linked debt (Unknown BNPL)",
    count: orphanedBnplBills.length,
    bills: orphanedBnplBills.map((bill) => ({
      id: bill.id,
      name: bill.name,
      amount: bill.amount,
      dueDay: bill.dueDay,
      paymentsCount: bill.payments.length,
    })),
  });
}

// DELETE: Remove the orphaned BNPL bills
export async function DELETE() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Find and delete BNPL bills with no linked debt
  // Bill payments will cascade delete automatically
  const result = await prisma.bill.deleteMany({
    where: {
      userId: session.user.id,
      category: "BNPL",
      debtId: null,
    },
  });

  return NextResponse.json({
    message: "Deleted orphaned BNPL bills",
    deletedCount: result.count,
  });
}
