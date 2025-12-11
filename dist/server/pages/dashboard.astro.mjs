import { e as createComponent, f as createAstro, k as renderComponent, r as renderTemplate, m as maybeRenderHead, h as addAttribute } from '../chunks/astro/server_Cel7--ii.mjs';
import 'piccolore';
import { L as Link, $ as $$DashboardLayout } from '../chunks/DashboardLayout_PUHTqK68.mjs';
import { jsx, jsxs } from 'react/jsx-runtime';
import { g as getCurrentPayPeriod, a as getNextPayPeriod, f as formatPayPeriod, S as SectionCard } from '../chunks/section-card_CqSZrPoy.mjs';
import { XCircle, AlertTriangle, CheckCircle, Info, Receipt, CreditCard, Calendar, Target, CheckCircle2, TrendingUp, ChevronRight } from 'lucide-react';
import { g as getSession } from '../chunks/get-session-astro_CVC6HSBT.mjs';
import { p as prisma } from '../chunks/auth-config_mz_UKjvQ.mjs';
import { startOfDay, endOfDay, differenceInDays, isToday, isTomorrow, format } from 'date-fns';
export { renderers } from '../renderers.mjs';

function AccountSummaryCard({
  title,
  subtitle,
  primaryAmount,
  primaryLabel = "Available",
  secondaryItems,
  children
}) {
  const formattedAmount = primaryAmount.toLocaleString(void 0, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  });
  return /* @__PURE__ */ jsx("div", { className: "bg-chase-gradient rounded-2xl shadow-theme-md overflow-hidden", children: /* @__PURE__ */ jsxs("div", { className: "px-5 py-6 lg:px-8 lg:py-8", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between mb-4", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("p", { className: "text-label-light", children: primaryLabel }),
        /* @__PURE__ */ jsx("h2", { className: "text-white font-semibold text-lg mt-0.5", children: title })
      ] }),
      subtitle && /* @__PURE__ */ jsx("span", { className: "text-xs text-white/70 bg-white/10 px-2.5 py-1 rounded-full", children: subtitle })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "mb-6", children: /* @__PURE__ */ jsxs("p", { className: "text-balance-xl text-white", children: [
      "$",
      formattedAmount
    ] }) }),
    secondaryItems && secondaryItems.length > 0 && /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-x-6 gap-y-3 pt-4 border-t border-white/20", children: secondaryItems.map((item, index) => /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("p", { className: "text-[11px] text-white/60 uppercase tracking-wider font-medium", children: item.label }),
      /* @__PURE__ */ jsx("p", { className: "text-white font-semibold mt-0.5", children: item.value })
    ] }, index)) }),
    children
  ] }) });
}
function SimpleBalanceCard({
  label,
  amount,
  trend = "neutral",
  subtitle
}) {
  const formattedAmount = amount.toLocaleString(void 0, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  });
  const trendColors = {
    up: "text-success-600 dark:text-success-400",
    down: "text-danger-600 dark:text-danger-400",
    neutral: "text-theme-primary"
  };
  return /* @__PURE__ */ jsxs("div", { className: "bg-theme-elevated rounded-2xl shadow-theme p-4 lg:p-5 border border-theme", children: [
    /* @__PURE__ */ jsx("p", { className: "text-label", children: label }),
    /* @__PURE__ */ jsxs("p", { className: `text-2xl font-semibold mt-1 ${trendColors[trend]}`, children: [
      "$",
      formattedAmount
    ] }),
    subtitle && /* @__PURE__ */ jsx("p", { className: "text-xs text-theme-muted mt-1", children: subtitle })
  ] });
}

