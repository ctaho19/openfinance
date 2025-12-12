import { g as getSession } from '../../chunks/get-session-astro_CVC6HSBT.mjs';
import { l as listGoals, c as createGoal } from '../../chunks/goals_D9yX8bsM.mjs';
import { a as apiError, b as apiResponse } from '../../chunks/api-utils_VuBcwo3s.mjs';
export { renderers } from '../../renderers.mjs';

const GET = async ({ request }) => {
  const session = await getSession(request);
  if (!session?.user?.id) {
    return apiError("Unauthorized", 401);
  }
  const goals = await listGoals(session.user.id);
  return apiResponse(goals);
};
const POST = async ({ request }) => {
  const session = await getSession(request);
  if (!session?.user?.id) {
    return apiError("Unauthorized", 401);
  }
  try {
    const body = await request.json();
    const goal = await createGoal(session.user.id, body);
    return apiResponse(goal, 201);
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to create goal", 400);
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  GET,
  POST
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
//# sourceMappingURL=goals.astro.mjs.map
