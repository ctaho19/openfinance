import { g as getSession } from '../../../chunks/get-session-astro_CVC6HSBT.mjs';
import { r as recordExtraDebtPayment } from '../../../chunks/dollar-allocation-plan_Dm62CO0y.mjs';
import { a as apiError, b as apiResponse } from '../../../chunks/api-utils_VuBcwo3s.mjs';
export { renderers } from '../../../renderers.mjs';

const POST = async ({ request }) => {
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

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  POST
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
//# sourceMappingURL=extra-payment.astro.mjs.map