function QuickActionsGrid({ actions, columns = 4 }) {
  const gridCols = {
    3: "grid-cols-3",
    4: "grid-cols-4",
    5: "grid-cols-5"
  };
  return /* @__PURE__ */ jsx("div", { className: `grid ${gridCols[columns]} gap-3 lg:gap-4`, children: actions.map((action) => /* @__PURE__ */ jsxs(
    Link,
    {
      href: action.href,
      className: "flex flex-col items-center justify-center py-4 px-2 min-h-[80px] min-w-[64px] group",
      children: [
        /* @__PURE__ */ jsxs("div", { className: "relative", children: [
          /* @__PURE__ */ jsx("div", { className: "\n              w-12 h-12 lg:w-14 lg:h-14 \n              rounded-full \n              bg-accent-50 dark:bg-accent-600/20\n              flex items-center justify-center\n              transition-all duration-200\n              group-hover:bg-accent-100 dark:group-hover:bg-accent-600/30\n              group-hover:scale-105\n              group-active:scale-95\n            ", children: /* @__PURE__ */ jsx(action.icon, { className: "h-5 w-5 lg:h-6 lg:w-6 text-accent-600 dark:text-accent-400" }) }),
          action.badge && /* @__PURE__ */ jsx("span", { className: "absolute -top-1 -right-1 bg-danger-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center", children: action.badge })
        ] }),
        /* @__PURE__ */ jsx("span", { className: "text-[11px] lg:text-xs font-medium text-theme-primary mt-2 text-center leading-tight", children: action.label })
      ]
    },
    action.label
  )) });
}

const severityConfig = {
  info: {
    bg: "bg-info-100 dark:bg-info-600/20",
    border: "border-info-500/30",
    icon: Info,
    iconColor: "text-info-600 dark:text-info-400"
  },
  success: {
    bg: "bg-success-100 dark:bg-success-600/20",
    border: "border-success-500/30",
    icon: CheckCircle,
    iconColor: "text-success-600 dark:text-success-400"
  },
  warning: {
    bg: "bg-warning-100 dark:bg-warning-600/20",
    border: "border-warning-500/30",
    icon: AlertTriangle,
    iconColor: "text-warning-600 dark:text-warning-400"
  },
  error: {
    bg: "bg-danger-100 dark:bg-danger-600/20",
    border: "border-danger-500/30",
    icon: XCircle,
    iconColor: "text-danger-600 dark:text-danger-400"
  }
};
function AlertBanner({
  children,
  severity = "info",
  icon,
  dismissible = false,
  onDismiss
}) {
  const config = severityConfig[severity];
  const IconComponent = config.icon;
  return /* @__PURE__ */ jsxs(
    "div",
    {
      className: `
        flex items-start gap-3 px-4 py-3 rounded-xl border
        ${config.bg} ${config.border}
      `,
      role: "alert",
      children: [
        /* @__PURE__ */ jsx("div", { className: `flex-shrink-0 mt-0.5 ${config.iconColor}`, children: icon || /* @__PURE__ */ jsx(IconComponent, { className: "h-5 w-5" }) }),
        /* @__PURE__ */ jsx("div", { className: "flex-1 text-sm text-theme-primary", children }),
        dismissible && onDismiss && /* @__PURE__ */ jsx(
          "button",
          {
            onClick: onDismiss,
            className: "flex-shrink-0 p-1 rounded hover:bg-black/5 dark:hover:bg-white/5 transition-colors",
            "aria-label": "Dismiss",
            children: /* @__PURE__ */ jsx(XCircle, { className: "h-4 w-4 text-theme-muted" })
          }
        )
      ]
    }
  );
}

