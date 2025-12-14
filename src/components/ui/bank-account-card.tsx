import { Building2, CreditCard, PiggyBank, Wallet, Star, MoreVertical, Pencil, Trash2 } from "lucide-react";
import { useState, useRef, useEffect } from "react";

const BANK_CONFIG: Record<string, { name: string; gradient: string; initials: string }> = {
  NAVY_FEDERAL: {
    name: "Navy Federal",
    gradient: "from-blue-900 via-blue-800 to-blue-700",
    initials: "NF",
  },
  PNC: {
    name: "PNC",
    gradient: "from-orange-600 via-orange-500 to-orange-400",
    initials: "PNC",
  },
  CAPITAL_ONE: {
    name: "Capital One",
    gradient: "from-red-700 via-red-600 to-red-500",
    initials: "C1",
  },
  TRUIST: {
    name: "Truist",
    gradient: "from-purple-700 via-purple-600 to-purple-500",
    initials: "T",
  },
  CHASE: {
    name: "Chase",
    gradient: "from-blue-800 via-blue-700 to-blue-600",
    initials: "C",
  },
  BANK_OF_AMERICA: {
    name: "Bank of America",
    gradient: "from-red-800 via-red-700 to-blue-700",
    initials: "BoA",
  },
  WELLS_FARGO: {
    name: "Wells Fargo",
    gradient: "from-red-700 via-yellow-600 to-yellow-500",
    initials: "WF",
  },
  OTHER: {
    name: "Other",
    gradient: "from-gray-700 via-gray-600 to-gray-500",
    initials: "",
  },
};

function getBankIcon(bank: string, size = 24) {
  const config = BANK_CONFIG[bank] || BANK_CONFIG.OTHER;
  if (config.initials) {
    return (
      <span className="font-bold text-white tracking-tight" style={{ fontSize: size * 0.6 }}>
        {config.initials}
      </span>
    );
  }
  return <Building2 size={size} className="text-white" />;
}

function getAccountTypeIcon(accountType?: string) {
  switch (accountType) {
    case "CHECKING":
      return <Wallet className="h-4 w-4" />;
    case "SAVINGS":
      return <PiggyBank className="h-4 w-4" />;
    case "CREDIT":
      return <CreditCard className="h-4 w-4" />;
    default:
      return <Wallet className="h-4 w-4" />;
  }
}

interface BankAccountCardProps {
  id: string;
  name: string;
  bank: string;
  lastFour?: string | null;
  isDefault?: boolean;
  accountType?: string;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onSetDefault?: (id: string) => void;
}

