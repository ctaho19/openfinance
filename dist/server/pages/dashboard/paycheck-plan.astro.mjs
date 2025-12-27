import { e as createComponent, f as createAstro, k as renderComponent, r as renderTemplate, m as maybeRenderHead } from '../../chunks/astro/server_CLo6n4dC.mjs';
import 'piccolore';
import { $ as $$DashboardLayout } from '../../chunks/DashboardLayout_Dtx_fU2x.mjs';
import { jsxs, jsx, Fragment } from 'react/jsx-runtime';
import { useState, useEffect, useMemo } from 'react';
import { AlertTriangle, Wallet, Loader2, Check, Info, Target, PiggyBank, TrendingDown, CheckCircle2, Heart, RotateCcw, Circle, Zap, CreditCard, ArrowRight } from 'lucide-react';
import { C as Card, c as CardContent, a as CardHeader, b as CardTitle } from '../../chunks/card_XHmopkrD.mjs';
import { format } from 'date-fns';
import { g as getSession } from '../../chunks/get-session-astro_CVC6HSBT.mjs';
export { renderers } from '../../renderers.mjs';

function formatCurrency(amount) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2
  }).format(amount);
}
function ChecklistItem({
  step,
  isCompleted,
  onToggle,
  isLoading
}) {
  const getIcon = () => {
    switch (step.type) {
      case "TRANSFER":
        return /* @__PURE__ */ jsx(ArrowRight, { className: "h-5 w-5" });
      case "BILL_PAYMENT":
        return /* @__PURE__ */ jsx(CreditCard, { className: "h-5 w-5" });
      case "EXTRA_DEBT_PAYMENT":
        return /* @__PURE__ */ jsx(Zap, { className: "h-5 w-5" });
      case "SAVINGS_TRANSFER":
        return /* @__PURE__ */ jsx(PiggyBank, { className: "h-5 w-5" });
      default:
        return /* @__PURE__ */ jsx(Wallet, { className: "h-5 w-5" });
    }
  };
  const getBgColor = () => {
    if (isCompleted) return "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800";
    switch (step.type) {
      case "TRANSFER":
        return "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800";
      case "BILL_PAYMENT":
        return "bg-white dark:bg-[#1c2128] border-gray-200 dark:border-[#30363d]";
      case "EXTRA_DEBT_PAYMENT":
        return "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800";
      case "SAVINGS_TRANSFER":
        return "bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800";
      default:
        return "bg-white dark:bg-[#1c2128] border-gray-200 dark:border-[#30363d]";
    }
  };
  const getIconColor = () => {
    if (isCompleted) return "text-emerald-600 dark:text-emerald-400";
    switch (step.type) {
      case "TRANSFER":
        return "text-blue-600 dark:text-blue-400";
      case "EXTRA_DEBT_PAYMENT":
        return "text-amber-600 dark:text-amber-400";
      case "SAVINGS_TRANSFER":
        return "text-purple-600 dark:text-purple-400";
      default:
        return "text-gray-600 dark:text-gray-400";
    }
  };
  return /* @__PURE__ */ jsxs(
    "div",
    {
      onClick: () => !isLoading && onToggle(),
      className: `
        flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer
        transition-all duration-200 hover:shadow-md
        ${getBgColor()}
        ${isCompleted ? "opacity-75" : ""}
      `,
      children: [
        /* @__PURE__ */ jsx("div", { className: "flex-shrink-0 mt-0.5", children: isLoading ? /* @__PURE__ */ jsx("div", { className: "h-6 w-6 rounded-full border-2 border-gray-300 border-t-blue-600 animate-spin" }) : isCompleted ? /* @__PURE__ */ jsx(CheckCircle2, { className: "h-6 w-6 text-emerald-600 dark:text-emerald-400" }) : /* @__PURE__ */ jsx(Circle, { className: "h-6 w-6 text-gray-400 dark:text-gray-500" }) }),
        /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-1", children: [
            /* @__PURE__ */ jsx("span", { className: getIconColor(), children: getIcon() }),
            /* @__PURE__ */ jsx("span", { className: "text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400", children: step.type.replace(/_/g, " ") })
          ] }),
          /* @__PURE__ */ jsx("p", { className: `font-medium ${isCompleted ? "line-through text-gray-500" : "text-gray-900 dark:text-gray-100"}`, children: step.label }),
          step.dueDate && /* @__PURE__ */ jsxs("p", { className: "text-sm text-gray-500 dark:text-gray-400 mt-1", children: [
            "Due: ",
            format(new Date(step.dueDate), "MMM d, yyyy")
          ] })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "flex-shrink-0 text-right", children: /* @__PURE__ */ jsx("p", { className: `text-lg font-semibold ${isCompleted ? "text-gray-500 line-through" : "text-gray-900 dark:text-gray-100"}`, children: formatCurrency(step.amount) }) })
      ]
    }
  );
}
function ProgressBar({
  progress,
  label,
  color = "blue"
}) {
  const colors = {
    blue: "bg-blue-600 dark:bg-blue-500",
    emerald: "bg-emerald-600 dark:bg-emerald-500",
    amber: "bg-amber-600 dark:bg-amber-500"
  };
  return /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-sm", children: [
      /* @__PURE__ */ jsx("span", { className: "text-gray-600 dark:text-gray-400", children: label }),
      /* @__PURE__ */ jsxs("span", { className: "font-medium text-gray-900 dark:text-gray-100", children: [
        (progress * 100).toFixed(1),
        "%"
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden", children: /* @__PURE__ */ jsx(
      "div",
      {
        className: `h-full ${colors[color]} transition-all duration-500`,
        style: { width: `${Math.min(100, progress * 100)}%` }
      }
    ) })
  ] });
}
function LifeHappenedCard({
  amount,
  onAmountChange,
  onReset,
  maxAmount
}) {
  const [inputValue, setInputValue] = useState(amount > 0 ? amount.toString() : "");
  const handleInputChange = (e) => {
    const value = e.target.value.replace(/[^0-9.]/g, "");
    setInputValue(value);
    const parsed = parseFloat(value);
    if (!isNaN(parsed) && parsed >= 0) {
      onAmountChange(Math.min(parsed, maxAmount));
    } else if (value === "") {
      onAmountChange(0);
    }
  };
  const handleReset = () => {
    setInputValue("");
    onReset();
  };
  return /* @__PURE__ */ jsx(Card, { variant: "outlined", className: "border-rose-200 dark:border-rose-800 bg-rose-50/50 dark:bg-rose-900/10", children: /* @__PURE__ */ jsx(CardContent, { className: "py-4", children: /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3", children: [
    /* @__PURE__ */ jsx(Heart, { className: "h-5 w-5 text-rose-500 flex-shrink-0 mt-1" }),
    /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
      /* @__PURE__ */ jsx("p", { className: "font-medium text-gray-900 dark:text-gray-100 mb-1", children: "Life Happened?" }),
      /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-600 dark:text-gray-400 mb-3", children: "Unexpected expense this period? Enter it here and we'll adjust your plan. No judgment." }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsxs("div", { className: "relative flex-1 max-w-[200px]", children: [
          /* @__PURE__ */ jsx("span", { className: "absolute left-3 top-1/2 -translate-y-1/2 text-gray-500", children: "$" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "text",
              inputMode: "decimal",
              value: inputValue,
              onChange: handleInputChange,
              placeholder: "0.00",
              className: "w-full pl-7 pr-3 py-2 rounded-lg border border-rose-200 dark:border-rose-700 \n                    bg-white dark:bg-[#1c2128] text-gray-900 dark:text-gray-100\n                    focus:ring-2 focus:ring-rose-500 focus:border-transparent\n                    placeholder:text-gray-400"
            }
          )
        ] }),
        amount > 0 && /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: handleReset,
            className: "flex items-center gap-1.5 px-3 py-2 text-sm font-medium\n                    text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/30\n                    rounded-lg transition-colors",
            children: [
              /* @__PURE__ */ jsx(RotateCcw, { className: "h-4 w-4" }),
              "Reset"
            ]
          }
        )
      ] }),
      amount > 0 && /* @__PURE__ */ jsxs("p", { className: "text-sm text-rose-600 dark:text-rose-400 mt-2", children: [
        "Adjusting plan by −",
        formatCurrency(amount)
      ] })
    ] })
  ] }) }) });
}
function PaycheckPlanView() {
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [completedSteps, setCompletedSteps] = useState(/* @__PURE__ */ new Set());
  const [processingStep, setProcessingStep] = useState(null);
  const [lifeHappenedAmount, setLifeHappenedAmount] = useState(0);
  const [processingPastDue, setProcessingPastDue] = useState(null);
  useEffect(() => {
    fetchPlan();
  }, []);
  useEffect(() => {
    if (!plan) return;
    const saved = localStorage.getItem("paycheck-plan-completed");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.periodStart === plan.period.startDate) {
          setCompletedSteps(new Set(parsed.steps));
        }
      } catch {
      }
    }
    const savedLifeHappened = localStorage.getItem("paycheck-plan-life-happened");
    if (savedLifeHappened) {
      try {
        const parsed = JSON.parse(savedLifeHappened);
        if (parsed.periodStart === plan.period.startDate) {
          setLifeHappenedAmount(parsed.amount || 0);
        }
      } catch {
      }
    }
  }, [plan?.period.startDate]);
  useEffect(() => {
    if (plan) {
      localStorage.setItem(
        "paycheck-plan-completed",
        JSON.stringify({
          periodStart: plan.period.startDate,
          steps: Array.from(completedSteps)
        })
      );
    }
  }, [completedSteps, plan]);
  useEffect(() => {
    if (plan) {
      localStorage.setItem(
        "paycheck-plan-life-happened",
        JSON.stringify({
          periodStart: plan.period.startDate,
          amount: lifeHappenedAmount
        })
      );
    }
  }, [lifeHappenedAmount, plan]);
  const adjusted = useMemo(() => {
    if (!plan) return null;
    const originalSurplus = plan.surplusSplit.surplus;
    const adjustedSurplus = originalSurplus - lifeHappenedAmount;
    const isNegative = adjustedSurplus <= 0;
    plan.debtSurplusPercent ?? 0.8;
    const savingsPercent = plan.savingsSurplusPercent ?? 0.2;
    let adjustedDebtAllocation = 0;
    let adjustedSavingsAllocation = 0;
    if (!isNegative) {
      const efRemaining = Math.max(0, plan.emergencyFundTarget - plan.emergencyFundCurrent);
      adjustedSavingsAllocation = Math.min(adjustedSurplus * savingsPercent, efRemaining);
      adjustedDebtAllocation = adjustedSurplus - adjustedSavingsAllocation;
    }
    const adjustedExtraDebtStep = plan.extraDebtStep ? { ...plan.extraDebtStep, amount: Math.max(0, adjustedDebtAllocation) } : void 0;
    const adjustedSavingsStep = plan.savingsStep ? { ...plan.savingsStep, amount: Math.max(0, adjustedSavingsAllocation) } : void 0;
    return {
      surplusSplit: {
        surplus: adjustedSurplus,
        savingsAllocation: adjustedSavingsAllocation,
        debtAllocation: adjustedDebtAllocation,
        isNegative
      },
      extraDebtStep: adjustedExtraDebtStep,
      savingsStep: adjustedSavingsStep,
      originalSurplus
    };
  }, [plan, lifeHappenedAmount]);
  const handleLifeHappenedChange = (amount) => {
    setLifeHappenedAmount(amount);
  };
  const handleLifeHappenedReset = () => {
    setLifeHappenedAmount(0);
  };
  async function handleMarkPastDuePaid(paymentId) {
    setProcessingPastDue(paymentId);
    try {
      const res = await fetch(`/api/bill-payments/${paymentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "PAID" })
      });
      if (!res.ok) throw new Error("Failed to mark payment as paid");
      await fetchPlan();
    } catch (err) {
      console.error("Failed to mark past-due payment as paid:", err);
    } finally {
      setProcessingPastDue(null);
    }
  }
  async function fetchPlan() {
    try {
      setLoading(true);
      const res = await fetch("/api/paycheck-plan");
      if (!res.ok) throw new Error("Failed to fetch plan");
      const data = await res.json();
      setPlan(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load plan");
    } finally {
      setLoading(false);
    }
  }
  async function handleToggleStep(step) {
    if (completedSteps.has(step.id)) {
      setCompletedSteps((prev) => {
        const next = new Set(prev);
        next.delete(step.id);
        return next;
      });
      return;
    }
    setProcessingStep(step.id);
    try {
      if (step.type === "BILL_PAYMENT" && step.billPaymentId) {
        await fetch(`/api/bill-payments/${step.billPaymentId}/pay`, {
          method: "POST"
        });
      } else if (step.type === "EXTRA_DEBT_PAYMENT" && step.debtId) {
        await fetch("/api/paycheck-plan/extra-payment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ debtId: step.debtId, amount: step.amount })
        });
      } else if (step.type === "SAVINGS_TRANSFER") {
        await fetch("/api/paycheck-plan/emergency-fund", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amount: step.amount })
        });
      }
      setCompletedSteps((prev) => /* @__PURE__ */ new Set([...prev, step.id]));
      if (step.type === "EXTRA_DEBT_PAYMENT" || step.type === "BILL_PAYMENT") {
        fetchPlan();
      }
    } catch (err) {
      console.error("Failed to process step:", err);
    } finally {
      setProcessingStep(null);
    }
  }
  if (loading) {
    return /* @__PURE__ */ jsxs("div", { className: "space-y-4 animate-pulse", children: [
      /* @__PURE__ */ jsx("div", { className: "h-32 bg-gray-200 dark:bg-gray-700 rounded-xl" }),
      /* @__PURE__ */ jsx("div", { className: "h-24 bg-gray-200 dark:bg-gray-700 rounded-xl" }),
      /* @__PURE__ */ jsx("div", { className: "h-48 bg-gray-200 dark:bg-gray-700 rounded-xl" })
    ] });
  }
  if (error || !plan) {
    return /* @__PURE__ */ jsx(Card, { variant: "outlined", className: "border-red-200 dark:border-red-800", children: /* @__PURE__ */ jsxs(CardContent, { className: "py-8 text-center", children: [
      /* @__PURE__ */ jsx(AlertTriangle, { className: "h-12 w-12 text-red-500 mx-auto mb-4" }),
      /* @__PURE__ */ jsx("p", { className: "text-red-600 dark:text-red-400 font-medium", children: error || "Failed to load plan" }),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: fetchPlan,
          className: "mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700",
          children: "Retry"
        }
      )
    ] }) });
  }
  const periodLabel = `${format(new Date(plan.period.startDate), "MMM d")} - ${format(new Date(plan.period.endDate), "MMM d, yyyy")}`;
  const completionPct = plan.steps.length > 0 ? completedSteps.size / plan.steps.length * 100 : 0;
  return /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsx(Card, { variant: "gradient", className: "relative overflow-hidden", children: /* @__PURE__ */ jsxs(CardContent, { className: "py-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-2", children: [
        /* @__PURE__ */ jsx(Wallet, { className: "h-5 w-5 text-white/80" }),
        /* @__PURE__ */ jsx("span", { className: "text-sm text-white/80 font-medium", children: "Paycheck Plan" })
      ] }),
      /* @__PURE__ */ jsx("h1", { className: "text-3xl font-bold text-white mb-1", children: formatCurrency(plan.paycheckAmount) }),
      /* @__PURE__ */ jsx("p", { className: "text-white/70", children: periodLabel }),
      /* @__PURE__ */ jsxs("div", { className: "mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("p", { className: "text-xs text-white/60 uppercase tracking-wide", children: "Total Bills" }),
          /* @__PURE__ */ jsx("p", { className: "text-lg font-semibold text-white", children: formatCurrency(plan.totalBillsThisPeriod) })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("p", { className: "text-xs text-white/60 uppercase tracking-wide", children: "Remaining" }),
          /* @__PURE__ */ jsx("p", { className: "text-lg font-semibold text-amber-300", children: formatCurrency(plan.billsRemainingThisPeriod) }),
          plan.billsPaidThisPeriod > 0 && /* @__PURE__ */ jsxs("p", { className: "text-xs text-white/50", children: [
            formatCurrency(plan.billsPaidThisPeriod),
            " paid"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("p", { className: "text-xs text-white/60 uppercase tracking-wide", children: "Spending" }),
          /* @__PURE__ */ jsx("p", { className: "text-lg font-semibold text-white", children: formatCurrency(plan.discretionaryThisPaycheck) })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsxs("p", { className: "text-xs text-white/60 uppercase tracking-wide", children: [
            "True Surplus",
            lifeHappenedAmount > 0 ? " (Adjusted)" : ""
          ] }),
          /* @__PURE__ */ jsx("p", { className: `text-lg font-semibold ${adjusted?.surplusSplit.isNegative ? "text-red-300" : "text-emerald-300"}`, children: formatCurrency(adjusted?.surplusSplit.surplus ?? plan.surplusSplit.surplus) }),
          lifeHappenedAmount > 0 && /* @__PURE__ */ jsx("p", { className: "text-xs text-white/50 line-through", children: formatCurrency(plan.surplusSplit.surplus) })
        ] })
      ] }),
      completionPct > 0 && /* @__PURE__ */ jsxs("div", { className: "mt-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-xs text-white/70 mb-1", children: [
          /* @__PURE__ */ jsx("span", { children: "Progress" }),
          /* @__PURE__ */ jsxs("span", { children: [
            completionPct.toFixed(0),
            "% complete"
          ] })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "h-2 bg-white/20 rounded-full overflow-hidden", children: /* @__PURE__ */ jsx(
          "div",
          {
            className: "h-full bg-white transition-all duration-500",
            style: { width: `${completionPct}%` }
          }
        ) })
      ] })
    ] }) }),
    !plan.surplusSplit.isNegative && plan.surplusSplit.surplus > 0 && /* @__PURE__ */ jsx(
      LifeHappenedCard,
      {
        amount: lifeHappenedAmount,
        onAmountChange: handleLifeHappenedChange,
        onReset: handleLifeHappenedReset,
        maxAmount: plan.surplusSplit.surplus
      }
    ),
    adjusted?.surplusSplit.isNegative && !plan.surplusSplit.isNegative && /* @__PURE__ */ jsx(Card, { variant: "outlined", className: "border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20", children: /* @__PURE__ */ jsx(CardContent, { className: "py-4", children: /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3", children: [
      /* @__PURE__ */ jsx(AlertTriangle, { className: "h-6 w-6 text-amber-600 flex-shrink-0 mt-0.5" }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("p", { className: "font-semibold text-amber-800 dark:text-amber-200", children: "After adjustments, no surplus remains" }),
        /* @__PURE__ */ jsxs("p", { className: "text-sm text-amber-700 dark:text-amber-300 mt-1", children: [
          "Your surprise expense of ",
          formatCurrency(lifeHappenedAmount),
          " uses all your surplus. Extra debt and savings steps will be skipped this period."
        ] })
      ] })
    ] }) }) }),
    plan.surplusSplit.isNegative && /* @__PURE__ */ jsx(Card, { variant: "outlined", className: "border-red-300 dark:border-red-800 bg-red-50 dark:bg-red-900/20", children: /* @__PURE__ */ jsx(CardContent, { className: "py-4", children: /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3", children: [
      /* @__PURE__ */ jsx(AlertTriangle, { className: "h-6 w-6 text-red-600 flex-shrink-0 mt-0.5" }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsxs("p", { className: "font-semibold text-red-800 dark:text-red-200", children: [
          "You're short ",
          formatCurrency(Math.abs(plan.surplusSplit.surplus)),
          " this paycheck"
        ] }),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-red-700 dark:text-red-300 mt-1", children: "Your bills and spending budget exceed your paycheck. Consider which payments can be delayed or reduced." })
      ] })
    ] }) }) }),
    plan.unpaidPayments && plan.unpaidPayments.length > 0 && /* @__PURE__ */ jsx(Card, { variant: "outlined", className: "border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-900/20", children: /* @__PURE__ */ jsx(CardContent, { className: "py-4", children: /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3", children: [
      /* @__PURE__ */ jsx(AlertTriangle, { className: "h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" }),
      /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
        /* @__PURE__ */ jsxs("p", { className: "font-medium text-orange-800 dark:text-orange-200", children: [
          plan.unpaidPayments.length,
          " bill",
          plan.unpaidPayments.length > 1 ? "s" : "",
          " from previous periods"
        ] }),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-orange-700 dark:text-orange-300 mt-1 mb-3", children: "Mark as paid when you've caught up on these bills." }),
        /* @__PURE__ */ jsx("div", { className: "space-y-2", children: plan.unpaidPayments.map((p) => /* @__PURE__ */ jsxs(
          "div",
          {
            className: "flex items-center justify-between gap-3 p-2 rounded-lg bg-white/50 dark:bg-[#1c2128]/50",
            children: [
              /* @__PURE__ */ jsxs("div", { className: "min-w-0 flex-1", children: [
                /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-gray-900 dark:text-gray-100 truncate", children: p.bill.name }),
                /* @__PURE__ */ jsxs("p", { className: "text-xs text-gray-500 dark:text-gray-400", children: [
                  "Due ",
                  format(new Date(p.dueDate), "MMM d"),
                  " · ",
                  formatCurrency(p.amount)
                ] })
              ] }),
              /* @__PURE__ */ jsxs(
                "button",
                {
                  onClick: () => handleMarkPastDuePaid(p.id),
                  disabled: processingPastDue === p.id,
                  className: "flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg \n                          bg-orange-600 text-white hover:bg-orange-700 \n                          disabled:opacity-50 disabled:cursor-not-allowed\n                          transition-colors",
                  children: [
                    processingPastDue === p.id ? /* @__PURE__ */ jsx(Loader2, { className: "h-3.5 w-3.5 animate-spin" }) : /* @__PURE__ */ jsx(Check, { className: "h-3.5 w-3.5" }),
                    "Paid"
                  ]
                }
              )
            ]
          },
          p.id
        )) })
      ] })
    ] }) }) }),
    /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-2 px-1", children: [
      /* @__PURE__ */ jsx(Info, { className: "h-4 w-4 text-gray-400 flex-shrink-0 mt-0.5" }),
      /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500 dark:text-gray-400", children: "These checkboxes are just for your brain—nothing breaks if you skip them. Bill payments will automatically update their status when checked." })
    ] }),
    plan.transfers.length > 0 && /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-3", children: [
        /* @__PURE__ */ jsx("div", { className: "w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm", children: "1" }),
        /* @__PURE__ */ jsx("h2", { className: "text-lg font-semibold text-gray-900 dark:text-gray-100", children: "Move Money Between Accounts" })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "space-y-3", children: plan.transfers.map((step) => /* @__PURE__ */ jsx(
        ChecklistItem,
        {
          step,
          isCompleted: completedSteps.has(step.id),
          onToggle: () => handleToggleStep(step),
          isLoading: processingStep === step.id
        },
        step.id
      )) })
    ] }),
    plan.billPayments.length > 0 && /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-3", children: [
        /* @__PURE__ */ jsx("div", { className: "w-8 h-8 rounded-full bg-gray-600 text-white flex items-center justify-center font-bold text-sm", children: "2" }),
        /* @__PURE__ */ jsx("h2", { className: "text-lg font-semibold text-gray-900 dark:text-gray-100", children: "Pay Bills (In Order)" })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "space-y-3", children: plan.billPayments.map((step) => /* @__PURE__ */ jsx(
        ChecklistItem,
        {
          step,
          isCompleted: completedSteps.has(step.id),
          onToggle: () => handleToggleStep(step),
          isLoading: processingStep === step.id
        },
        step.id
      )) })
    ] }),
    adjusted?.extraDebtStep && adjusted.extraDebtStep.amount > 0 && plan.avalancheTarget && /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-3", children: [
        /* @__PURE__ */ jsx("div", { className: "w-8 h-8 rounded-full bg-amber-600 text-white flex items-center justify-center font-bold text-sm", children: "3" }),
        /* @__PURE__ */ jsx("h2", { className: "text-lg font-semibold text-gray-900 dark:text-gray-100", children: "Extra Debt Attack (Avalanche)" })
      ] }),
      /* @__PURE__ */ jsx(Card, { variant: "outlined", className: "mb-3 border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-900/10", children: /* @__PURE__ */ jsxs(CardContent, { className: "py-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 mb-3", children: [
          /* @__PURE__ */ jsx(Target, { className: "h-6 w-6 text-amber-600" }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsxs("p", { className: "font-semibold text-gray-900 dark:text-gray-100", children: [
              "Target: ",
              plan.avalancheTarget.debtName
            ] }),
            /* @__PURE__ */ jsxs("p", { className: "text-sm text-gray-600 dark:text-gray-400", children: [
              plan.avalancheTarget.interestRate.toFixed(2),
              "% APR • Balance: ",
              formatCurrency(plan.avalancheTarget.currentBalance)
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsx("p", { className: "text-xs text-amber-700 dark:text-amber-400", children: "This is your highest-APR debt. Every extra dollar here saves you the most in interest." })
      ] }) }),
      /* @__PURE__ */ jsx(
        ChecklistItem,
        {
          step: adjusted.extraDebtStep,
          isCompleted: completedSteps.has(adjusted.extraDebtStep.id),
          onToggle: () => handleToggleStep(adjusted.extraDebtStep),
          isLoading: processingStep === adjusted.extraDebtStep.id
        }
      ),
      lifeHappenedAmount > 0 && plan.extraDebtStep && /* @__PURE__ */ jsxs("p", { className: "text-xs text-gray-500 dark:text-gray-400 mt-2 ml-2", children: [
        "Reduced from ",
        formatCurrency(plan.extraDebtStep.amount),
        " due to life adjustment"
      ] })
    ] }),
    adjusted?.savingsStep && adjusted.savingsStep.amount > 0 && /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-3", children: [
        /* @__PURE__ */ jsx("div", { className: "w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-sm", children: "4" }),
        /* @__PURE__ */ jsx("h2", { className: "text-lg font-semibold text-gray-900 dark:text-gray-100", children: "Build Emergency Fund" })
      ] }),
      /* @__PURE__ */ jsx(Card, { variant: "outlined", className: "mb-3 border-purple-200 dark:border-purple-800 bg-purple-50/50 dark:bg-purple-900/10", children: /* @__PURE__ */ jsxs(CardContent, { className: "py-4", children: [
        /* @__PURE__ */ jsx("div", { className: "flex items-center justify-between mb-3", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsx(PiggyBank, { className: "h-6 w-6 text-purple-600" }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "font-semibold text-gray-900 dark:text-gray-100", children: "Emergency Fund" }),
            /* @__PURE__ */ jsxs("p", { className: "text-sm text-gray-600 dark:text-gray-400", children: [
              formatCurrency(plan.emergencyFundCurrent),
              " / ",
              formatCurrency(plan.emergencyFundTarget)
            ] })
          ] })
        ] }) }),
        /* @__PURE__ */ jsx(
          ProgressBar,
          {
            progress: plan.emergencyFundCurrent / plan.emergencyFundTarget,
            label: "Progress to Goal",
            color: "emerald"
          }
        )
      ] }) }),
      /* @__PURE__ */ jsx(
        ChecklistItem,
        {
          step: adjusted.savingsStep,
          isCompleted: completedSteps.has(adjusted.savingsStep.id),
          onToggle: () => handleToggleStep(adjusted.savingsStep),
          isLoading: processingStep === adjusted.savingsStep.id
        }
      ),
      lifeHappenedAmount > 0 && plan.savingsStep && /* @__PURE__ */ jsxs("p", { className: "text-xs text-gray-500 dark:text-gray-400 mt-2 ml-2", children: [
        "Reduced from ",
        formatCurrency(plan.savingsStep.amount),
        " due to life adjustment"
      ] })
    ] }),
    plan.payoffProgress.targetDate && /* @__PURE__ */ jsxs(Card, { children: [
      /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsxs(CardTitle, { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsx(TrendingDown, { className: "h-5 w-5 text-emerald-600" }),
        "Path to Debt Freedom"
      ] }) }),
      /* @__PURE__ */ jsxs(CardContent, { className: "space-y-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500 uppercase tracking-wide", children: "Current Debt" }),
            /* @__PURE__ */ jsx("p", { className: "text-xl font-semibold text-gray-900 dark:text-gray-100", children: formatCurrency(plan.payoffProgress.currentDebt) })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500 uppercase tracking-wide", children: "Target Date" }),
            /* @__PURE__ */ jsx("p", { className: "text-xl font-semibold text-gray-900 dark:text-gray-100", children: format(new Date(plan.payoffProgress.targetDate), "MMM yyyy") })
          ] })
        ] }),
        plan.payoffProgress.debtPaid !== void 0 && plan.payoffProgress.startDebt && /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-sm mb-1", children: [
            /* @__PURE__ */ jsx("span", { className: "text-gray-600 dark:text-gray-400", children: "Debt Paid Off" }),
            /* @__PURE__ */ jsx("span", { className: "font-medium text-emerald-600 dark:text-emerald-400", children: formatCurrency(plan.payoffProgress.debtPaid) })
          ] }),
          /* @__PURE__ */ jsx(
            ProgressBar,
            {
              progress: plan.payoffProgress.debtProgressPct ?? 0,
              label: "Debt Progress",
              color: "emerald"
            }
          )
        ] }),
        plan.payoffProgress.timeProgressPct !== void 0 && /* @__PURE__ */ jsx(
          ProgressBar,
          {
            progress: plan.payoffProgress.timeProgressPct,
            label: "Time Elapsed",
            color: "blue"
          }
        ),
        plan.payoffProgress.onTrack !== void 0 && /* @__PURE__ */ jsx("div", { className: `flex items-center gap-2 p-3 rounded-lg ${plan.payoffProgress.onTrack ? "bg-emerald-50 dark:bg-emerald-900/20" : "bg-amber-50 dark:bg-amber-900/20"}`, children: plan.payoffProgress.onTrack ? /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx(CheckCircle2, { className: "h-5 w-5 text-emerald-600" }),
          /* @__PURE__ */ jsx("span", { className: "font-medium text-emerald-700 dark:text-emerald-400", children: "You're on track! Keep it up!" })
        ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx(AlertTriangle, { className: "h-5 w-5 text-amber-600" }),
          /* @__PURE__ */ jsx("span", { className: "font-medium text-amber-700 dark:text-amber-400", children: "Slightly behind - focus on extra payments" })
        ] }) }),
        plan.payoffProgress.monthsRemaining && plan.payoffProgress.monthsRemaining > 0 && /* @__PURE__ */ jsxs("p", { className: "text-center text-gray-600 dark:text-gray-400", children: [
          /* @__PURE__ */ jsx("span", { className: "font-semibold text-gray-900 dark:text-gray-100", children: plan.payoffProgress.monthsRemaining }),
          " ",
          "months until target date"
        ] })
      ] })
    ] }),
    completionPct === 100 && /* @__PURE__ */ jsx(Card, { variant: "outlined", className: "border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-900/20", children: /* @__PURE__ */ jsxs(CardContent, { className: "py-8 text-center", children: [
      /* @__PURE__ */ jsx(CheckCircle2, { className: "h-16 w-16 text-emerald-600 mx-auto mb-4" }),
      /* @__PURE__ */ jsx("h2", { className: "text-2xl font-bold text-emerald-800 dark:text-emerald-200 mb-2", children: "All Done!" }),
      /* @__PURE__ */ jsx("p", { className: "text-emerald-700 dark:text-emerald-300", children: "You've completed all tasks for this pay period. Great job staying on track!" })
    ] }) })
  ] });
}

const $$Astro = createAstro();
const $$Index = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Index;
  const session = await getSession(Astro2.request);
  if (!session?.user?.id) {
    return Astro2.redirect("/login");
  }
  return renderTemplate`${renderComponent($$result, "DashboardLayout", $$DashboardLayout, { "title": "Paycheck Plan", "currentPath": "/dashboard/paycheck-plan", "user": session.user }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="space-y-6 animate-fade-in"> <header class="hidden lg:block"> <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">
Paycheck Plan
</h1> <p class="text-gray-600 dark:text-gray-400 mt-1">
Your step-by-step guide to allocating this paycheck
</p> </header> ${renderComponent($$result2, "PaycheckPlanView", PaycheckPlanView, { "client:load": true, "client:component-hydration": "load", "client:component-path": "/Users/chris/projects/dev/openfinance/src/components/paycheck-plan/PaycheckPlanView", "client:component-export": "PaycheckPlanView" })} </div> ` })}`;
}, "/Users/chris/projects/dev/openfinance/src/pages/dashboard/paycheck-plan/index.astro", void 0);

const $$file = "/Users/chris/projects/dev/openfinance/src/pages/dashboard/paycheck-plan/index.astro";
const $$url = "/dashboard/paycheck-plan";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
//# sourceMappingURL=paycheck-plan.astro.mjs.map
