import { g as getSession } from '../../../chunks/get-session-astro_CVC6HSBT.mjs';
import { g as getPaymentStatus, m as markPaymentUnpaid, a as markPaymentPaid } from '../../../chunks/pay-periods_BQe5dfMu.mjs';
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

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  PATCH
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
//# sourceMappingURL=_id_.astro.mjs.map
