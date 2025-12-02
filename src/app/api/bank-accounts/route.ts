import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { BankType } from "@prisma/client";

const bankAccountSchema = z.object({
  name: z.string().min(1, "Name is required"),
  bank: z.nativeEnum(BankType),
  lastFour: z
    .string()
    .length(4, "Last four must be exactly 4 digits")
    .regex(/^\d{4}$/, "Last four must be numeric")
    .optional()
    .nullable(),
  isDefault: z.boolean().optional(),
});

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
  const result = bankAccountSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json(
      { error: result.error.issues.map((i) => i.message).join(", ") },
      { status: 400 }
    );
  }

  const { name, bank, lastFour, isDefault } = result.data;

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
