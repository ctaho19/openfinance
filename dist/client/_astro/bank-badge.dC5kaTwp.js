import{c as d}from"./createLucideIcon.DV6VgPWa.js";import{j as e}from"./jsx-runtime.D_zvdyIk.js";/**
 * @license lucide-react v0.555.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const l=[["path",{d:"m12 19-7-7 7-7",key:"1l729n"}],["path",{d:"M19 12H5",key:"x3x0zl"}]],b=d("arrow-left",l);/**
 * @license lucide-react v0.555.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const m=[["path",{d:"M10 12h4",key:"a56b0p"}],["path",{d:"M10 8h4",key:"1sr2af"}],["path",{d:"M14 21v-3a2 2 0 0 0-4 0v3",key:"1rgiei"}],["path",{d:"M6 10H4a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-2",key:"secmi2"}],["path",{d:"M6 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16",key:"16ra0t"}]],h=d("building-2",m),s={NAVY_FEDERAL:{name:"Navy Federal",bg:"bg-gradient-to-r from-blue-900 to-blue-700",text:"text-white",initials:"NF"},PNC:{name:"PNC",bg:"bg-gradient-to-r from-orange-600 to-orange-500",text:"text-white",initials:"PNC"},CAPITAL_ONE:{name:"Capital One",bg:"bg-gradient-to-r from-red-700 to-red-600",text:"text-white",initials:"C1"},TRUIST:{name:"Truist",bg:"bg-gradient-to-r from-purple-700 to-purple-600",text:"text-white",initials:"T"},CHASE:{name:"Chase",bg:"bg-gradient-to-r from-blue-800 to-blue-600",text:"text-white",initials:"C"},BANK_OF_AMERICA:{name:"Bank of America",bg:"bg-gradient-to-r from-red-800 to-blue-800",text:"text-white",initials:"BoA"},WELLS_FARGO:{name:"Wells Fargo",bg:"bg-gradient-to-r from-red-700 to-yellow-600",text:"text-white",initials:"WF"},OTHER:{name:"Other",bg:"bg-gradient-to-r from-gray-600 to-gray-500",text:"text-white",initials:""}};function c({value:r,onChange:a,banks:o}){return o.length===0?e.jsxs("p",{className:"text-sm text-theme-muted",children:["No bank accounts added."," ",e.jsx("a",{href:"/dashboard/settings",className:"text-accent hover:underline",children:"Add one in settings"})]}):e.jsx("div",{className:"grid grid-cols-2 gap-2",children:o.map(t=>{const i=s[t.bank]||s.OTHER,n=r===t.id;return e.jsx("button",{type:"button",onClick:()=>a(t.id),className:`
              p-3 rounded-lg border-2 text-left transition-all
              ${n?`${i.bg} ${i.text} border-transparent`:"bg-theme-secondary border-theme hover:border-theme-hover"}
            `,children:e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("span",{className:"font-bold",children:i.initials||e.jsx(h,{size:16})}),e.jsxs("div",{children:[e.jsx("p",{className:`text-sm font-medium ${n?"":"text-theme-primary"}`,children:t.name}),e.jsxs("p",{className:`text-xs ${n?"opacity-75":"text-theme-muted"}`,children:[i.name," ",t.lastFour&&`•${t.lastFour}`]})]})]})},t.id)})})}Object.entries(s).map(([r,a])=>({value:r,label:a.name,initials:a.initials}));export{b as A,c as B};
//# sourceMappingURL=bank-badge.dC5kaTwp.js.map
