import { jsx, jsxs } from 'react/jsx-runtime';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

function Card({
  children,
  className = "",
  variant = "default",
  hover = false,
  animate = false
}) {
  const baseStyles = "rounded-xl overflow-hidden transition-all duration-150";
  const variants = {
    default: "bg-white dark:bg-[#1c2128] border border-gray-200 dark:border-[#30363d] shadow-sm",
    elevated: "bg-white dark:bg-[#1c2128] border border-gray-200 dark:border-[#30363d] shadow-md",
    outlined: "bg-transparent border border-gray-200 dark:border-[#30363d]",
    glass: "bg-white/90 dark:bg-[#1c2128]/90 backdrop-blur-lg border border-gray-200/50 dark:border-[#30363d]/50 shadow-lg",
    gradient: "bg-gradient-to-br from-[#0060f0] to-[#0a3254] border-0 text-white shadow-md"
  };
  const hoverStyles = hover ? "hover:shadow-md hover:border-gray-300 dark:hover:border-[#484f58] cursor-pointer" : "";
  const animateStyles = animate ? "animate-fade-in-up" : "";
  return /* @__PURE__ */ jsx("div", { className: `${baseStyles} ${variants[variant]} ${hoverStyles} ${animateStyles} ${className}`, children });
}
function CardHeader({
  children,
  className = "",
  onClick,
  action
}) {
  return /* @__PURE__ */ jsxs(
    "div",
    {
      className: `px-5 py-4 border-b border-gray-100 dark:border-[#30363d] flex items-center justify-between ${className}`,
      onClick,
      children: [
        /* @__PURE__ */ jsx("div", { className: "flex-1", children }),
        action && /* @__PURE__ */ jsx("div", { className: "ml-4", children: action })
      ]
    }
  );
}
function CardTitle({
  children,
  className = "",
  as: Component = "h3"
}) {
  return /* @__PURE__ */ jsx(Component, { className: `text-lg font-semibold text-gray-900 dark:text-gray-100 tracking-tight ${className}`, children });
}
function CardContent({
  children,
  className = "",
  noPadding = false
}) {
  return /* @__PURE__ */ jsx("div", { className: noPadding ? className : `px-5 py-5 ${className}`, children });
}
function StatCard({
  label,
  value,
  icon,
  trend,
  variant = "default",
  className = ""
}) {
  const trendColors = {
    up: "text-emerald-600 dark:text-emerald-400",
    down: "text-red-600 dark:text-red-400",
    neutral: "text-gray-500 dark:text-gray-400"
  };
  const iconClasses = {
    default: "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400",
    success: "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400",
    warning: "bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400",
    danger: "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400",
    info: "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
  };
  return /* @__PURE__ */ jsx(Card, { className, children: /* @__PURE__ */ jsx(CardContent, { className: "py-5", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
    icon && /* @__PURE__ */ jsx("div", { className: `p-3 rounded-xl ${iconClasses[variant]}`, children: icon }),
    /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
      /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-gray-500 dark:text-gray-400 truncate", children: label }),
      /* @__PURE__ */ jsx("p", { className: "text-2xl font-medium text-gray-900 dark:text-gray-100 tracking-tight mt-0.5", children: value }),
      trend && /* @__PURE__ */ jsxs("p", { className: `text-xs font-medium mt-1 flex items-center gap-1 ${trendColors[trend.direction]}`, children: [
        trend.direction === "up" && /* @__PURE__ */ jsx(ArrowUpRight, { className: "h-3 w-3" }),
        trend.direction === "down" && /* @__PURE__ */ jsx(ArrowDownRight, { className: "h-3 w-3" }),
        trend.direction === "neutral" && /* @__PURE__ */ jsx(Minus, { className: "h-3 w-3" }),
        trend.value > 0 ? "+" : "",
        trend.value,
        "% from last period"
      ] })
    ] })
  ] }) }) });
}

export { Card as C, StatCard as S, CardHeader as a, CardTitle as b, CardContent as c };
//# sourceMappingURL=card_XHmopkrD.mjs.map
