import { ReactNode } from "react";

interface AccountSummaryCardProps {
  title: string;
  subtitle?: string;
  primaryAmount: number;
  primaryLabel?: string;
  secondaryItems?: Array<{
    label: string;
    value: string;
  }>;
  children?: ReactNode;
}

export function AccountSummaryCard({
  title,
  subtitle,
  primaryAmount,
  primaryLabel = "Available",
  secondaryItems,
  children,
}: AccountSummaryCardProps) {
  const formattedAmount = primaryAmount.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

  return (
    <div className="bg-chase-gradient rounded-2xl shadow-theme-md overflow-hidden">
      <div className="px-5 py-6 lg:px-8 lg:py-8">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-label-light">{primaryLabel}</p>
            <h2 className="text-white font-semibold text-lg mt-0.5">{title}</h2>
          </div>
          {subtitle && (
            <span className="text-xs text-white/70 bg-white/10 px-2.5 py-1 rounded-full">
              {subtitle}
            </span>
          )}
        </div>

        {/* Primary Amount */}
        <div className="mb-6">
          <p className="text-balance-responsive text-white">
            ${formattedAmount}
          </p>
        </div>

        {/* Secondary Items */}
        {secondaryItems && secondaryItems.length > 0 && (
          <div className="flex flex-wrap gap-x-4 gap-y-2 sm:gap-x-6 sm:gap-y-3 pt-4 border-t border-white/20">
            {secondaryItems.map((item, index) => (
              <div key={index}>
                <p className="text-[10px] sm:text-[11px] text-white/60 uppercase tracking-wider font-medium">
                  {item.label}
                </p>
                <p className="text-sm sm:text-base text-white font-semibold mt-0.5">
                  {item.value}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Optional children for additional content */}
        {children}
      </div>
    </div>
  );
}

interface SimpleBalanceCardProps {
  label: string;
  amount: number;
  trend?: "up" | "down" | "neutral";
  subtitle?: string;
}

export function SimpleBalanceCard({
  label,
  amount,
  trend = "neutral",
  subtitle,
}: SimpleBalanceCardProps) {
  const formattedAmount = amount.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

  const trendColors = {
    up: "text-success-600 dark:text-success-400",
    down: "text-danger-600 dark:text-danger-400",
    neutral: "text-theme-primary",
  };

  return (
    <div className="bg-theme-elevated rounded-2xl shadow-theme p-4 lg:p-5 border border-theme">
      <p className="text-label">{label}</p>
      <p className={`text-2xl font-semibold mt-1 ${trendColors[trend]}`}>
        ${formattedAmount}
      </p>
      {subtitle && (
        <p className="text-xs text-theme-muted mt-1">{subtitle}</p>
      )}
    </div>
  );
}
