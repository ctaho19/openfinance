import { e as createComponent, f as createAstro, k as renderComponent, r as renderTemplate, m as maybeRenderHead, h as addAttribute, l as renderScript } from '../../chunks/astro/server_B4LN2q8c.mjs';
import 'piccolore';
import { $ as $$DashboardLayout } from '../../chunks/DashboardLayout_CPcOq8Jq.mjs';
import { g as getCurrentPayPeriod, a as getPreviousPayPeriod, b as getNextPayPeriod, c as getPayPeriods, f as formatPayPeriod, S as SectionCard } from '../../chunks/section-card_v4AMPtzv.mjs';
import { jsxs, jsx } from 'react/jsx-runtime';
import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar, Wallet, Building2, Circle, CheckCircle2, TrendingUp, CreditCard } from 'lucide-react';
import { B as BankAccountAllocationCard } from '../../chunks/bank-account-card_SiXbaX8W.mjs';
import { g as getSession } from '../../chunks/get-session-astro_CVC6HSBT.mjs';
import { g as getPaymentsForPeriod } from '../../chunks/pay-periods_DhVbftd9.mjs';
import { p as prisma } from '../../chunks/auth-config_mz_UKjvQ.mjs';
import { startOfDay, endOfDay, addDays, format, isToday, isTomorrow, differenceInDays } from 'date-fns';
export { renderers } from '../../renderers.mjs';

function PeriodSelector({
  currentPeriodLabel,
  previousPeriodLabel,
  nextPeriodLabel,
  defaultPeriod = "current",
  onPeriodChange
}) {
  const [activePeriod, setActivePeriod] = useState(defaultPeriod);
  const periods = [
    { key: "previous", label: "Previous" },
    { key: "current", label: "Current" },
    { key: "next", label: "Next" }
  ];
  const handlePeriodChange = (period) => {
    setActivePeriod(period);
    onPeriodChange?.(period);
    const params = new URLSearchParams(window.location.search);
    if (period === "current") {
      params.delete("period");
    } else {
      params.set("period", period);
    }
    const newUrl = window.location.pathname + (params.toString() ? `?${params}` : "");
    window.history.pushState({}, "", newUrl);
    window.location.reload();
  };
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const period = params.get("period");
    if (period && ["previous", "current", "next"].includes(period)) {
      setActivePeriod(period);
    }
  }, []);
  const periodLabels = {
    previous: previousPeriodLabel,
    current: currentPeriodLabel,
    next: nextPeriodLabel
  };
  return /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => handlePeriodChange(
            activePeriod === "next" ? "current" : activePeriod === "current" ? "previous" : "previous"
          ),
          disabled: activePeriod === "previous",
          className: "p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors",
          children: /* @__PURE__ */ jsx(ChevronLeft, { className: "h-5 w-5 text-gray-600 dark:text-gray-400" })
        }
      ),
      /* @__PURE__ */ jsx("div", { className: "flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1", children: periods.map((period) => /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => handlePeriodChange(period.key),
          className: `
                px-4 py-2 text-sm font-medium rounded-md transition-all duration-200
                ${activePeriod === period.key ? "bg-white dark:bg-[#1c2128] text-gray-900 dark:text-gray-100 shadow-sm" : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"}
              `,
          children: period.label
        },
        period.key
      )) }),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => handlePeriodChange(
            activePeriod === "previous" ? "current" : activePeriod === "current" ? "next" : "next"
          ),
          disabled: activePeriod === "next",
          className: "p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors",
          children: /* @__PURE__ */ jsx(ChevronRight, { className: "h-5 w-5 text-gray-600 dark:text-gray-400" })
        }
      )
    ] }),
    /* @__PURE__ */ jsx("p", { className: "text-center text-sm text-gray-500 dark:text-gray-400", children: periodLabels[activePeriod] })
  ] });
}

