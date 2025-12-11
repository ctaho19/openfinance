import type { APIRoute } from "astro";
import { getSession } from "../../../lib/get-session-astro";
import { listDebts, createDebt } from "../../../lib/services/debts";
import { apiResponse, apiError } from "../../../lib/api-utils";

export const GET: APIRoute = async ({ request }) => {
  const session = await getSession(request);
  if (!session?.user?.id) {
    return apiError("Unauthorized", 401);
  }

  const url = new URL(request.url);
  const sortBy = url.searchParams.get("sortBy") || "effective";

  const debts = await listDebts(session.user.id, sortBy);
  return apiResponse(debts);
};

export const POST: APIRoute = async ({ request }) => {
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
