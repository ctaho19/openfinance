import { e as createComponent, f as createAstro, k as renderComponent, r as renderTemplate, m as maybeRenderHead, l as renderScript, h as addAttribute } from '../../chunks/astro/server_B4LN2q8c.mjs';
import 'piccolore';
import { $ as $$DashboardLayout } from '../../chunks/DashboardLayout_D7aHZw7-.mjs';
import { g as getSession } from '../../chunks/get-session-astro_CVC6HSBT.mjs';
import { g as getFOOProgress } from '../../chunks/foo_ColQHPYl.mjs';
import { Target, CheckCircle2, Clock, ChevronRight } from 'lucide-react';
export { renderers } from '../../renderers.mjs';

const $$Astro = createAstro();
const $$Index = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Index;
  const session = await getSession(Astro2.request);
  if (!session?.user?.id) {
    return Astro2.redirect("/login");
  }
  const progress = await getFOOProgress(session.user.id);
  const completedCount = progress.filter((p) => p.status === "COMPLETED").length;
  const currentStepIndex = progress.findIndex((p) => p.status !== "COMPLETED");
  const currentStep = currentStepIndex >= 0 ? progress[currentStepIndex] : null;
  const FOO_EXPLANATIONS = {
    DEDUCTIBLES_COVERED: "Before anything else, ensure you can handle unexpected expenses. Save enough to cover your highest insurance deductible (health, auto, or home) so an emergency doesn't derail your finances.",
    EMPLOYER_MATCH: "This is free money! Contribute at least enough to your 401(k) to get your full employer match. Not doing this is like leaving part of your salary on the table.",
    HIGH_INTEREST_DEBT: "Credit cards and high-interest loans (typically 10%+ APR) are wealth destroyers. Focus all extra money here before investing\u2014no investment reliably beats 20%+ credit card interest.",
    EMERGENCY_FUND: "Life happens. Job loss, medical issues, car repairs\u2014an emergency fund of 3-6 months of expenses provides a safety net so you don't go back into debt when the unexpected occurs.",
    ROTH_HSA: "Roth IRAs grow tax-free and withdrawals in retirement are tax-free. HSAs offer triple tax advantages: tax-deductible contributions, tax-free growth, and tax-free withdrawals for medical expenses.",
    MAX_RETIREMENT: "After getting the match and maxing Roth/HSA, contribute the maximum allowed to your 401(k) or 403(b). This builds serious long-term wealth through tax-advantaged compound growth.",
    HYPERACCUMULATION: "You've optimized tax-advantaged accounts. Now focus on building taxable investment accounts, saving 25% or more of your gross income. This accelerates your path to financial independence.",
    PREPAY_FUTURE: "With wealth-building on autopilot, you can now save for big future goals: children's education (529 plans), a vacation property, or other major life goals.",
    PREPAY_LOW_INTEREST: "The final step: eliminate remaining debt including your mortgage. While low-interest debt isn't urgent, becoming completely debt-free provides peace of mind and maximum financial flexibility."
  };
  function getProgressPercent(step) {
    if (!step.targetAmount || Number(step.targetAmount) === 0) return null;
    return Math.min(100, Number(step.currentAmount || 0) / Number(step.targetAmount) * 100);
  }
  return renderTemplate`${renderComponent($$result, "DashboardLayout", $$DashboardLayout, { "title": "Financial Order of Operations", "currentPath": "/dashboard/foo", "user": session.user, "showExploreSidebar": false }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="space-y-6"> <header> <h1 class="text-2xl font-bold text-theme-primary">Financial Order of Operations</h1> <p class="text-theme-secondary mt-1">Follow these 9 steps in order to build a strong financial foundation</p> </header> <!-- Progress Summary Card --> <div class="bg-chase-gradient rounded-2xl p-6 text-white"> <div class="flex items-center justify-between"> <div class="flex items-center gap-4"> <div class="p-3 rounded-full bg-white/20"> ${renderComponent($$result2, "Target", Target, { "className": "h-8 w-8 text-white" })} </div> <div> <p class="text-sm font-medium text-white/80">Your Progress</p> <p class="text-2xl font-bold mt-1 text-white">${completedCount} of 9 Steps Complete</p> </div> </div> <div class="text-right hidden sm:block"> <p class="text-sm font-medium text-white/80">Current Focus</p> <p class="text-xl font-bold mt-1 text-white"> ${currentStep ? `Step ${currentStep.stepInfo.number}: ${currentStep.stepInfo.name}` : "All Complete!"} </p> </div> </div> <!-- Progress Bar --> <div class="mt-6 flex gap-1"> ${progress.map((step) => renderTemplate`<div${addAttribute(`h-2 flex-1 rounded-full ${step.status === "COMPLETED" ? "bg-white" : step.status === "IN_PROGRESS" ? "bg-white/50" : "bg-white/20"}`, "class")}${addAttribute(`Step ${step.stepInfo.number}: ${step.stepInfo.name}`, "title")}></div>`)} </div> </div> <!-- Steps List --> <div class="space-y-4"> ${progress.map((step, index) => {
    const isCurrentStep = currentStep?.step === step.step;
    const progressPercent = getProgressPercent(step);
    const explanation = FOO_EXPLANATIONS[step.step];
    return renderTemplate`<div${addAttribute(`bg-theme-elevated rounded-2xl border border-theme overflow-hidden transition-all ${isCurrentStep ? "ring-2 ring-accent-500/50" : step.status === "COMPLETED" ? "opacity-80" : ""}`, "class")}> <!-- Header (always visible) --> <button class="w-full p-4 flex items-center justify-between text-left step-toggle"${addAttribute(step.step, "data-step")}> <div class="flex items-center gap-4"> <div${addAttribute(`flex items-center justify-center w-10 h-10 rounded-full font-bold ${step.status === "COMPLETED" ? "bg-success-100 dark:bg-success-600/20" : isCurrentStep ? "bg-accent-100 dark:bg-accent-600/20" : "bg-theme-tertiary"}`, "class")}> ${step.status === "COMPLETED" ? renderTemplate`${renderComponent($$result2, "CheckCircle2", CheckCircle2, { "className": "h-6 w-6 text-success-600" })}` : step.status === "IN_PROGRESS" ? renderTemplate`${renderComponent($$result2, "Clock", Clock, { "className": "h-6 w-6 text-warning-600" })}` : renderTemplate`<span class="text-theme-primary">${step.stepInfo.number}</span>`} </div> <div> <div class="flex items-center gap-2"> <p class="font-semibold text-theme-primary">${step.stepInfo.name}</p> ${isCurrentStep && renderTemplate`<span class="px-2 py-0.5 text-xs font-medium bg-accent-100 dark:bg-accent-600/20 text-accent-700 dark:text-accent-400 rounded-full">
Current
</span>`} </div> <p class="text-sm text-theme-secondary mt-0.5">${step.stepInfo.description}</p> </div> </div> <div class="flex items-center gap-3"> <span${addAttribute(`px-2 py-1 text-xs font-medium rounded-full ${step.status === "COMPLETED" ? "bg-success-100 dark:bg-success-600/20 text-success-700 dark:text-success-400" : step.status === "IN_PROGRESS" ? "bg-warning-100 dark:bg-warning-600/20 text-warning-700 dark:text-warning-400" : "bg-theme-tertiary text-theme-secondary"}`, "class")}> ${step.status === "COMPLETED" ? "Completed" : step.status === "IN_PROGRESS" ? "In Progress" : "Not Started"} </span> ${renderComponent($$result2, "ChevronRight", ChevronRight, { "className": "h-5 w-5 text-theme-muted step-chevron transition-transform" })} </div> </button> <!-- Progress bar (if has amount and in progress) --> ${progressPercent !== null && step.status !== "NOT_STARTED" && renderTemplate`<div class="px-4 pb-4 -mt-2"> <div class="ml-14"> <div class="flex justify-between text-sm mb-1"> <span class="text-theme-secondary">
$${Number(step.currentAmount || 0).toLocaleString()} of $${Number(step.targetAmount || 0).toLocaleString()} </span> <span class="text-accent-600 dark:text-accent-400">${progressPercent.toFixed(0)}%</span> </div> <div class="h-2 bg-theme-tertiary rounded-full overflow-hidden"> <div class="h-full bg-accent-500 rounded-full transition-all"${addAttribute(`width: ${progressPercent}%`, "style")}></div> </div> </div> </div>`} <!-- Expandable content --> <div class="step-content hidden border-t border-theme p-4 bg-theme-secondary/30"> <div class="bg-theme-tertiary rounded-lg p-4 mb-4"> <p class="text-sm text-theme-secondary leading-relaxed">${explanation}</p> </div> ${step.notes && renderTemplate`<div class="bg-theme-tertiary rounded-lg p-3 mb-4"> <p class="text-xs text-theme-muted mb-1">Notes</p> <p class="text-sm text-theme-secondary">${step.notes}</p> </div>`} ${step.completedAt && step.status === "COMPLETED" && renderTemplate`<p class="text-sm text-theme-muted mb-4">
Completed on ${new Date(step.completedAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })} </p>`} <button class="update-step-btn px-4 py-2 bg-theme-tertiary hover:bg-theme-secondary text-theme-primary font-medium rounded-lg transition-colors"${addAttribute(step.step, "data-step")}${addAttribute(step.status, "data-status")}${addAttribute(step.targetAmount?.toString() || "", "data-target")}${addAttribute(step.currentAmount?.toString() || "", "data-current")}${addAttribute(step.notes || "", "data-notes")}>
Update Progress
</button> </div> </div>`;
  })} </div> </div>  <div id="update-modal" class="fixed inset-0 bg-black/50 z-50 hidden items-center justify-center p-4"> <div class="bg-theme-elevated rounded-2xl max-w-md w-full p-6 border border-theme"> <h3 class="text-lg font-semibold text-theme-primary mb-4">Update Progress</h3> <form id="update-form" class="space-y-4"> <input type="hidden" name="step" id="modal-step"> <div> <label class="block text-sm font-medium text-theme-secondary mb-2">Status</label> <div class="flex gap-2"> <button type="button" data-status="NOT_STARTED" class="status-btn px-3 py-1.5 rounded-lg text-sm font-medium bg-theme-tertiary text-theme-secondary">Not Started</button> <button type="button" data-status="IN_PROGRESS" class="status-btn px-3 py-1.5 rounded-lg text-sm font-medium bg-theme-tertiary text-theme-secondary">In Progress</button> <button type="button" data-status="COMPLETED" class="status-btn px-3 py-1.5 rounded-lg text-sm font-medium bg-theme-tertiary text-theme-secondary">Completed</button> </div> <input type="hidden" name="status" id="modal-status"> </div> <div class="grid grid-cols-2 gap-4"> <div> <label class="block text-sm font-medium text-theme-secondary mb-2">Target Amount</label> <div class="relative"> <span class="absolute left-3 top-1/2 -translate-y-1/2 text-theme-muted">$</span> <input type="number" name="targetAmount" id="modal-target" placeholder="0.00" class="w-full bg-theme-tertiary border border-theme rounded-lg pl-7 pr-3 py-2 text-theme-primary"> </div> </div> <div> <label class="block text-sm font-medium text-theme-secondary mb-2">Current Amount</label> <div class="relative"> <span class="absolute left-3 top-1/2 -translate-y-1/2 text-theme-muted">$</span> <input type="number" name="currentAmount" id="modal-current" placeholder="0.00" class="w-full bg-theme-tertiary border border-theme rounded-lg pl-7 pr-3 py-2 text-theme-primary"> </div> </div> </div> <div> <label class="block text-sm font-medium text-theme-secondary mb-2">Notes</label> <textarea name="notes" id="modal-notes" rows="2" placeholder="Add notes..." class="w-full bg-theme-tertiary border border-theme rounded-lg px-3 py-2 text-theme-primary resize-none"></textarea> </div> <div class="flex gap-2 pt-2"> <button type="submit" class="flex-1 px-4 py-2 bg-accent-600 hover:bg-accent-700 text-white font-medium rounded-lg transition-colors">
Save Changes
</button> <button type="button" id="cancel-modal" class="px-4 py-2 bg-theme-tertiary hover:bg-theme-secondary text-theme-primary font-medium rounded-lg transition-colors">
Cancel
</button> </div> </form> </div> </div> ${renderScript($$result2, "/Users/chris/projects/dev/openfinance/src/pages/dashboard/foo/index.astro?astro&type=script&index=0&lang.ts")} ` })}`;
}, "/Users/chris/projects/dev/openfinance/src/pages/dashboard/foo/index.astro", void 0);

const $$file = "/Users/chris/projects/dev/openfinance/src/pages/dashboard/foo/index.astro";
const $$url = "/dashboard/foo";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
//# sourceMappingURL=foo.astro.mjs.map
