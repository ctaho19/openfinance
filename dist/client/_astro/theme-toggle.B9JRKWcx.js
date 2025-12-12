import{j as m}from"./jsx-runtime.D_zvdyIk.js";import{r as s}from"./index.Cd_vQiNd.js";import{c as u}from"./createLucideIcon.DV6VgPWa.js";/**
 * @license lucide-react v0.555.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const S=[["rect",{width:"20",height:"14",x:"2",y:"3",rx:"2",key:"48i651"}],["line",{x1:"8",x2:"16",y1:"21",y2:"21",key:"1svkeh"}],["line",{x1:"12",x2:"12",y1:"17",y2:"21",key:"vw1qmm"}]],y=u("monitor",S);/**
 * @license lucide-react v0.555.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const b=[["path",{d:"M20.985 12.486a9 9 0 1 1-9.473-9.472c.405-.022.617.46.402.803a6 6 0 0 0 8.268 8.268c.344-.215.825-.004.803.401",key:"kfwtm"}]],p=u("moon",b);/**
 * @license lucide-react v0.555.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const w=[["circle",{cx:"12",cy:"12",r:"4",key:"4exip2"}],["path",{d:"M12 2v2",key:"tus03m"}],["path",{d:"M12 20v2",key:"1lh1kg"}],["path",{d:"m4.93 4.93 1.41 1.41",key:"149t6j"}],["path",{d:"m17.66 17.66 1.41 1.41",key:"ptbguv"}],["path",{d:"M2 12h2",key:"1t8f8n"}],["path",{d:"M20 12h2",key:"1q8mjw"}],["path",{d:"m6.34 17.66-1.41 1.41",key:"1m8zz5"}],["path",{d:"m19.07 4.93-1.41 1.41",key:"1shlcs"}]],f=u("sun",w),g=s.createContext(void 0);function x(){return typeof window>"u"||window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"}function N({children:n}){const[t,c]=s.useState("system"),[a,d]=s.useState("chase"),[l,h]=s.useState("dark"),[i,v]=s.useState(!1);s.useEffect(()=>{const e=localStorage.getItem("theme-mode"),o=localStorage.getItem("theme-accent");e&&c(e),o&&d(o),v(!0)},[]),s.useEffect(()=>{if(!i)return;const e=()=>{const o=t==="system"?x():t;h(o);const r=document.documentElement;r.classList.remove("light","dark"),r.classList.add(o)};if(e(),t==="system"){const o=window.matchMedia("(prefers-color-scheme: dark)"),r=()=>e();return o.addEventListener("change",r),()=>o.removeEventListener("change",r)}},[t,i]),s.useEffect(()=>{if(!i)return;const e=document.documentElement;e.classList.remove("accent-chase","accent-blue","accent-purple","accent-orange","accent-pink"),e.classList.add(`accent-${a}`)},[a,i]);const M={mode:t,setMode:e=>{c(e),localStorage.setItem("theme-mode",e);const o=e==="system"?x():e;h(o);const r=document.documentElement;r.classList.remove("light","dark"),r.classList.add(o)},accentColor:a,setAccentColor:e=>{d(e),localStorage.setItem("theme-accent",e)},resolvedMode:l};return m.jsx(g.Provider,{value:M,children:n})}function k(){const n=s.useContext(g);if(n===void 0)throw new Error("useTheme must be used within a ThemeProvider");return n}const T=[{value:"light",icon:f,label:"Light"},{value:"dark",icon:p,label:"Dark"},{value:"system",icon:y,label:"System"}];function _(){const{mode:n,setMode:t}=k();return m.jsx("div",{className:"flex items-center gap-1 p-1 rounded-xl bg-theme-tertiary",children:T.map(({value:c,icon:a,label:d})=>m.jsxs("button",{onClick:()=>t(c),className:`
            flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium
            transition-all duration-200
            ${n===c?"bg-theme-elevated text-theme-primary shadow-sm":"text-theme-secondary hover:text-theme-primary"}
          `,title:d,children:[m.jsx(a,{className:"h-4 w-4"}),m.jsx("span",{className:"hidden sm:inline",children:d})]},c))})}function $(){const{resolvedMode:n,mode:t,setMode:c}=k(),a=()=>{const l=["light","dark","system"],i=(l.indexOf(t)+1)%l.length;c(l[i])},d=t==="system"?y:n==="dark"?p:f;return m.jsx("button",{onClick:a,className:"p-2.5 rounded-xl text-theme-secondary hover:bg-theme-tertiary hover:text-theme-primary transition-all duration-200",title:`Theme: ${t}`,"aria-label":`Current theme: ${t}. Click to change.`,children:m.jsx(d,{className:"h-5 w-5"})})}export{N as T,_ as a,$ as b,k as u};
//# sourceMappingURL=theme-toggle.B9JRKWcx.js.map
