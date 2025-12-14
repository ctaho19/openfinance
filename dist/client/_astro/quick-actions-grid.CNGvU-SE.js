import{j as e}from"./jsx-runtime.D_zvdyIk.js";import{L as a}from"./link.D3EDiB7B.js";function c({actions:t,columns:s=4}){const l={3:"grid-cols-3",4:"grid-cols-4",5:"grid-cols-5"};return e.jsx("div",{className:`grid ${l[s]} gap-2`,children:t.map(r=>{const n=r.icon;return e.jsxs(a,{href:r.href,className:"flex flex-col items-center justify-center py-4 px-2 rounded-lg hover:bg-gray-50 dark:hover:bg-[#21262d] transition-colors group",children:[e.jsxs("div",{className:"relative",children:[e.jsx("div",{className:`
                w-11 h-11 lg:w-12 lg:h-12 
                rounded-full 
                bg-[#e6f2fc] dark:bg-[#0060f0]/15
                flex items-center justify-center
                transition-all duration-150
                group-hover:scale-105
                group-active:scale-95
              `,children:e.jsx(n,{className:"h-5 w-5 lg:h-5 lg:w-5 text-[#0060f0] dark:text-[#60a5fa]"})}),r.badge&&e.jsx("span",{className:"absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center",children:r.badge})]}),e.jsx("span",{className:"text-[11px] lg:text-xs font-medium text-gray-700 dark:text-gray-300 mt-2 text-center leading-tight",children:r.label})]},r.label)})})}export{c as QuickActionsGrid};
//# sourceMappingURL=quick-actions-grid.CNGvU-SE.js.map
