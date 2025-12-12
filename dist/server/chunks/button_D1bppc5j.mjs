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
      transition-all duration-200
      focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
      disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none
      active:scale-[0.98]
    `;
    const variants = {
      primary: `
        bg-accent-600 text-white
        hover:bg-accent-700
        focus-visible:ring-accent-500
        shadow-sm hover:shadow-md
      `,
      secondary: `
        bg-theme-tertiary text-theme-primary
        hover:bg-theme-secondary
        border border-theme
        focus-visible:ring-accent-500
      `,
      outline: `
        bg-transparent text-accent-600
        border-2 border-accent-600
        hover:bg-accent-50 dark:hover:bg-accent-600/10
        focus-visible:ring-accent-500
      `,
      ghost: `
        bg-transparent text-theme-secondary
        hover:text-theme-primary hover:bg-theme-tertiary
        focus-visible:ring-accent-500
      `,
      danger: `
        text-white
        focus-visible:ring-red-500
        shadow-sm hover:shadow-md
        [background-color:#dc2626] hover:[background-color:#b91c1c]
      `,
      success: `
        bg-success-600 text-white
        hover:bg-success-700
        focus-visible:ring-success-500
        shadow-sm hover:shadow-md
      `,
      link: `
        bg-transparent text-accent-600
        hover:text-accent-700 hover:underline
        p-0 h-auto
        focus-visible:ring-accent-500
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
      transition-all duration-200
      focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
      disabled:opacity-50 disabled:cursor-not-allowed
      active:scale-95
    `;
    const variants = {
      primary: "bg-accent-600 text-white hover:bg-accent-700 focus-visible:ring-accent-500",
      secondary: "bg-theme-tertiary text-theme-primary hover:bg-theme-secondary border border-theme focus-visible:ring-accent-500",
      ghost: "bg-transparent text-theme-secondary hover:text-theme-primary hover:bg-theme-tertiary focus-visible:ring-accent-500",
      danger: "bg-transparent text-danger-600 hover:bg-danger-50 dark:hover:bg-danger-600/10 focus-visible:ring-danger-500"
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
//# sourceMappingURL=button_D1bppc5j.mjs.map
