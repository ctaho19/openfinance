import { e as createComponent, f as createAstro, k as renderComponent, l as renderScript, r as renderTemplate, m as maybeRenderHead } from '../chunks/astro/server_B4LN2q8c.mjs';
import 'piccolore';
import { $ as $$BaseLayout } from '../chunks/BaseLayout_CfQ5SKdz.mjs';
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
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": "Sign in" }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="min-h-screen bg-[#f5f6f7] flex flex-col"> <!-- Header bar - Chase style --> <header class="bg-[#0a3254] py-4"> <div class="max-w-7xl mx-auto px-6 flex items-center justify-between"> <a href="/" class="flex items-center gap-2"> <div class="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center"> <span class="text-white font-bold text-sm">OF</span> </div> <span class="text-white font-semibold text-lg hidden sm:block">OpenFinance</span> </a> <nav class="flex items-center gap-6 text-sm text-white/80"> <a href="/" class="hover:text-white transition-colors">Personal</a> <a href="/" class="hover:text-white transition-colors">Business</a> </nav> </div> </header> <!-- Main content --> <main class="flex-1 flex items-center justify-center px-4 py-12"> <div class="w-full max-w-sm"> <div class="bg-white rounded-xl shadow-lg border border-gray-200 p-8"> <h1 class="text-xl font-semibold text-gray-900 mb-6">Welcome back</h1> <div id="error-message" class="hidden mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm"></div> ${error && renderTemplate`<div class="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm"> ${error === "CredentialsSignin" ? "Invalid email or password" : "An error occurred. Please try again."} </div>`} <form id="login-form" class="space-y-5"> <div> <label for="email" class="block text-sm font-medium text-gray-700 mb-1.5">
Username
</label> <input type="email" id="email" name="email" required class="w-full px-4 py-3 rounded-lg border border-gray-300 bg-gray-50 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0060f0]/20 focus:border-[#0060f0] transition-all" placeholder="you@example.com"> </div> <div> <label for="password" class="block text-sm font-medium text-gray-700 mb-1.5">
Password
</label> <div class="relative"> <input type="password" id="password" name="password" required class="w-full px-4 py-3 rounded-lg border border-gray-300 bg-gray-50 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0060f0]/20 focus:border-[#0060f0] transition-all pr-16" placeholder="••••••••"> <button type="button" class="absolute right-3 top-1/2 -translate-y-1/2 text-[#0060f0] text-sm font-medium hover:text-[#004dc0]" onclick="togglePassword()">
Show
</button> </div> </div> <div class="flex items-center justify-between text-sm"> <label class="flex items-center gap-2 cursor-pointer"> <input type="checkbox" class="w-4 h-4 rounded border-gray-300 text-[#0060f0] focus:ring-[#0060f0]"> <span class="text-gray-600">Remember me</span> </label> <a href="#" class="text-[#0060f0] hover:text-[#004dc0] font-medium">
Use token
<span class="ml-0.5">›</span> </a> </div> <button type="submit" id="submit-btn" class="w-full py-3 bg-[#0060f0] hover:bg-[#004dc0] text-white rounded-lg font-semibold transition-colors disabled:opacity-50">
Sign in
</button> </form> <div class="mt-6 pt-5 border-t border-gray-200 space-y-3 text-sm"> <a href="#" class="block text-[#0060f0] hover:text-[#004dc0]">
Forgot username/password?
<span class="ml-0.5">›</span> </a> <a href="#" class="block text-[#0060f0] hover:text-[#004dc0]">
Not Enrolled? Sign Up Now.
<span class="ml-0.5">›</span> </a> </div> </div> </div> </main> <!-- Footer --> <footer class="py-6 border-t border-gray-200 bg-white"> <div class="max-w-7xl mx-auto px-6 text-center text-sm text-gray-500">
© 2024 OpenFinance. All rights reserved.
</div> </footer> </div> ` })} ${renderScript($$result, "/Users/chris/projects/dev/openfinance/src/pages/login.astro?astro&type=script&index=0&lang.ts")}`;
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
