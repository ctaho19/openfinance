import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export type PeriodType = "previous" | "current" | "next";

interface PeriodSelectorProps {
  currentPeriodLabel: string;
  previousPeriodLabel: string;
  nextPeriodLabel: string;
  defaultPeriod?: PeriodType;
  onPeriodChange?: (period: PeriodType) => void;
}

export function PeriodSelector({
  currentPeriodLabel,
  previousPeriodLabel,
  nextPeriodLabel,
  defaultPeriod = "current",
  onPeriodChange,
}: PeriodSelectorProps) {
  const [activePeriod, setActivePeriod] = useState<PeriodType>(defaultPeriod);

  const periods: { key: PeriodType; label: string }[] = [
    { key: "previous", label: "Previous" },
    { key: "current", label: "Current" },
    { key: "next", label: "Next" },
  ];

  const handlePeriodChange = (period: PeriodType) => {
    setActivePeriod(period);
    onPeriodChange?.(period);

    const params = new URLSearchParams(window.location.search);
    if (period === "current") {
      params.delete("period");
    } else {
      params.set("period", period);
    }
    const newUrl =
      window.location.pathname + (params.toString() ? `?${params}` : "");
    window.history.pushState({}, "", newUrl);
    window.location.reload();
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const period = params.get("period") as PeriodType | null;
    if (period && ["previous", "current", "next"].includes(period)) {
      setActivePeriod(period);
    }
  }, []);

  const periodLabels: Record<PeriodType, string> = {
    previous: previousPeriodLabel,
    current: currentPeriodLabel,
    next: nextPeriodLabel,
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <button
          onClick={() =>
            handlePeriodChange(
              activePeriod === "next"
                ? "current"
                : activePeriod === "current"
                  ? "previous"
                  : "previous"
            )
          }
          disabled={activePeriod === "previous"}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="h-5 w-5 text-gray-600 dark:text-gray-400" />
        </button>

        <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
          {periods.map((period) => (
            <button
              key={period.key}
              onClick={() => handlePeriodChange(period.key)}
              className={`
                px-4 py-2 text-sm font-medium rounded-md transition-all duration-200
                ${
                  activePeriod === period.key
                    ? "bg-white dark:bg-[#1c2128] text-gray-900 dark:text-gray-100 shadow-sm"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
                }
              `}
            >
              {period.label}
            </button>
          ))}
        </div>

        <button
          onClick={() =>
            handlePeriodChange(
              activePeriod === "previous"
                ? "current"
                : activePeriod === "current"
                  ? "next"
                  : "next"
            )
          }
          disabled={activePeriod === "next"}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight className="h-5 w-5 text-gray-600 dark:text-gray-400" />
        </button>
      </div>

      <p className="text-center text-sm text-gray-500 dark:text-gray-400">
        {periodLabels[activePeriod]}
      </p>
    </div>
  );
}
