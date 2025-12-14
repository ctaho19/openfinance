import{j as r}from"./jsx-runtime.D_zvdyIk.js";import{r as b}from"./index.Cd_vQiNd.js";import{c as p}from"./createLucideIcon.DV6VgPWa.js";/**
 * @license lucide-react v0.555.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const u=[["path",{d:"M21 12a9 9 0 1 1-6.219-8.56",key:"13zald"}]],x=p("loader-circle",u),v=b.forwardRef(({className:t="",variant:s="primary",size:a="md",loading:e=!1,fullWidth:o=!1,leftIcon:i,rightIcon:n,disabled:d,children:g,...c},l)=>{const f=`
      inline-flex items-center justify-center gap-2
      font-semibold rounded-lg
      transition-all duration-150
      focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
      disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none
      active:scale-[0.98]
    `,h={primary:`
        bg-[#0060f0] text-white
        hover:bg-[#004dc0]
        focus-visible:ring-[#0060f0]
        shadow-sm
      `,secondary:`
        bg-gray-100 text-gray-700
        hover:bg-gray-200
        border border-gray-300
        focus-visible:ring-[#0060f0]
        dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 dark:hover:bg-gray-700
      `,outline:`
        bg-transparent text-[#0060f0]
        border border-[#0060f0]
        hover:bg-[#e6f2fc]
        focus-visible:ring-[#0060f0]
        dark:hover:bg-[#0060f0]/10
      `,ghost:`
        bg-transparent text-gray-600
        hover:text-gray-900 hover:bg-gray-100
        focus-visible:ring-[#0060f0]
        dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-800
      `,danger:`
        text-white
        focus-visible:ring-red-500
        shadow-sm
        [background-color:#dc2626] hover:[background-color:#b91c1c]
      `,success:`
        bg-emerald-600 text-white
        hover:bg-emerald-700
        focus-visible:ring-emerald-500
        shadow-sm
      `,link:`
        bg-transparent text-[#0060f0]
        hover:text-[#004dc0] hover:underline
        p-0 h-auto
        focus-visible:ring-[#0060f0]
      `},y={xs:"px-2.5 py-1.5 text-xs min-h-[32px]",sm:"px-3 py-2 text-sm min-h-[36px]",md:"px-4 py-2.5 text-sm min-h-[44px]",lg:"px-5 py-3 text-base min-h-[48px]",xl:"px-6 py-3.5 text-lg min-h-[52px]"},m=o?"w-full":"";return r.jsxs("button",{ref:l,className:`${f} ${h[s]} ${y[a]} ${m} ${t}`,disabled:d||e,...c,children:[e?r.jsx(x,{className:"h-4 w-4 animate-spin"}):i,g,!e&&n]})});v.displayName="Button";const w=b.forwardRef(({className:t="",variant:s="ghost",size:a="md",loading:e=!1,disabled:o,children:i,...n},d)=>{const g=`
      inline-flex items-center justify-center
      rounded-lg
      transition-all duration-150
      focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
      disabled:opacity-50 disabled:cursor-not-allowed
      active:scale-95
    `,c={primary:"bg-[#0060f0] text-white hover:bg-[#004dc0] focus-visible:ring-[#0060f0]",secondary:"bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300 focus-visible:ring-[#0060f0] dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700",ghost:"bg-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus-visible:ring-[#0060f0] dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-800",danger:"bg-transparent text-red-600 hover:bg-red-50 dark:hover:bg-red-600/10 focus-visible:ring-red-500"},l={sm:"h-9 w-9 min-h-[36px] min-w-[36px]",md:"h-11 w-11 min-h-[44px] min-w-[44px]",lg:"h-12 w-12 min-h-[48px] min-w-[48px]"};return r.jsx("button",{ref:d,className:`${g} ${c[s]} ${l[a]} ${t}`,disabled:o||e,...n,children:e?r.jsx(x,{className:"h-4 w-4 animate-spin"}):i})});w.displayName="IconButton";export{v as B};
//# sourceMappingURL=button.9NTnJrUv.js.map
