import type { APIRoute } from "astro";
import { getSession } from "../../../lib/get-session-astro";
import { prisma } from "../../../lib/db";
import { apiResponse, apiError } from "../../../lib/api-utils";

const VALID_BANK_TYPES = [
  "NAVY_FEDERAL",
  "PNC",
  "CAPITAL_ONE",
  "TRUIST",
  "CHASE",
  "BANK_OF_AMERICA",
  "WELLS_FARGO",
  "OTHER",
] as const;

export const GET: APIRoute = async ({ request }) => {
  const session = await getSession(request);
  if (!session?.user?.id) {
    return apiError("Unauthorized", 401);
  }

  const accounts = await prisma.bankAccount.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "asc" },
  });
  return apiResponse(accounts);
};

export const POST: APIRoute = async ({ request }) => {
  const session = await getSession(request);
  if (!session?.user?.id) {
    return apiError("Unauthorized", 401);
  }

  try {
    const body = await request.json();

    if (!body.name || typeof body.name !== "string") {
      return apiError("name is required", 400);
    }

    if (!body.bank || !VALID_BANK_TYPES.includes(body.bank)) {
      return apiError(`bank must be one of: ${VALID_BANK_TYPES.join(", ")}`, 400);
    }

    const isDefault = body.isDefault === true;

    if (isDefault) {
      await prisma.bankAccount.updateMany({
        where: { userId: session.user.id, isDefault: true },
        data: { isDefault: false },
      });
    }

    const account = await prisma.bankAccount.create({
      data: {
        userId: session.user.id,
        name: body.name,
        bank: body.bank,
        lastFour: body.lastFour ?? null,
        isDefault,
      },
    });

    return apiResponse(account, 201);
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to create bank account", 400);
  }
};
