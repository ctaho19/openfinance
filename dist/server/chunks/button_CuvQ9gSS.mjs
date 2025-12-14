import { jsx, jsxs } from 'react/jsx-runtime';
import { ArrowUpRight, ArrowDownRight, Minus, Loader2 } from 'lucide-react';
import { forwardRef } from 'react';

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

const Button = forwardRef(
  ({
    className = "",
    variant = "primary",
    size = "md",
    loading = false,
    fullWidth = false,
    leftIcon,
    rightIcon,
    disabled,
    children,
    ...props
  }, ref) => {
    const baseStyles = `
      inline-flex items-center justify-center gap-2
      font-semibold rounded-lg
      transition-all duration-150
      focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
      disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none
      active:scale-[0.98]
    `;
    const variants = {
      primary: `
        bg-[#0060f0] text-white
        hover:bg-[#004dc0]
        focus-visible:ring-[#0060f0]
        shadow-sm
      `,
      secondary: `
        bg-gray-100 text-gray-700
        hover:bg-gray-200
        border border-gray-300
        focus-visible:ring-[#0060f0]
        dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 dark:hover:bg-gray-700
      `,
      outline: `
        bg-transparent text-[#0060f0]
        border border-[#0060f0]
        hover:bg-[#e6f2fc]
        focus-visible:ring-[#0060f0]
        dark:hover:bg-[#0060f0]/10
      `,
      ghost: `
        bg-transparent text-gray-600
        hover:text-gray-900 hover:bg-gray-100
        focus-visible:ring-[#0060f0]
        dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-800
      `,
      danger: `
        text-white
        focus-visible:ring-red-500
        shadow-sm
        [background-color:#dc2626] hover:[background-color:#b91c1c]
      `,
      success: `
        bg-emerald-600 text-white
        hover:bg-emerald-700
        focus-visible:ring-emerald-500
        shadow-sm
      `,
      link: `
        bg-transparent text-[#0060f0]
        hover:text-[#004dc0] hover:underline
        p-0 h-auto
        focus-visible:ring-[#0060f0]
      `
    };
    const sizes = {
      xs: "px-2.5 py-1.5 text-xs min-h-[32px]",
      sm: "px-3 py-2 text-sm min-h-[36px]",
      md: "px-4 py-2.5 text-sm min-h-[44px]",
      lg: "px-5 py-3 text-base min-h-[48px]",
      xl: "px-6 py-3.5 text-lg min-h-[52px]"
    };
    const widthStyle = fullWidth ? "w-full" : "";
    return /* @__PURE__ */ jsxs(
      "button",
      {
        ref,
        className: `${baseStyles} ${variants[variant]} ${sizes[size]} ${widthStyle} ${className}`,
        disabled: disabled || loading,
        ...props,
        children: [
          loading ? /* @__PURE__ */ jsx(Loader2, { className: "h-4 w-4 animate-spin" }) : leftIcon,
          children,
          !loading && rightIcon
        ]
      }
    );
  }
);
Button.displayName = "Button";
const IconButton = forwardRef(
  ({
    className = "",
    variant = "ghost",
    size = "md",
    loading = false,
    disabled,
    children,
    ...props
  }, ref) => {
    const baseStyles = `
      inline-flex items-center justify-center
      rounded-lg
      transition-all duration-150
      focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
      disabled:opacity-50 disabled:cursor-not-allowed
      active:scale-95
    `;
    const variants = {
      primary: "bg-[#0060f0] text-white hover:bg-[#004dc0] focus-visible:ring-[#0060f0]",
      secondary: "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300 focus-visible:ring-[#0060f0] dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700",
      ghost: "bg-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus-visible:ring-[#0060f0] dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-800",
      danger: "bg-transparent text-red-600 hover:bg-red-50 dark:hover:bg-red-600/10 focus-visible:ring-red-500"
    };
    const sizes = {
      sm: "h-9 w-9 min-h-[36px] min-w-[36px]",
      md: "h-11 w-11 min-h-[44px] min-w-[44px]",
      lg: "h-12 w-12 min-h-[48px] min-w-[48px]"
    };
    return /* @__PURE__ */ jsx(
      "button",
      {
        ref,
        className: `${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`,
        disabled: disabled || loading,
        ...props,
        children: loading ? /* @__PURE__ */ jsx(Loader2, { className: "h-4 w-4 animate-spin" }) : children
      }
    );
  }
);
IconButton.displayName = "IconButton";

export { Button as B, Card as C, StatCard as S, CardHeader as a, CardTitle as b, CardContent as c };
//# sourceMappingURL=button_CuvQ9gSS.mjs.map
