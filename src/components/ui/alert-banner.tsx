import { type ReactNode } from "react";
import { AlertTriangle, Info, CheckCircle, XCircle, X } from "lucide-react";

type Severity = "info" | "success" | "warning" | "error";

interface AlertBannerProps {
  children: ReactNode;
  severity?: Severity;
  icon?: ReactNode;
  dismissible?: boolean;
  onDismiss?: () => void;
}

const severityConfig: Record<
  Severity,
  {
    bg: string;
    border: string;
    icon: typeof Info;
    iconColor: string;
  }
> = {
  info: {
    bg: "bg-blue-50 dark:bg-blue-900/20",
    border: "border-blue-200 dark:border-blue-800/50",
    icon: Info,
    iconColor: "text-blue-600 dark:text-blue-400",
  },
  success: {
    bg: "bg-emerald-50 dark:bg-emerald-900/20",
    border: "border-emerald-200 dark:border-emerald-800/50",
    icon: CheckCircle,
    iconColor: "text-emerald-600 dark:text-emerald-400",
  },
  warning: {
    bg: "bg-amber-50 dark:bg-amber-900/20",
    border: "border-amber-200 dark:border-amber-800/50",
    icon: AlertTriangle,
    iconColor: "text-amber-600 dark:text-amber-400",
  },
  error: {
    bg: "bg-red-50 dark:bg-red-900/20",
    border: "border-red-200 dark:border-red-800/50",
    icon: XCircle,
    iconColor: "text-red-600 dark:text-red-400",
  },
};

export function AlertBanner({
  children,
  severity = "info",
  icon,
  dismissible = false,
  onDismiss,
}: AlertBannerProps) {
  const config = severityConfig[severity];
  const IconComponent = config.icon;

  return (
    <div
      className={`
        flex items-start gap-3 px-4 py-3 rounded-xl border
        ${config.bg} ${config.border}
      `}
      role="alert"
    >
      <div className={`flex-shrink-0 mt-0.5 ${config.iconColor}`}>
        {icon || <IconComponent className="h-5 w-5" />}
      </div>
      <div className="flex-1 text-sm text-gray-800 dark:text-gray-200">{children}</div>
      {dismissible && onDismiss && (
        <button
          onClick={onDismiss}
          className="flex-shrink-0 p-1 rounded hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          aria-label="Dismiss"
        >
          <X className="h-4 w-4 text-gray-500 dark:text-gray-400" />
        </button>
      )}
    </div>
  );
}
