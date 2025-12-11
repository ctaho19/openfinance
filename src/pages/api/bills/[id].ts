import type { APIRoute } from "astro";
import { getSession } from "../../../lib/get-session-astro";
import { getBill, updateBill, deleteBill } from "../../../lib/services/bills";
import { apiResponse, apiError } from "../../../lib/api-utils";

export const GET: APIRoute = async ({ request, params }) => {
  const session = await getSession(request);
  if (!session?.user?.id) {
    return apiError("Unauthorized", 401);
  }

  const { id } = params;
  if (!id) {
    return apiError("Bill ID required", 400);
  }

  const bill = await getBill(session.user.id, id);
  if (!bill) {
    return apiError("Bill not found", 404);
  }

  return apiResponse(bill);
};

export const PATCH: APIRoute = async ({ request, params }) => {
  const session = await getSession(request);
  if (!session?.user?.id) {
    return apiError("Unauthorized", 401);
  }

  const { id } = params;
  if (!id) {
    return apiError("Bill ID required", 400);
  }

  try {
    const body = await request.json();
    const bill = await updateBill(session.user.id, id, body);
    return apiResponse(bill);
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to update bill", 400);
  }
};

export const DELETE: APIRoute = async ({ request, params }) => {
  const session = await getSession(request);
  if (!session?.user?.id) {
    return apiError("Unauthorized", 401);
  }

  const { id } = params;
  if (!id) {
    return apiError("Bill ID required", 400);
  }

  try {
    await deleteBill(session.user.id, id);
    return apiResponse({ success: true });
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to delete bill", 400);
  }
};