function AllocationChart({ items, total }) {
  return /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsx("div", { className: "h-4 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-800 flex", children: items.map((item, index) => /* @__PURE__ */ jsx(
      "div",
      {
        className: `${item.color} transition-all duration-500`,
        style: { width: `${Math.max(item.percentage, 0)}%` }
      },
      index
    )) }),
    /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 lg:grid-cols-4 gap-3", children: items.map((item, index) => /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
      /* @__PURE__ */ jsx("div", { className: `w-3 h-3 rounded-full ${item.color}` }),
      /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
        /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500 dark:text-gray-400 truncate", children: item.label }),
        /* @__PURE__ */ jsxs("p", { className: "text-sm font-semibold text-gray-900 dark:text-gray-100", children: [
          "$",
          item.amount.toLocaleString(void 0, { minimumFractionDigits: 2 })
        ] })
      ] })
    ] }, index)) })
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
  const periodParam = Astro2.url.searchParams.get("period");
  const currentPeriod = getCurrentPayPeriod();
  const previousPeriod = getPreviousPayPeriod();
  const nextPeriod = getNextPayPeriod();
  const selectedPeriod = periodParam === "previous" ? previousPeriod : periodParam === "next" ? nextPeriod : currentPeriod;
  const periodStart = startOfDay(selectedPeriod.startDate);
  const periodEnd = endOfDay(selectedPeriod.endDate);
  const [payments, user, bankAccounts] = await Promise.all([
    getPaymentsForPeriod(session.user.id, periodStart, periodEnd),
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { paycheckAmount: true }
    }),
    prisma.bankAccount.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "asc" }
    })
  ]);
  const paycheckAmount = user?.paycheckAmount ? Number(user.paycheckAmount) : 0;
  const paidPayments = payments.filter((p) => p.status === "PAID");
  const unpaidPayments = payments.filter((p) => p.status === "UNPAID");
  const totalDue = payments.reduce((sum, p) => sum + Number(p.amount), 0);
  const totalPaid = paidPayments.reduce((sum, p) => sum + Number(p.amount), 0);
  const totalRemaining = totalDue - totalPaid;
  const safeToSpend = paycheckAmount - totalDue;
  const discretionary = Math.max(0, safeToSpend);
  const allocationItems = [
    {
      label: "Bills Due",
      amount: totalDue,
      color: "bg-blue-500",
      percentage: paycheckAmount > 0 ? totalDue / paycheckAmount * 100 : 0
    },
    {
      label: "Safe to Spend",
      amount: discretionary,
      color: "bg-emerald-500",
      percentage: paycheckAmount > 0 ? discretionary / paycheckAmount * 100 : 0
    }
  ];
  const futurePeriods = getPayPeriods(addDays(currentPeriod.endDate, 1), 3, "forward");
  const forecastData = await Promise.all(
    futurePeriods.map(async (period) => {
      const periodPayments = await getPaymentsForPeriod(
        session.user.id,
        startOfDay(period.startDate),
        endOfDay(period.endDate)
      );
      const totalBills = periodPayments.reduce((sum, p) => sum + Number(p.amount), 0);
      const projectedBalance = paycheckAmount - totalBills;
      return {
        period,
        totalBills,
        projectedBalance,
        paymentCount: periodPayments.length
      };
    })
  );
  const isPastPeriod = periodParam === "previous";
  const isFuturePeriod = periodParam === "next";
  const isCurrentPeriod = !periodParam || periodParam === "current";
  const bankAllocations = [];
  const accountMap = /* @__PURE__ */ new Map();
  unpaidPayments.forEach((payment) => {
    const bankId = payment.bill.bankAccountId;
    if (!accountMap.has(bankId)) {
      accountMap.set(bankId, []);
    }
    accountMap.get(bankId).push(payment);
  });
  accountMap.forEach((accountPayments, bankId) => {
    const account = bankId ? bankAccounts.find((a) => a.id === bankId) || null : null;
    const bills = accountPayments.map((p) => ({
      name: p.bill.name,
      amount: Number(p.amount),
      dueDate: format(p.dueDate, "MMM d")
    }));
    const total = bills.reduce((sum, b) => sum + b.amount, 0);
    bankAllocations.push({ account, bills, total });
  });
  bankAllocations.sort((a, b) => {
    if (a.account && !b.account) return -1;
    if (!a.account && b.account) return 1;
    return b.total - a.total;
  });
  function formatDueDate(date) {
    if (isToday(date)) return "Today";
    if (isTomorrow(date)) return "Tomorrow";
    const days = differenceInDays(date, /* @__PURE__ */ new Date());
    if (days < 0) return `${Math.abs(days)}d overdue`;
    return format(date, "MMM d");
  }
  function getPaymentStatus(date) {
    if (isToday(date)) return "due-today";
    const days = differenceInDays(date, /* @__PURE__ */ new Date());
    if (days < 0) return "overdue";
    if (days <= 3) return "due-soon";
    return "pending";
  }
  return renderTemplate`${renderComponent($$result, "DashboardLayout", $$DashboardLayout, { "title": "Pay Periods", "currentPath": "/dashboard/pay-periods", "user": session.user, "showExploreSidebar": false }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="space-y-6"> <!-- Header with Period Selector --> <header class="space-y-4"> <div class="flex items-center justify-between"> <div> <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100">Pay Period</h1> <p class="text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-2"> ${renderComponent($$result2, "Calendar", Calendar, { "className": "h-4 w-4" })} ${formatPayPeriod(selectedPeriod)} </p> </div> ${isPastPeriod && renderTemplate`<span class="px-3 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-full">
