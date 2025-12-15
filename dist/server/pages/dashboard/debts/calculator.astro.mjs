import { e as createComponent, f as createAstro, k as renderComponent, r as renderTemplate } from '../../../chunks/astro/server_B4LN2q8c.mjs';
import 'piccolore';
import { $ as $$DashboardLayout } from '../../../chunks/DashboardLayout_Bq6NtJ36.mjs';
import { jsxs, jsx, Fragment } from 'react/jsx-runtime';
import { useState, useEffect, useMemo } from 'react';
import { C as Card, c as CardContent, a as CardHeader, b as CardTitle } from '../../../chunks/card_XHmopkrD.mjs';
import { B as Button } from '../../../chunks/button_VWZV24pY.mjs';
import { Calculator, ArrowLeft, FileText, Home, ShoppingBag, Banknote, GraduationCap, Car, CreditCard, Check, DollarSign, TrendingDown, Calendar } from 'lucide-react';
import { g as getSession } from '../../../chunks/get-session-astro_CVC6HSBT.mjs';
export { renderers } from '../../../renderers.mjs';

function calculatePayoff(input) {
  const { balance, apr, minimumPayment, extraPayment = 0 } = input;
  if (balance <= 0) {
    return {
      months: 0,
      totalPayment: 0,
      totalInterest: 0,
      payoffDate: /* @__PURE__ */ new Date(),
      schedule: []
    };
  }
  const monthlyPayment = minimumPayment + extraPayment;
  const monthlyRate = apr / 100 / 12;
  if (monthlyPayment <= 0) {
    return null;
  }
  const schedule = [];
  let remainingBalance = balance;
  let totalPayment = 0;
  let totalInterest = 0;
  let month = 0;
  const maxMonths = 600;
  while (remainingBalance > 0.01 && month < maxMonths) {
    month++;
    const interestCharge = remainingBalance * monthlyRate;
    if (monthlyPayment <= interestCharge && apr > 0) {
      return null;
    }
    const actualPayment = Math.min(monthlyPayment, remainingBalance + interestCharge);
    const principalPayment = actualPayment - interestCharge;
    remainingBalance = Math.max(0, remainingBalance - principalPayment);
    totalPayment += actualPayment;
    totalInterest += interestCharge;
    schedule.push({
      month,
      payment: actualPayment,
      principal: principalPayment,
      interest: interestCharge,
      balance: remainingBalance
    });
  }
  if (month >= maxMonths) {
    return null;
  }
  const payoffDate = /* @__PURE__ */ new Date();
  payoffDate.setMonth(payoffDate.getMonth() + month);
  return {
    months: month,
    totalPayment,
    totalInterest,
    payoffDate,
    schedule
  };
}
function calculatePayoffComparison(input) {
  const withMinimum = calculatePayoff({ ...input, extraPayment: 0 });
  const withExtra = input.extraPayment && input.extraPayment > 0 ? calculatePayoff(input) : withMinimum;
  const monthsSaved = (withMinimum?.months ?? 0) - (withExtra?.months ?? 0);
  const interestSaved = (withMinimum?.totalInterest ?? 0) - (withExtra?.totalInterest ?? 0);
  return {
    withMinimum,
    withExtra,
    monthsSaved,
    interestSaved
  };
}
function formatMonthsToYearsMonths(totalMonths) {
  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;
  if (years === 0) {
    return `${months} month${months !== 1 ? "s" : ""}`;
  }
  if (months === 0) {
    return `${years} year${years !== 1 ? "s" : ""}`;
  }
  return `${years}y ${months}mo`;
}

