import type { APIRoute } from "astro";
import { getSession } from "../../../lib/get-session-astro";
import { recalculatePayoffBaseline, getCurrentDebtTotal } from "../../../lib/services/dollar-allocation-plan";
import { apiResponse, apiError } from "../../../lib/api-utils";

export const GET: APIRoute = async ({ request }) => {
  const session = await getSession(request);
  if (!session?.user?.id) {
    return apiError("Unauthorized", 401);
  }

  try {
    const currentTotal = await getCurrentDebtTotal(session.user.id);
    return apiResponse({ currentDebtTotal: currentTotal });
  } catch (error) {
    console.error("Error getting current debt total:", error);
    return apiError(
      error instanceof Error ? error.message : "Failed to get debt total",
      500
    );
  }
};

export const POST: APIRoute = async ({ request }) => {
  const session = await getSession(request);
  if (!session?.user?.id) {
    return apiError("Unauthorized", 401);
  }

  try {
    const body = await request.json().catch(() => ({}));
    const preserveStartDate = body.preserveStartDate ?? false;

    const result = await recalculatePayoffBaseline(session.user.id, {
      preserveStartDate,
    });

    return apiResponse({
      success: true,
      ...result,
      previousStartDate: result.previousStartDate?.toISOString() ?? null,
      newStartDate: result.newStartDate.toISOString(),
    });
  } catch (error) {
    console.error("Error syncing baseline:", error);
    return apiError(
      error instanceof Error ? error.message : "Failed to sync baseline",
      500
    );
  }
};
