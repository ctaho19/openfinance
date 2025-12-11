import type { APIRoute } from "astro";
import { getSession } from "../../../lib/get-session-astro";
import { listBills, createBill } from "../../../lib/services/bills";
import { apiResponse, apiError } from "../../../lib/api-utils";

export const GET: APIRoute = async ({ request }) => {
  const session = await getSession(request);
  if (!session?.user?.id) {
    return apiError("Unauthorized", 401);
  }

  const bills = await listBills(session.user.id);
  return apiResponse(bills);
};

export const POST: APIRoute = async ({ request }) => {
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
