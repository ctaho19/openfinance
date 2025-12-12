import{j as e}from"./jsx-runtime.D_zvdyIk.js";import{c as o}from"./createLucideIcon.DV6VgPWa.js";import"./index.Cd_vQiNd.js";/**
 * @license lucide-react v0.555.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const l=[["path",{d:"M21.801 10A10 10 0 1 1 17 3.335",key:"yps3ct"}],["path",{d:"m9 11 3 3L22 4",key:"1pflzl"}]],g=o("circle-check-big",l);/**
 * @license lucide-react v0.555.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const b=[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"m15 9-6 6",key:"1uzhvr"}],["path",{d:"m9 9 6 6",key:"z0biqf"}]],c=o("circle-x",b);/**
 * @license lucide-react v0.555.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const x=[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"M12 16v-4",key:"1dtifu"}],["path",{d:"M12 8h.01",key:"e9boi3"}]],h=o("info",x);/**
 * @license lucide-react v0.555.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const m=[["path",{d:"m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3",key:"wmoenq"}],["path",{d:"M12 9v4",key:"juzpu7"}],["path",{d:"M12 17h.01",key:"p32p05"}]],k=o("triangle-alert",m),p={info:{bg:"bg-info-100 dark:bg-info-600/20",border:"border-info-500/30",icon:h,iconColor:"text-info-600 dark:text-info-400"},success:{bg:"bg-success-100 dark:bg-success-600/20",border:"border-success-500/30",icon:g,iconColor:"text-success-600 dark:text-success-400"},warning:{bg:"bg-warning-100 dark:bg-warning-600/20",border:"border-warning-500/30",icon:k,iconColor:"text-warning-600 dark:text-warning-400"},error:{bg:"bg-danger-100 dark:bg-danger-600/20",border:"border-danger-500/30",icon:c,iconColor:"text-danger-600 dark:text-danger-400"}};function C({children:t,severity:i="info",icon:a,dismissible:s=!1,onDismiss:n}){const r=p[i],d=r.icon;return e.jsxs("div",{className:`
        flex items-start gap-3 px-4 py-3 rounded-xl border
        ${r.bg} ${r.border}
      `,role:"alert",children:[e.jsx("div",{className:`flex-shrink-0 mt-0.5 ${r.iconColor}`,children:a||e.jsx(d,{className:"h-5 w-5"})}),e.jsx("div",{className:"flex-1 text-sm text-theme-primary",children:t}),s&&n&&e.jsx("button",{onClick:n,className:"flex-shrink-0 p-1 rounded hover:bg-black/5 dark:hover:bg-white/5 transition-colors","aria-label":"Dismiss",children:e.jsx(c,{className:"h-4 w-4 text-theme-muted"})})]})}export{C as AlertBanner};
//# sourceMappingURL=alert-banner.Dm9WPNcW.js.map
