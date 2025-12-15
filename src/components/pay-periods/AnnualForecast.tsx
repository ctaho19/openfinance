import { useState, useMemo } from "react";
import { Calendar, ChevronDown, ChevronUp, TrendingUp, DollarSign, AlertTriangle, Building2, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { BankBadge } from "@/components/banks/bank-badge";

interface BankAllocation {
  accountId: string | null;
  accountName: string;
  bank: string;
  lastFour: string | null;
  total: number;
  bills: Array<{ name: string; amount: number; dueDate: string }>;
}

interface ForecastPeriod {
  period: {
    startDate: string;
    endDate: string;
    paycheckDate: string;
  };
  totalBills: number;
  projectedBalance: number;
  paymentCount: number;
  allocations?: BankAllocation[];
}

interface AnnualForecastProps {
  forecastData: ForecastPeriod[];
  paycheckAmount: number;
}

export function AnnualForecast({ forecastData, paycheckAmount }: AnnualForecastProps) {
  const [visibleCount, setVisibleCount] = useState(3);
  const [isExpanded, setIsExpanded] = useState(false);

  const visiblePeriods = useMemo(() => {
    return forecastData.slice(0, visibleCount);
  }, [forecastData, visibleCount]);

  const stats = useMemo(() => {
    const totalBillsAmount = forecastData.reduce((sum, f) => sum + f.totalBills, 0);
    const totalBillCount = forecastData.reduce((sum, f) => sum + f.paymentCount, 0);
    const avgPerPeriod = forecastData.length > 0 ? totalBillsAmount / forecastData.length : 0;
    
    const monthlyTotals = new Map<string, number>();
    forecastData.forEach((f) => {
      const month = format(new Date(f.period.startDate), "MMM yyyy");
      monthlyTotals.set(month, (monthlyTotals.get(month) || 0) + f.totalBills);
    });

    let highestMonth = "";
    let highestAmount = 0;
    monthlyTotals.forEach((amount, month) => {
      if (amount > highestAmount) {
        highestAmount = amount;
        highestMonth = month;
      }
    });

    const periodsWithDeficit = forecastData.filter((f) => f.projectedBalance < 0).length;

    return {
      totalBillsAmount,
      totalBillCount,
      avgPerPeriod,
      highestMonth,
      highestAmount,
      periodsWithDeficit,
    };
  }, [forecastData]);

  const handleShowMore = () => {
    setVisibleCount((prev) => Math.min(prev + 6, forecastData.length));
  };

  const handleShowLess = () => {
    setVisibleCount(3);
    setIsExpanded(false);
  };

  const toggleExpanded = () => {
    if (isExpanded) {
      setVisibleCount(3);
    } else {
      setVisibleCount(forecastData.length);
    }
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="bg-white dark:bg-[#1c2128] rounded-xl border border-gray-200 dark:border-[#30363d] overflow-hidden">
      <div
        className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-[#21262d] transition-colors"
        onClick={toggleExpanded}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
            <TrendingUp className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">
              Annual Forecast
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Next {forecastData.length} pay periods ({Math.round(forecastData.length / 2)} months)
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full">
            ${stats.totalBillsAmount.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })} total
          </span>
          <ChevronDown
            className={`h-5 w-5 text-gray-400 transition-transform duration-200 ${
              isExpanded ? "rotate-180" : ""
            }`}
          />
        </div>
      </div>

      {isExpanded && (
        <div className="px-5 pb-5">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <DollarSign className="h-4 w-4 text-gray-400" />
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  Total Bills
                </p>
              </div>
              <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                ${stats.totalBillsAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {stats.totalBillCount} payments
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <Calendar className="h-4 w-4 text-gray-400" />
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  Avg/Period
                </p>
              </div>
              <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                ${stats.avgPerPeriod.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                per pay period
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="h-4 w-4 text-gray-400" />
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  Highest Month
                </p>
              </div>
              <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {stats.highestMonth || "N/A"}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                ${stats.highestAmount.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })} in bills
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <AlertTriangle className="h-4 w-4 text-gray-400" />
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  Tight Periods
                </p>
              </div>
              <p className={`text-lg font-semibold ${
                stats.periodsWithDeficit > 0 
                  ? "text-red-600 dark:text-red-400" 
                  : "text-emerald-600 dark:text-emerald-400"
              }`}>
                {stats.periodsWithDeficit}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                projected deficit
              </p>
            </div>
          </div>

          <div className="space-y-2">
            {visiblePeriods.map((forecast, index) => (
              <ForecastRow 
                key={index} 
                forecast={forecast} 
                paycheckAmount={paycheckAmount}
                index={index}
              />
            ))}
          </div>

          {forecastData.length > 3 && (
            <div className="flex items-center justify-center gap-3 mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
              {visibleCount < forecastData.length && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleShowMore();
                  }}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                >
                  <ChevronDown className="h-4 w-4" />
                  Show More ({forecastData.length - visibleCount} remaining)
                </button>
              )}
              {visibleCount > 3 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleShowLess();
                  }}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <ChevronUp className="h-4 w-4" />
                  Show Less
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {!isExpanded && (
        <div className="px-5 pb-5">
          <div className="space-y-2">
            {visiblePeriods.slice(0, 3).map((forecast, index) => (
              <ForecastRow 
                key={index} 
                forecast={forecast} 
                paycheckAmount={paycheckAmount}
                index={index}
                compact
              />
            ))}
          </div>
          {forecastData.length > 3 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleExpanded();
              }}
              className="w-full mt-3 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <ChevronDown className="h-4 w-4" />
              View Full Year Forecast ({forecastData.length - 3} more periods)
            </button>
          )}
        </div>
      )}
    </div>
  );
}

