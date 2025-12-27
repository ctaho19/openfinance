import type { APIRoute } from "astro";
import { getSession } from "../../../lib/get-session-astro";
import { updateEmergencyFund } from "../../../lib/services/dollar-allocation-plan";
import { apiResponse, apiError } from "../../../lib/api-utils";

export const POST: APIRoute = async ({ request }) => {
  const session = await getSession(request);
  if (!session?.user?.id) {
    return apiError("Unauthorized", 401);
  }

  try {
    const body = await request.json();
    
    if (!body.amount || body.amount <= 0) {
      return apiError("amount must be a positive number", 400);
    }

    const result = await updateEmergencyFund(session.user.id, body.amount);

    return apiResponse(result);
  } catch (error) {
    console.error("Error updating emergency fund:", error);
    return apiError(
      error instanceof Error ? error.message : "Failed to update emergency fund",
      400
    );
  }
};
