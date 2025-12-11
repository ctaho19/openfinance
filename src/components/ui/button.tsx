"use client";

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
      transition-all duration-200
      focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
      disabled:opacity-50 disabled:cursor-not-allowed
      active:scale-95
    `;

    const variants = {
      primary: "bg-accent-600 text-white hover:bg-accent-700 focus-visible:ring-accent-500",
      secondary: "bg-theme-tertiary text-theme-primary hover:bg-theme-secondary border border-theme focus-visible:ring-accent-500",
      ghost: "bg-transparent text-theme-secondary hover:text-theme-primary hover:bg-theme-tertiary focus-visible:ring-accent-500",
      danger: "bg-transparent text-danger-600 hover:bg-danger-50 dark:hover:bg-danger-600/10 focus-visible:ring-danger-500",
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
    <div className={`inline-flex rounded-lg overflow-hidden border border-theme ${className}`}>
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
    <div className={`inline-flex rounded-lg bg-theme-tertiary p-1 ${className}`}>
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={`
            flex items-center gap-2 px-3 py-2 min-h-[36px] rounded-md text-sm font-medium
            transition-all duration-200
            ${value === option.value 
              ? "bg-theme-elevated text-theme-primary shadow-sm" 
              : "text-theme-secondary hover:text-theme-primary"
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
