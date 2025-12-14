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
  const baseStyles = "rounded-xl overflow-hidden transition-all duration-150";
  
  const variants = {
    default: "bg-white dark:bg-[#1c2128] border border-gray-200 dark:border-[#30363d] shadow-sm",
    elevated: "bg-white dark:bg-[#1c2128] border border-gray-200 dark:border-[#30363d] shadow-md",
    outlined: "bg-transparent border border-gray-200 dark:border-[#30363d]",
    glass: "bg-white/90 dark:bg-[#1c2128]/90 backdrop-blur-lg border border-gray-200/50 dark:border-[#30363d]/50 shadow-lg",
    gradient: "bg-gradient-to-br from-[#0060f0] to-[#0a3254] border-0 text-white shadow-md",
  };
  
  const hoverStyles = hover 
    ? "hover:shadow-md hover:border-gray-300 dark:hover:border-[#484f58] cursor-pointer" 
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
      className={`px-5 py-4 border-b border-gray-100 dark:border-[#30363d] flex items-center justify-between ${className}`}
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
    <Component className={`text-lg font-semibold text-gray-900 dark:text-gray-100 tracking-tight ${className}`}>
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
    <p className={`text-sm text-gray-500 dark:text-gray-400 mt-1 ${className}`}>
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
    <div className={noPadding ? className : `px-5 py-5 ${className}`}>
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
    <div className={`px-5 py-4 border-t border-gray-100 dark:border-[#30363d] bg-gray-50 dark:bg-[#161b22] ${className}`}>
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
    up: "text-emerald-600 dark:text-emerald-400",
    down: "text-red-600 dark:text-red-400",
    neutral: "text-gray-500 dark:text-gray-400",
  };

  const iconClasses: Record<string, string> = {
    default: "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400",
    success: "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400",
    warning: "bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400",
    danger: "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400",
    info: "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400",
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
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">{label}</p>
            <p className="text-2xl font-medium text-gray-900 dark:text-gray-100 tracking-tight mt-0.5">
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
