"use client";

import { ReactNode } from "react";

interface BadgeProps {
  children: ReactNode;
  variant?: "default" | "success" | "warning" | "danger" | "info" | "accent";
  size?: "sm" | "md" | "lg";
  dot?: boolean;
  pulse?: boolean;
  className?: string;
}

export function Badge({
  children,
  variant = "default",
  size = "md",
  dot = false,
  pulse = false,
  className = "",
}: BadgeProps) {
  const baseStyles = `
    inline-flex items-center gap-1.5
    font-medium rounded-full
    whitespace-nowrap
    transition-colors duration-200
  `;

  const variants = {
    default: "bg-theme-tertiary text-theme-secondary border border-theme",
    success: "bg-success-50 text-success-700 border border-success-200 dark:bg-success-600/15 dark:text-success-400 dark:border-success-600/30",
    warning: "bg-warning-50 text-warning-700 border border-warning-200 dark:bg-warning-600/15 dark:text-warning-400 dark:border-warning-600/30",
    danger: "bg-danger-50 text-danger-700 border border-danger-200 dark:bg-danger-600/15 dark:text-danger-400 dark:border-danger-600/30",
    info: "bg-info-50 text-info-700 border border-info-200 dark:bg-info-600/15 dark:text-info-400 dark:border-info-600/30",
    accent: "bg-accent-50 text-accent-700 border border-accent-200 dark:bg-accent-600/15 dark:text-accent-400 dark:border-accent-600/30",
  };

  const sizes = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-2.5 py-0.5 text-xs",
    lg: "px-3 py-1 text-sm",
  };

  const dotColors = {
    default: "bg-theme-muted",
    success: "bg-success-500",
    warning: "bg-warning-500",
    danger: "bg-danger-500",
    info: "bg-info-500",
    accent: "bg-accent-500",
  };

  return (
    <span className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}>
      {dot && (
        <span className={`w-1.5 h-1.5 rounded-full ${dotColors[variant]} ${pulse ? "animate-pulse-subtle" : ""}`} />
      )}
      {children}
    </span>
  );
}

// Status badge - more prominent, for key status indicators
interface StatusBadgeProps {
  status: "active" | "inactive" | "pending" | "paid" | "unpaid" | "overdue" | "current" | "deferred";
  className?: string;
}

const statusConfig: Record<StatusBadgeProps["status"], { label: string; variant: BadgeProps["variant"]; dot?: boolean }> = {
  active: { label: "Active", variant: "success", dot: true },
  inactive: { label: "Inactive", variant: "default" },
  pending: { label: "Pending", variant: "warning", dot: true },
  paid: { label: "Paid", variant: "success" },
  unpaid: { label: "Unpaid", variant: "warning" },
  overdue: { label: "Overdue", variant: "danger", dot: true },
  current: { label: "Current", variant: "success" },
  deferred: { label: "Deferred", variant: "info" },
};

export function StatusBadge({ status, className = "" }: StatusBadgeProps) {
  const config = statusConfig[status];
  return (
    <Badge 
      variant={config.variant} 
      dot={config.dot}
      className={className}
    >
      {config.label}
    </Badge>
  );
}

// Category badge - for bill/debt categories
interface CategoryBadgeProps {
  category: string;
  className?: string;
}

const categoryVariants: Record<string, BadgeProps["variant"]> = {
  SUBSCRIPTION: "info",
  UTILITY: "warning",
  LOAN: "danger",
  BNPL: "danger",
  INSURANCE: "success",
  CREDIT_CARD: "danger",
  OTHER: "default",
};

export function CategoryBadge({ category, className = "" }: CategoryBadgeProps) {
  const variant = categoryVariants[category] || "default";
  const label = category.replace(/_/g, " ").toLowerCase();
  
  return (
    <Badge variant={variant} size="sm" className={`capitalize ${className}`}>
      {label}
    </Badge>
  );
}

// Count badge - for showing counts/numbers
interface CountBadgeProps {
  count: number;
  max?: number;
  variant?: BadgeProps["variant"];
  className?: string;
}

export function CountBadge({ count, max = 99, variant = "accent", className = "" }: CountBadgeProps) {
  const displayCount = count > max ? `${max}+` : count.toString();
  
  return (
    <Badge variant={variant} size="sm" className={`min-w-[1.5rem] justify-center ${className}`}>
      {displayCount}
    </Badge>
  );
}
