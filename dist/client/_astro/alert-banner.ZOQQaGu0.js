import{j as r}from"./jsx-runtime.D_zvdyIk.js";import{c as o}from"./createLucideIcon.DV6VgPWa.js";import{T as n}from"./triangle-alert.CsgL7Lr6.js";import{X as b}from"./x.DGcJ3xm4.js";import"./index.Cd_vQiNd.js";/**
 * @license lucide-react v0.555.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const s=[["path",{d:"M21.801 10A10 10 0 1 1 17 3.335",key:"yps3ct"}],["path",{d:"m9 11 3 3L22 4",key:"1pflzl"}]],m=o("circle-check-big",s);/**
 * @license lucide-react v0.555.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const x=[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"m15 9-6 6",key:"1uzhvr"}],["path",{d:"m9 9 6 6",key:"z0biqf"}]],k=o("circle-x",x);/**
 * @license lucide-react v0.555.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const g=[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"M12 16v-4",key:"1dtifu"}],["path",{d:"M12 8h.01",key:"e9boi3"}]],h=o("info",g),p={info:{bg:"bg-blue-50 dark:bg-blue-900/20",border:"border-blue-200 dark:border-blue-800/50",icon:h,iconColor:"text-blue-600 dark:text-blue-400"},success:{bg:"bg-emerald-50 dark:bg-emerald-900/20",border:"border-emerald-200 dark:border-emerald-800/50",icon:m,iconColor:"text-emerald-600 dark:text-emerald-400"},warning:{bg:"bg-amber-50 dark:bg-amber-900/20",border:"border-amber-200 dark:border-amber-800/50",icon:n,iconColor:"text-amber-600 dark:text-amber-400"},error:{bg:"bg-red-50 dark:bg-red-900/20",border:"border-red-200 dark:border-red-800/50",icon:k,iconColor:"text-red-600 dark:text-red-400"}};function j({children:a,severity:d="info",icon:c,dismissible:i=!1,onDismiss:t}){const e=p[d],l=e.icon;return r.jsxs("div",{className:`
        flex items-start gap-3 px-4 py-3 rounded-xl border
        ${e.bg} ${e.border}
      `,role:"alert",children:[r.jsx("div",{className:`flex-shrink-0 mt-0.5 ${e.iconColor}`,children:c||r.jsx(l,{className:"h-5 w-5"})}),r.jsx("div",{className:"flex-1 text-sm text-gray-800 dark:text-gray-200",children:a}),i&&t&&r.jsx("button",{onClick:t,className:"flex-shrink-0 p-1 rounded hover:bg-black/5 dark:hover:bg-white/5 transition-colors","aria-label":"Dismiss",children:r.jsx(b,{className:"h-4 w-4 text-gray-500 dark:text-gray-400"})})]})}export{j as AlertBanner};
//# sourceMappingURL=alert-banner.ZOQQaGu0.js.map
