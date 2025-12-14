import type { APIRoute } from "astro";
import { getSession } from "../../../lib/get-session-astro";
import { markPaymentPaid, markPaymentUnpaid, getPaymentStatus } from "../../../lib/services/pay-periods";
import { apiResponse, apiError } from "../../../lib/api-utils";

export const PATCH: APIRoute = async ({ request, params }) => {
  const session = await getSession(request);
  if (!session?.user?.id) {
    return apiError("Unauthorized", 401);
  }

  const { id } = params;
  if (!id) {
    return apiError("Payment ID required", 400);
  }

  try {
    const body = await request.json();
    const { status, togglePaid } = body;

    if (togglePaid) {
      const currentStatus = await getPaymentStatus(session.user.id, id);
      if (currentStatus === "PAID") {
        const payment = await markPaymentUnpaid(session.user.id, id);
        return apiResponse({ payment, debtUpdated: false });
      } else {
        const result = await markPaymentPaid(session.user.id, id);
        return apiResponse(result);
      }
    } else if (status === "PAID") {
      const result = await markPaymentPaid(session.user.id, id);
      return apiResponse(result);
    } else if (status === "UNPAID") {
      const payment = await markPaymentUnpaid(session.user.id, id);
      return apiResponse({ payment, debtUpdated: false });
    } else {
      return apiError("Invalid request. Provide 'status' (PAID/UNPAID) or 'togglePaid'", 400);
    }
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to update payment", 400);
  }
};
