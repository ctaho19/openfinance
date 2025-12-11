import { useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";

interface SectionCardProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  defaultOpen?: boolean;
  collapsible?: boolean;
  action?: ReactNode;
}

export function SectionCard({
  title,
  subtitle,
  children,
  defaultOpen = true,
  collapsible = true,
  action,
}: SectionCardProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="bg-theme-elevated rounded-2xl shadow-theme border border-theme overflow-hidden">
      <div
        className={`
          flex items-center justify-between px-5 py-4
          ${collapsible ? "cursor-pointer hover:bg-theme-secondary/30 transition-colors" : ""}
        `}
        onClick={collapsible ? () => setIsOpen(!isOpen) : undefined}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3">
            <h3 className="font-semibold text-theme-primary">{title}</h3>
            {subtitle && (
              <span className="text-xs text-theme-muted bg-theme-secondary px-2 py-0.5 rounded-full">
                {subtitle}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {action && <div onClick={(e) => e.stopPropagation()}>{action}</div>}
          {collapsible && (
            <ChevronDown
              className={`h-5 w-5 text-theme-muted transition-transform duration-200 ${
                isOpen ? "rotate-180" : ""
              }`}
            />
          )}
        </div>
      </div>

      {isOpen && <div className="px-5 pb-5">{children}</div>}
    </div>
  );
}
