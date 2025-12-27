import { e as createComponent, f as createAstro, k as renderComponent, r as renderTemplate, m as maybeRenderHead, h as addAttribute } from '../../chunks/astro/server_CLo6n4dC.mjs';
import 'piccolore';
import { $ as $$DashboardLayout } from '../../chunks/DashboardLayout_CcQdn0FA.mjs';
import { g as getSession } from '../../chunks/get-session-astro_CVC6HSBT.mjs';
import { l as listGoals } from '../../chunks/goals_D9yX8bsM.mjs';
import { Plus, Target, PiggyBank } from 'lucide-react';
export { renderers } from '../../renderers.mjs';

const $$Astro = createAstro();
const $$Index = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Index;
  const session = await getSession(Astro2.request);
  if (!session?.user?.id) {
    return Astro2.redirect("/login");
  }
  const goals = await listGoals(session.user.id);
  return renderTemplate`${renderComponent($$result, "DashboardLayout", $$DashboardLayout, { "title": "Goals", "currentPath": "/dashboard/goals", "user": session.user, "showExploreSidebar": false }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="space-y-6"> <header class="flex items-center justify-between"> <div> <h1 class="text-2xl font-bold text-theme-primary">Savings Goals</h1> <p class="text-theme-secondary mt-1">${goals.length} goal${goals.length !== 1 ? "s" : ""}</p> </div> <a href="/dashboard/goals/new" class="inline-flex items-center gap-2 px-4 py-2 bg-accent-600 hover:bg-accent-700 text-white rounded-xl font-medium transition-colors"> ${renderComponent($$result2, "Plus", Plus, { "class": "h-4 w-4" })}
Add Goal
</a> </header> ${goals.length === 0 ? renderTemplate`<div class="bg-theme-elevated rounded-2xl border border-theme p-12 text-center"> <div class="w-16 h-16 rounded-full bg-accent-50 dark:bg-accent-600/20 flex items-center justify-center mx-auto mb-4"> ${renderComponent($$result2, "Target", Target, { "class": "h-8 w-8 text-accent-600" })} </div> <h2 class="text-xl font-semibold text-theme-primary mb-2">No goals yet</h2> <p class="text-theme-secondary mb-6">Set savings goals to track your progress.</p> <a href="/dashboard/goals/new" class="inline-flex items-center gap-2 px-6 py-3 bg-accent-600 hover:bg-accent-700 text-white rounded-xl font-medium transition-colors"> ${renderComponent($$result2, "Plus", Plus, { "class": "h-5 w-5" })}
Create Your First Goal
</a> </div>` : renderTemplate`<div class="grid gap-4 md:grid-cols-2"> ${goals.map((goal) => {
    const progress = Number(goal.targetAmount) > 0 ? Number(goal.currentAmount) / Number(goal.targetAmount) * 100 : 0;
    return renderTemplate`<div class="bg-theme-elevated rounded-2xl border border-theme p-5 card-hover-lift"> <div class="flex items-start justify-between mb-4"> <div class="flex items-center gap-3"> <div class="p-2 rounded-xl bg-accent-50 dark:bg-accent-600/20"> ${renderComponent($$result2, "PiggyBank", PiggyBank, { "class": "h-5 w-5 text-accent-600" })} </div> <div> <h3 class="font-semibold text-theme-primary">${goal.name}</h3> ${goal.deadline && renderTemplate`<p class="text-xs text-theme-muted">
Due ${new Date(goal.deadline).toLocaleDateString()} </p>`} </div> </div> </div> <div class="space-y-2"> <div class="flex justify-between text-sm"> <span class="text-theme-secondary">
$${Number(goal.currentAmount).toLocaleString()} </span> <span class="font-medium text-theme-primary">
$${Number(goal.targetAmount).toLocaleString()} </span> </div> <div class="progress-bar"> <div class="progress-bar-fill"${addAttribute(`width: ${Math.min(progress, 100)}%`, "style")}></div> </div> <p class="text-xs text-theme-muted text-right"> ${progress.toFixed(0)}% complete
</p> </div> </div>`;
  })} </div>`} </div> ` })}`;
}, "/Users/chris/projects/dev/openfinance/src/pages/dashboard/goals/index.astro", void 0);

const $$file = "/Users/chris/projects/dev/openfinance/src/pages/dashboard/goals/index.astro";
const $$url = "/dashboard/goals";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
//# sourceMappingURL=goals.astro.mjs.map
