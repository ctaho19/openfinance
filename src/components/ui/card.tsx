"use client";

import { ReactNode } from "react";
import { ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";

interface CardProps {
  children: ReactNode;
  className?: string;
  variant?: "default" | "elevated" | "outlined" | "glass" | "gradient";
  hover?: boolean;
  animate?: boolean;
}

export function Card({ 
  children, 
  className = "", 
  variant = "default",
  hover = false,
  animate = false,
}: CardProps) {
  const baseStyles = "rounded-2xl overflow-hidden transition-all duration-200";
  
  const variants = {
    default: "bg-theme-elevated border border-theme shadow-theme",
    elevated: "bg-theme-elevated border border-theme shadow-theme-md",
    outlined: "bg-transparent border-2 border-theme",
    glass: "glass border border-theme/50 shadow-theme-lg",
    gradient: "bg-chase-gradient border-0 text-white shadow-theme-md",
  };
  
  const hoverStyles = hover 
    ? "card-hover-lift cursor-pointer" 
    : "";
  
  const animateStyles = animate ? "animate-fade-in-up" : "";

  return (
    <div className={`${baseStyles} ${variants[variant]} ${hoverStyles} ${animateStyles} ${className}`}>
      {children}
    </div>
  );
}

interface CardHeaderProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  action?: ReactNode;
}

export function CardHeader({
  children,
  className = "",
  onClick,
  action,
}: CardHeaderProps) {
  return (
    <div
      className={`px-6 py-4 border-b border-theme flex items-center justify-between ${className}`}
      onClick={onClick}
    >
      <div className="flex-1">{children}</div>
      {action && <div className="ml-4">{action}</div>}
    </div>
  );
}

export function CardTitle({
  children,
  className = "",
  as: Component = "h3",
}: {
  children: ReactNode;
  className?: string;
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
}) {
  return (
    <Component className={`text-lg font-semibold text-theme-primary tracking-tight ${className}`}>
      {children}
    </Component>
  );
}

export function CardDescription({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <p className={`text-sm text-theme-secondary mt-1 ${className}`}>
      {children}
    </p>
  );
}

export function CardContent({
  children,
  className = "",
  noPadding = false,
}: {
  children: ReactNode;
  className?: string;
  noPadding?: boolean;
}) {
  return (
    <div className={noPadding ? className : `px-6 py-4 ${className}`}>
      {children}
    </div>
  );
}

export function CardFooter({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`px-6 py-4 border-t border-theme bg-theme-secondary/50 ${className}`}>
      {children}
    </div>
  );
}

// Specialized stat card for dashboard metrics
interface StatCardProps {
  label: string;
  value: string | number;
  icon?: ReactNode;
  trend?: {
    value: number;
    direction: "up" | "down" | "neutral";
  };
  variant?: "default" | "success" | "warning" | "danger" | "info";
  className?: string;
}

export function StatCard({
  label,
  value,
  icon,
  trend,
  variant = "default",
  className = "",
}: StatCardProps) {
  const trendColors = {
    up: "text-success-600 dark:text-success-500",
    down: "text-danger-600 dark:text-danger-500",
    neutral: "text-theme-muted",
  };

  const iconClasses: Record<string, string> = {
    default: "bg-theme-tertiary text-theme-secondary",
    success: "bg-success-100 text-success-600 dark:bg-success-600/20 dark:text-success-400",
    warning: "bg-warning-100 text-warning-600 dark:bg-warning-600/20 dark:text-warning-400",
    danger: "bg-danger-100 text-danger-600 dark:bg-danger-600/20 dark:text-danger-400",
    info: "bg-info-100 text-info-600 dark:bg-info-600/20 dark:text-info-400",
  };

  return (
    <Card className={className}>
      <CardContent className="py-5">
        <div className="flex items-center gap-4">
          {icon && (
            <div className={`p-3 rounded-xl ${iconClasses[variant]}`}>
              {icon}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-theme-secondary truncate">{label}</p>
            <p className="text-2xl font-bold text-theme-primary tracking-tight mt-0.5">
              {value}
            </p>
            {trend && (
              <p className={`text-xs font-medium mt-1 flex items-center gap-1 ${trendColors[trend.direction]}`}>
                {trend.direction === "up" && <ArrowUpRight className="h-3 w-3" />}
                {trend.direction === "down" && <ArrowDownRight className="h-3 w-3" />}
                {trend.direction === "neutral" && <Minus className="h-3 w-3" />}
                {trend.value > 0 ? "+" : ""}{trend.value}% from last period
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
