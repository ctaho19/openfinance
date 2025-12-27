import type { APIRoute } from "astro";
import { getSession } from "../../../lib/get-session-astro";
import { getDollarAllocationPlan, setupUserStrategy } from "../../../lib/services/dollar-allocation-plan";
import { apiResponse, apiError } from "../../../lib/api-utils";

export const GET: APIRoute = async ({ request }) => {
  const session = await getSession(request);
  if (!session?.user?.id) {
    return apiError("Unauthorized", 401);
  }

  try {
    const plan = await getDollarAllocationPlan(session.user.id);
    
    const serializedPlan = {
      ...plan,
      period: {
        startDate: plan.period.startDate.toISOString(),
        endDate: plan.period.endDate.toISOString(),
        paycheckDate: plan.period.paycheckDate.toISOString(),
      },
      steps: plan.steps.map((s) => ({
        ...s,
        dueDate: s.dueDate?.toISOString(),
      })),
      transfers: plan.transfers.map((s) => ({
        ...s,
        dueDate: s.dueDate?.toISOString(),
      })),
      billPayments: plan.billPayments.map((s) => ({
        ...s,
        dueDate: s.dueDate?.toISOString(),
      })),
      extraDebtStep: plan.extraDebtStep
        ? { ...plan.extraDebtStep, dueDate: plan.extraDebtStep.dueDate?.toISOString() }
        : undefined,
      savingsStep: plan.savingsStep
        ? { ...plan.savingsStep, dueDate: plan.savingsStep.dueDate?.toISOString() }
        : undefined,
      payoffProgress: {
        ...plan.payoffProgress,
        startDate: plan.payoffProgress.startDate?.toISOString(),
        targetDate: plan.payoffProgress.targetDate?.toISOString(),
      },
      unpaidPayments: plan.unpaidPayments.map((p) => ({
        ...p,
        dueDate: p.dueDate.toISOString(),
        paidAt: p.paidAt?.toISOString(),
        createdAt: p.createdAt.toISOString(),
        updatedAt: p.updatedAt.toISOString(),
        bill: {
          ...p.bill,
          createdAt: p.bill.createdAt.toISOString(),
          updatedAt: p.bill.updatedAt.toISOString(),
        },
      })),
    };

    return apiResponse(serializedPlan);
  } catch (error) {
    console.error("Error getting paycheck plan:", error);
    return apiError(
      error instanceof Error ? error.message : "Failed to get paycheck plan",
      500
    );
  }
};

export const PUT: APIRoute = async ({ request }) => {
  const session = await getSession(request);
  if (!session?.user?.id) {
    return apiError("Unauthorized", 401);
  }

  try {
    const body = await request.json();
    
    await setupUserStrategy(session.user.id, {
      paycheckBankAccountId: body.paycheckBankAccountId,
      spendingBankAccountId: body.spendingBankAccountId,
      discretionaryBudgetMonthly: body.discretionaryBudgetMonthly,
      emergencyFundTarget: body.emergencyFundTarget,
      debtSurplusPercent: body.debtSurplusPercent,
      savingsSurplusPercent: body.savingsSurplusPercent,
      payoffStartDate: body.payoffStartDate ? new Date(body.payoffStartDate) : undefined,
      payoffStartTotalDebt: body.payoffStartTotalDebt,
      payoffTargetDate: body.payoffTargetDate ? new Date(body.payoffTargetDate) : undefined,
    });

    return apiResponse({ success: true });
  } catch (error) {
    console.error("Error updating strategy:", error);
    return apiError(
      error instanceof Error ? error.message : "Failed to update strategy",
      400
    );
  }
};
