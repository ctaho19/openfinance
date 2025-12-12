import { g as getSession } from '../../chunks/get-session-astro_CVC6HSBT.mjs';
import { l as listBills, c as createBill } from '../../chunks/bills_DrTPm3JP.mjs';
import { a as apiError, b as apiResponse } from '../../chunks/api-utils_VuBcwo3s.mjs';
export { renderers } from '../../renderers.mjs';

const GET = async ({ request }) => {
  const session = await getSession(request);
  if (!session?.user?.id) {
    return apiError("Unauthorized", 401);
  }
  const bills = await listBills(session.user.id);
  return apiResponse(bills);
};
const POST = async ({ request }) => {
  const session = await getSession(request);
  if (!session?.user?.id) {
    return apiError("Unauthorized", 401);
  }
  try {
    const body = await request.json();
    const bill = await createBill(session.user.id, body);
    return apiResponse(bill, 201);
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to create bill", 400);
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  GET,
  POST
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
//# sourceMappingURL=bills.astro.mjs.map
