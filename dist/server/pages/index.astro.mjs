import { e as createComponent, f as createAstro, k as renderComponent, r as renderTemplate, m as maybeRenderHead } from '../chunks/astro/server_Cel7--ii.mjs';
import 'piccolore';
import { $ as $$BaseLayout } from '../chunks/BaseLayout_DCIuD1W9.mjs';
import { g as getSession } from '../chunks/get-session-astro_CVC6HSBT.mjs';
export { renderers } from '../renderers.mjs';

const $$Astro = createAstro();
const $$Index = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Index;
  const session = await getSession(Astro2.request);
  if (session?.user?.id) {
    return Astro2.redirect("/dashboard");
  }
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": "OpenFinance - Personal Finance Manager" }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="min-h-screen bg-theme-secondary"> <header class="bg-[var(--chase-blue-700)] text-white"> <div class="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between"> <span class="text-xl font-bold">openfinance</span> <a href="/login" class="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium transition-colors">
Sign In
</a> </div> </header> <main class="max-w-7xl mx-auto px-4 py-20 text-center"> <h1 class="text-4xl md:text-6xl font-bold text-theme-primary mb-6">
Take control of your finances
</h1> <p class="text-xl text-theme-secondary max-w-2xl mx-auto mb-10">
Track bills, manage debt, and follow the Financial Order of Operations to build wealth.
</p> <a href="/login" class="inline-flex items-center gap-2 px-8 py-4 bg-accent-600 hover:bg-accent-700 text-white rounded-xl text-lg font-semibold transition-colors shadow-lg">
Get Started
</a> </main> </div> ` })}`;
}, "/Users/chris/projects/dev/openfinance/src/pages/index.astro", void 0);

const $$file = "/Users/chris/projects/dev/openfinance/src/pages/index.astro";
const $$url = "";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
//# sourceMappingURL=index.astro.mjs.map
