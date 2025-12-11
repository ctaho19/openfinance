import Link from "next/link";
import { LucideIcon } from "lucide-react";

interface QuickAction {
  label: string;
  icon: LucideIcon;
  href: string;
  badge?: string;
}

interface QuickActionsGridProps {
  actions: QuickAction[];
  columns?: 3 | 4 | 5;
}

export function QuickActionsGrid({ actions, columns = 4 }: QuickActionsGridProps) {
  const gridCols = {
    3: "grid-cols-3",
    4: "grid-cols-4",
    5: "grid-cols-5",
  };

  return (
    <div className={`grid ${gridCols[columns]} gap-3 lg:gap-4`}>
      {actions.map((action) => (
        <Link
          key={action.label}
          href={action.href}
          className="flex flex-col items-center justify-center py-4 px-2 min-h-[80px] min-w-[64px] group"
        >
          <div className="relative">
            <div className="
              w-12 h-12 lg:w-14 lg:h-14 
              rounded-full 
              bg-accent-50 dark:bg-accent-600/20
              flex items-center justify-center
              transition-all duration-200
              group-hover:bg-accent-100 dark:group-hover:bg-accent-600/30
              group-hover:scale-105
              group-active:scale-95
            ">
              <action.icon className="h-5 w-5 lg:h-6 lg:w-6 text-accent-600 dark:text-accent-400" />
            </div>
            {action.badge && (
              <span className="absolute -top-1 -right-1 bg-danger-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                {action.badge}
              </span>
            )}
          </div>
          <span className="text-[11px] lg:text-xs font-medium text-theme-primary mt-2 text-center leading-tight">
            {action.label}
          </span>
        </Link>
      ))}
    </div>
  );
}

interface QuickActionButtonProps {
  icon: LucideIcon;
  label: string;
  onClick?: () => void;
  href?: string;
  variant?: "primary" | "secondary" | "danger" | "warning";
}

export function QuickActionButton({
  icon: Icon,
  label,
  onClick,
  href,
  variant = "primary",
}: QuickActionButtonProps) {
  const variantStyles = {
    primary: "bg-accent-50 dark:bg-accent-600/20 text-accent-600 dark:text-accent-400",
    secondary: "bg-theme-tertiary text-theme-secondary",
    danger: "bg-danger-50 dark:bg-danger-600/20 text-danger-600 dark:text-danger-400",
    warning: "bg-warning-50 dark:bg-warning-600/20 text-warning-600 dark:text-warning-400",
  };

  const content = (
    <div className="flex flex-col items-center justify-center py-4 px-2 min-h-[80px] min-w-[64px] group cursor-pointer">
      <div className={`
        w-12 h-12 lg:w-14 lg:h-14 
        rounded-full 
        ${variantStyles[variant]}
        flex items-center justify-center
        transition-all duration-200
        group-hover:scale-105
        group-active:scale-95
      `}>
        <Icon className="h-5 w-5 lg:h-6 lg:w-6" />
      </div>
      <span className="text-[11px] lg:text-xs font-medium text-theme-primary mt-2 text-center leading-tight">
        {label}
      </span>
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return <button onClick={onClick}>{content}</button>;
}
