import { renderers } from './renderers.mjs';
import { c as createExports, s as serverEntrypointModule } from './chunks/_@astrojs-ssr-adapter_DlroI_xT.mjs';
import { manifest } from './manifest_BX6uj4Ae.mjs';

const serverIslandMap = new Map();;

const _page0 = () => import('./pages/_image.astro.mjs');
const _page1 = () => import('./pages/api/auth/_---auth_.astro.mjs');
const _page2 = () => import('./pages/api/bank-accounts/_id_.astro.mjs');
const _page3 = () => import('./pages/api/bank-accounts.astro.mjs');
const _page4 = () => import('./pages/api/bill-payments/_id_.astro.mjs');
const _page5 = () => import('./pages/api/bills/_id_.astro.mjs');
const _page6 = () => import('./pages/api/bills.astro.mjs');
const _page7 = () => import('./pages/api/debts/_id_/payments.astro.mjs');
const _page8 = () => import('./pages/api/debts/_id_.astro.mjs');
const _page9 = () => import('./pages/api/debts.astro.mjs');
const _page10 = () => import('./pages/api/foo.astro.mjs');
const _page11 = () => import('./pages/api/goals/_id_.astro.mjs');
const _page12 = () => import('./pages/api/goals.astro.mjs');
const _page13 = () => import('./pages/dashboard/bills/new.astro.mjs');
const _page14 = () => import('./pages/dashboard/bills.astro.mjs');
const _page15 = () => import('./pages/dashboard/debts/calculator.astro.mjs');
const _page16 = () => import('./pages/dashboard/debts/new.astro.mjs');
const _page17 = () => import('./pages/dashboard/debts.astro.mjs');
const _page18 = () => import('./pages/dashboard/foo.astro.mjs');
const _page19 = () => import('./pages/dashboard/goals/new.astro.mjs');
const _page20 = () => import('./pages/dashboard/goals.astro.mjs');
const _page21 = () => import('./pages/dashboard/pay-periods.astro.mjs');
const _page22 = () => import('./pages/dashboard/settings/accounts.astro.mjs');
const _page23 = () => import('./pages/dashboard/settings.astro.mjs');
const _page24 = () => import('./pages/dashboard.astro.mjs');
const _page25 = () => import('./pages/login.astro.mjs');
const _page26 = () => import('./pages/index.astro.mjs');
const pageMap = new Map([
    ["node_modules/astro/dist/assets/endpoint/generic.js", _page0],
    ["src/pages/api/auth/[...auth].ts", _page1],
    ["src/pages/api/bank-accounts/[id].ts", _page2],
    ["src/pages/api/bank-accounts/index.ts", _page3],
    ["src/pages/api/bill-payments/[id].ts", _page4],
    ["src/pages/api/bills/[id].ts", _page5],
    ["src/pages/api/bills/index.ts", _page6],
    ["src/pages/api/debts/[id]/payments.ts", _page7],
    ["src/pages/api/debts/[id].ts", _page8],
    ["src/pages/api/debts/index.ts", _page9],
    ["src/pages/api/foo/index.ts", _page10],
    ["src/pages/api/goals/[id].ts", _page11],
    ["src/pages/api/goals/index.ts", _page12],
    ["src/pages/dashboard/bills/new.astro", _page13],
    ["src/pages/dashboard/bills/index.astro", _page14],
    ["src/pages/dashboard/debts/calculator.astro", _page15],
    ["src/pages/dashboard/debts/new.astro", _page16],
    ["src/pages/dashboard/debts/index.astro", _page17],
    ["src/pages/dashboard/foo/index.astro", _page18],
    ["src/pages/dashboard/goals/new.astro", _page19],
    ["src/pages/dashboard/goals/index.astro", _page20],
    ["src/pages/dashboard/pay-periods/index.astro", _page21],
    ["src/pages/dashboard/settings/accounts.astro", _page22],
    ["src/pages/dashboard/settings/index.astro", _page23],
    ["src/pages/dashboard/index.astro", _page24],
    ["src/pages/login.astro", _page25],
    ["src/pages/index.astro", _page26]
]);

const _manifest = Object.assign(manifest, {
    pageMap,
    serverIslandMap,
    renderers,
    actions: () => import('./noop-entrypoint.mjs'),
    middleware: () => import('./_noop-middleware.mjs')
});
const _args = {
    "responseMode": "buffer"
};
const _exports = createExports(_manifest, _args);
const handler = _exports['handler'];
const _start = 'start';
if (Object.prototype.hasOwnProperty.call(serverEntrypointModule, _start)) {
	serverEntrypointModule[_start](_manifest, _args);
}

export { handler, pageMap };
//# sourceMappingURL=entry.mjs.map
