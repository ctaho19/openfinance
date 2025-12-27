import { g as getSession } from '../../../chunks/get-session-astro_CVC6HSBT.mjs';
import { g as getCurrentDebtTotal, a as recalculatePayoffBaseline } from '../../../chunks/dollar-allocation-plan_D5-OnGrS.mjs';
import { a as apiError, b as apiResponse } from '../../../chunks/api-utils_VuBcwo3s.mjs';
export { renderers } from '../../../renderers.mjs';

const GET = async ({ request }) => {
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
const POST = async ({ request }) => {
  const session = await getSession(request);
  if (!session?.user?.id) {
    return apiError("Unauthorized", 401);
  }
  try {
    const body = await request.json().catch(() => ({}));
    const preserveStartDate = body.preserveStartDate ?? false;
    const result = await recalculatePayoffBaseline(session.user.id, {
      preserveStartDate
    });
    return apiResponse({
      success: true,
      ...result,
      previousStartDate: result.previousStartDate?.toISOString() ?? null,
      newStartDate: result.newStartDate.toISOString()
    });
  } catch (error) {
    console.error("Error syncing baseline:", error);
    return apiError(
      error instanceof Error ? error.message : "Failed to sync baseline",
      500
    );
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  GET,
  POST
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
//# sourceMappingURL=sync-baseline.astro.mjs.map
