import { ReactNode } from "react";
import { ChevronRight } from "lucide-react";
import Link from "next/link";

interface TransactionListProps {
  children: ReactNode;
  className?: string;
}

export function TransactionList({ children, className = "" }: TransactionListProps) {
  return (
    <div className={`bg-theme-elevated rounded-2xl shadow-theme border border-theme overflow-hidden ${className}`}>
      {children}
    </div>
  );
}

interface TransactionListHeaderProps {
  title: string;
  action?: {
    label: string;
    href: string;
  };
}

export function TransactionListHeader({ title, action }: TransactionListHeaderProps) {
  return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-theme">
      <h3 className="font-semibold text-theme-primary">{title}</h3>
      {action && (
        <Link 
          href={action.href}
          className="text-sm font-medium text-accent-600 dark:text-accent-400 hover:text-accent-700 flex items-center gap-1"
        >
          {action.label}
          <ChevronRight className="h-4 w-4" />
        </Link>
      )}
    </div>
  );
}

interface TransactionItemProps {
  icon?: ReactNode;
  iconBgColor?: string;
  title: string;
  subtitle?: string;
  amount: number | string;
  amountLabel?: string;
  status?: "overdue" | "due-soon" | "due-today" | "paid" | "pending";
  onClick?: () => void;
  href?: string;
}

export function TransactionItem({
  icon,
  iconBgColor = "bg-theme-tertiary",
  title,
  subtitle,
  amount,
  amountLabel,
  status,
  onClick,
  href,
}: TransactionItemProps) {
  const formattedAmount = typeof amount === "number" 
    ? `$${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    : amount;

  const statusStyles = {
    overdue: "text-danger-600 dark:text-danger-400",
    "due-soon": "text-warning-600 dark:text-warning-400",
    "due-today": "text-warning-600 dark:text-warning-400",
    paid: "text-success-600 dark:text-success-400",
    pending: "text-theme-secondary",
  };

  const statusDots = {
    overdue: "bg-danger-500",
    "due-soon": "bg-warning-500",
    "due-today": "bg-warning-500",
    paid: "bg-success-500",
    pending: "bg-theme-muted",
  };

  const content = (
    <div className="flex items-center gap-3 px-4 py-3 hover:bg-theme-secondary/50 transition-colors cursor-pointer active:bg-theme-tertiary">
      {/* Icon or Status Dot */}
      <div className={`flex-shrink-0 w-10 h-10 rounded-full ${iconBgColor} flex items-center justify-center`}>
        {icon || (status && <div className={`w-2.5 h-2.5 rounded-full ${statusDots[status]}`} />)}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="font-medium text-theme-primary truncate">{title}</p>
        {subtitle && (
          <p className="text-xs text-theme-muted mt-0.5">{subtitle}</p>
        )}
      </div>

      {/* Amount */}
      <div className="text-right flex-shrink-0">
        <p className={`font-semibold ${status ? statusStyles[status] : "text-theme-primary"}`}>
          {formattedAmount}
        </p>
        {amountLabel && (
          <p className="text-[10px] text-theme-muted uppercase tracking-wide mt-0.5">
            {amountLabel}
          </p>
        )}
      </div>

      <ChevronRight className="h-4 w-4 text-theme-muted flex-shrink-0" />
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  if (onClick) {
    return <button onClick={onClick} className="w-full text-left">{content}</button>;
  }

  return content;
}

interface TransactionEmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    href: string;
  };
}

export function TransactionEmptyState({
  icon,
  title,
  description,
  action,
}: TransactionEmptyStateProps) {
  return (
    <div className="py-12 px-6 text-center">
      {icon && (
        <div className="w-14 h-14 rounded-full bg-success-100 dark:bg-success-600/20 flex items-center justify-center mx-auto mb-4">
          {icon}
        </div>
      )}
      <p className="font-medium text-theme-secondary">{title}</p>
      {description && (
        <p className="text-sm text-theme-muted mt-1">{description}</p>
      )}
      {action && (
        <Link
          href={action.href}
          className="inline-flex items-center gap-1 mt-4 text-sm font-medium text-accent-600 dark:text-accent-400 hover:text-accent-700"
        >
          {action.label}
          <ChevronRight className="h-4 w-4" />
        </Link>
      )}
    </div>
  );
}

export function TransactionDivider() {
  return <div className="border-t border-theme" />;
}