const FOO_STEP_NAMES = {
  DEDUCTIBLES_COVERED: { number: 1, name: "Cover Deductibles" },
  EMPLOYER_MATCH: { number: 2, name: "Get Employer Match" },
  HIGH_INTEREST_DEBT: { number: 3, name: "Pay Off High-Interest Debt" },
  EMERGENCY_FUND: { number: 4, name: "Build Emergency Fund" },
  ROTH_HSA: { number: 5, name: "Max Roth IRA & HSA" },
  MAX_RETIREMENT: { number: 6, name: "Max Out Retirement" },
  HYPERACCUMULATION: { number: 7, name: "Hyperaccumulation" },
  PREPAY_FUTURE: { number: 8, name: "Prepay Future Expenses" },
  PREPAY_LOW_INTEREST: { number: 9, name: "Prepay Low-Interest Debt" }
};
const FOO_STEP_ORDER = [
  "DEDUCTIBLES_COVERED",
  "EMPLOYER_MATCH",
  "HIGH_INTEREST_DEBT",
  "EMERGENCY_FUND",
  "ROTH_HSA",
  "MAX_RETIREMENT",
  "HYPERACCUMULATION",
  "PREPAY_FUTURE",
  "PREPAY_LOW_INTEREST"
];
async function getDashboardData(userId) {
  const currentPeriod = getCurrentPayPeriod();
  const nextPeriod = getNextPayPeriod();
  const today = /* @__PURE__ */ new Date();
  const periodStart = startOfDay(currentPeriod.startDate);
  const periodEnd = endOfDay(currentPeriod.endDate);
  const [user, bills, debts, fooProgress, upcomingPayments, quickPayments] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { paycheckAmount: true }
    }),
    prisma.bill.count({ where: { userId, isActive: true } }),
    prisma.debt.findMany({ where: { userId, isActive: true } }),
    prisma.fOOProgress.findMany({ where: { userId } }),
    prisma.billPayment.findMany({
      where: {
        bill: {
          userId,
          OR: [
            { debtId: null },
            {
              debt: {
                OR: [
                  { status: { not: "DEFERRED" } },
                  { deferredUntil: null },
                  { deferredUntil: { lte: periodEnd } }
                ]
              }
            }
          ]
        },
        dueDate: {
          gte: periodStart,
          lte: periodEnd
        }
      },
      include: {
        bill: { select: { id: true, name: true, category: true } }
      },
      orderBy: { dueDate: "asc" }
    }),
    prisma.quickPayment.findMany({
      where: {
        userId,
        paidAt: {
          gte: periodStart,
          lte: periodEnd
        }
      }
    })
  ]);
  const totalDebt = debts.reduce(
    (sum, d) => sum + Number(d.currentBalance),
    0
  );
  const paidPayments = upcomingPayments.filter((p) => p.status === "PAID");
  const unpaidPayments = upcomingPayments.filter((p) => p.status === "UNPAID");
  const quickPaymentTotal = quickPayments.reduce(
    (sum, p) => sum + Number(p.amount),
    0
  );
  const billsDueThisPeriod = upcomingPayments.reduce(
    (sum, p) => sum + Number(p.amount),
    0
  );
  const totalDueThisPeriod = billsDueThisPeriod + quickPaymentTotal;
  const billsPaidThisPeriod = paidPayments.reduce(
    (sum, p) => sum + Number(p.amount),
    0
  );
  const totalPaidThisPeriod = billsPaidThisPeriod + quickPaymentTotal;
  const completedSteps = fooProgress.filter(
    (p) => p.status === "COMPLETED"
  ).length;
  const completedStepNames = fooProgress.filter((p) => p.status === "COMPLETED").map((p) => p.step);
  const currentFooStep = FOO_STEP_ORDER.find(
    (step) => !completedStepNames.includes(step)
  );
  const overduePayments = unpaidPayments.filter(
    (p) => differenceInDays(p.dueDate, today) < 0
  );
  const dueSoonPayments = unpaidPayments.filter((p) => {
    const days = differenceInDays(p.dueDate, today);
    return days >= 0 && days <= 3;
  });
  const bnplBillsDueThisPeriod = upcomingPayments.filter(
    (p) => p.bill.category === "BNPL" && p.status === "UNPAID"
  );
  const bnplDueAmount = bnplBillsDueThisPeriod.reduce(
    (sum, p) => sum + Number(p.amount),
    0
  );
  const paycheckAmount = user?.paycheckAmount ? Number(user.paycheckAmount) : 0;
  const safeToSpend = paycheckAmount - totalDueThisPeriod;
  return {
    currentPeriod,
    nextPeriod,
    billCount: bills,
    totalDebt,
    debtCount: debts.length,
    upcomingPayments: unpaidPayments.slice(0, 5),
    billsDueThisPeriod,
    totalDueThisPeriod,
    totalPaidThisPeriod,
    completedSteps,
    currentFooStep,
    overdueCount: overduePayments.length,
    dueSoonCount: dueSoonPayments.length,
    bnplDueAmount,
    hasBnplDue: bnplBillsDueThisPeriod.length > 0,
    paycheckAmount,
    safeToSpend
  };
}

