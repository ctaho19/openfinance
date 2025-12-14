import{j as e}from"./jsx-runtime.D_zvdyIk.js";import{S as i}from"./search.B65NY9Yq.js";import{X as h}from"./x.DGcJ3xm4.js";function x({value:r,onChange:s,placeholder:a="Search...",className:o="",size:t="md"}){const l={sm:"h-9 text-sm pl-9 pr-9",md:"h-10 text-sm pl-10 pr-10",lg:"h-12 text-base pl-12 pr-12"},m={sm:"h-4 w-4 left-2.5",md:"h-4 w-4 left-3",lg:"h-5 w-5 left-3.5"},n={sm:"right-2.5",md:"right-3",lg:"right-3.5"};return e.jsxs("div",{className:`relative ${o}`,children:[e.jsx(i,{className:`absolute top-1/2 -translate-y-1/2 text-theme-muted ${m[t]}`}),e.jsx("input",{type:"text",value:r,onChange:c=>s(c.target.value),placeholder:a,className:`
          w-full rounded-xl
          bg-theme-tertiary border border-theme
          text-theme-primary placeholder:text-theme-muted
          focus:outline-none focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500
          transition-all duration-200
          ${l[t]}
        `}),r&&e.jsx("button",{onClick:()=>s(""),className:`
            absolute top-1/2 -translate-y-1/2
            text-theme-muted hover:text-theme-primary
            transition-colors duration-200
            p-0.5 rounded-md hover:bg-theme-secondary
            ${n[t]}
          `,"aria-label":"Clear search",children:e.jsx(h,{className:"h-4 w-4"})})]})}export{x as S};
//# sourceMappingURL=search-input.BW1cW3xT.js.map
