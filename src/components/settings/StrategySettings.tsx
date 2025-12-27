import { useState, useEffect } from "react";
import { Save, AlertCircle, CheckCircle2, Loader2, RefreshCw } from "lucide-react";

interface BankAccount {
  id: string;
  name: string;
  bank: string;
}

interface StrategyData {
  paycheckBankAccountId?: string;
  spendingBankAccountId?: string;
  discretionaryBudgetMonthly?: number;
  emergencyFundTarget?: number;
  debtSurplusPercent?: number;
  savingsSurplusPercent?: number;
  payoffStartDate?: string;
  payoffStartTotalDebt?: number;
  payoffTargetDate?: string;
}

export function StrategySettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentDebtTotal, setCurrentDebtTotal] = useState<number | null>(null);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [data, setData] = useState<StrategyData>({
    discretionaryBudgetMonthly: 750,
    emergencyFundTarget: 1000,
    debtSurplusPercent: 0.8,
    savingsSurplusPercent: 0.2,
  });

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      setLoading(true);
      const [accountsRes, userRes, debtTotalRes] = await Promise.all([
        fetch("/api/bank-accounts"),
        fetch("/api/auth/session"),
        fetch("/api/paycheck-plan/sync-baseline"),
      ]);

      if (accountsRes.ok) {
        const accounts = await accountsRes.json();
        setBankAccounts(accounts);
      }

      if (debtTotalRes.ok) {
        const { currentDebtTotal: total } = await debtTotalRes.json();
        setCurrentDebtTotal(total);
      }

      if (userRes.ok) {
        const session = await userRes.json();
        if (session?.user) {
          setData({
            paycheckBankAccountId: session.user.paycheckBankAccountId || "",
            spendingBankAccountId: session.user.spendingBankAccountId || "",
            discretionaryBudgetMonthly: session.user.discretionaryBudgetMonthly || 750,
            emergencyFundTarget: session.user.emergencyFundTarget || 1000,
            debtSurplusPercent: session.user.debtSurplusPercent || 0.8,
            savingsSurplusPercent: session.user.savingsSurplusPercent || 0.2,
            payoffStartDate: session.user.payoffStartDate?.split("T")[0] || "",
            payoffStartTotalDebt: session.user.payoffStartTotalDebt || undefined,
            payoffTargetDate: session.user.payoffTargetDate?.split("T")[0] || "",
          });
        }
      }
    } catch (err) {
      setError("Failed to load settings");
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    try {
      setSaving(true);
      setError(null);
      setSuccess(false);

      const res = await fetch("/api/paycheck-plan", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          payoffStartDate: data.payoffStartDate || null,
          payoffTargetDate: data.payoffTargetDate || null,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to save settings");
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  function handlePercentChange(field: "debtSurplusPercent" | "savingsSurplusPercent", value: number) {
    const percent = value / 100;
    if (field === "debtSurplusPercent") {
      setData({
        ...data,
        debtSurplusPercent: percent,
        savingsSurplusPercent: 1 - percent,
      });
    } else {
      setData({
        ...data,
        savingsSurplusPercent: percent,
        debtSurplusPercent: 1 - percent,
      });
    }
  }

  async function handleSyncFromDebts() {
    try {
      setSyncing(true);
      setError(null);

      const res = await fetch("/api/paycheck-plan/sync-baseline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ preserveStartDate: false }),
      });

      if (!res.ok) {
        throw new Error("Failed to sync baseline");
      }

      const result = await res.json();
      setData({
        ...data,
        payoffStartDate: result.newStartDate.split("T")[0],
        payoffStartTotalDebt: result.newStartDebt,
      });
      setCurrentDebtTotal(result.newStartDebt);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to sync");
    } finally {
      setSyncing(false);
    }
  }

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded" />
        <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded" />
        <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-lg">
          <AlertCircle className="h-5 w-5" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 p-3 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 rounded-lg">
          <CheckCircle2 className="h-5 w-5" />
          <span>Settings saved successfully!</span>
        </div>
      )}

      {/* Bank Account Routing */}
      <div className="space-y-4">
        <h3 className="font-semibold text-gray-900 dark:text-gray-100">
          Account Routing
        </h3>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Paycheck Deposit Account
          </label>
          <select
            value={data.paycheckBankAccountId || ""}
            onChange={(e) => setData({ ...data, paycheckBankAccountId: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-[#1c2128] text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select account...</option>
            {bankAccounts.map((acc) => (
              <option key={acc.id} value={acc.id}>
                {acc.name} ({acc.bank.replace(/_/g, " ")})
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-1">Where your paycheck is deposited</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Spending Account
          </label>
          <select
            value={data.spendingBankAccountId || ""}
            onChange={(e) => setData({ ...data, spendingBankAccountId: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-[#1c2128] text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select account...</option>
            {bankAccounts.map((acc) => (
              <option key={acc.id} value={acc.id}>
                {acc.name} ({acc.bank.replace(/_/g, " ")})
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-1">Where you transfer money for daily spending</p>
        </div>
      </div>

      {/* Budget Settings */}
      <div className="space-y-4">
        <h3 className="font-semibold text-gray-900 dark:text-gray-100">
          Monthly Budget
        </h3>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Discretionary Budget (Monthly)
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
            <input
              type="number"
              value={data.discretionaryBudgetMonthly || ""}
              onChange={(e) => setData({ ...data, discretionaryBudgetMonthly: Number(e.target.value) })}
              className="w-full pl-7 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-[#1c2128] text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500"
              placeholder="750"
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">Food, gas, personal spending per month</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Emergency Fund Target
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
            <input
              type="number"
              value={data.emergencyFundTarget || ""}
              onChange={(e) => setData({ ...data, emergencyFundTarget: Number(e.target.value) })}
              className="w-full pl-7 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-[#1c2128] text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500"
              placeholder="1000"
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">Goal for emergency fund before 100% goes to debt</p>
        </div>
      </div>

      {/* Surplus Split */}
      <div className="space-y-4">
        <h3 className="font-semibold text-gray-900 dark:text-gray-100">
          Surplus Allocation
        </h3>

        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm text-gray-600 dark:text-gray-400">Debt Payoff</span>
            <span className="font-semibold text-gray-900 dark:text-gray-100">
              {((data.debtSurplusPercent || 0.8) * 100).toFixed(0)}%
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={(data.debtSurplusPercent || 0.8) * 100}
            onChange={(e) => handlePercentChange("debtSurplusPercent", Number(e.target.value))}
            className="w-full accent-blue-600"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-2">
            <span>Savings: {((data.savingsSurplusPercent || 0.2) * 100).toFixed(0)}%</span>
            <span>Debt: {((data.debtSurplusPercent || 0.8) * 100).toFixed(0)}%</span>
          </div>
        </div>
        <p className="text-xs text-gray-500">
          After bills and spending, split your surplus between savings and extra debt payments
        </p>
      </div>

      {/* Payoff Tracking */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100">
            Payoff Goal Tracking
          </h3>
          <button
            onClick={handleSyncFromDebts}
            disabled={syncing}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors disabled:opacity-50"
          >
            {syncing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            Sync from Debts
          </button>
        </div>

        {currentDebtTotal !== null && data.payoffStartTotalDebt && currentDebtTotal !== data.payoffStartTotalDebt && (
          <div className="p-3 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 rounded-lg text-sm">
            <strong>Baseline may be stale:</strong> Current debt (${currentDebtTotal.toLocaleString()}) differs from baseline (${data.payoffStartTotalDebt.toLocaleString()}). 
            Click "Sync from Debts" to reset your baseline.
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Start Date
            </label>
            <input
              type="date"
              value={data.payoffStartDate || ""}
              onChange={(e) => setData({ ...data, payoffStartDate: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-[#1c2128] text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Target Date
            </label>
            <input
              type="date"
              value={data.payoffTargetDate || ""}
              onChange={(e) => setData({ ...data, payoffTargetDate: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-[#1c2128] text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Starting Total Debt
            </label>
            {currentDebtTotal !== null && (
              <span className="text-xs text-gray-500">
                Current: ${currentDebtTotal.toLocaleString()}
              </span>
            )}
          </div>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
            <input
              type="number"
              value={data.payoffStartTotalDebt || ""}
              onChange={(e) => setData({ ...data, payoffStartTotalDebt: Number(e.target.value) })}
              className="w-full pl-7 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-[#1c2128] text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500"
              placeholder="82108.87"
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">Total debt when you started your payoff journey</p>
        </div>
      </div>

      {/* Save Button */}
      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold rounded-xl transition-colors"
      >
        {saving ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            Saving...
          </>
        ) : (
          <>
            <Save className="h-5 w-5" />
            Save Strategy Settings
          </>
        )}
      </button>
    </div>
  );
}
