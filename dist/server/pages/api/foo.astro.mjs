import { g as getSession } from '../../chunks/get-session-astro_CVC6HSBT.mjs';
import { g as getFOOProgress, u as updateFOOStep } from '../../chunks/foo_ColQHPYl.mjs';
import { a as apiError, b as apiResponse } from '../../chunks/api-utils_VuBcwo3s.mjs';
export { renderers } from '../../renderers.mjs';

const GET = async ({ request }) => {
  const session = await getSession(request);
  if (!session?.user?.id) {
    return apiError("Unauthorized", 401);
  }
  const progress = await getFOOProgress(session.user.id);
  return apiResponse(progress);
};
const PATCH = async ({ request }) => {
  const session = await getSession(request);
  if (!session?.user?.id) {
    return apiError("Unauthorized", 401);
  }
  try {
    const body = await request.json();
    const { step, ...data } = body;
    if (!step) {
      return apiError("Step is required", 400);
    }
    const updated = await updateFOOStep(session.user.id, step, data);
    return apiResponse(updated);
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to update FOO progress", 400);
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  GET,
  PATCH
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
//# sourceMappingURL=foo.astro.mjs.map
