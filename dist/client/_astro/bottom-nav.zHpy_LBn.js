import{j as e}from"./jsx-runtime.D_zvdyIk.js";import{L as i}from"./link.D3EDiB7B.js";import{c as o}from"./createLucideIcon.DV6VgPWa.js";import{P as h}from"./piggy-bank.63Q_NMAF.js";import{T as d}from"./target.BCJb0dyN.js";import{M as n}from"./menu.DOgrcrVU.js";import"./index.Cd_vQiNd.js";/**
 * @license lucide-react v0.555.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const c=[["path",{d:"M8 3 4 7l4 4",key:"9rb6wj"}],["path",{d:"M4 7h16",key:"6tx8e3"}],["path",{d:"m16 21 4-4-4-4",key:"siv7j2"}],["path",{d:"M20 17H4",key:"h6l3hr"}]],l=o("arrow-left-right",c);/**
 * @license lucide-react v0.555.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const m=[["rect",{width:"7",height:"9",x:"3",y:"3",rx:"1",key:"10lvy0"}],["rect",{width:"7",height:"5",x:"14",y:"3",rx:"1",key:"16une8"}],["rect",{width:"7",height:"9",x:"14",y:"12",rx:"1",key:"1hutg5"}],["rect",{width:"7",height:"5",x:"3",y:"16",rx:"1",key:"ldoo1y"}]],x=o("layout-dashboard",m),f=[{name:"Plan",href:"/dashboard/paycheck-plan",icon:x,activeMatch:a=>a==="/dashboard/paycheck-plan"},{name:"Bills",href:"/dashboard/bills",icon:l,activeMatch:a=>a.startsWith("/dashboard/bills")||a.startsWith("/dashboard/pay-periods")},{name:"Goals",href:"/dashboard/goals",icon:h,activeMatch:a=>a.startsWith("/dashboard/goals")},{name:"FOO",href:"/dashboard/foo",icon:d,activeMatch:a=>a.startsWith("/dashboard/foo")||a.startsWith("/dashboard/debts")},{name:"More",href:"/dashboard/settings",icon:n,activeMatch:a=>a.startsWith("/dashboard/settings")}];function j({currentPath:a=""}){return e.jsxs("nav",{className:"fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 dark:bg-[#1c2128] dark:border-[#30363d] lg:hidden",children:[e.jsx("div",{className:"mx-auto flex justify-around items-center h-14 max-w-lg",children:f.map(t=>{const r=t.activeMatch(a),s=t.icon;return e.jsxs(i,{href:t.href,"aria-current":r?"page":void 0,"aria-label":t.name,className:`
                flex flex-col items-center justify-center gap-0.5 py-1.5 px-4 min-w-[56px] min-h-[44px]
                transition-colors duration-150
                ${r?"text-[#0060f0] dark:text-[#60a5fa]":"text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"}
              `,children:[e.jsx(s,{"aria-hidden":"true",className:"h-5 w-5"}),e.jsx("span",{className:`text-[10px] font-medium ${r?"font-semibold":""}`,children:t.name})]},t.name)})}),e.jsx("div",{className:"h-[env(safe-area-inset-bottom)]"})]})}export{j as BottomNav};
//# sourceMappingURL=bottom-nav.zHpy_LBn.js.map
