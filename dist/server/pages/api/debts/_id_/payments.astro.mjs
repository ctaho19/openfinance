import { g as getSession } from '../../../../chunks/get-session-astro_CVC6HSBT.mjs';
import { r as recordPayment } from '../../../../chunks/debts_CS0jnHWh.mjs';
import { a as apiError, b as apiResponse } from '../../../../chunks/api-utils_VuBcwo3s.mjs';
export { renderers } from '../../../../renderers.mjs';

const POST = async ({ request, params }) => {
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

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  POST
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
//# sourceMappingURL=payments.astro.mjs.map
