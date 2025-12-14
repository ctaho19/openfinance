import { useState, type ReactNode } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";

interface SectionCardProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  defaultOpen?: boolean;
  collapsible?: boolean;
  action?: ReactNode;
  linkHref?: string;
  linkText?: string;
}

export function SectionCard({
  title,
  subtitle,
  children,
  defaultOpen = true,
  collapsible = true,
  action,
  linkHref,
  linkText,
}: SectionCardProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="bg-white dark:bg-[#1c2128] rounded-xl border border-gray-200 dark:border-[#30363d] overflow-hidden">
      {/* Header - Chase style */}
      <div
        className={`
          flex items-center justify-between px-5 py-4
          ${collapsible ? "cursor-pointer hover:bg-gray-50 dark:hover:bg-[#21262d] transition-colors" : ""}
        `}
        onClick={collapsible ? () => setIsOpen(!isOpen) : undefined}
      >
        <div className="flex items-center gap-3 min-w-0">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate">
            {title}
          </h3>
          {subtitle && (
            <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full flex-shrink-0">
              {subtitle}
            </span>
          )}
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          {action && (
            <div onClick={(e) => e.stopPropagation()}>{action}</div>
          )}
          {linkHref && (
            <a
              href={linkHref}
              className="text-[#0060f0] hover:text-[#004dc0] text-sm font-medium inline-flex items-center gap-0.5"
              onClick={(e) => e.stopPropagation()}
            >
              {linkText || "See all"}
            </a>
          )}
          {collapsible && (
            <ChevronDown
              className={`h-5 w-5 text-gray-400 transition-transform duration-200 ${
                isOpen ? "" : "-rotate-90"
              }`}
            />
          )}
        </div>
      </div>

      {/* Content */}
      {isOpen && (
        <div className="px-5 pb-5">
          {children}
        </div>
      )}
    </div>
  );
}

interface ListItemProps {
  title: string;
  subtitle?: string;
  value?: string;
  valueSubtitle?: string;
  status?: "default" | "success" | "warning" | "danger";
  href?: string;
  icon?: ReactNode;
}

export function ChaseListItem({
  title,
  subtitle,
  value,
  valueSubtitle,
  status = "default",
  href,
  icon,
}: ListItemProps) {
  const statusColors = {
    default: "text-gray-900 dark:text-gray-100",
    success: "text-emerald-600 dark:text-emerald-400",
    warning: "text-amber-600 dark:text-amber-400",
    danger: "text-red-600 dark:text-red-400",
  };

  const content = (
    <div className="flex items-center justify-between py-3 group">
      <div className="flex items-center gap-3 min-w-0">
        {icon && (
          <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0">
            {icon}
          </div>
        )}
        <div className="min-w-0">
          <p className="font-medium text-gray-900 dark:text-gray-100 truncate">
            {title}
          </p>
          {subtitle && (
            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
              {subtitle}
            </p>
          )}
        </div>
      </div>
      
      <div className="flex items-center gap-2 flex-shrink-0">
        {value && (
          <div className="text-right">
            <p className={`font-semibold ${statusColors[status]}`}>
              {value}
            </p>
            {valueSubtitle && (
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {valueSubtitle}
              </p>
            )}
          </div>
        )}
        {href && (
          <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300" />
        )}
      </div>
    </div>
  );

  if (href) {
    return (
      <a
        href={href}
        className="block hover:bg-gray-50 dark:hover:bg-[#21262d] -mx-5 px-5 transition-colors"
      >
        {content}
      </a>
    );
  }

  return content;
}
