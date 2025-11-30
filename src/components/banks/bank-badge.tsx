"use client";

interface BankBadgeProps {
  bank: string;
  size?: "sm" | "md" | "lg";
  showName?: boolean;
}

const BANK_CONFIG: Record<string, { name: string; bg: string; text: string; icon: string }> = {
  NAVY_FEDERAL: {
    name: "Navy Federal",
    bg: "bg-gradient-to-r from-blue-900 to-blue-700",
    text: "text-white",
    icon: "⚓",
  },
  PNC: {
    name: "PNC",
    bg: "bg-gradient-to-r from-orange-600 to-orange-500",
    text: "text-white",
    icon: "🏦",
  },
  CAPITAL_ONE: {
    name: "Capital One",
    bg: "bg-gradient-to-r from-red-700 to-red-600",
    text: "text-white",
    icon: "💳",
  },
  TRUIST: {
    name: "Truist",
    bg: "bg-gradient-to-r from-purple-700 to-purple-600",
    text: "text-white",
    icon: "🏛️",
  },
  CHASE: {
    name: "Chase",
    bg: "bg-gradient-to-r from-blue-800 to-blue-600",
    text: "text-white",
    icon: "🔷",
  },
  BANK_OF_AMERICA: {
    name: "Bank of America",
    bg: "bg-gradient-to-r from-red-800 to-blue-800",
    text: "text-white",
    icon: "🏧",
  },
  WELLS_FARGO: {
    name: "Wells Fargo",
    bg: "bg-gradient-to-r from-red-700 to-yellow-600",
    text: "text-white",
    icon: "🐴",
  },
  OTHER: {
    name: "Other",
    bg: "bg-gradient-to-r from-gray-600 to-gray-500",
    text: "text-white",
    icon: "🏦",
  },
};

const SIZE_CLASSES = {
  sm: "text-xs px-2 py-0.5",
  md: "text-sm px-3 py-1",
  lg: "text-base px-4 py-1.5",
};

export function BankBadge({ bank, size = "sm", showName = true }: BankBadgeProps) {
  const config = BANK_CONFIG[bank] || BANK_CONFIG.OTHER;

  return (
    <span
      className={`
        inline-flex items-center gap-1.5 rounded-full font-medium
        ${config.bg} ${config.text} ${SIZE_CLASSES[size]}
        shadow-sm
      `}
    >
      <span>{config.icon}</span>
      {showName && <span>{config.name}</span>}
    </span>
  );
}

// SVG-based logos for a more professional look
export function BankLogo({ bank, size = 24 }: { bank: string; size?: number }) {
  const config = BANK_CONFIG[bank] || BANK_CONFIG.OTHER;

  return (
    <div
      className={`
        inline-flex items-center justify-center rounded-lg
        ${config.bg} ${config.text}
      `}
      style={{ width: size, height: size, fontSize: size * 0.5 }}
    >
      {config.icon}
    </div>
  );
}

// Compact inline badge for lists
export function BankTag({ bank, lastFour }: { bank: string; lastFour?: string | null }) {
  const config = BANK_CONFIG[bank] || BANK_CONFIG.OTHER;

  return (
    <span
      className={`
        inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-md
        ${config.bg} ${config.text}
      `}
    >
      <span>{config.icon}</span>
      <span className="font-medium">{config.name}</span>
      {lastFour && <span className="opacity-75">•{lastFour}</span>}
    </span>
  );
}

// Full bank card display
export function BankCard({
  bank,
  name,
  lastFour,
  isDefault,
  onClick,
}: {
  bank: string;
  name: string;
  lastFour?: string | null;
  isDefault?: boolean;
  onClick?: () => void;
}) {
  const config = BANK_CONFIG[bank] || BANK_CONFIG.OTHER;

  return (
    <button
      onClick={onClick}
      className={`
        relative w-full p-4 rounded-xl text-left transition-all
        ${config.bg} ${config.text}
        hover:scale-[1.02] hover:shadow-lg
        focus:outline-none focus:ring-2 focus:ring-white/50
      `}
    >
      {isDefault && (
        <span className="absolute top-2 right-2 text-xs bg-white/20 px-2 py-0.5 rounded-full">
          Default
        </span>
      )}
      <div className="flex items-center gap-3">
        <span className="text-2xl">{config.icon}</span>
        <div>
          <p className="font-semibold">{name}</p>
          <p className="text-sm opacity-75">
            {config.name} {lastFour && `•••• ${lastFour}`}
          </p>
        </div>
      </div>
    </button>
  );
}

// Selector component for forms
export function BankSelector({
  value,
  onChange,
  banks,
}: {
  value: string;
  onChange: (value: string) => void;
  banks: Array<{ id: string; name: string; bank: string; lastFour?: string | null }>;
}) {
  if (banks.length === 0) {
    return (
      <p className="text-sm text-theme-muted">
        No bank accounts added.{" "}
        <a href="/dashboard/settings" className="text-accent hover:underline">
          Add one in settings
        </a>
      </p>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-2">
      {banks.map((account) => {
        const config = BANK_CONFIG[account.bank] || BANK_CONFIG.OTHER;
        const isSelected = value === account.id;

        return (
          <button
            key={account.id}
            type="button"
            onClick={() => onChange(account.id)}
            className={`
              p-3 rounded-lg border-2 text-left transition-all
              ${
                isSelected
                  ? `${config.bg} ${config.text} border-transparent`
                  : "bg-theme-secondary border-theme hover:border-theme-hover"
              }
            `}
          >
            <div className="flex items-center gap-2">
              <span>{config.icon}</span>
              <div>
                <p className={`text-sm font-medium ${isSelected ? "" : "text-theme-primary"}`}>
                  {account.name}
                </p>
                <p className={`text-xs ${isSelected ? "opacity-75" : "text-theme-muted"}`}>
                  {config.name} {account.lastFour && `•${account.lastFour}`}
                </p>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}

export const BANK_OPTIONS = Object.entries(BANK_CONFIG).map(([value, config]) => ({
  value,
  label: config.name,
  icon: config.icon,
}));
