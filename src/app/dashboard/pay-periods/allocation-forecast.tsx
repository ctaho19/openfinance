"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Calendar, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

interface ForecastPeriod {
  periodLabel: string;
  startDate: string;
  endDate: string;
  allocations: {
    bankId: string | null;
    bankName: string;
    bankType: string;
    amount: number;
  }[];
  totalAmount: number;
}

interface AllocationForecastProps {
  periods: ForecastPeriod[];
}

const BANK_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  NAVY_FEDERAL: { bg: "bg-blue-100 dark:bg-blue-600/20", text: "text-blue-700 dark:text-blue-400", dot: "bg-blue-600" },
  PNC: { bg: "bg-orange-100 dark:bg-orange-600/20", text: "text-orange-700 dark:text-orange-400", dot: "bg-orange-500" },
  CAPITAL_ONE: { bg: "bg-red-100 dark:bg-red-600/20", text: "text-red-700 dark:text-red-400", dot: "bg-red-600" },
  TRUIST: { bg: "bg-purple-100 dark:bg-purple-600/20", text: "text-purple-700 dark:text-purple-400", dot: "bg-purple-600" },
  CHASE: { bg: "bg-blue-100 dark:bg-blue-600/20", text: "text-blue-700 dark:text-blue-400", dot: "bg-blue-800" },
  BANK_OF_AMERICA: { bg: "bg-red-100 dark:bg-red-600/20", text: "text-red-700 dark:text-red-400", dot: "bg-red-700" },
  WELLS_FARGO: { bg: "bg-yellow-100 dark:bg-yellow-600/20", text: "text-yellow-700 dark:text-yellow-400", dot: "bg-yellow-600" },
  OTHER: { bg: "bg-gray-100 dark:bg-gray-600/20", text: "text-gray-700 dark:text-gray-400", dot: "bg-gray-600" },
};

function ForecastPeriodCard({ period, index }: { period: ForecastPeriod; index: number }) {
  const [expanded, setExpanded] = useState(index === 0);

  return (
    <div className="border border-theme rounded-xl overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-theme-secondary/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-theme-tertiary">
            <Calendar className="h-4 w-4 text-theme-secondary" />
          </div>
          <div className="text-left">
            <p className="font-medium text-theme-primary">{period.periodLabel}</p>
            <p className="text-xs text-theme-muted">{period.startDate} - {period.endDate}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="font-bold text-theme-primary">
              ${period.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-theme-muted">{period.allocations.length} account{period.allocations.length !== 1 ? "s" : ""}</p>
          </div>
          {expanded ? (
            <ChevronUp className="h-5 w-5 text-theme-muted" />
          ) : (
            <ChevronDown className="h-5 w-5 text-theme-muted" />
          )}
        </div>
      </button>

      {expanded && period.allocations.length > 0 && (
        <div className="border-t border-theme px-4 py-3 space-y-2">
          {period.allocations.map((alloc) => {
            const colors = BANK_COLORS[alloc.bankType] || BANK_COLORS.OTHER;
            return (
              <div
                key={alloc.bankId || "unassigned"}
                className="flex items-center justify-between py-1"
              >
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${colors.dot}`} />
                  <span className="text-sm text-theme-secondary">{alloc.bankName}</span>
                </div>
                <span className={`text-sm font-medium ${colors.text}`}>
                  ${alloc.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function AllocationForecast({ periods }: AllocationForecastProps) {
  if (periods.length === 0) {
    return null;
  }

  const totalForecast = periods.reduce((sum, p) => sum + p.totalAmount, 0);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-success-100 dark:bg-success-600/20">
              <TrendingUp className="h-5 w-5 text-success-600 dark:text-success-400" />
            </div>
            <div>
              <CardTitle>Allocation Forecast</CardTitle>
              <p className="text-sm text-theme-secondary mt-0.5">
                Upcoming {periods.length} pay period{periods.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-theme-secondary">Total Forecast</p>
            <p className="text-2xl font-bold text-success-600 dark:text-success-400">
              ${totalForecast.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {periods.map((period, index) => (
            <ForecastPeriodCard key={period.periodLabel} period={period} index={index} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
