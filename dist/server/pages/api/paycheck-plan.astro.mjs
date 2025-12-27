import { g as getSession } from '../../chunks/get-session-astro_CVC6HSBT.mjs';
import { b as getDollarAllocationPlan, s as setupUserStrategy } from '../../chunks/dollar-allocation-plan_Dm62CO0y.mjs';
import { a as apiError, b as apiResponse } from '../../chunks/api-utils_VuBcwo3s.mjs';
export { renderers } from '../../renderers.mjs';

const GET = async ({ request }) => {
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
        paycheckDate: plan.period.paycheckDate.toISOString()
      },
      steps: plan.steps.map((s) => ({
        ...s,
        dueDate: s.dueDate?.toISOString()
      })),
      transfers: plan.transfers.map((s) => ({
        ...s,
        dueDate: s.dueDate?.toISOString()
      })),
      billPayments: plan.billPayments.map((s) => ({
        ...s,
        dueDate: s.dueDate?.toISOString()
      })),
      extraDebtStep: plan.extraDebtStep ? { ...plan.extraDebtStep, dueDate: plan.extraDebtStep.dueDate?.toISOString() } : void 0,
      savingsStep: plan.savingsStep ? { ...plan.savingsStep, dueDate: plan.savingsStep.dueDate?.toISOString() } : void 0,
      payoffProgress: {
        ...plan.payoffProgress,
        startDate: plan.payoffProgress.startDate?.toISOString(),
        targetDate: plan.payoffProgress.targetDate?.toISOString()
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
          updatedAt: p.bill.updatedAt.toISOString()
        }
      }))
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
const PUT = async ({ request }) => {
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
      payoffStartDate: body.payoffStartDate ? new Date(body.payoffStartDate) : void 0,
      payoffStartTotalDebt: body.payoffStartTotalDebt,
      payoffTargetDate: body.payoffTargetDate ? new Date(body.payoffTargetDate) : void 0
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

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  GET,
  PUT
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
//# sourceMappingURL=paycheck-plan.astro.mjs.map
