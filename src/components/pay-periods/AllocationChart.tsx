interface AllocationItem {
  label: string;
  amount: number;
  color: string;
  percentage: number;
}

interface AllocationChartProps {
  items: AllocationItem[];
  total: number;
}

export function AllocationChart({ items, total }: AllocationChartProps) {
  return (
    <div className="space-y-4">
      <div className="h-4 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-800 flex">
        {items.map((item, index) => (
          <div
            key={index}
            className={`${item.color} transition-all duration-500`}
            style={{ width: `${Math.max(item.percentage, 0)}%` }}
          />
        ))}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {items.map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${item.color}`} />
            <div className="min-w-0">
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {item.label}
              </p>
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                ${item.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

interface DonutChartProps {
  items: AllocationItem[];
  centerLabel?: string;
  centerValue?: string;
}

export function DonutChart({ items, centerLabel, centerValue }: DonutChartProps) {
  const radius = 80;
  const strokeWidth = 24;
  const normalizedRadius = radius - strokeWidth / 2;
  const circumference = normalizedRadius * 2 * Math.PI;

  let currentOffset = 0;

  const colorMap: Record<string, string> = {
    "bg-blue-500": "#3b82f6",
    "bg-emerald-500": "#10b981",
    "bg-amber-500": "#f59e0b",
    "bg-purple-500": "#a855f7",
    "bg-gray-300 dark:bg-gray-600": "#9ca3af",
  };

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg height={radius * 2} width={radius * 2} className="-rotate-90">
        {items.map((item, index) => {
          const strokeDasharray = `${(item.percentage / 100) * circumference} ${circumference}`;
          const offset = currentOffset;
          currentOffset += (item.percentage / 100) * circumference;

          return (
            <circle
              key={index}
              stroke={colorMap[item.color] || "#e5e7eb"}
              fill="transparent"
              strokeWidth={strokeWidth}
              strokeDasharray={strokeDasharray}
              strokeDashoffset={-offset}
              r={normalizedRadius}
              cx={radius}
              cy={radius}
              className="transition-all duration-500"
            />
          );
        })}
      </svg>
      {centerLabel && centerValue && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">{centerLabel}</p>
          <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
            {centerValue}
          </p>
        </div>
      )}
    </div>
  );
}
