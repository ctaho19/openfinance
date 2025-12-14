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

export const GET: APIRoute = async ({ request, params }) => {
  const session = await getSession(request);
  if (!session?.user?.id) {
    return apiError("Unauthorized", 401);
  }

  const { id } = params;
  if (!id) {
    return apiError("Account ID required", 400);
  }

  const account = await prisma.bankAccount.findFirst({
    where: { id, userId: session.user.id },
  });

  if (!account) {
    return apiError("Bank account not found", 404);
  }

  return apiResponse(account);
};

export const PATCH: APIRoute = async ({ request, params }) => {
  const session = await getSession(request);
  if (!session?.user?.id) {
    return apiError("Unauthorized", 401);
  }

  const { id } = params;
  if (!id) {
    return apiError("Account ID required", 400);
  }

  try {
    const body = await request.json();

    const existing = await prisma.bankAccount.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!existing) {
      return apiError("Bank account not found", 404);
    }

    if (body.bank && !VALID_BANK_TYPES.includes(body.bank)) {
      return apiError(`bank must be one of: ${VALID_BANK_TYPES.join(", ")}`, 400);
    }

    const isDefault = body.isDefault === true;

    if (isDefault && !existing.isDefault) {
      await prisma.bankAccount.updateMany({
        where: { userId: session.user.id, isDefault: true },
        data: { isDefault: false },
      });
    }

    const account = await prisma.bankAccount.update({
      where: { id },
      data: {
        name: body.name ?? existing.name,
        bank: body.bank ?? existing.bank,
        lastFour: body.lastFour !== undefined ? body.lastFour : existing.lastFour,
        isDefault: body.isDefault !== undefined ? isDefault : existing.isDefault,
      },
    });

    return apiResponse(account);
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to update bank account", 400);
  }
};

export const DELETE: APIRoute = async ({ request, params }) => {
  const session = await getSession(request);
  if (!session?.user?.id) {
    return apiError("Unauthorized", 401);
  }

  const { id } = params;
  if (!id) {
    return apiError("Account ID required", 400);
  }

  try {
    const existing = await prisma.bankAccount.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!existing) {
      return apiError("Bank account not found", 404);
    }

    await prisma.bill.updateMany({
      where: { bankAccountId: id },
      data: { bankAccountId: null },
    });

    await prisma.debt.updateMany({
      where: { bankAccountId: id },
      data: { bankAccountId: null },
    });

    await prisma.bankAccount.delete({
      where: { id },
    });

    return apiResponse({ success: true });
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to delete bank account", 400);
  }
};
