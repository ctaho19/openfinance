import { jsxs, jsx } from 'react/jsx-runtime';
import { Search, X } from 'lucide-react';

function SearchInput({
  value,
  onChange,
  placeholder = "Search...",
  className = "",
  size = "md"
}) {
  const sizes = {
    sm: "h-9 text-sm pl-9 pr-9",
    md: "h-10 text-sm pl-10 pr-10",
    lg: "h-12 text-base pl-12 pr-12"
  };
  const iconSizes = {
    sm: "h-4 w-4 left-2.5",
    md: "h-4 w-4 left-3",
    lg: "h-5 w-5 left-3.5"
  };
  const clearSizes = {
    sm: "right-2.5",
    md: "right-3",
    lg: "right-3.5"
  };
  return /* @__PURE__ */ jsxs("div", { className: `relative ${className}`, children: [
    /* @__PURE__ */ jsx(Search, { className: `absolute top-1/2 -translate-y-1/2 text-theme-muted ${iconSizes[size]}` }),
    /* @__PURE__ */ jsx(
      "input",
      {
        type: "text",
        value,
        onChange: (e) => onChange(e.target.value),
        placeholder,
        className: `
          w-full rounded-xl
          bg-theme-tertiary border border-theme
          text-theme-primary placeholder:text-theme-muted
          focus:outline-none focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500
          transition-all duration-200
          ${sizes[size]}
        `
      }
    ),
    value && /* @__PURE__ */ jsx(
      "button",
      {
        onClick: () => onChange(""),
        className: `
            absolute top-1/2 -translate-y-1/2
            text-theme-muted hover:text-theme-primary
            transition-colors duration-200
            p-0.5 rounded-md hover:bg-theme-secondary
            ${clearSizes[size]}
          `,
        "aria-label": "Clear search",
        children: /* @__PURE__ */ jsx(X, { className: "h-4 w-4" })
      }
    )
  ] });
}

export { SearchInput as S };
//# sourceMappingURL=search-input_DAvPwjoS.mjs.map
