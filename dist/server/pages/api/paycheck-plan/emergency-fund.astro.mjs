import { g as getSession } from '../../../chunks/get-session-astro_CVC6HSBT.mjs';
import { u as updateEmergencyFund } from '../../../chunks/dollar-allocation-plan_BLinAmuv.mjs';
import { a as apiError, b as apiResponse } from '../../../chunks/api-utils_VuBcwo3s.mjs';
export { renderers } from '../../../renderers.mjs';

const POST = async ({ request }) => {
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

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  POST
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
//# sourceMappingURL=emergency-fund.astro.mjs.map
