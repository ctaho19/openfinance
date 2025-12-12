import type { APIRoute } from "astro";
import { getSession } from "../../../../lib/get-session-astro";
import { recordPayment } from "../../../../lib/services/debts";
import { apiResponse, apiError } from "../../../../lib/api-utils";

export const POST: APIRoute = async ({ request, params }) => {
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
    const payment = await recordPayment(session.user.id, id, body);
    return apiResponse(payment, 201);
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to record payment", 400);
  }
};
