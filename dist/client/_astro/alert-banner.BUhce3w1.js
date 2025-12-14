import{j as e}from"./jsx-runtime.D_zvdyIk.js";import{c as o}from"./createLucideIcon.DV6VgPWa.js";import{X as l}from"./x.DGcJ3xm4.js";import"./index.Cd_vQiNd.js";/**
 * @license lucide-react v0.555.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const b=[["path",{d:"M21.801 10A10 10 0 1 1 17 3.335",key:"yps3ct"}],["path",{d:"m9 11 3 3L22 4",key:"1pflzl"}]],s=o("circle-check-big",b);/**
 * @license lucide-react v0.555.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const m=[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"m15 9-6 6",key:"1uzhvr"}],["path",{d:"m9 9 6 6",key:"z0biqf"}]],k=o("circle-x",m);/**
 * @license lucide-react v0.555.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const x=[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"M12 16v-4",key:"1dtifu"}],["path",{d:"M12 8h.01",key:"e9boi3"}]],g=o("info",x);/**
 * @license lucide-react v0.555.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const h=[["path",{d:"m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3",key:"wmoenq"}],["path",{d:"M12 9v4",key:"juzpu7"}],["path",{d:"M12 17h.01",key:"p32p05"}]],p=o("triangle-alert",h),y={info:{bg:"bg-blue-50 dark:bg-blue-900/20",border:"border-blue-200 dark:border-blue-800/50",icon:g,iconColor:"text-blue-600 dark:text-blue-400"},success:{bg:"bg-emerald-50 dark:bg-emerald-900/20",border:"border-emerald-200 dark:border-emerald-800/50",icon:s,iconColor:"text-emerald-600 dark:text-emerald-400"},warning:{bg:"bg-amber-50 dark:bg-amber-900/20",border:"border-amber-200 dark:border-amber-800/50",icon:p,iconColor:"text-amber-600 dark:text-amber-400"},error:{bg:"bg-red-50 dark:bg-red-900/20",border:"border-red-200 dark:border-red-800/50",icon:k,iconColor:"text-red-600 dark:text-red-400"}};function j({children:a,severity:d="info",icon:c,dismissible:n=!1,onDismiss:t}){const r=y[d],i=r.icon;return e.jsxs("div",{className:`
        flex items-start gap-3 px-4 py-3 rounded-xl border
        ${r.bg} ${r.border}
      `,role:"alert",children:[e.jsx("div",{className:`flex-shrink-0 mt-0.5 ${r.iconColor}`,children:c||e.jsx(i,{className:"h-5 w-5"})}),e.jsx("div",{className:"flex-1 text-sm text-gray-800 dark:text-gray-200",children:a}),n&&t&&e.jsx("button",{onClick:t,className:"flex-shrink-0 p-1 rounded hover:bg-black/5 dark:hover:bg-white/5 transition-colors","aria-label":"Dismiss",children:e.jsx(l,{className:"h-4 w-4 text-gray-500 dark:text-gray-400"})})]})}export{j as AlertBanner};
//# sourceMappingURL=alert-banner.BUhce3w1.js.map
