import { e as createComponent, f as createAstro, k as renderComponent, r as renderTemplate, m as maybeRenderHead } from '../../../chunks/astro/server_CLo6n4dC.mjs';
import 'piccolore';
import { $ as $$DashboardLayout } from '../../../chunks/DashboardLayout_CcQdn0FA.mjs';
import { g as getSession } from '../../../chunks/get-session-astro_CVC6HSBT.mjs';
import { jsxs, jsx, Fragment } from 'react/jsx-runtime';
import { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle2, Loader2, RefreshCw, Save, ArrowLeft } from 'lucide-react';
export { renderers } from '../../../renderers.mjs';

function StrategySettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [currentDebtTotal, setCurrentDebtTotal] = useState(null);
  const [bankAccounts, setBankAccounts] = useState([]);
  const [data, setData] = useState({
    discretionaryBudgetMonthly: 750,
    emergencyFundTarget: 1e3,
    debtSurplusPercent: 0.8,
    savingsSurplusPercent: 0.2
  });
  useEffect(() => {
    fetchData();
  }, []);
  async function fetchData() {
    try {
      setLoading(true);
      const [accountsRes, userRes, debtTotalRes] = await Promise.all([
        fetch("/api/bank-accounts"),
        fetch("/api/auth/session"),
        fetch("/api/paycheck-plan/sync-baseline")
      ]);
      if (accountsRes.ok) {
        const accounts = await accountsRes.json();
        setBankAccounts(accounts);
      }
      if (debtTotalRes.ok) {
        const { currentDebtTotal: total } = await debtTotalRes.json();
        setCurrentDebtTotal(total);
      }
      if (userRes.ok) {
        const session = await userRes.json();
        if (session?.user) {
          setData({
            paycheckBankAccountId: session.user.paycheckBankAccountId || "",
            spendingBankAccountId: session.user.spendingBankAccountId || "",
            discretionaryBudgetMonthly: session.user.discretionaryBudgetMonthly || 750,
            emergencyFundTarget: session.user.emergencyFundTarget || 1e3,
            debtSurplusPercent: session.user.debtSurplusPercent || 0.8,
            savingsSurplusPercent: session.user.savingsSurplusPercent || 0.2,
            payoffStartDate: session.user.payoffStartDate?.split("T")[0] || "",
            payoffStartTotalDebt: session.user.payoffStartTotalDebt || void 0,
            payoffTargetDate: session.user.payoffTargetDate?.split("T")[0] || ""
          });
        }
      }
    } catch (err) {
      setError("Failed to load settings");
    } finally {
      setLoading(false);
    }
  }
  async function handleSave() {
    try {
      setSaving(true);
      setError(null);
      setSuccess(false);
      const res = await fetch("/api/paycheck-plan", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          payoffStartDate: data.payoffStartDate || null,
          payoffTargetDate: data.payoffTargetDate || null
        })
      });
      if (!res.ok) {
        throw new Error("Failed to save settings");
      }
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3e3);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }
  function handlePercentChange(field, value) {
    const percent = value / 100;
    {
      setData({
        ...data,
        debtSurplusPercent: percent,
        savingsSurplusPercent: 1 - percent
      });
    }
  }
  async function handleSyncFromDebts() {
    try {
      setSyncing(true);
      setError(null);
      const res = await fetch("/api/paycheck-plan/sync-baseline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ preserveStartDate: false })
      });
      if (!res.ok) {
        throw new Error("Failed to sync baseline");
      }
      const result = await res.json();
      setData({
        ...data,
        payoffStartDate: result.newStartDate.split("T")[0],
        payoffStartTotalDebt: result.newStartDebt
      });
      setCurrentDebtTotal(result.newStartDebt);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3e3);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to sync");
    } finally {
      setSyncing(false);
    }
  }
  if (loading) {
    return /* @__PURE__ */ jsxs("div", { className: "animate-pulse space-y-4", children: [
      /* @__PURE__ */ jsx("div", { className: "h-10 bg-gray-200 dark:bg-gray-700 rounded" }),
      /* @__PURE__ */ jsx("div", { className: "h-10 bg-gray-200 dark:bg-gray-700 rounded" }),
      /* @__PURE__ */ jsx("div", { className: "h-10 bg-gray-200 dark:bg-gray-700 rounded" })
    ] });
  }
  return /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
    error && /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-lg", children: [
      /* @__PURE__ */ jsx(AlertCircle, { className: "h-5 w-5" }),
      /* @__PURE__ */ jsx("span", { children: error })
    ] }),
    success && /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 p-3 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 rounded-lg", children: [
      /* @__PURE__ */ jsx(CheckCircle2, { className: "h-5 w-5" }),
      /* @__PURE__ */ jsx("span", { children: "Settings saved successfully!" })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-semibold text-gray-900 dark:text-gray-100", children: "Account Routing" }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1", children: "Paycheck Deposit Account" }),
        /* @__PURE__ */ jsxs(
          "select",
          {
            value: data.paycheckBankAccountId || "",
            onChange: (e) => setData({ ...data, paycheckBankAccountId: e.target.value }),
            className: "w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-[#1c2128] text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500",
            children: [
              /* @__PURE__ */ jsx("option", { value: "", children: "Select account..." }),
              bankAccounts.map((acc) => /* @__PURE__ */ jsxs("option", { value: acc.id, children: [
                acc.name,
                " (",
                acc.bank.replace(/_/g, " "),
                ")"
              ] }, acc.id))
            ]
          }
        ),
        /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500 mt-1", children: "Where your paycheck is deposited" })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1", children: "Spending Account" }),
        /* @__PURE__ */ jsxs(
          "select",
          {
            value: data.spendingBankAccountId || "",
            onChange: (e) => setData({ ...data, spendingBankAccountId: e.target.value }),
            className: "w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-[#1c2128] text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500",
            children: [
              /* @__PURE__ */ jsx("option", { value: "", children: "Select account..." }),
              bankAccounts.map((acc) => /* @__PURE__ */ jsxs("option", { value: acc.id, children: [
                acc.name,
                " (",
                acc.bank.replace(/_/g, " "),
                ")"
              ] }, acc.id))
            ]
          }
        ),
        /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500 mt-1", children: "Where you transfer money for daily spending" })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-semibold text-gray-900 dark:text-gray-100", children: "Monthly Budget" }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1", children: "Discretionary Budget (Monthly)" }),
        /* @__PURE__ */ jsxs("div", { className: "relative", children: [
          /* @__PURE__ */ jsx("span", { className: "absolute left-3 top-1/2 -translate-y-1/2 text-gray-500", children: "$" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "number",
              value: data.discretionaryBudgetMonthly || "",
              onChange: (e) => setData({ ...data, discretionaryBudgetMonthly: Number(e.target.value) }),
              className: "w-full pl-7 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-[#1c2128] text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500",
              placeholder: "750"
            }
          )
        ] }),
        /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500 mt-1", children: "Food, gas, personal spending per month" })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1", children: "Emergency Fund Target" }),
        /* @__PURE__ */ jsxs("div", { className: "relative", children: [
          /* @__PURE__ */ jsx("span", { className: "absolute left-3 top-1/2 -translate-y-1/2 text-gray-500", children: "$" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "number",
              value: data.emergencyFundTarget || "",
              onChange: (e) => setData({ ...data, emergencyFundTarget: Number(e.target.value) }),
              className: "w-full pl-7 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-[#1c2128] text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500",
              placeholder: "1000"
            }
          )
        ] }),
        /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500 mt-1", children: "Goal for emergency fund before 100% goes to debt" })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-semibold text-gray-900 dark:text-gray-100", children: "Surplus Allocation" }),
      /* @__PURE__ */ jsxs("div", { className: "p-4 bg-gray-50 dark:bg-gray-800 rounded-lg", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center mb-4", children: [
          /* @__PURE__ */ jsx("span", { className: "text-sm text-gray-600 dark:text-gray-400", children: "Debt Payoff" }),
          /* @__PURE__ */ jsxs("span", { className: "font-semibold text-gray-900 dark:text-gray-100", children: [
            ((data.debtSurplusPercent || 0.8) * 100).toFixed(0),
            "%"
          ] })
        ] }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "range",
            min: "0",
            max: "100",
            value: (data.debtSurplusPercent || 0.8) * 100,
            onChange: (e) => handlePercentChange("debtSurplusPercent", Number(e.target.value)),
            className: "w-full accent-blue-600"
          }
        ),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-xs text-gray-500 mt-2", children: [
          /* @__PURE__ */ jsxs("span", { children: [
            "Savings: ",
            ((data.savingsSurplusPercent || 0.2) * 100).toFixed(0),
            "%"
          ] }),
          /* @__PURE__ */ jsxs("span", { children: [
            "Debt: ",
            ((data.debtSurplusPercent || 0.8) * 100).toFixed(0),
            "%"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500", children: "After bills and spending, split your surplus between savings and extra debt payments" })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsx("h3", { className: "font-semibold text-gray-900 dark:text-gray-100", children: "Payoff Goal Tracking" }),
        /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: handleSyncFromDebts,
            disabled: syncing,
            className: "flex items-center gap-1.5 px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors disabled:opacity-50",
            children: [
              syncing ? /* @__PURE__ */ jsx(Loader2, { className: "h-4 w-4 animate-spin" }) : /* @__PURE__ */ jsx(RefreshCw, { className: "h-4 w-4" }),
              "Sync from Debts"
            ]
          }
        )
      ] }),
      currentDebtTotal !== null && data.payoffStartTotalDebt && currentDebtTotal !== data.payoffStartTotalDebt && /* @__PURE__ */ jsxs("div", { className: "p-3 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 rounded-lg text-sm", children: [
        /* @__PURE__ */ jsx("strong", { children: "Baseline may be stale:" }),
        " Current debt ($",
        currentDebtTotal.toLocaleString(),
        ") differs from baseline ($",
        data.payoffStartTotalDebt.toLocaleString(),
        '). Click "Sync from Debts" to reset your baseline.'
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1", children: "Start Date" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "date",
              value: data.payoffStartDate || "",
              onChange: (e) => setData({ ...data, payoffStartDate: e.target.value }),
              className: "w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-[#1c2128] text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1", children: "Target Date" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "date",
              value: data.payoffTargetDate || "",
              onChange: (e) => setData({ ...data, payoffTargetDate: e.target.value }),
              className: "w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-[#1c2128] text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500"
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-1", children: [
          /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-700 dark:text-gray-300", children: "Starting Total Debt" }),
          currentDebtTotal !== null && /* @__PURE__ */ jsxs("span", { className: "text-xs text-gray-500", children: [
            "Current: $",
            currentDebtTotal.toLocaleString()
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "relative", children: [
          /* @__PURE__ */ jsx("span", { className: "absolute left-3 top-1/2 -translate-y-1/2 text-gray-500", children: "$" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "number",
              value: data.payoffStartTotalDebt || "",
              onChange: (e) => setData({ ...data, payoffStartTotalDebt: Number(e.target.value) }),
              className: "w-full pl-7 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-[#1c2128] text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500",
              placeholder: "82108.87"
            }
          )
        ] }),
        /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500 mt-1", children: "Total debt when you started your payoff journey" })
      ] })
    ] }),
    /* @__PURE__ */ jsx(
      "button",
      {
        onClick: handleSave,
        disabled: saving,
        className: "w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold rounded-xl transition-colors",
        children: saving ? /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx(Loader2, { className: "h-5 w-5 animate-spin" }),
          "Saving..."
        ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx(Save, { className: "h-5 w-5" }),
          "Save Strategy Settings"
        ] })
      }
    )
  ] });
}

