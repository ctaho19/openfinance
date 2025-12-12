import type { APIRoute } from "astro";
import { getSession } from "../../../lib/get-session-astro";
import { getFOOProgress, updateFOOStep } from "../../../lib/services/foo";
import type { FOOStep } from "@prisma/client";
import { apiResponse, apiError } from "../../../lib/api-utils";

export const GET: APIRoute = async ({ request }) => {
  const session = await getSession(request);
  if (!session?.user?.id) {
    return apiError("Unauthorized", 401);
  }

  const progress = await getFOOProgress(session.user.id);
  return apiResponse(progress);
};

export const PATCH: APIRoute = async ({ request }) => {
  const session = await getSession(request);
  if (!session?.user?.id) {
    return apiError("Unauthorized", 401);
  }

  try {
    const body = await request.json();
    const { step, ...data } = body;

    if (!step) {
      return apiError("Step is required", 400);
    }

    const updated = await updateFOOStep(session.user.id, step as FOOStep, data);
    return apiResponse(updated);
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to update FOO progress", 400);
  }
};
