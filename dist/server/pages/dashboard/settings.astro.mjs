import { e as createComponent, f as createAstro, k as renderComponent, r as renderTemplate, m as maybeRenderHead } from '../../chunks/astro/server_B4LN2q8c.mjs';
import 'piccolore';
import { u as useTheme, T as ThemeProvider, a as ThemeToggle, $ as $$DashboardLayout } from '../../chunks/DashboardLayout_CdcQ6Wnq.mjs';
import { g as getSession } from '../../chunks/get-session-astro_CVC6HSBT.mjs';
import { jsx, jsxs } from 'react/jsx-runtime';
import { Check, Building2, ChevronRight, Palette } from 'lucide-react';
export { renderers } from '../../renderers.mjs';

const accentColors = [
  { value: "chase", label: "Chase Blue", color: "#117ACA" },
  { value: "blue", label: "Blue", color: "#3b82f6" },
  { value: "purple", label: "Purple", color: "#a855f7" },
  { value: "orange", label: "Orange", color: "#f97316" },
  { value: "pink", label: "Pink", color: "#ec4899" }
];
function AccentPicker() {
  const { accentColor, setAccentColor } = useTheme();
  return /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-3", children: accentColors.map(({ value, label, color }) => /* @__PURE__ */ jsxs(
    "button",
    {
      onClick: () => setAccentColor(value),
      className: "group relative",
      title: label,
      children: [
        /* @__PURE__ */ jsx(
          "div",
          {
            className: `w-10 h-10 rounded-full transition-transform hover:scale-110 ${accentColor === value ? "ring-2 ring-offset-2 ring-offset-[var(--bg-primary)]" : ""}`,
            style: {
              backgroundColor: color,
              ["--tw-ring-color"]: accentColor === value ? color : void 0
            },
            children: accentColor === value && /* @__PURE__ */ jsx("div", { className: "absolute inset-0 flex items-center justify-center", children: /* @__PURE__ */ jsx(Check, { className: "h-5 w-5 text-white" }) })
          }
        ),
        /* @__PURE__ */ jsx("span", { className: "sr-only", children: label })
      ]
    },
    value
  )) });
}

function AppearanceSettings() {
  return /* @__PURE__ */ jsx(ThemeProvider, { children: /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-theme-secondary mb-3", children: "Theme Mode" }),
      /* @__PURE__ */ jsx(ThemeToggle, {})
    ] }),
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-theme-secondary mb-3", children: "Accent Color" }),
      /* @__PURE__ */ jsx(AccentPicker, {})
    ] })
  ] }) });
}

const $$Astro = createAstro();
const $$Index = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Index;
  const session = await getSession(Astro2.request);
  if (!session?.user?.id) {
    return Astro2.redirect("/login");
  }
  return renderTemplate`${renderComponent($$result, "DashboardLayout", $$DashboardLayout, { "title": "Settings", "currentPath": "/dashboard/settings", "user": session.user, "showExploreSidebar": false }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="space-y-6 lg:space-y-8 animate-fade-in"> <header> <h1 class="text-2xl lg:text-3xl font-bold text-theme-primary tracking-tight">Settings</h1> <p class="text-theme-secondary mt-1">
Customize your experience
</p> </header> <section class="bg-theme-elevated border border-theme rounded-2xl overflow-hidden"> <a href="/dashboard/settings/accounts" class="flex items-center justify-between p-5 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors border-b border-theme"> <div class="flex items-center gap-4"> <div class="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-sm"> ${renderComponent($$result2, "Building2", Building2, { "className": "h-5 w-5 text-white" })} </div> <div> <h3 class="font-semibold text-theme-primary">Bank Accounts</h3> <p class="text-sm text-theme-secondary">Manage accounts for bill payments</p> </div> </div> ${renderComponent($$result2, "ChevronRight", ChevronRight, { "className": "h-5 w-5 text-gray-400" })} </a> <div class="p-5"> <div class="flex items-center gap-4 mb-4"> <div class="w-11 h-11 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-sm"> ${renderComponent($$result2, "Palette", Palette, { "className": "h-5 w-5 text-white" })} </div> <div> <h3 class="font-semibold text-theme-primary">Appearance</h3> <p class="text-sm text-theme-secondary">Choose your theme preference</p> </div> </div> ${renderComponent($$result2, "AppearanceSettings", AppearanceSettings, { "client:load": true, "client:component-hydration": "load", "client:component-path": "/Users/chris/projects/dev/openfinance/src/components/ui/appearance-settings", "client:component-export": "AppearanceSettings" })} </div> </section> </div> ` })}`;
}, "/Users/chris/projects/dev/openfinance/src/pages/dashboard/settings/index.astro", void 0);

const $$file = "/Users/chris/projects/dev/openfinance/src/pages/dashboard/settings/index.astro";
const $$url = "/dashboard/settings";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
//# sourceMappingURL=settings.astro.mjs.map
