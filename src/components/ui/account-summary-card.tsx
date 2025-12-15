import { ReactNode } from "react";
import { ChevronDown } from "lucide-react";

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
  primaryLabel = "Total accounts",
  secondaryItems,
  children,
}: AccountSummaryCardProps) {
  const formattedAmount = primaryAmount.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return (
    <div className="bg-white dark:bg-[#1c2128] rounded-xl border border-gray-200 dark:border-[#30363d] shadow-sm overflow-hidden">
      {/* Collapsible Header - Chase style */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-[#30363d]">
        <div className="flex items-center gap-2">
          <h2 className="font-semibold text-gray-900 dark:text-gray-100">
            {title}
          </h2>
          {subtitle && (
            <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full">
              {subtitle}
            </span>
          )}
        </div>
        <ChevronDown className="h-5 w-5 text-gray-400" />
      </div>

      <div className="px-5 py-5">
        {/* Balance Display - Chase style with large numbers */}
        <div>
          <p className="text-[2.5rem] leading-none font-normal text-gray-900 dark:text-gray-100 tracking-tight">
            ${formattedAmount}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            {primaryLabel}
          </p>
        </div>

        {/* Secondary Items */}
        {secondaryItems && secondaryItems.length > 0 && (
          <div className="flex flex-wrap gap-x-8 gap-y-3 mt-6 pt-4 border-t border-gray-100 dark:border-[#30363d]">
            {secondaryItems.map((item, index) => (
              <div key={index}>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                  {item.label}
                </p>
                <p className="text-gray-900 dark:text-gray-100 font-medium mt-0.5">
                  {item.value}
                </p>
              </div>
            ))}
          </div>
        )}

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
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const trendColors = {
    up: "text-emerald-600 dark:text-emerald-400",
    down: "text-red-600 dark:text-red-400",
    neutral: "text-gray-900 dark:text-gray-100",
  };

  return (
    <div className="bg-white dark:bg-[#1c2128] rounded-xl border border-gray-200 dark:border-[#30363d] p-4 lg:p-5">
      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
        {label}
      </p>
      <p className={`text-2xl font-medium mt-1.5 tracking-tight ${trendColors[trend]}`}>
        ${formattedAmount}
      </p>
      {subtitle && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{subtitle}</p>
      )}
    </div>
  );
}