const DEBT_TYPE_ICONS = {
  CREDIT_CARD: CreditCard,
  AUTO_LOAN: Car,
  STUDENT_LOAN: GraduationCap,
  PERSONAL_LOAN: Banknote,
  BNPL: ShoppingBag,
  MORTGAGE: Home,
  OTHER: FileText
};
function formatCurrency(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  }).format(value);
}
function formatCurrencyPrecise(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD"
  }).format(value);
}
function PayoffCalculator() {
  const [debts, setDebts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDebtIds, setSelectedDebtIds] = useState(/* @__PURE__ */ new Set());
  const [extraPayment, setExtraPayment] = useState("");
  useEffect(() => {
    fetchDebts();
  }, []);
  async function fetchDebts() {
    try {
      const res = await fetch("/api/debts");
      if (res.ok) {
        const data = await res.json();
        const activeDebts = data.filter((d) => Number(d.currentBalance) > 0);
        setDebts(activeDebts);
        if (activeDebts.length > 0) {
          setSelectedDebtIds(/* @__PURE__ */ new Set([activeDebts[0].id]));
        }
      }
    } finally {
      setLoading(false);
    }
  }
  function toggleDebt(id) {
    setSelectedDebtIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }
  function selectAllDebts() {
    setSelectedDebtIds(new Set(debts.map((d) => d.id)));
  }
  function clearSelection() {
    setSelectedDebtIds(/* @__PURE__ */ new Set());
  }
  const selectedDebts = debts.filter((d) => selectedDebtIds.has(d.id));
  const totals = useMemo(() => {
    return selectedDebts.reduce((acc, debt) => ({
      balance: acc.balance + Number(debt.currentBalance),
      minimumPayment: acc.minimumPayment + Number(debt.minimumPayment),
      weightedApr: acc.weightedApr + Number(debt.interestRate) * Number(debt.currentBalance)
    }), { balance: 0, minimumPayment: 0, weightedApr: 0 });
  }, [selectedDebts]);
  const averageApr = totals.balance > 0 ? totals.weightedApr / totals.balance : 0;
  const extraPaymentNum = parseFloat(extraPayment) || 0;
  const comparison = useMemo(() => {
    if (selectedDebts.length === 0 || totals.balance <= 0) {
      return null;
    }
    return calculatePayoffComparison({
      balance: totals.balance,
      apr: averageApr,
      minimumPayment: totals.minimumPayment,
      extraPayment: extraPaymentNum
    });
  }, [selectedDebts, totals, averageApr, extraPaymentNum]);
  if (loading) {
    return /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
      /* @__PURE__ */ jsx("header", { children: /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold text-theme-primary", children: "Debt Payoff Calculator" }) }),
      /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsx(CardContent, { className: "py-16 text-center", children: /* @__PURE__ */ jsxs("div", { className: "animate-pulse space-y-4", children: [
        /* @__PURE__ */ jsx("div", { className: "h-8 w-48 bg-theme-tertiary rounded mx-auto" }),
        /* @__PURE__ */ jsx("div", { className: "h-4 w-64 bg-theme-tertiary rounded mx-auto" })
      ] }) }) })
    ] });
  }
  if (debts.length === 0) {
    return /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
      /* @__PURE__ */ jsx("header", { children: /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold text-theme-primary", children: "Debt Payoff Calculator" }) }),
      /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsxs(CardContent, { className: "py-16 text-center", children: [
        /* @__PURE__ */ jsx("div", { className: "w-16 h-16 rounded-full bg-accent-50 dark:bg-accent-600/20 flex items-center justify-center mx-auto mb-4", children: /* @__PURE__ */ jsx(Calculator, { className: "h-8 w-8 text-accent-600" }) }),
        /* @__PURE__ */ jsx("h2", { className: "text-xl font-semibold text-theme-primary mb-2", children: "No Active Debts" }),
        /* @__PURE__ */ jsx("p", { className: "text-theme-secondary mb-6", children: "Add some debts first to calculate your payoff timeline." }),
        /* @__PURE__ */ jsx("a", { href: "/dashboard/debts/new", children: /* @__PURE__ */ jsx(Button, { children: "Add Your First Debt" }) })
      ] }) })
    ] });
  }
  return /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxs("header", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold text-theme-primary", children: "Debt Payoff Calculator" }),
        /* @__PURE__ */ jsx("p", { className: "text-theme-secondary mt-1", children: "See how extra payments can accelerate your debt payoff" })
      ] }),
      /* @__PURE__ */ jsx("a", { href: "/dashboard/debts", children: /* @__PURE__ */ jsx(Button, { variant: "ghost", leftIcon: /* @__PURE__ */ jsx(ArrowLeft, { className: "h-4 w-4" }), children: "Back" }) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "lg:col-span-1 space-y-4", children: [
        /* @__PURE__ */ jsxs(Card, { children: [
          /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ jsx(CardTitle, { children: "Select Debts" }),
            /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
              /* @__PURE__ */ jsx(
                "button",
                {
                  onClick: selectAllDebts,
                  className: "text-xs text-accent-600 hover:text-accent-700 font-medium",
                  children: "All"
                }
              ),
              /* @__PURE__ */ jsx("span", { className: "text-theme-muted", children: "·" }),
              /* @__PURE__ */ jsx(
                "button",
                {
                  onClick: clearSelection,
                  className: "text-xs text-accent-600 hover:text-accent-700 font-medium",
                  children: "None"
                }
              )
            ] })
          ] }) }),
          /* @__PURE__ */ jsx(CardContent, { noPadding: true, children: /* @__PURE__ */ jsx("div", { className: "divide-y divide-theme", children: debts.map((debt) => {
            const isSelected = selectedDebtIds.has(debt.id);
            const IconComponent = DEBT_TYPE_ICONS[debt.type] || FileText;
            return /* @__PURE__ */ jsxs(
              "button",
              {
                onClick: () => toggleDebt(debt.id),
                className: `
                        w-full flex items-center gap-3 p-4 text-left transition-colors
                        ${isSelected ? "bg-accent-50 dark:bg-accent-600/10" : "hover:bg-theme-secondary"}
                      `,
                children: [
                  /* @__PURE__ */ jsx("div", { className: `
                        w-5 h-5 rounded border-2 flex items-center justify-center shrink-0
                        transition-colors
                        ${isSelected ? "bg-accent-600 border-accent-600 text-white" : "border-gray-300 dark:border-gray-600"}
                      `, children: isSelected && /* @__PURE__ */ jsx(Check, { className: "h-3 w-3" }) }),
                  /* @__PURE__ */ jsx("div", { className: "p-1.5 rounded bg-theme-tertiary shrink-0", children: /* @__PURE__ */ jsx(IconComponent, { className: "h-4 w-4 text-theme-secondary" }) }),
                  /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
                    /* @__PURE__ */ jsx("p", { className: "font-medium text-theme-primary truncate", children: debt.name }),
                    /* @__PURE__ */ jsxs("p", { className: "text-xs text-theme-muted", children: [
                      formatCurrency(Number(debt.currentBalance)),
                      " · ",
                      debt.interestRate,
                      "% APR"
                    ] })
                  ] })
                ]
              },
              debt.id
            );
          }) }) })
        ] }),
        /* @__PURE__ */ jsxs(Card, { children: [
          /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsx(CardTitle, { children: "Extra Monthly Payment" }) }),
          /* @__PURE__ */ jsxs(CardContent, { children: [
            /* @__PURE__ */ jsxs("div", { className: "relative", children: [
              /* @__PURE__ */ jsx(DollarSign, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-theme-muted" }),
              /* @__PURE__ */ jsx(
                "input",
                {
                  type: "number",
                  min: "0",
                  step: "50",
                  value: extraPayment,
                  onChange: (e) => setExtraPayment(e.target.value),
                  placeholder: "0",
                  className: "\n                    w-full pl-10 pr-4 py-3 rounded-xl\n                    bg-theme-secondary border border-theme\n                    text-theme-primary text-lg font-medium\n                    placeholder:text-theme-muted\n                    focus:outline-none focus:ring-2 focus:ring-accent-600 focus:border-transparent\n                  "
                }
              )
            ] }),
            /* @__PURE__ */ jsx("p", { className: "text-xs text-theme-muted mt-2", children: "Enter an additional amount to pay each month" }),
            /* @__PURE__ */ jsx("div", { className: "flex gap-2 mt-3", children: [50, 100, 200, 500].map((amount) => /* @__PURE__ */ jsxs(
              "button",
              {
                onClick: () => setExtraPayment(amount.toString()),
                className: `
                      flex-1 py-2 rounded-lg text-sm font-medium transition-colors
                      ${extraPayment === amount.toString() ? "bg-accent-600 text-white" : "bg-theme-tertiary text-theme-secondary hover:bg-theme-secondary"}
                    `,
                children: [
                  "$",
                  amount
                ]
              },
              amount
            )) })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "lg:col-span-2 space-y-4", children: selectedDebts.length === 0 ? /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsxs(CardContent, { className: "py-16 text-center", children: [
        /* @__PURE__ */ jsx("div", { className: "w-16 h-16 rounded-full bg-theme-tertiary flex items-center justify-center mx-auto mb-4", children: /* @__PURE__ */ jsx(Calculator, { className: "h-8 w-8 text-theme-muted" }) }),
        /* @__PURE__ */ jsx("h3", { className: "text-lg font-semibold text-theme-primary mb-2", children: "Select debts to calculate" }),
        /* @__PURE__ */ jsx("p", { className: "text-theme-secondary", children: "Choose one or more debts from the list to see your payoff timeline" })
      ] }) }) : comparison ? /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-3", children: [
          /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsxs(CardContent, { className: "py-4", children: [
            /* @__PURE__ */ jsx("p", { className: "text-xs text-theme-muted uppercase tracking-wide mb-1", children: "Total Balance" }),
            /* @__PURE__ */ jsx("p", { className: "text-xl font-bold text-theme-primary", children: formatCurrency(totals.balance) })
          ] }) }),
          /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsxs(CardContent, { className: "py-4", children: [
            /* @__PURE__ */ jsx("p", { className: "text-xs text-theme-muted uppercase tracking-wide mb-1", children: "Monthly Payment" }),
            /* @__PURE__ */ jsx("p", { className: "text-xl font-bold text-theme-primary", children: formatCurrency(totals.minimumPayment + extraPaymentNum) }),
            extraPaymentNum > 0 && /* @__PURE__ */ jsxs("p", { className: "text-xs text-emerald-600 dark:text-emerald-400", children: [
              "+",
              formatCurrency(extraPaymentNum),
              " extra"
            ] })
          ] }) }),
          /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsxs(CardContent, { className: "py-4", children: [
            /* @__PURE__ */ jsx("p", { className: "text-xs text-theme-muted uppercase tracking-wide mb-1", children: "Avg. APR" }),
            /* @__PURE__ */ jsxs("p", { className: "text-xl font-bold text-theme-primary", children: [
              averageApr.toFixed(1),
              "%"
            ] })
          ] }) }),
          /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsxs(CardContent, { className: "py-4", children: [
            /* @__PURE__ */ jsx("p", { className: "text-xs text-theme-muted uppercase tracking-wide mb-1", children: "Debts Selected" }),
            /* @__PURE__ */ jsx("p", { className: "text-xl font-bold text-theme-primary", children: selectedDebts.length })
          ] }) })
        ] }),
        /* @__PURE__ */ jsxs(Card, { children: [
          /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsx(CardTitle, { children: "Payoff Comparison" }) }),
          /* @__PURE__ */ jsx(CardContent, { children: comparison.withMinimum === null ? /* @__PURE__ */ jsxs("div", { className: "text-center py-8", children: [
            /* @__PURE__ */ jsx("p", { className: "text-danger-600 dark:text-danger-400 font-medium", children: "Minimum payment is too low to pay off this debt" }),
            /* @__PURE__ */ jsx("p", { className: "text-theme-secondary text-sm mt-2", children: "The monthly interest exceeds your minimum payment" })
          ] }) : /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
            /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [
              /* @__PURE__ */ jsx(
                PayoffCard,
                {
                  title: "With Minimum Payments",
                  result: comparison.withMinimum,
                  isHighlighted: false,
                  payment: totals.minimumPayment
                }
              ),
              extraPaymentNum > 0 && comparison.withExtra && /* @__PURE__ */ jsx(
                PayoffCard,
                {
                  title: "With Extra Payments",
                  result: comparison.withExtra,
                  isHighlighted: true,
                  payment: totals.minimumPayment + extraPaymentNum
                }
              )
            ] }),
            extraPaymentNum > 0 && comparison.monthsSaved > 0 && /* @__PURE__ */ jsx("div", { className: "bg-emerald-50 dark:bg-emerald-600/10 border border-emerald-200 dark:border-emerald-600/30 rounded-xl p-5", children: /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-4", children: [
              /* @__PURE__ */ jsx("div", { className: "p-2.5 rounded-lg bg-emerald-100 dark:bg-emerald-600/20", children: /* @__PURE__ */ jsx(TrendingDown, { className: "h-5 w-5 text-emerald-600 dark:text-emerald-400" }) }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsxs("h4", { className: "font-semibold text-emerald-700 dark:text-emerald-400", children: [
                  "You'll save ",
                  formatMonthsToYearsMonths(comparison.monthsSaved),
                  "!"
                ] }),
                /* @__PURE__ */ jsxs("p", { className: "text-emerald-600 dark:text-emerald-400/80 mt-1", children: [
                  "Plus ",
                  /* @__PURE__ */ jsx("strong", { children: formatCurrencyPrecise(comparison.interestSaved) }),
                  " in interest charges"
                ] })
              ] })
            ] }) }),
            /* @__PURE__ */ jsx(
              PayoffTimeline,
              {
                withMinimum: comparison.withMinimum,
                withExtra: comparison.withExtra,
                hasExtra: extraPaymentNum > 0
              }
            )
          ] }) })
        ] })
      ] }) : null })
    ] })
  ] });
}
function PayoffCard({
  title,
  result,
  isHighlighted,
  payment
}) {
  return /* @__PURE__ */ jsxs("div", { className: `
      rounded-xl border p-5 transition-all
      ${isHighlighted ? "border-accent-300 dark:border-accent-600/50 bg-accent-50/50 dark:bg-accent-600/5" : "border-theme bg-theme-secondary"}
    `, children: [
    /* @__PURE__ */ jsx("h4", { className: `font-semibold mb-4 ${isHighlighted ? "text-accent-600" : "text-theme-secondary"}`, children: title }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex justify-between", children: [
        /* @__PURE__ */ jsx("span", { className: "text-theme-muted", children: "Monthly Payment" }),
        /* @__PURE__ */ jsx("span", { className: "font-medium text-theme-primary", children: formatCurrency(payment) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex justify-between", children: [
        /* @__PURE__ */ jsx("span", { className: "text-theme-muted", children: "Time to Payoff" }),
        /* @__PURE__ */ jsx("span", { className: "font-medium text-theme-primary", children: formatMonthsToYearsMonths(result.months) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex justify-between", children: [
        /* @__PURE__ */ jsx("span", { className: "text-theme-muted", children: "Payoff Date" }),
        /* @__PURE__ */ jsx("span", { className: "font-medium text-theme-primary", children: result.payoffDate.toLocaleDateString("en-US", { month: "short", year: "numeric" }) })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "border-t border-theme pt-3 mt-3", children: /* @__PURE__ */ jsxs("div", { className: "flex justify-between", children: [
        /* @__PURE__ */ jsx("span", { className: "text-theme-muted", children: "Total Interest" }),
        /* @__PURE__ */ jsx("span", { className: `font-bold ${isHighlighted ? "text-emerald-600 dark:text-emerald-400" : "text-theme-primary"}`, children: formatCurrencyPrecise(result.totalInterest) })
      ] }) })
    ] })
  ] });
}
function PayoffTimeline({
  withMinimum,
  withExtra,
  hasExtra
}) {
  const maxMonths = withMinimum.months;
  const extraMonths = withExtra?.months ?? maxMonths;
  const minimumPercentage = 100;
  const extraPercentage = maxMonths > 0 ? extraMonths / maxMonths * 100 : 100;
  return /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
    /* @__PURE__ */ jsxs("h4", { className: "font-medium text-theme-primary flex items-center gap-2", children: [
      /* @__PURE__ */ jsx(Calendar, { className: "h-4 w-4 text-theme-muted" }),
      "Payoff Timeline"
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
      /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-sm", children: [
          /* @__PURE__ */ jsx("span", { className: "text-theme-muted", children: "Minimum payments" }),
          /* @__PURE__ */ jsx("span", { className: "text-theme-secondary font-medium", children: formatMonthsToYearsMonths(withMinimum.months) })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "h-3 bg-theme-tertiary rounded-full overflow-hidden", children: /* @__PURE__ */ jsx(
          "div",
          {
            className: "h-full bg-gray-400 dark:bg-gray-500 rounded-full transition-all duration-500",
            style: { width: `${minimumPercentage}%` }
          }
        ) })
      ] }),
      hasExtra && withExtra && /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-sm", children: [
          /* @__PURE__ */ jsx("span", { className: "text-accent-600 font-medium", children: "With extra payments" }),
          /* @__PURE__ */ jsx("span", { className: "text-accent-600 font-medium", children: formatMonthsToYearsMonths(withExtra.months) })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "h-3 bg-theme-tertiary rounded-full overflow-hidden", children: /* @__PURE__ */ jsx(
          "div",
          {
            className: "h-full bg-accent-600 rounded-full transition-all duration-500",
            style: { width: `${extraPercentage}%` }
          }
        ) })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-xs text-theme-muted pt-2 border-t border-theme", children: [
      /* @__PURE__ */ jsx("span", { children: "Today" }),
      /* @__PURE__ */ jsx("span", { children: withMinimum.payoffDate.toLocaleDateString("en-US", { month: "short", year: "numeric" }) })
    ] })
  ] });
}

const $$Astro = createAstro();
const $$Calculator = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Calculator;
  const session = await getSession(Astro2.request);
  if (!session?.user?.id) {
    return Astro2.redirect("/login");
  }
  return renderTemplate`${renderComponent($$result, "DashboardLayout", $$DashboardLayout, { "title": "Debt Calculator", "currentPath": "/dashboard/debts", "user": session.user, "showExploreSidebar": false }, { "default": async ($$result2) => renderTemplate` ${renderComponent($$result2, "PayoffCalculator", PayoffCalculator, { "client:load": true, "client:component-hydration": "load", "client:component-path": "/Users/chris/projects/dev/openfinance/src/components/debts/payoff-calculator", "client:component-export": "default" })} ` })}`;
}, "/Users/chris/projects/dev/openfinance/src/pages/dashboard/debts/calculator.astro", void 0);

const $$file = "/Users/chris/projects/dev/openfinance/src/pages/dashboard/debts/calculator.astro";
const $$url = "/dashboard/debts/calculator";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Calculator,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
//# sourceMappingURL=calculator.astro.mjs.map
