import { e as createComponent, f as createAstro, o as renderHead, n as renderSlot, r as renderTemplate } from './astro/server_Cel7--ii.mjs';
import 'piccolore';
import 'clsx';
/* empty css                         */

const $$Astro = createAstro();
const $$BaseLayout = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$BaseLayout;
  const { title } = Astro2.props;
  return renderTemplate`<html lang="en"> <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>${title} | OpenFinance</title>${renderHead()}</head> <body> ${renderSlot($$result, $$slots["default"])} </body></html>`;
}, "/Users/chris/projects/dev/openfinance/src/layouts/BaseLayout.astro", void 0);

export { $$BaseLayout as $ };
//# sourceMappingURL=BaseLayout_Bte9BUna.mjs.map