Past Period
</span>`} ${isFuturePeriod && renderTemplate`<span class="px-3 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full">
Upcoming
</span>`} </div> <!-- Period Navigation --> <div class="bg-white dark:bg-[#1c2128] rounded-xl border border-gray-200 dark:border-[#30363d] p-4"> ${renderComponent($$result2, "PeriodSelector", PeriodSelector, { "client:load": true, "currentPeriodLabel": formatPayPeriod(currentPeriod), "previousPeriodLabel": formatPayPeriod(previousPeriod), "nextPeriodLabel": formatPayPeriod(nextPeriod), "defaultPeriod": periodParam || "current", "client:component-hydration": "load", "client:component-path": "/Users/chris/projects/dev/openfinance/src/components/pay-periods/PeriodSelector", "client:component-export": "PeriodSelector" })} </div> </header> <!-- Paycheck Allocation Card --> <div class="bg-white dark:bg-[#1c2128] rounded-xl border border-gray-200 dark:border-[#30363d] p-5"> <div class="flex items-center justify-between mb-4"> <div class="flex items-center gap-2"> <div class="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center"> ${renderComponent($$result2, "Wallet", Wallet, { "className": "h-5 w-5 text-emerald-600 dark:text-emerald-400" })} </div> <div> <h2 class="font-semibold text-gray-900 dark:text-gray-100">Paycheck Allocation</h2> <p class="text-sm text-gray-500 dark:text-gray-400">
$${paycheckAmount.toLocaleString(void 0, { minimumFractionDigits: 2 })} paycheck
</p> </div> </div> <div class="text-right"> <p class="text-xs text-gray-500 dark:text-gray-400">Safe to Spend</p> <p${addAttribute(`text-xl font-bold ${safeToSpend >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`, "class")}>
$${safeToSpend.toLocaleString(void 0, { minimumFractionDigits: 2 })} </p> </div> </div> ${renderComponent($$result2, "AllocationChart", AllocationChart, { "client:visible": true, "items": allocationItems, "total": paycheckAmount, "client:component-hydration": "visible", "client:component-path": "/Users/chris/projects/dev/openfinance/src/components/pay-periods/AllocationChart", "client:component-export": "AllocationChart" })} </div> <!-- Bank Account Allocation --> ${bankAllocations.length > 0 && bankAllocations.some((a) => a.account !== null) && renderTemplate`${renderComponent($$result2, "SectionCard", SectionCard, { "client:visible": true, "title": "Transfer by Account", "subtitle": `${bankAllocations.filter((a) => a.account).length} accounts`, "defaultOpen": true, "client:component-hydration": "visible", "client:component-path": "/Users/chris/projects/dev/openfinance/src/components/ui/section-card", "client:component-export": "SectionCard" }, { "default": async ($$result3) => renderTemplate` <div class="grid grid-cols-1 lg:grid-cols-2 gap-4"> ${bankAllocations.map((allocation) => allocation.account ? renderTemplate`${renderComponent($$result3, "BankAccountAllocationCard", BankAccountAllocationCard, { "client:visible": true, "name": allocation.account.name, "bank": allocation.account.bank, "lastFour": allocation.account.lastFour, "amount": allocation.total, "bills": allocation.bills, "client:component-hydration": "visible", "client:component-path": "/Users/chris/projects/dev/openfinance/src/components/ui/bank-account-card", "client:component-export": "BankAccountAllocationCard" })}` : null)} </div> ${bankAllocations.some((a) => a.account === null) && renderTemplate`<div class="mt-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-dashed border-gray-200 dark:border-gray-700"> <div class="flex items-center gap-3 mb-3"> <div class="w-10 h-10 rounded-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center"> ${renderComponent($$result3, "Building2", Building2, { "className": "h-5 w-5 text-gray-500 dark:text-gray-400" })} </div> <div> <p class="font-medium text-gray-700 dark:text-gray-300">Unassigned Bills</p> <p class="text-sm text-gray-500 dark:text-gray-400">
$${bankAllocations.find((a) => a.account === null)?.total.toLocaleString(void 0, { minimumFractionDigits: 2 })} total
</p> </div> </div> <div class="space-y-1"> ${bankAllocations.find((a) => a.account === null)?.bills.map((bill) => renderTemplate`<div class="flex items-center justify-between text-sm"> <span class="text-gray-600 dark:text-gray-400">${bill.name}</span> <span class="text-gray-700 dark:text-gray-300">$${bill.amount.toLocaleString(void 0, { minimumFractionDigits: 2 })}</span> </div>`)} </div> <p class="text-xs text-gray-500 dark:text-gray-400 mt-3"> <a href="/dashboard/bills" class="text-blue-600 dark:text-blue-400 hover:underline">Assign bank accounts</a> to these bills for better tracking
</p> </div>`}` })}`} <!-- Summary Stats --> <div class="grid grid-cols-2 lg:grid-cols-4 gap-4"> <div class="bg-white dark:bg-[#1c2128] rounded-xl border border-gray-200 dark:border-[#30363d] p-4"> <p class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Total Due</p> <p class="text-2xl font-semibold text-gray-900 dark:text-gray-100 mt-1">
$${totalDue.toLocaleString(void 0, { minimumFractionDigits: 2 })} </p> <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">${payments.length} bills</p> </div> <div class="bg-white dark:bg-[#1c2128] rounded-xl border border-gray-200 dark:border-[#30363d] p-4"> <p class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Paid</p> <p class="text-2xl font-semibold text-emerald-600 dark:text-emerald-400 mt-1">
$${totalPaid.toLocaleString(void 0, { minimumFractionDigits: 2 })} </p> <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">${paidPayments.length} completed</p> </div> <div class="bg-white dark:bg-[#1c2128] rounded-xl border border-gray-200 dark:border-[#30363d] p-4"> <p class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Remaining</p> <p${addAttribute(`text-2xl font-semibold mt-1 ${totalRemaining > 0 ? "text-amber-600 dark:text-amber-400" : "text-emerald-600 dark:text-emerald-400"}`, "class")}>
$${totalRemaining.toLocaleString(void 0, { minimumFractionDigits: 2 })} </p> <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">${unpaidPayments.length} pending</p> </div> <div class="bg-white dark:bg-[#1c2128] rounded-xl border border-gray-200 dark:border-[#30363d] p-4"> <p class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Progress</p> <p class="text-2xl font-semibold text-gray-900 dark:text-gray-100 mt-1"> ${payments.length > 0 ? Math.round(paidPayments.length / payments.length * 100) : 0}%
</p> <div class="mt-2 h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden"> <div class="h-full bg-emerald-500 rounded-full transition-all duration-500"${addAttribute(`width: ${payments.length > 0 ? paidPayments.length / payments.length * 100 : 0}%`, "style")}></div> </div> </div> </div> <!-- Unpaid Bills --> ${unpaidPayments.length > 0 && renderTemplate`${renderComponent($$result2, "SectionCard", SectionCard, { "client:visible": true, "title": "Unpaid", "subtitle": `${unpaidPayments.length} remaining`, "client:component-hydration": "visible", "client:component-path": "/Users/chris/projects/dev/openfinance/src/components/ui/section-card", "client:component-export": "SectionCard" }, { "default": async ($$result3) => renderTemplate` <div class="divide-y divide-gray-100 dark:divide-gray-800"> ${unpaidPayments.map((payment) => {
    const status = getPaymentStatus(payment.dueDate);
    return renderTemplate`<div class="flex items-center justify-between py-3 first:pt-0 last:pb-0 group"> <div class="flex items-center gap-3"> <button${addAttribute(payment.id, "data-payment-id")} class="payment-toggle p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"> ${renderComponent($$result3, "Circle", Circle, { "className": "h-5 w-5 text-gray-400 dark:text-gray-500" })} </button> <div> <p class="font-medium text-gray-900 dark:text-gray-100">${payment.bill.name}</p> <p${addAttribute(`text-sm ${status === "overdue" ? "text-red-600 dark:text-red-400" : status === "due-today" ? "text-amber-600 dark:text-amber-400" : status === "due-soon" ? "text-amber-600 dark:text-amber-400" : "text-gray-500 dark:text-gray-400"}`, "class")}> ${formatDueDate(payment.dueDate)} </p> </div> </div> <span${addAttribute(`font-semibold ${status === "overdue" ? "text-red-600 dark:text-red-400" : "text-gray-900 dark:text-gray-100"}`, "class")}>
$${Number(payment.amount).toLocaleString(void 0, { minimumFractionDigits: 2 })} </span> </div>`;
  })} </div> ` })}`} <!-- Paid Bills --> ${paidPayments.length > 0 && renderTemplate`${renderComponent($$result2, "SectionCard", SectionCard, { "client:visible": true, "title": "Paid", "subtitle": `${paidPayments.length} completed`, "defaultOpen": false, "client:component-hydration": "visible", "client:component-path": "/Users/chris/projects/dev/openfinance/src/components/ui/section-card", "client:component-export": "SectionCard" }, { "default": async ($$result3) => renderTemplate` <div class="divide-y divide-gray-100 dark:divide-gray-800"> ${paidPayments.map((payment) => renderTemplate`<div class="flex items-center justify-between py-3 first:pt-0 last:pb-0 opacity-60"> <div class="flex items-center gap-3"> <button${addAttribute(payment.id, "data-payment-id")} class="payment-toggle p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"> ${renderComponent($$result3, "CheckCircle2", CheckCircle2, { "className": "h-5 w-5 text-emerald-600 dark:text-emerald-400" })} </button> <div> <p class="font-medium text-gray-900 dark:text-gray-100 line-through">${payment.bill.name}</p> <p class="text-sm text-gray-500 dark:text-gray-400">${formatDueDate(payment.dueDate)}</p> </div> </div> <span class="font-semibold text-gray-900 dark:text-gray-100">
$${Number(payment.amount).toLocaleString(void 0, { minimumFractionDigits: 2 })} </span> </div>`)} </div> ` })}`} <!-- No Bills Message --> ${payments.length === 0 && renderTemplate`<div class="bg-white dark:bg-[#1c2128] rounded-xl border border-gray-200 dark:border-[#30363d] p-8"> <div class="text-center"> <div class="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-3"> ${renderComponent($$result2, "TrendingUp", TrendingUp, { "className": "h-6 w-6 text-gray-400" })} </div> <p class="font-medium text-gray-600 dark:text-gray-400">No bills this period</p> <p class="text-sm text-gray-500 dark:text-gray-500 mt-1"> ${isFuturePeriod ? "Nothing scheduled yet" : "All clear for this period"} </p> </div> </div>`} <!-- Payday Forecast --> ${isCurrentPeriod && forecastData.length > 0 && renderTemplate`${renderComponent($$result2, "SectionCard", SectionCard, { "client:visible": true, "title": "Payday Forecast", "subtitle": "Next 3 periods", "defaultOpen": true, "client:component-hydration": "visible", "client:component-path": "/Users/chris/projects/dev/openfinance/src/components/ui/section-card", "client:component-export": "SectionCard" }, { "default": async ($$result3) => renderTemplate` <div class="space-y-3"> ${forecastData.map((forecast, index) => renderTemplate`<div class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg"> <div class="flex items-center gap-3"> <div class="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center"> ${renderComponent($$result3, "Calendar", Calendar, { "className": "h-5 w-5 text-blue-600 dark:text-blue-400" })} </div> <div> <p class="font-medium text-gray-900 dark:text-gray-100"> ${format(forecast.period.startDate, "MMM d")} - ${format(forecast.period.endDate, "MMM d")} </p> <p class="text-sm text-gray-500 dark:text-gray-400"> ${forecast.paymentCount} bills · $${forecast.totalBills.toLocaleString(void 0, { minimumFractionDigits: 2 })} due
</p> </div> </div> <div class="text-right"> <p class="text-xs text-gray-500 dark:text-gray-400">Projected Balance</p> <p${addAttribute(`font-semibold ${forecast.projectedBalance >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`, "class")}>
$${forecast.projectedBalance.toLocaleString(void 0, { minimumFractionDigits: 2 })} </p> </div> </div>`)} </div> ` })}`} <!-- Period Comparison (Previous Period) --> ${isPastPeriod && renderTemplate`<div class="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-800/30 rounded-xl border border-gray-200 dark:border-[#30363d] p-5"> <div class="flex items-center gap-2 mb-3"> ${renderComponent($$result2, "CreditCard", CreditCard, { "className": "h-5 w-5 text-gray-600 dark:text-gray-400" })} <h3 class="font-semibold text-gray-900 dark:text-gray-100">Period Summary</h3> </div> <div class="grid grid-cols-2 gap-4"> <div> <p class="text-xs text-gray-500 dark:text-gray-400">Total Spent</p> <p class="text-lg font-bold text-gray-900 dark:text-gray-100">
$${totalPaid.toLocaleString(void 0, { minimumFractionDigits: 2 })} </p> </div> <div> <p class="text-xs text-gray-500 dark:text-gray-400">Bills Paid</p> <p class="text-lg font-bold text-gray-900 dark:text-gray-100"> ${paidPayments.length} of ${payments.length} </p> </div> </div> </div>`} </div> ${renderScript($$result2, "/Users/chris/projects/dev/openfinance/src/pages/dashboard/pay-periods/index.astro?astro&type=script&index=0&lang.ts")} ` })}`;
}, "/Users/chris/projects/dev/openfinance/src/pages/dashboard/pay-periods/index.astro", void 0);

const $$file = "/Users/chris/projects/dev/openfinance/src/pages/dashboard/pay-periods/index.astro";
const $$url = "/dashboard/pay-periods";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
//# sourceMappingURL=pay-periods.astro.mjs.map
