import type { APIRoute } from "astro";
import { getSession } from "../../../lib/get-session-astro";
import { listGoals, createGoal } from "../../../lib/services/goals";
import { apiResponse, apiError } from "../../../lib/api-utils";

export const GET: APIRoute = async ({ request }) => {
  const session = await getSession(request);
  if (!session?.user?.id) {
    return apiError("Unauthorized", 401);
  }

  const goals = await listGoals(session.user.id);
  return apiResponse(goals);
};

export const POST: APIRoute = async ({ request }) => {
  const session = await getSession(request);
  if (!session?.user?.id) {
    return apiError("Unauthorized", 401);
  }

  try {
    const body = await request.json();
    const goal = await createGoal(session.user.id, body);
    return apiResponse(goal, 201);
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to create goal", 400);
  }
};
