import type { APIRoute } from "astro";
import { getSession } from "../../../lib/get-session-astro";
import { getDebt, updateDebt } from "../../../lib/services/debts";
import { prisma } from "../../../lib/db";
import { apiResponse, apiError } from "../../../lib/api-utils";

export const GET: APIRoute = async ({ request, params }) => {
  const session = await getSession(request);
  if (!session?.user?.id) {
    return apiError("Unauthorized", 401);
  }

  const { id } = params;
  if (!id) {
    return apiError("Debt ID required", 400);
  }

  const debt = await getDebt(session.user.id, id);
  if (!debt) {
    return apiError("Debt not found", 404);
  }

  return apiResponse(debt);
};

export const PATCH: APIRoute = async ({ request, params }) => {
  const session = await getSession(request);
  if (!session?.user?.id) {
    return apiError("Unauthorized", 401);
  }

  const { id } = params;
  if (!id) {
    return apiError("Debt ID required", 400);
  }

  try {
    const body = await request.json();
    const debt = await updateDebt(session.user.id, id, body);
    return apiResponse(debt);
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to update debt", 400);
  }
};

export const DELETE: APIRoute = async ({ request, params }) => {
  const session = await getSession(request);
  if (!session?.user?.id) {
    return apiError("Unauthorized", 401);
  }

  const { id } = params;
  if (!id) {
    return apiError("Debt ID required", 400);
  }

  try {
    const existing = await prisma.debt.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!existing) {
      return apiError("Debt not found", 404);
    }

    await prisma.debt.update({
      where: { id },
      data: { isActive: false },
    });

    return apiResponse({ success: true });
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to delete debt", 400);
  }
};
