import type { APIRoute } from "astro";
import { getSession } from "../../../lib/get-session-astro";
import { getGoal, updateGoal, deleteGoal } from "../../../lib/services/goals";
import { apiResponse, apiError } from "../../../lib/api-utils";

export const GET: APIRoute = async ({ request, params }) => {
  const session = await getSession(request);
  if (!session?.user?.id) {
    return apiError("Unauthorized", 401);
  }

  const { id } = params;
  if (!id) {
    return apiError("Goal ID required", 400);
  }

  const goal = await getGoal(session.user.id, id);
  if (!goal) {
    return apiError("Goal not found", 404);
  }

  return apiResponse(goal);
};

export const PATCH: APIRoute = async ({ request, params }) => {
  const session = await getSession(request);
  if (!session?.user?.id) {
    return apiError("Unauthorized", 401);
  }

  const { id } = params;
  if (!id) {
    return apiError("Goal ID required", 400);
  }

  try {
    const body = await request.json();
    const goal = await updateGoal(session.user.id, id, body);
    return apiResponse(goal);
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to update goal", 400);
  }
};

export const DELETE: APIRoute = async ({ request, params }) => {
  const session = await getSession(request);
  if (!session?.user?.id) {
    return apiError("Unauthorized", 401);
  }

  const { id } = params;
  if (!id) {
    return apiError("Goal ID required", 400);
  }

  try {
    await deleteGoal(session.user.id, id);
    return apiResponse({ success: true });
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to delete goal", 400);
  }
};
