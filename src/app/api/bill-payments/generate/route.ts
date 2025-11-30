import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { generateUpcomingBillPayments } from "@/lib/bill-payments";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const monthsAhead = body.monthsAhead || 3;

  const result = await generateUpcomingBillPayments(session.user.id, monthsAhead);

  return NextResponse.json({
    success: true,
    created: result.created,
    existing: result.existing,
    message: `Created ${result.created} new bill payment records (${result.existing} already existed)`,
  });
}
