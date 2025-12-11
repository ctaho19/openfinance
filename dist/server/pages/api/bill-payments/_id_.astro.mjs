import { g as getSession } from '../../../chunks/get-session-astro_CVC6HSBT.mjs';
import { m as markPaymentPaid, a as markPaymentUnpaid } from '../../../chunks/pay-periods_DhVbftd9.mjs';
import { a as apiError, b as apiResponse } from '../../../chunks/api-utils_VuBcwo3s.mjs';
export { renderers } from '../../../renderers.mjs';

const PATCH = async ({ request, params }) => {
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
    const { status } = body;
    if (status === "PAID") {
      const result = await markPaymentPaid(session.user.id, id);
      return apiResponse(result);
    } else if (status === "UNPAID") {
      const payment = await markPaymentUnpaid(session.user.id, id);
      return apiResponse({ payment, debtUpdated: false });
    } else {
      return apiError("Invalid status. Must be 'PAID' or 'UNPAID'", 400);
    }
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to update payment", 400);
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  PATCH
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
//# sourceMappingURL=_id_.astro.mjs.map