const $$Astro = createAstro();
const $$Index = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Index;
  const session = await getSession(Astro2.request);
  if (!session?.user?.id) {
    return Astro2.redirect("/login");
  }
  const data = await getDashboardData(session.user.id);
  const currentPeriod = getCurrentPayPeriod();
  const nextPeriod = getNextPayPeriod();
  const daysUntilPayday = differenceInDays(nextPeriod.startDate, /* @__PURE__ */ new Date());
  function formatDueDate(date) {
    if (isToday(date)) return "Today";
    if (isTomorrow(date)) return "Tomorrow";
    const days = differenceInDays(date, /* @__PURE__ */ new Date());
    if (days < 0) return `${Math.abs(days)}d overdue`;
    if (days <= 7) return `In ${days} days`;
    return format(date, "MMM d");
  }
  function getPaymentStatus(date) {
    if (isToday(date)) return "due-today";
    const days = differenceInDays(date, /* @__PURE__ */ new Date());
    if (days < 0) return "overdue";
    if (days <= 3) return "due-soon";
    return "pending";
  }
  const hasOverdue = data.overdueCount > 0;
  const needsAttention = hasOverdue || data.dueSoonCount > 0 || data.hasBnplDue;
  const quickActions = [
    { label: "Add Bill", icon: Receipt, href: "/dashboard/bills/new" },
    { label: "Add Debt", icon: CreditCard, href: "/dashboard/debts/new" },
    { label: "Pay Period", icon: Calendar, href: "/dashboard/pay-periods" },
    { label: "FOO Plan", icon: Target, href: "/dashboard/foo" }
  ];
  return renderTemplate`${renderComponent($$result, "DashboardLayout", $$DashboardLayout, { "title": "Dashboard", "currentPath": "/dashboard", "user": session.user }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="space-y-6 animate-fade-in"> <!-- Welcome Header --> <header class="hidden lg:block"> <h1 class="text-2xl font-bold text-theme-primary tracking-tight">
Welcome back${session.user.name ? `, ${session.user.name.split(" ")[0]}` : ""} </h1> <p class="text-theme-secondary mt-1">
Here's your financial overview for this pay period
</p> </header> <!-- Hero Account Summary Card --> ${renderComponent($$result2, "AccountSummaryCard", AccountSummaryCard, { "client:load": true, "title": "Safe to Spend", "subtitle": formatPayPeriod(currentPeriod), "primaryAmount": data.safeToSpend, "primaryLabel": "This Pay Period", "secondaryItems": [
    {
      label: "Next Payday",
      value: daysUntilPayday === 0 ? "Today!" : daysUntilPayday === 1 ? "Tomorrow" : `${daysUntilPayday} days`
    },
    {
      label: "Paycheck",
      value: `$${data.paycheckAmount.toLocaleString()}`
    }
  ], "client:component-hydration": "load", "client:component-path": "/Users/chris/projects/dev/openfinance/src/components/ui/account-summary-card", "client:component-export": "AccountSummaryCard" })} <!-- Alert Banner --> ${needsAttention && renderTemplate`${renderComponent($$result2, "AlertBanner", AlertBanner, { "client:visible": true, "severity": "warning", "client:component-hydration": "visible", "client:component-path": "/Users/chris/projects/dev/openfinance/src/components/ui/alert-banner", "client:component-export": "AlertBanner" }, { "default": async ($$result3) => renderTemplate` <div class="flex flex-wrap items-center gap-x-4 gap-y-1"> ${data.overdueCount > 0 && renderTemplate`<span class="text-danger-600 dark:text-danger-400 font-semibold"> ${data.overdueCount} bill${data.overdueCount !== 1 ? "s" : ""} overdue
</span>`} ${data.dueSoonCount > 0 && renderTemplate`<span class="font-medium"> ${data.dueSoonCount} due within 3 days
</span>`} ${data.hasBnplDue && renderTemplate`<span class="text-theme-secondary">
$${data.bnplDueAmount.toLocaleString()} BNPL due
</span>`} </div> ` })}`} <!-- Quick Actions --> <div class="bg-theme-elevated rounded-2xl shadow-theme border border-theme p-2"> ${renderComponent($$result2, "QuickActionsGrid", QuickActionsGrid, { "client:load": true, "actions": quickActions, "client:component-hydration": "load", "client:component-path": "/Users/chris/projects/dev/openfinance/src/components/ui/quick-actions-grid", "client:component-export": "QuickActionsGrid" })} </div> <!-- Stats Grid - Desktop --> <div class="hidden lg:grid lg:grid-cols-4 gap-4"> ${renderComponent($$result2, "SimpleBalanceCard", SimpleBalanceCard, { "client:visible": true, "label": "Due This Period", "amount": data.billsDueThisPeriod, "client:component-hydration": "visible", "client:component-path": "/Users/chris/projects/dev/openfinance/src/components/ui/account-summary-card", "client:component-export": "SimpleBalanceCard" })} ${renderComponent($$result2, "SimpleBalanceCard", SimpleBalanceCard, { "client:visible": true, "label": "Paid So Far", "amount": data.totalPaidThisPeriod, "trend": "up", "client:component-hydration": "visible", "client:component-path": "/Users/chris/projects/dev/openfinance/src/components/ui/account-summary-card", "client:component-export": "SimpleBalanceCard" })} ${renderComponent($$result2, "SimpleBalanceCard", SimpleBalanceCard, { "client:visible": true, "label": "Total Debt", "amount": data.totalDebt, "trend": "down", "client:component-hydration": "visible", "client:component-path": "/Users/chris/projects/dev/openfinance/src/components/ui/account-summary-card", "client:component-export": "SimpleBalanceCard" })} <a href="/dashboard/foo" class="block"> <div class="bg-theme-elevated rounded-2xl shadow-theme p-4 lg:p-5 border border-theme h-full card-hover-lift"> <p class="text-label">FOO Progress</p> ${data.currentFooStep ? renderTemplate`<p class="text-2xl font-semibold text-theme-primary mt-1">
Step ${FOO_STEP_NAMES[data.currentFooStep].number} </p>` : data.completedSteps === 9 ? renderTemplate`<p class="text-2xl font-semibold text-success-600 dark:text-success-400 mt-1 flex items-center gap-2">
Complete ${renderComponent($$result2, "CheckCircle2", CheckCircle2, { "className": "h-5 w-5" })} </p>` : renderTemplate`<p class="text-2xl font-semibold text-theme-primary mt-1"> ${data.completedSteps}/9
</p>`} </div> </a> </div> <!-- Upcoming Payments Section --> ${renderComponent($$result2, "SectionCard", SectionCard, { "client:visible": true, "title": "Upcoming Payments", "subtitle": `${data.upcomingPayments.length} this period`, "defaultOpen": true, "client:component-hydration": "visible", "client:component-path": "/Users/chris/projects/dev/openfinance/src/components/ui/section-card", "client:component-export": "SectionCard" }, { "default": async ($$result3) => renderTemplate`${data.upcomingPayments.length === 0 ? renderTemplate`<div class="py-8 text-center"> <div class="w-12 h-12 rounded-full bg-success-100 dark:bg-success-600/20 flex items-center justify-center mx-auto mb-3"> ${renderComponent($$result3, "TrendingUp", TrendingUp, { "className": "h-6 w-6 text-success-600 dark:text-success-400" })} </div> <p class="font-medium text-theme-secondary">All caught up!</p> <p class="text-sm text-theme-muted">No upcoming payments this period</p> </div>` : renderTemplate`<div class="space-y-1"> ${data.upcomingPayments.slice(0, 5).map((payment) => renderTemplate`<a href="/dashboard/pay-periods" class="flex items-center justify-between py-2 px-1 rounded-lg hover:bg-theme-secondary/50 transition-colors"> <div> <p class="font-medium text-theme-primary">${payment.bill.name}</p> <p class="text-xs text-theme-muted">${formatDueDate(payment.dueDate)}</p> </div> <div class="text-right"> <p${addAttribute(`font-semibold ${getPaymentStatus(payment.dueDate) === "overdue" ? "text-danger-600" : getPaymentStatus(payment.dueDate) === "due-soon" ? "text-warning-600" : "text-theme-primary"}`, "class")}>
$${Number(payment.amount).toLocaleString(void 0, { minimumFractionDigits: 2 })} </p> </div> </a>`)} ${data.upcomingPayments.length > 5 && renderTemplate`<a href="/dashboard/pay-periods" class="flex items-center justify-center gap-1 py-2 text-sm font-medium text-accent-600 hover:text-accent-700">
View all payments
${renderComponent($$result3, "ChevronRight", ChevronRight, { "className": "h-4 w-4" })} </a>`} </div>`}` })} </div> ` })}`;
}, "/Users/chris/projects/dev/openfinance/src/pages/dashboard/index.astro", void 0);

const $$file = "/Users/chris/projects/dev/openfinance/src/pages/dashboard/index.astro";
const $$url = "/dashboard";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
//# sourceMappingURL=dashboard.astro.mjs.map
