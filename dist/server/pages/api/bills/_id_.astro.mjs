import { g as getSession } from '../../../chunks/get-session-astro_CVC6HSBT.mjs';
import { g as getBill, u as updateBill, d as deleteBill } from '../../../chunks/bills_Bja9DX58.mjs';
import { a as apiError, b as apiResponse } from '../../../chunks/api-utils_VuBcwo3s.mjs';
export { renderers } from '../../../renderers.mjs';

const GET = async ({ request, params }) => {
  const session = await getSession(request);
  if (!session?.user?.id) {
    return apiError("Unauthorized", 401);
  }
  const { id } = params;
  if (!id) {
    return apiError("Bill ID required", 400);
  }
  const bill = await getBill(session.user.id, id);
  if (!bill) {
    return apiError("Bill not found", 404);
  }
  return apiResponse(bill);
};
const PATCH = async ({ request, params }) => {
  const session = await getSession(request);
  if (!session?.user?.id) {
    return apiError("Unauthorized", 401);
  }
  const { id } = params;
  if (!id) {
    return apiError("Bill ID required", 400);
  }
  try {
    const body = await request.json();
    const bill = await updateBill(session.user.id, id, body);
    return apiResponse(bill);
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to update bill", 400);
  }
};
const DELETE = async ({ request, params }) => {
  const session = await getSession(request);
  if (!session?.user?.id) {
    return apiError("Unauthorized", 401);
  }
  const { id } = params;
  if (!id) {
    return apiError("Bill ID required", 400);
  }
  try {
    await deleteBill(session.user.id, id);
    return apiResponse({ success: true });
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to delete bill", 400);
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  DELETE,
  GET,
  PATCH
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
//# sourceMappingURL=_id_.astro.mjs.map
