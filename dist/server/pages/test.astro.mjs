import { e as createComponent, f as createAstro, k as renderComponent, r as renderTemplate, m as maybeRenderHead } from '../chunks/astro/server_Cel7--ii.mjs';
import 'piccolore';
import { $ as $$BaseLayout } from '../chunks/BaseLayout_Bte9BUna.mjs';
import { B as Button } from '../chunks/button_DPiCKfK2.mjs';
export { renderers } from '../renderers.mjs';

const $$Astro = createAstro();
const $$Test = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Test;
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": "Test Page" }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="min-h-screen bg-theme-primary flex items-center justify-center"> <div class="text-center space-y-4"> <h1 class="text-2xl font-bold text-theme-primary">Astro + React Test</h1> <p class="text-theme-secondary">If you see this, Astro is working!</p> ${renderComponent($$result2, "Button", Button, { "client:load": true, "client:component-hydration": "load", "client:component-path": "/Users/chris/projects/dev/openfinance/src/components/ui/button", "client:component-export": "Button" }, { "default": ($$result3) => renderTemplate`Click me (React Island)` })} </div> </div> ` })}`;
}, "/Users/chris/projects/dev/openfinance/src/pages/test.astro", void 0);

const $$file = "/Users/chris/projects/dev/openfinance/src/pages/test.astro";
const $$url = "/test";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Test,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
//# sourceMappingURL=test.astro.mjs.map