const $$Astro = createAstro();
const $$Strategy = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Strategy;
  const session = await getSession(Astro2.request);
  if (!session?.user?.id) {
    return Astro2.redirect("/login");
  }
  return renderTemplate`${renderComponent($$result, "DashboardLayout", $$DashboardLayout, { "title": "Paycheck Strategy", "currentPath": "/dashboard/settings/strategy", "user": session.user, "showExploreSidebar": false }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="space-y-6 animate-fade-in"> <header> <a href="/dashboard/settings" class="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 mb-4"> ${renderComponent($$result2, "ArrowLeft", ArrowLeft, { "className": "h-4 w-4" })}
Back to Settings
</a> <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">
Paycheck Strategy
</h1> <p class="text-gray-600 dark:text-gray-400 mt-1">
Configure your dollar allocation plan settings
</p> </header> <section class="bg-white dark:bg-[#1c2128] border border-gray-200 dark:border-[#30363d] rounded-2xl p-5"> ${renderComponent($$result2, "StrategySettings", StrategySettings, { "client:load": true, "client:component-hydration": "load", "client:component-path": "/Users/chris/projects/dev/openfinance/src/components/settings/StrategySettings", "client:component-export": "StrategySettings" })} </section> </div> ` })}`;
}, "/Users/chris/projects/dev/openfinance/src/pages/dashboard/settings/strategy.astro", void 0);

const $$file = "/Users/chris/projects/dev/openfinance/src/pages/dashboard/settings/strategy.astro";
const $$url = "/dashboard/settings/strategy";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Strategy,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
//# sourceMappingURL=strategy.astro.mjs.map
