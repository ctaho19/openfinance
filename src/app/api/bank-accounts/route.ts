import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { BankType } from "@prisma/client";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const accounts = await prisma.bankAccount.findMany({
    where: { userId: session.user.id },
    orderBy: [{ isDefault: "desc" }, { name: "asc" }],
  });

  return NextResponse.json(accounts);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { name, bank, lastFour, isDefault } = body;

  if (!name || !bank) {
    return NextResponse.json({ error: "Name and bank are required" }, { status: 400 });
  }

  if (!Object.values(BankType).includes(bank)) {
    return NextResponse.json({ error: "Invalid bank type" }, { status: 400 });
  }

  // If setting as default, unset other defaults
  if (isDefault) {
    await prisma.bankAccount.updateMany({
      where: { userId: session.user.id },
      data: { isDefault: false },
    });
  }

  const account = await prisma.bankAccount.create({
    data: {
      userId: session.user.id,
      name,
      bank,
      lastFour: lastFour || null,
      isDefault: isDefault || false,
    },
  });

  return NextResponse.json(account, { status: 201 });
}
