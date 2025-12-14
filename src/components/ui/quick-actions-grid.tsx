import { Link } from "./link";
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
    <div className={`grid ${gridCols[columns]} gap-2`}>
      {actions.map((action) => {
        const Icon = action.icon;
        return (
          <Link
            key={action.label}
            href={action.href}
            className="flex flex-col items-center justify-center py-4 px-2 rounded-lg hover:bg-gray-50 dark:hover:bg-[#21262d] transition-colors group"
          >
            <div className="relative">
              <div className="
                w-11 h-11 lg:w-12 lg:h-12 
                rounded-full 
                bg-[#e6f2fc] dark:bg-[#0060f0]/15
                flex items-center justify-center
                transition-all duration-150
                group-hover:scale-105
                group-active:scale-95
              ">
                <Icon className="h-5 w-5 lg:h-5 lg:w-5 text-[#0060f0] dark:text-[#60a5fa]" />
              </div>
              {action.badge && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {action.badge}
                </span>
              )}
            </div>
            <span className="text-[11px] lg:text-xs font-medium text-gray-700 dark:text-gray-300 mt-2 text-center leading-tight">
              {action.label}
            </span>
          </Link>
        );
      })}
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
    primary: "bg-[#e6f2fc] dark:bg-[#0060f0]/15 text-[#0060f0] dark:text-[#60a5fa]",
    secondary: "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400",
    danger: "bg-red-50 dark:bg-red-600/15 text-red-600 dark:text-red-400",
    warning: "bg-amber-50 dark:bg-amber-600/15 text-amber-600 dark:text-amber-400",
  };

  const content = (
    <div className="flex flex-col items-center justify-center py-4 px-2 rounded-lg hover:bg-gray-50 dark:hover:bg-[#21262d] transition-colors group cursor-pointer">
      <div className={`
        w-11 h-11 lg:w-12 lg:h-12 
        rounded-full 
        ${variantStyles[variant]}
        flex items-center justify-center
        transition-all duration-150
        group-hover:scale-105
        group-active:scale-95
      `}>
        <Icon className="h-5 w-5 lg:h-5 lg:w-5" />
      </div>
      <span className="text-[11px] lg:text-xs font-medium text-gray-700 dark:text-gray-300 mt-2 text-center leading-tight">
        {label}
      </span>
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return <button onClick={onClick}>{content}</button>;
}
