import { g as getSession } from '../../chunks/get-session-astro_CVC6HSBT.mjs';
import { l as listDebts, c as createDebt } from '../../chunks/debts_ClTN3PuL.mjs';
import { a as apiError, b as apiResponse } from '../../chunks/api-utils_VuBcwo3s.mjs';
export { renderers } from '../../renderers.mjs';

const GET = async ({ request }) => {
  const session = await getSession(request);
  if (!session?.user?.id) {
    return apiError("Unauthorized", 401);
  }
  const url = new URL(request.url);
  const sortBy = url.searchParams.get("sortBy") || "effective";
  const debts = await listDebts(session.user.id, sortBy);
  return apiResponse(debts);
};
const POST = async ({ request }) => {
  const session = await getSession(request);
  if (!session?.user?.id) {
    return apiError("Unauthorized", 401);
  }
  try {
    const body = await request.json();
    const debt = await createDebt(session.user.id, body);
    return apiResponse(debt, 201);
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to create debt", 400);
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  GET,
  POST
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
//# sourceMappingURL=debts.astro.mjs.map
