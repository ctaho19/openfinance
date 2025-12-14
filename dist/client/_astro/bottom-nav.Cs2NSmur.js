import{j as r}from"./jsx-runtime.D_zvdyIk.js";import{L as o}from"./link.D3EDiB7B.js";import{L as i,P as d,T as n}from"./target.CSbGnMcv.js";import{c as h}from"./createLucideIcon.DV6VgPWa.js";import{M as c}from"./menu.DOgrcrVU.js";import"./index.Cd_vQiNd.js";/**
 * @license lucide-react v0.555.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const m=[["path",{d:"M8 3 4 7l4 4",key:"9rb6wj"}],["path",{d:"M4 7h16",key:"6tx8e3"}],["path",{d:"m16 21 4-4-4-4",key:"siv7j2"}],["path",{d:"M20 17H4",key:"h6l3hr"}]],f=h("arrow-left-right",m),l=[{name:"Accounts",href:"/dashboard",icon:i,activeMatch:a=>a==="/dashboard"},{name:"Pay",href:"/dashboard/pay-periods",icon:f,activeMatch:a=>a.startsWith("/dashboard/pay-periods")||a.startsWith("/dashboard/bills")},{name:"Goals",href:"/dashboard/goals",icon:d,activeMatch:a=>a.startsWith("/dashboard/goals")},{name:"FOO",href:"/dashboard/foo",icon:n,activeMatch:a=>a.startsWith("/dashboard/foo")||a.startsWith("/dashboard/debts")},{name:"More",href:"/dashboard/settings",icon:c,activeMatch:a=>a.startsWith("/dashboard/settings")}];function u({currentPath:a=""}){return r.jsxs("nav",{className:"fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 dark:bg-[#1c2128] dark:border-[#30363d] lg:hidden",children:[r.jsx("div",{className:"mx-auto flex justify-around items-center h-14 max-w-lg",children:l.map(t=>{const e=t.activeMatch(a),s=t.icon;return r.jsxs(o,{href:t.href,"aria-current":e?"page":void 0,"aria-label":t.name,className:`
                flex flex-col items-center justify-center gap-0.5 py-1.5 px-4 min-w-[56px] min-h-[44px]
                transition-colors duration-150
                ${e?"text-[#0060f0] dark:text-[#60a5fa]":"text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"}
              `,children:[r.jsx(s,{"aria-hidden":"true",className:"h-5 w-5"}),r.jsx("span",{className:`text-[10px] font-medium ${e?"font-semibold":""}`,children:t.name})]},t.name)})}),r.jsx("div",{className:"h-[env(safe-area-inset-bottom)]"})]})}export{u as BottomNav};
//# sourceMappingURL=bottom-nav.Cs2NSmur.js.map
