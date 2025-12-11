import { g as getSession } from '../../../chunks/get-session-astro_CVC6HSBT.mjs';
import { g as getGoal, u as updateGoal, d as deleteGoal } from '../../../chunks/goals_D9yX8bsM.mjs';
import { a as apiError, b as apiResponse } from '../../../chunks/api-utils_VuBcwo3s.mjs';
export { renderers } from '../../../renderers.mjs';

const GET = async ({ request, params }) => {
  const session = await getSession(request);
  if (!session?.user?.id) {
    return apiError("Unauthorized", 401);
  }
  const { id } = params;
  if (!id) {
    return apiError("Goal ID required", 400);
  }
  const goal = await getGoal(session.user.id, id);
  if (!goal) {
    return apiError("Goal not found", 404);
  }
  return apiResponse(goal);
};
const PATCH = async ({ request, params }) => {
  const session = await getSession(request);
  if (!session?.user?.id) {
    return apiError("Unauthorized", 401);
  }
  const { id } = params;
  if (!id) {
    return apiError("Goal ID required", 400);
  }
  try {
    const body = await request.json();
    const goal = await updateGoal(session.user.id, id, body);
    return apiResponse(goal);
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to update goal", 400);
  }
};
const DELETE = async ({ request, params }) => {
  const session = await getSession(request);
  if (!session?.user?.id) {
    return apiError("Unauthorized", 401);
  }
  const { id } = params;
  if (!id) {
    return apiError("Goal ID required", 400);
  }
  try {
    await deleteGoal(session.user.id, id);
    return apiResponse({ success: true });
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to delete goal", 400);
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
