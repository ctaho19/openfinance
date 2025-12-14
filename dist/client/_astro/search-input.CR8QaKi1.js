import{c as h}from"./createLucideIcon.DV6VgPWa.js";import{j as e}from"./jsx-runtime.D_zvdyIk.js";import{S as i}from"./search.B65NY9Yq.js";import{X as d}from"./x.DGcJ3xm4.js";/**
 * @license lucide-react v0.555.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const p=[["path",{d:"M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z",key:"1oefj6"}],["path",{d:"M14 2v5a1 1 0 0 0 1 1h5",key:"wfsgrz"}],["path",{d:"M10 9H8",key:"b1mrlr"}],["path",{d:"M16 13H8",key:"t4e002"}],["path",{d:"M16 17H8",key:"z1uh3a"}]],y=h("file-text",p);function b({value:r,onChange:a,placeholder:s="Search...",className:o="",size:t="md"}){const l={sm:"h-9 text-sm pl-9 pr-9",md:"h-10 text-sm pl-10 pr-10",lg:"h-12 text-base pl-12 pr-12"},m={sm:"h-4 w-4 left-2.5",md:"h-4 w-4 left-3",lg:"h-5 w-5 left-3.5"},c={sm:"right-2.5",md:"right-3",lg:"right-3.5"};return e.jsxs("div",{className:`relative ${o}`,children:[e.jsx(i,{className:`absolute top-1/2 -translate-y-1/2 text-theme-muted ${m[t]}`}),e.jsx("input",{type:"text",value:r,onChange:n=>a(n.target.value),placeholder:s,className:`
          w-full rounded-xl
          bg-theme-tertiary border border-theme
          text-theme-primary placeholder:text-theme-muted
          focus:outline-none focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500
          transition-all duration-200
          ${l[t]}
        `}),r&&e.jsx("button",{onClick:()=>a(""),className:`
            absolute top-1/2 -translate-y-1/2
            text-theme-muted hover:text-theme-primary
            transition-colors duration-200
            p-0.5 rounded-md hover:bg-theme-secondary
            ${c[t]}
          `,"aria-label":"Clear search",children:e.jsx(d,{className:"h-4 w-4"})})]})}export{y as F,b as S};
//# sourceMappingURL=search-input.CR8QaKi1.js.map
