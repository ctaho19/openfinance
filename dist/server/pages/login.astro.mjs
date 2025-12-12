import { e as createComponent, f as createAstro, k as renderComponent, l as renderScript, r as renderTemplate, m as maybeRenderHead } from '../chunks/astro/server_Cel7--ii.mjs';
import 'piccolore';
import { $ as $$BaseLayout } from '../chunks/BaseLayout_BX7Pf0fF.mjs';
import { g as getSession } from '../chunks/get-session-astro_CVC6HSBT.mjs';
export { renderers } from '../renderers.mjs';

const $$Astro = createAstro();
const $$Login = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Login;
  const session = await getSession(Astro2.request);
  if (session?.user?.id) {
    return Astro2.redirect("/dashboard");
  }
  const error = Astro2.url.searchParams.get("error");
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": "Login" }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="min-h-screen bg-theme-secondary flex items-center justify-center px-4"> <div class="w-full max-w-md"> <div class="text-center mb-8"> <div class="w-16 h-16 rounded-2xl bg-chase-gradient flex items-center justify-center mx-auto mb-4 shadow-lg"> <span class="text-white font-bold text-2xl">OF</span> </div> <h1 class="text-2xl font-bold text-theme-primary">Welcome to OpenFinance</h1> <p class="text-theme-secondary mt-2">Sign in to manage your finances</p> </div> <div class="bg-theme-elevated rounded-2xl border border-theme shadow-theme p-6"> <div id="error-message" class="hidden mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg text-sm"></div> ${error && renderTemplate`<div class="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg text-sm"> ${error === "CredentialsSignin" ? "Invalid email or password" : "An error occurred. Please try again."} </div>`} <form id="login-form" class="space-y-4"> <div> <label for="email" class="block text-sm font-medium text-theme-primary mb-1.5">
Email
</label> <input type="email" id="email" name="email" required class="w-full px-4 py-2.5 rounded-xl border border-theme bg-theme-primary text-theme-primary placeholder:text-theme-muted focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-colors" placeholder="you@example.com"> </div> <div> <label for="password" class="block text-sm font-medium text-theme-primary mb-1.5">
Password
</label> <input type="password" id="password" name="password" required class="w-full px-4 py-2.5 rounded-xl border border-theme bg-theme-primary text-theme-primary placeholder:text-theme-muted focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-colors" placeholder="••••••••"> </div> <button type="submit" id="submit-btn" class="w-full py-3 bg-accent-600 hover:bg-accent-700 text-white rounded-xl font-semibold transition-colors disabled:opacity-50">
Sign In
</button> </form> </div> </div> </div> ` })} ${renderScript($$result, "/Users/chris/projects/dev/openfinance/src/pages/login.astro?astro&type=script&index=0&lang.ts")}`;
}, "/Users/chris/projects/dev/openfinance/src/pages/login.astro", void 0);

const $$file = "/Users/chris/projects/dev/openfinance/src/pages/login.astro";
const $$url = "/login";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Login,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
//# sourceMappingURL=login.astro.mjs.map