export function BankAccountCard({
  id,
  name,
  bank,
  lastFour,
  isDefault,
  onEdit,
  onDelete,
  onSetDefault,
}: BankAccountCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const config = BANK_CONFIG[bank] || BANK_CONFIG.OTHER;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div
      className={`
        relative overflow-hidden rounded-2xl p-5
        bg-gradient-to-br ${config.gradient}
        shadow-lg hover:shadow-xl transition-all duration-300
        hover:scale-[1.02] group
        min-h-[140px]
      `}
    >
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCI+CjxyZWN0IHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgZmlsbD0ibm9uZSIvPgo8Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIxLjUiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4xKSIvPgo8L3N2Zz4=')] opacity-30" />

      <div className="absolute top-3 right-3 flex items-center gap-2">
        {isDefault && (
          <span className="flex items-center gap-1 text-xs bg-white/20 backdrop-blur-sm px-2.5 py-1 rounded-full text-white font-medium">
            <Star className="h-3 w-3 fill-current" />
            Default
          </span>
        )}
        
        {(onEdit || onDelete || onSetDefault) && (
          <div ref={menuRef} className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors opacity-0 group-hover:opacity-100"
            >
              <MoreVertical className="h-4 w-4 text-white" />
            </button>
            
            {showMenu && (
              <div className="absolute right-0 top-full mt-1 w-40 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 py-1 z-10">
                {onEdit && (
                  <button
                    onClick={() => { onEdit(id); setShowMenu(false); }}
                    className="w-full px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                  >
                    <Pencil className="h-4 w-4" />
                    Edit
                  </button>
                )}
                {!isDefault && onSetDefault && (
                  <button
                    onClick={() => { onSetDefault(id); setShowMenu(false); }}
                    className="w-full px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                  >
                    <Star className="h-4 w-4" />
                    Set as Default
                  </button>
                )}
                {onDelete && (
                  <button
                    onClick={() => { onDelete(id); setShowMenu(false); }}
                    className="w-full px-3 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="relative flex flex-col justify-between h-full">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center">
            {getBankIcon(bank, 28)}
          </div>
          <div>
            <p className="text-white font-semibold text-lg leading-tight">{name}</p>
            <p className="text-white/70 text-sm">{config.name}</p>
          </div>
        </div>

        <div className="flex items-center justify-between mt-auto">
          <div className="flex items-center gap-3">
            {lastFour && (
              <p className="font-mono text-white/90 text-lg tracking-widest">
                •••• {lastFour}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

interface BankAccountMiniCardProps {
  name: string;
  bank: string;
  lastFour?: string | null;
  amount?: number;
  billCount?: number;
}

export function BankAccountMiniCard({
  name,
  bank,
  lastFour,
  amount,
  billCount,
}: BankAccountMiniCardProps) {
  const config = BANK_CONFIG[bank] || BANK_CONFIG.OTHER;

  return (
    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
      <div className="flex items-center gap-3">
        <div
          className={`w-10 h-10 rounded-lg bg-gradient-to-br ${config.gradient} flex items-center justify-center shadow-sm`}
        >
          {getBankIcon(bank, 20)}
        </div>
        <div>
          <p className="font-medium text-gray-900 dark:text-gray-100">{name}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {config.name} {lastFour && `•${lastFour}`}
            {billCount !== undefined && ` · ${billCount} bill${billCount !== 1 ? "s" : ""}`}
          </p>
        </div>
      </div>
      {amount !== undefined && (
        <div className="text-right">
          <p className="font-semibold text-gray-900 dark:text-gray-100">
            ${amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">to transfer</p>
        </div>
      )}
    </div>
  );
}

export function BankAccountAllocationCard({
  name,
  bank,
  lastFour,
  amount,
  bills,
}: {
  name: string;
  bank: string;
  lastFour?: string | null;
  amount: number;
  bills: Array<{ name: string; amount: number; dueDate?: string }>;
}) {
  const config = BANK_CONFIG[bank] || BANK_CONFIG.OTHER;

  return (
    <div className="bg-white dark:bg-[#1c2128] rounded-xl border border-gray-200 dark:border-[#30363d] overflow-hidden">
      <div className={`p-4 bg-gradient-to-r ${config.gradient}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-white/10 backdrop-blur-sm flex items-center justify-center">
              {getBankIcon(bank, 20)}
            </div>
            <div>
              <p className="font-semibold text-white">{name}</p>
              <p className="text-sm text-white/70">
                {config.name} {lastFour && `•••• ${lastFour}`}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-white/70">Transfer Amount</p>
            <p className="text-xl font-bold text-white">
              ${amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>
      </div>
      
      {bills.length > 0 && (
        <div className="p-4 divide-y divide-gray-100 dark:divide-gray-800">
          {bills.map((bill, idx) => (
            <div key={idx} className="flex items-center justify-between py-2 first:pt-0 last:pb-0">
              <div>
                <p className="font-medium text-gray-900 dark:text-gray-100 text-sm">{bill.name}</p>
                {bill.dueDate && (
                  <p className="text-xs text-gray-500 dark:text-gray-400">{bill.dueDate}</p>
                )}
              </div>
              <p className="font-medium text-gray-700 dark:text-gray-300">
                ${bill.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export { BANK_CONFIG };
