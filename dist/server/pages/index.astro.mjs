import { e as createComponent, f as createAstro, k as renderComponent, r as renderTemplate, m as maybeRenderHead } from '../chunks/astro/server_Cel7--ii.mjs';
import 'piccolore';
import { $ as $$BaseLayout } from '../chunks/BaseLayout_D8LCLloo.mjs';
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
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": "OpenFinance - Personal Finance Manager" }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="min-h-screen bg-gradient-to-br from-[#0d1117] via-[#161b22] to-[#0d1117]"> <!-- Header --> <header class="border-b border-white/10"> <div class="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between"> <span class="text-xl font-bold text-white tracking-tight">openfinance</span> <div class="flex items-center gap-4"> <a href="/login" class="text-sm text-gray-300 hover:text-white transition-colors">
Log in
</a> <a href="/login" class="px-4 py-2 bg-[#f6821f] hover:bg-[#e5740e] text-white rounded-lg text-sm font-semibold transition-colors">
Sign up
</a> </div> </div> </header> <!-- Hero Section --> <main class="max-w-7xl mx-auto px-6"> <section class="py-24 md:py-32 text-center"> <h1 class="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight tracking-tight">
Take control of your
<span class="bg-gradient-to-r from-[#f6821f] to-[#fbad41] bg-clip-text text-transparent"> finances</span> </h1> <p class="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
Track bills, manage debt, and follow the Financial Order of Operations to build wealth. Your complete personal finance command center.
</p> <div class="flex flex-col sm:flex-row gap-4 justify-center"> <a href="/login" class="px-8 py-4 bg-[#f6821f] hover:bg-[#e5740e] text-white rounded-lg text-lg font-semibold transition-all hover:shadow-lg hover:shadow-[#f6821f]/20">
Start for free
</a> <a href="#features" class="px-8 py-4 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-lg text-lg font-semibold transition-colors">
Learn more
</a> </div> </section> <!-- Stats Section --> <section class="py-16 border-t border-white/10"> <div class="grid grid-cols-2 md:grid-cols-4 gap-8 text-center"> <div> <div class="text-3xl md:text-4xl font-bold text-white mb-2">100%</div> <div class="text-sm text-gray-500 uppercase tracking-wider">Free to use</div> </div> <div> <div class="text-3xl md:text-4xl font-bold text-white mb-2">Bank-level</div> <div class="text-sm text-gray-500 uppercase tracking-wider">Security</div> </div> <div> <div class="text-3xl md:text-4xl font-bold text-white mb-2">Real-time</div> <div class="text-sm text-gray-500 uppercase tracking-wider">Sync</div> </div> <div> <div class="text-3xl md:text-4xl font-bold text-white mb-2">Unlimited</div> <div class="text-sm text-gray-500 uppercase tracking-wider">Accounts</div> </div> </div> </section> <!-- Features Section --> <section id="features" class="py-20 border-t border-white/10"> <h2 class="text-3xl md:text-4xl font-bold text-white text-center mb-4">
Everything you need to manage your money
</h2> <p class="text-gray-400 text-center max-w-2xl mx-auto mb-16">
OpenFinance brings all your financial data together in one place, giving you the tools to make smarter decisions.
</p> <div class="grid md:grid-cols-3 gap-6"> <!-- Feature Card 1 --> <div class="p-6 rounded-xl bg-white/5 border border-white/10 hover:border-[#f6821f]/50 transition-colors group"> <div class="w-12 h-12 rounded-lg bg-[#f6821f]/10 flex items-center justify-center mb-4 group-hover:bg-[#f6821f]/20 transition-colors"> <svg class="w-6 h-6 text-[#f6821f]" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path> </svg> </div> <h3 class="text-lg font-semibold text-white mb-2">Financial Dashboard</h3> <p class="text-gray-400 text-sm leading-relaxed">
See all your accounts, balances, and net worth at a glance with real-time updates.
</p> </div> <!-- Feature Card 2 --> <div class="p-6 rounded-xl bg-white/5 border border-white/10 hover:border-[#f6821f]/50 transition-colors group"> <div class="w-12 h-12 rounded-lg bg-[#f6821f]/10 flex items-center justify-center mb-4 group-hover:bg-[#f6821f]/20 transition-colors"> <svg class="w-6 h-6 text-[#f6821f]" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path> </svg> </div> <h3 class="text-lg font-semibold text-white mb-2">Bill Tracking</h3> <p class="text-gray-400 text-sm leading-relaxed">
Never miss a payment. Track all your bills, due dates, and recurring expenses.
</p> </div> <!-- Feature Card 3 --> <div class="p-6 rounded-xl bg-white/5 border border-white/10 hover:border-[#f6821f]/50 transition-colors group"> <div class="w-12 h-12 rounded-lg bg-[#f6821f]/10 flex items-center justify-center mb-4 group-hover:bg-[#f6821f]/20 transition-colors"> <svg class="w-6 h-6 text-[#f6821f]" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path> </svg> </div> <h3 class="text-lg font-semibold text-white mb-2">Debt Payoff</h3> <p class="text-gray-400 text-sm leading-relaxed">
Create a personalized debt payoff plan using avalanche or snowball strategies.
</p> </div> <!-- Feature Card 4 --> <div class="p-6 rounded-xl bg-white/5 border border-white/10 hover:border-[#f6821f]/50 transition-colors group"> <div class="w-12 h-12 rounded-lg bg-[#f6821f]/10 flex items-center justify-center mb-4 group-hover:bg-[#f6821f]/20 transition-colors"> <svg class="w-6 h-6 text-[#f6821f]" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path> </svg> </div> <h3 class="text-lg font-semibold text-white mb-2">FOO Guide</h3> <p class="text-gray-400 text-sm leading-relaxed">
Follow the Financial Order of Operations to prioritize where your money should go.
</p> </div> <!-- Feature Card 5 --> <div class="p-6 rounded-xl bg-white/5 border border-white/10 hover:border-[#f6821f]/50 transition-colors group"> <div class="w-12 h-12 rounded-lg bg-[#f6821f]/10 flex items-center justify-center mb-4 group-hover:bg-[#f6821f]/20 transition-colors"> <svg class="w-6 h-6 text-[#f6821f]" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path> </svg> </div> <h3 class="text-lg font-semibold text-white mb-2">Secure & Private</h3> <p class="text-gray-400 text-sm leading-relaxed">
Bank-level encryption keeps your data safe. We never sell your information.
</p> </div> <!-- Feature Card 6 --> <div class="p-6 rounded-xl bg-white/5 border border-white/10 hover:border-[#f6821f]/50 transition-colors group"> <div class="w-12 h-12 rounded-lg bg-[#f6821f]/10 flex items-center justify-center mb-4 group-hover:bg-[#f6821f]/20 transition-colors"> <svg class="w-6 h-6 text-[#f6821f]" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path> </svg> </div> <h3 class="text-lg font-semibold text-white mb-2">Connect All Accounts</h3> <p class="text-gray-400 text-sm leading-relaxed">
Link checking, savings, investments, and credit cards in one unified view.
</p> </div> </div> </section> <!-- CTA Section --> <section class="py-20 border-t border-white/10 text-center"> <h2 class="text-3xl md:text-4xl font-bold text-white mb-4">
Ready to take control?
</h2> <p class="text-gray-400 max-w-xl mx-auto mb-8">
Join thousands of users who are building wealth with OpenFinance. It's free to start.
</p> <a href="/login" class="inline-flex px-8 py-4 bg-[#f6821f] hover:bg-[#e5740e] text-white rounded-lg text-lg font-semibold transition-all hover:shadow-lg hover:shadow-[#f6821f]/20">
Get started for free
</a> </section> </main> <!-- Footer --> <footer class="border-t border-white/10 py-8"> <div class="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4"> <span class="text-sm text-gray-500">© 2024 OpenFinance. All rights reserved.</span> <div class="flex items-center gap-6"> <a href="#" class="text-sm text-gray-500 hover:text-gray-300 transition-colors">Privacy</a> <a href="#" class="text-sm text-gray-500 hover:text-gray-300 transition-colors">Terms</a> <a href="https://github.com/ctaho19/openfinance" class="text-sm text-gray-500 hover:text-gray-300 transition-colors">GitHub</a> </div> </div> </footer> </div> ` })}`;
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
