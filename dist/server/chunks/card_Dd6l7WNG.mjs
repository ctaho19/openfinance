import { jsx, jsxs } from 'react/jsx-runtime';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

function Card({
  children,
  className = "",
  variant = "default",
  hover = false,
  animate = false
}) {
  const baseStyles = "rounded-2xl overflow-hidden transition-all duration-200";
  const variants = {
    default: "bg-theme-elevated border border-theme shadow-theme",
    elevated: "bg-theme-elevated border border-theme shadow-theme-md",
    outlined: "bg-transparent border-2 border-theme",
    glass: "glass border border-theme/50 shadow-theme-lg",
    gradient: "bg-chase-gradient border-0 text-white shadow-theme-md"
  };
  const hoverStyles = hover ? "card-hover-lift cursor-pointer" : "";
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
      className: `px-6 py-4 border-b border-theme flex items-center justify-between ${className}`,
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
  return /* @__PURE__ */ jsx(Component, { className: `text-lg font-semibold text-theme-primary tracking-tight ${className}`, children });
}
function CardContent({
  children,
  className = "",
  noPadding = false
}) {
  return /* @__PURE__ */ jsx("div", { className: noPadding ? className : `px-6 py-4 ${className}`, children });
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
    up: "text-success-600 dark:text-success-500",
    down: "text-danger-600 dark:text-danger-500",
    neutral: "text-theme-muted"
  };
  const iconClasses = {
    default: "bg-theme-tertiary text-theme-secondary",
    success: "bg-success-100 text-success-600 dark:bg-success-600/20 dark:text-success-400",
    warning: "bg-warning-100 text-warning-600 dark:bg-warning-600/20 dark:text-warning-400",
    danger: "bg-danger-100 text-danger-600 dark:bg-danger-600/20 dark:text-danger-400",
    info: "bg-info-100 text-info-600 dark:bg-info-600/20 dark:text-info-400"
  };
  return /* @__PURE__ */ jsx(Card, { className, children: /* @__PURE__ */ jsx(CardContent, { className: "py-5", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
    icon && /* @__PURE__ */ jsx("div", { className: `p-3 rounded-xl ${iconClasses[variant]}`, children: icon }),
    /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
      /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-theme-secondary truncate", children: label }),
      /* @__PURE__ */ jsx("p", { className: "text-2xl font-bold text-theme-primary tracking-tight mt-0.5", children: value }),
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
//# sourceMappingURL=card_Dd6l7WNG.mjs.map
