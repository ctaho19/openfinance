import { e as createComponent, f as createAstro, k as renderComponent, r as renderTemplate, m as maybeRenderHead, l as renderScript, h as addAttribute } from '../../chunks/astro/server_Cel7--ii.mjs';
import 'piccolore';
import { $ as $$DashboardLayout } from '../../chunks/DashboardLayout_D680jGCc.mjs';
import { g as getCurrentPayPeriod, f as formatPayPeriod, S as SectionCard } from '../../chunks/section-card_DlFhH3PJ.mjs';
import { g as getSession } from '../../chunks/get-session-astro_CVC6HSBT.mjs';
import { g as getPaymentsForPeriod } from '../../chunks/pay-periods_DhVbftd9.mjs';
import { startOfDay, endOfDay, isToday, isTomorrow, differenceInDays, format } from 'date-fns';
import { Circle, CheckCircle2 } from 'lucide-react';
export { renderers } from '../../renderers.mjs';

const $$Astro = createAstro();
const $$Index = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Index;
  const session = await getSession(Astro2.request);
  if (!session?.user?.id) {
    return Astro2.redirect("/login");
  }
  const currentPeriod = getCurrentPayPeriod();
  const periodStart = startOfDay(currentPeriod.startDate);
  const periodEnd = endOfDay(currentPeriod.endDate);
  const payments = await getPaymentsForPeriod(session.user.id, periodStart, periodEnd);
  const paidPayments = payments.filter((p) => p.status === "PAID");
  const unpaidPayments = payments.filter((p) => p.status === "UNPAID");
  const totalDue = payments.reduce((sum, p) => sum + Number(p.amount), 0);
  const totalPaid = paidPayments.reduce((sum, p) => sum + Number(p.amount), 0);
  function formatDueDate(date) {
    if (isToday(date)) return "Today";
    if (isTomorrow(date)) return "Tomorrow";
    const days = differenceInDays(date, /* @__PURE__ */ new Date());
    if (days < 0) return `${Math.abs(days)}d overdue`;
    return format(date, "MMM d");
  }
  return renderTemplate`${renderComponent($$result, "DashboardLayout", $$DashboardLayout, { "title": "Pay Periods", "currentPath": "/dashboard/pay-periods", "user": session.user, "showExploreSidebar": false }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="space-y-6"> <header> <h1 class="text-2xl font-bold text-theme-primary">Pay Period</h1> <p class="text-theme-secondary mt-1">${formatPayPeriod(currentPeriod)}</p> </header> <!-- Summary Cards --> <div class="grid grid-cols-2 lg:grid-cols-4 gap-4"> <div class="bg-theme-elevated rounded-2xl border border-theme p-4"> <p class="text-label">Total Due</p> <p class="text-2xl font-semibold text-theme-primary mt-1">
$${totalDue.toLocaleString(void 0, { minimumFractionDigits: 2 })} </p> </div> <div class="bg-theme-elevated rounded-2xl border border-theme p-4"> <p class="text-label">Paid</p> <p class="text-2xl font-semibold text-success-600 mt-1">
$${totalPaid.toLocaleString(void 0, { minimumFractionDigits: 2 })} </p> </div> <div class="bg-theme-elevated rounded-2xl border border-theme p-4"> <p class="text-label">Remaining</p> <p class="text-2xl font-semibold text-theme-primary mt-1">
$${(totalDue - totalPaid).toLocaleString(void 0, { minimumFractionDigits: 2 })} </p> </div> <div class="bg-theme-elevated rounded-2xl border border-theme p-4"> <p class="text-label">Bills</p> <p class="text-2xl font-semibold text-theme-primary mt-1"> ${paidPayments.length}/${payments.length} </p> </div> </div> <!-- Unpaid Bills --> ${unpaidPayments.length > 0 && renderTemplate`${renderComponent($$result2, "SectionCard", SectionCard, { "client:visible": true, "title": "Unpaid", "subtitle": `${unpaidPayments.length} remaining`, "client:component-hydration": "visible", "client:component-path": "/Users/chris/projects/dev/openfinance/src/components/ui/section-card", "client:component-export": "SectionCard" }, { "default": async ($$result3) => renderTemplate` <div class="divide-y divide-theme"> ${unpaidPayments.map((payment) => renderTemplate`<div class="flex items-center justify-between py-3 first:pt-0 last:pb-0 group"> <div class="flex items-center gap-3"> <button${addAttribute(payment.id, "data-payment-id")} class="payment-toggle p-1 rounded-full hover:bg-theme-secondary/50 transition-colors"> ${renderComponent($$result3, "Circle", Circle, { "className": "h-5 w-5 text-theme-muted" })} </button> <div> <p class="font-medium text-theme-primary">${payment.bill.name}</p> <p class="text-sm text-theme-muted">${formatDueDate(payment.dueDate)}</p> </div> </div> <span class="font-semibold text-theme-primary">
$${Number(payment.amount).toLocaleString(void 0, { minimumFractionDigits: 2 })} </span> </div>`)} </div> ` })}`} <!-- Paid Bills --> ${paidPayments.length > 0 && renderTemplate`${renderComponent($$result2, "SectionCard", SectionCard, { "client:visible": true, "title": "Paid", "subtitle": `${paidPayments.length} completed`, "defaultOpen": false, "client:component-hydration": "visible", "client:component-path": "/Users/chris/projects/dev/openfinance/src/components/ui/section-card", "client:component-export": "SectionCard" }, { "default": async ($$result3) => renderTemplate` <div class="divide-y divide-theme"> ${paidPayments.map((payment) => renderTemplate`<div class="flex items-center justify-between py-3 first:pt-0 last:pb-0 opacity-60"> <div class="flex items-center gap-3"> <button${addAttribute(payment.id, "data-payment-id")} class="payment-toggle p-1 rounded-full hover:bg-theme-secondary/50 transition-colors"> ${renderComponent($$result3, "CheckCircle2", CheckCircle2, { "className": "h-5 w-5 text-success-600" })} </button> <div> <p class="font-medium text-theme-primary line-through">${payment.bill.name}</p> <p class="text-sm text-theme-muted">${formatDueDate(payment.dueDate)}</p> </div> </div> <span class="font-semibold text-theme-primary">
$${Number(payment.amount).toLocaleString(void 0, { minimumFractionDigits: 2 })} </span> </div>`)} </div> ` })}`} </div> ${renderScript($$result2, "/Users/chris/projects/dev/openfinance/src/pages/dashboard/pay-periods/index.astro?astro&type=script&index=0&lang.ts")} ` })}`;
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
