import type { APIRoute } from "astro";
import { getSession } from "../../../lib/get-session-astro";
import { recordExtraDebtPayment } from "../../../lib/services/dollar-allocation-plan";
import { apiResponse, apiError } from "../../../lib/api-utils";

export const POST: APIRoute = async ({ request }) => {
  const session = await getSession(request);
  if (!session?.user?.id) {
    return apiError("Unauthorized", 401);
  }

  try {
    const body = await request.json();
    
    if (!body.debtId || !body.amount) {
      return apiError("debtId and amount are required", 400);
    }

    const result = await recordExtraDebtPayment(
      session.user.id,
      body.debtId,
      body.amount
    );

    return apiResponse(result);
  } catch (error) {
    console.error("Error recording extra payment:", error);
    return apiError(
      error instanceof Error ? error.message : "Failed to record extra payment",
      400
    );
  }
};
