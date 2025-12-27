import { jsxs, jsx } from 'react/jsx-runtime';
import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

function SectionCard({
  title,
  subtitle,
  children,
  defaultOpen = true,
  collapsible = true,
  action,
  linkHref,
  linkText
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return /* @__PURE__ */ jsxs("div", { className: "bg-white dark:bg-[#1c2128] rounded-xl border border-gray-200 dark:border-[#30363d] overflow-hidden", children: [
    /* @__PURE__ */ jsxs(
      "div",
      {
        className: `
          flex items-center justify-between px-5 py-4
          ${collapsible ? "cursor-pointer hover:bg-gray-50 dark:hover:bg-[#21262d] transition-colors" : ""}
        `,
        onClick: collapsible ? () => setIsOpen(!isOpen) : void 0,
        children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 min-w-0", children: [
            /* @__PURE__ */ jsx("h3", { className: "font-semibold text-gray-900 dark:text-gray-100 truncate", children: title }),
            subtitle && /* @__PURE__ */ jsx("span", { className: "text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full flex-shrink-0", children: subtitle })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 flex-shrink-0", children: [
            action && /* @__PURE__ */ jsx("div", { onClick: (e) => e.stopPropagation(), children: action }),
            linkHref && /* @__PURE__ */ jsx(
              "a",
              {
                href: linkHref,
                className: "text-[#0060f0] hover:text-[#004dc0] text-sm font-medium inline-flex items-center gap-0.5",
                onClick: (e) => e.stopPropagation(),
                children: linkText || "See all"
              }
            ),
            collapsible && /* @__PURE__ */ jsx(
              ChevronDown,
              {
                className: `h-5 w-5 text-gray-400 transition-transform duration-200 ${isOpen ? "" : "-rotate-90"}`
              }
            )
          ] })
        ]
      }
    ),
    isOpen && /* @__PURE__ */ jsx("div", { className: "px-5 pb-5", children })
  ] });
}

export { SectionCard as S };
//# sourceMappingURL=section-card_C_ZUdxQb.mjs.map
