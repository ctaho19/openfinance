import{j as t}from"./jsx-runtime.D_zvdyIk.js";import{r as m}from"./index.Cd_vQiNd.js";import{c as v}from"./createLucideIcon.DV6VgPWa.js";/**
 * @license lucide-react v0.555.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const f=[["path",{d:"M21 12a9 9 0 1 1-6.219-8.56",key:"13zald"}]],b=v("loader-circle",f),y=m.forwardRef(({className:s="",variant:r="primary",size:n="md",loading:e=!1,fullWidth:i=!1,leftIcon:o,rightIcon:a,disabled:c,children:d,...l},h)=>{const g=`
      inline-flex items-center justify-center gap-2
      font-semibold rounded-lg
      transition-all duration-200
      focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
      disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none
      active:scale-[0.98]
    `,p={primary:`
        bg-accent-600 text-white
        hover:bg-accent-700
        focus-visible:ring-accent-500
        shadow-sm hover:shadow-md
      `,secondary:`
        bg-theme-tertiary text-theme-primary
        hover:bg-theme-secondary
        border border-theme
        focus-visible:ring-accent-500
      `,outline:`
        bg-transparent text-accent-600
        border-2 border-accent-600
        hover:bg-accent-50 dark:hover:bg-accent-600/10
        focus-visible:ring-accent-500
      `,ghost:`
        bg-transparent text-theme-secondary
        hover:text-theme-primary hover:bg-theme-tertiary
        focus-visible:ring-accent-500
      `,danger:`
        text-white
        focus-visible:ring-red-500
        shadow-sm hover:shadow-md
        [background-color:#dc2626] hover:[background-color:#b91c1c]
      `,success:`
        bg-success-600 text-white
        hover:bg-success-700
        focus-visible:ring-success-500
        shadow-sm hover:shadow-md
      `,link:`
        bg-transparent text-accent-600
        hover:text-accent-700 hover:underline
        p-0 h-auto
        focus-visible:ring-accent-500
      `},x={xs:"px-2.5 py-1.5 text-xs min-h-[32px]",sm:"px-3 py-2 text-sm min-h-[36px]",md:"px-4 py-2.5 text-sm min-h-[44px]",lg:"px-5 py-3 text-base min-h-[48px]",xl:"px-6 py-3.5 text-lg min-h-[52px]"},u=i?"w-full":"";return t.jsxs("button",{ref:h,className:`${g} ${p[r]} ${x[n]} ${u} ${s}`,disabled:c||e,...l,children:[e?t.jsx(b,{className:"h-4 w-4 animate-spin"}):o,d,!e&&a]})});y.displayName="Button";const w=m.forwardRef(({className:s="",variant:r="ghost",size:n="md",loading:e=!1,disabled:i,children:o,...a},c)=>{const d=`
      inline-flex items-center justify-center
      rounded-lg
      transition-all duration-200
      focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
      disabled:opacity-50 disabled:cursor-not-allowed
      active:scale-95
    `,l={primary:"bg-accent-600 text-white hover:bg-accent-700 focus-visible:ring-accent-500",secondary:"bg-theme-tertiary text-theme-primary hover:bg-theme-secondary border border-theme focus-visible:ring-accent-500",ghost:"bg-transparent text-theme-secondary hover:text-theme-primary hover:bg-theme-tertiary focus-visible:ring-accent-500",danger:"bg-transparent text-danger-600 hover:bg-danger-50 dark:hover:bg-danger-600/10 focus-visible:ring-danger-500"},h={sm:"h-9 w-9 min-h-[36px] min-w-[36px]",md:"h-11 w-11 min-h-[44px] min-w-[44px]",lg:"h-12 w-12 min-h-[48px] min-w-[48px]"};return t.jsx("button",{ref:c,className:`${d} ${l[r]} ${h[n]} ${s}`,disabled:i||e,...a,children:e?t.jsx(b,{className:"h-4 w-4 animate-spin"}):o})});w.displayName="IconButton";export{y as B};
//# sourceMappingURL=button.BRkflXfO.js.map
