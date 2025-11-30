import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const existing = await prisma.bankAccount.findFirst({
    where: { id, userId: session.user.id },
  });

  if (!existing) {
    return NextResponse.json({ error: "Bank account not found" }, { status: 404 });
  }

  const body = await request.json();
  const { name, bank, lastFour, isDefault } = body;

  // If setting as default, unset other defaults
  if (isDefault) {
    await prisma.bankAccount.updateMany({
      where: { userId: session.user.id, id: { not: id } },
      data: { isDefault: false },
    });
  }

  const account = await prisma.bankAccount.update({
    where: { id },
    data: {
      ...(name !== undefined && { name }),
      ...(bank !== undefined && { bank }),
      ...(lastFour !== undefined && { lastFour }),
      ...(isDefault !== undefined && { isDefault }),
    },
  });

  return NextResponse.json(account);
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

  const existing = await prisma.bankAccount.findFirst({
    where: { id, userId: session.user.id },
  });

  if (!existing) {
    return NextResponse.json({ error: "Bank account not found" }, { status: 404 });
  }

  await prisma.bankAccount.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
