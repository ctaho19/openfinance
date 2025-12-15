import { g as getSession } from '../../../chunks/get-session-astro_CVC6HSBT.mjs';
import { g as getDebt, u as updateDebt } from '../../../chunks/debts_BeGaaKxR.mjs';
import { p as prisma } from '../../../chunks/auth-config_mz_UKjvQ.mjs';
import { a as apiError, b as apiResponse } from '../../../chunks/api-utils_VuBcwo3s.mjs';
export { renderers } from '../../../renderers.mjs';

const GET = async ({ request, params }) => {
  const session = await getSession(request);
  if (!session?.user?.id) {
    return apiError("Unauthorized", 401);
  }
  const { id } = params;
  if (!id) {
    return apiError("Debt ID required", 400);
  }
  const debt = await getDebt(session.user.id, id);
  if (!debt) {
    return apiError("Debt not found", 404);
  }
  return apiResponse(debt);
};
const PATCH = async ({ request, params }) => {
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
    const debt = await updateDebt(session.user.id, id, body);
    return apiResponse(debt);
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to update debt", 400);
  }
};
const DELETE = async ({ request, params }) => {
  const session = await getSession(request);
  if (!session?.user?.id) {
    return apiError("Unauthorized", 401);
  }
  const { id } = params;
  if (!id) {
    return apiError("Debt ID required", 400);
  }
  try {
    const existing = await prisma.debt.findFirst({
      where: { id, userId: session.user.id }
    });
    if (!existing) {
      return apiError("Debt not found", 404);
    }
    await prisma.debt.update({
      where: { id },
      data: { isActive: false }
    });
    return apiResponse({ success: true });
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to delete debt", 400);
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
