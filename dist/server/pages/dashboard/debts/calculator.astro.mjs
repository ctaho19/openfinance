import { e as createComponent, f as createAstro, k as renderComponent, r as renderTemplate, m as maybeRenderHead } from '../../../chunks/astro/server_Cel7--ii.mjs';
import 'piccolore';
import { $ as $$DashboardLayout } from '../../../chunks/DashboardLayout_D680jGCc.mjs';
import { g as getSession } from '../../../chunks/get-session-astro_CVC6HSBT.mjs';
import { Calculator, ArrowLeft } from 'lucide-react';
export { renderers } from '../../../renderers.mjs';

const $$Astro = createAstro();
const $$Calculator = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Calculator;
  const session = await getSession(Astro2.request);
  if (!session?.user?.id) {
    return Astro2.redirect("/login");
  }
  return renderTemplate`${renderComponent($$result, "DashboardLayout", $$DashboardLayout, { "title": "Debt Calculator", "currentPath": "/dashboard/debts", "user": session.user, "showExploreSidebar": false }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="space-y-6"> <header> <h1 class="text-2xl font-bold text-theme-primary">Debt Payoff Calculator</h1> </header> <div class="bg-theme-elevated rounded-2xl border border-theme p-12 text-center"> <div class="w-16 h-16 rounded-full bg-accent-50 dark:bg-accent-600/20 flex items-center justify-center mx-auto mb-4"> ${renderComponent($$result2, "Calculator", Calculator, { "class": "h-8 w-8 text-accent-600" })} </div> <h2 class="text-xl font-semibold text-theme-primary mb-2">Coming Soon</h2> <p class="text-theme-secondary mb-6">Calculate how quickly you can pay off your debts with different payment strategies.</p> <a href="/dashboard/debts" class="inline-flex items-center gap-2 px-6 py-3 bg-accent-600 hover:bg-accent-700 text-white rounded-xl font-medium transition-colors"> ${renderComponent($$result2, "ArrowLeft", ArrowLeft, { "class": "h-5 w-5" })}
Back to Debts
</a> </div> </div> ` })}`;
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