interface ForecastRowProps {
  forecast: ForecastPeriod;
  paycheckAmount: number;
  index: number;
  compact?: boolean;
}

function ForecastRow({ forecast, paycheckAmount, index, compact }: ForecastRowProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const startDate = new Date(forecast.period.startDate);
  const endDate = new Date(forecast.period.endDate);
  const utilizationPercent = paycheckAmount > 0 
    ? Math.min((forecast.totalBills / paycheckAmount) * 100, 100) 
    : 0;

  const getUtilizationColor = (percent: number) => {
    if (percent >= 90) return "bg-red-500";
    if (percent >= 70) return "bg-amber-500";
    return "bg-emerald-500";
  };

  const hasAllocations = forecast.allocations && forecast.allocations.length > 0;

  return (
    <div className="rounded-lg overflow-hidden">
      <div 
        className={`flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 ${
          compact ? "" : "hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        } ${hasAllocations && !compact ? "cursor-pointer" : ""}`}
        onClick={() => hasAllocations && !compact && setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {hasAllocations && !compact ? (
            <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
              <ChevronRight className={`h-4 w-4 text-blue-600 dark:text-blue-400 transition-transform ${isExpanded ? "rotate-90" : ""}`} />
            </div>
          ) : (
            <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                {index + 1}
              </span>
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="font-medium text-gray-900 dark:text-gray-100 truncate">
              {format(startDate, "MMM d")} - {format(endDate, "MMM d")}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {forecast.paymentCount} {forecast.paymentCount === 1 ? "bill" : "bills"} · ${forecast.totalBills.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-4 flex-shrink-0">
          {!compact && (
            <div className="hidden sm:block w-24">
              <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${getUtilizationColor(utilizationPercent)} rounded-full transition-all`}
                  style={{ width: `${utilizationPercent}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-center">
                {utilizationPercent.toFixed(0)}% used
              </p>
            </div>
          )}
          <div className="text-right">
            <p className="text-xs text-gray-500 dark:text-gray-400">Balance</p>
            <p className={`font-semibold ${
              forecast.projectedBalance >= 0 
                ? "text-emerald-600 dark:text-emerald-400" 
                : "text-red-600 dark:text-red-400"
            }`}>
              ${forecast.projectedBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>
      </div>

      {isExpanded && hasAllocations && (
        <div className="bg-gray-100 dark:bg-gray-800/30 px-3 pb-3 space-y-2">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide pt-2 px-2">
            Bank Allocations
          </p>
          {forecast.allocations!.map((allocation, allocIdx) => (
            <AllocationCard key={allocation.accountId || `unassigned-${allocIdx}`} allocation={allocation} />
          ))}
        </div>
      )}
    </div>
  );
}

function AllocationCard({ allocation }: { allocation: BankAllocation }) {
  const [showBills, setShowBills] = useState(false);
  
  return (
    <div className="bg-white dark:bg-[#1c2128] rounded-lg border border-gray-200 dark:border-[#30363d] overflow-hidden">
      <div 
        className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-[#21262d] transition-colors"
        onClick={() => setShowBills(!showBills)}
      >
        <div className="flex items-center gap-3">
          <BankBadge bank={allocation.bank} size="sm" />
          <div>
            <p className="font-medium text-gray-900 dark:text-gray-100 text-sm">
              {allocation.accountName}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {allocation.bills.length} {allocation.bills.length === 1 ? "bill" : "bills"}
              {allocation.lastFour && ` · •••• ${allocation.lastFour}`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <p className="font-semibold text-gray-900 dark:text-gray-100">
            ${allocation.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </p>
          <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${showBills ? "rotate-180" : ""}`} />
        </div>
      </div>
      
      {showBills && (
        <div className="border-t border-gray-100 dark:border-gray-800 px-3 pb-2">
          {allocation.bills.map((bill, billIdx) => (
            <div key={billIdx} className="flex items-center justify-between py-2 text-sm">
              <div>
                <p className="text-gray-900 dark:text-gray-100">{bill.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{bill.dueDate}</p>
              </div>
              <p className="text-gray-700 dark:text-gray-300">
                ${bill.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
