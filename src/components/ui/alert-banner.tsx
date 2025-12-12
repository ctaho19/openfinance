import { type ReactNode } from "react";
import { AlertTriangle, Info, CheckCircle, XCircle } from "lucide-react";

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
    bg: "bg-info-100 dark:bg-info-600/20",
    border: "border-info-500/30",
    icon: Info,
    iconColor: "text-info-600 dark:text-info-400",
  },
  success: {
    bg: "bg-success-100 dark:bg-success-600/20",
    border: "border-success-500/30",
    icon: CheckCircle,
    iconColor: "text-success-600 dark:text-success-400",
  },
  warning: {
    bg: "bg-warning-100 dark:bg-warning-600/20",
    border: "border-warning-500/30",
    icon: AlertTriangle,
    iconColor: "text-warning-600 dark:text-warning-400",
  },
  error: {
    bg: "bg-danger-100 dark:bg-danger-600/20",
    border: "border-danger-500/30",
    icon: XCircle,
    iconColor: "text-danger-600 dark:text-danger-400",
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
      <div className="flex-1 text-sm text-theme-primary">{children}</div>
      {dismissible && onDismiss && (
        <button
          onClick={onDismiss}
          className="flex-shrink-0 p-1 rounded hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          aria-label="Dismiss"
        >
          <XCircle className="h-4 w-4 text-theme-muted" />
        </button>
      )}
    </div>
  );
}
