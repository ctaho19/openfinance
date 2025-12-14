import { ButtonHTMLAttributes, forwardRef } from "react";
import { Loader2 } from "lucide-react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger" | "success" | "link";
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  loading?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { 
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
    },
    ref
  ) => {
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
      `,
    };

    const sizes = {
      xs: "px-2.5 py-1.5 text-xs min-h-[32px]",
      sm: "px-3 py-2 text-sm min-h-[36px]",
      md: "px-4 py-2.5 text-sm min-h-[44px]",
      lg: "px-5 py-3 text-base min-h-[48px]",
      xl: "px-6 py-3.5 text-lg min-h-[52px]",
    };

    const widthStyle = fullWidth ? "w-full" : "";

    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${widthStyle} ${className}`}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          leftIcon
        )}
        {children}
        {!loading && rightIcon}
      </button>
    );
  }
);

Button.displayName = "Button";

// Icon-only button variant
interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  "aria-label": string;
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  (
    { 
      className = "", 
      variant = "ghost", 
      size = "md", 
      loading = false,
      disabled,
      children, 
      ...props 
    },
    ref
  ) => {
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
      danger: "bg-transparent text-red-600 hover:bg-red-50 dark:hover:bg-red-600/10 focus-visible:ring-red-500",
    };

    const sizes = {
      sm: "h-9 w-9 min-h-[36px] min-w-[36px]",
      md: "h-11 w-11 min-h-[44px] min-w-[44px]",
      lg: "h-12 w-12 min-h-[48px] min-w-[48px]",
    };

    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : children}
      </button>
    );
  }
);

IconButton.displayName = "IconButton";

// Button group component
interface ButtonGroupProps {
  children: React.ReactNode;
  className?: string;
}

export function ButtonGroup({ children, className = "" }: ButtonGroupProps) {
  return (
    <div className={`inline-flex rounded-lg overflow-hidden border border-gray-300 dark:border-gray-700 ${className}`}>
      {children}
    </div>
  );
}

// Segmented control / toggle button group
interface ToggleGroupProps<T extends string> {
  value: T;
  onChange: (value: T) => void;
  options: { value: T; label: string; icon?: React.ReactNode }[];
  className?: string;
}

export function ToggleGroup<T extends string>({ 
  value, 
  onChange, 
  options,
  className = "" 
}: ToggleGroupProps<T>) {
  return (
    <div className={`inline-flex rounded-lg bg-gray-100 dark:bg-gray-800 p-1 ${className}`}>
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={`
            flex items-center gap-2 px-3 py-2 min-h-[36px] rounded-md text-sm font-medium
            transition-all duration-150
            ${value === option.value 
              ? "bg-white dark:bg-[#1c2128] text-gray-900 dark:text-gray-100 shadow-sm" 
              : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
            }
          `}
        >
          {option.icon}
          {option.label}
        </button>
      ))}
    </div>
  );
}
