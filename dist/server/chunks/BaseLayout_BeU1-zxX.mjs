import { e as createComponent, f as createAstro, r as renderTemplate, q as renderSlot, v as renderHead } from './astro/server_CLo6n4dC.mjs';
import 'piccolore';
import 'clsx';
/* empty css                        */

var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(cooked.slice()) }));
var _a;
const $$Astro = createAstro();
const $$BaseLayout = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$BaseLayout;
  const { title } = Astro2.props;
  return renderTemplate(_a || (_a = __template(['<html lang="en"> <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>', " | OpenFinance</title><script>\n      (function() {\n        const mode = localStorage.getItem('theme-mode');\n        const accent = localStorage.getItem('theme-accent') || 'chase';\n        \n        let resolved;\n        if (mode === 'dark') {\n          resolved = 'dark';\n        } else if (mode === 'light') {\n          resolved = 'light';\n        } else {\n          resolved = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';\n        }\n        \n        document.documentElement.classList.add(resolved);\n        document.documentElement.classList.add('accent-' + accent);\n      })();\n    <\/script>", "</head> <body> ", " </body></html>"])), title, renderHead(), renderSlot($$result, $$slots["default"]));
}, "/Users/chris/projects/dev/openfinance/src/layouts/BaseLayout.astro", void 0);

export { $$BaseLayout as $ };
//# sourceMappingURL=BaseLayout_BeU1-zxX.mjs.map
