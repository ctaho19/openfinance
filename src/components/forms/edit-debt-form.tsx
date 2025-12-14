import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BankSelector } from "@/components/banks/bank-badge";
import { ArrowLeft, Loader2 } from "lucide-react";

const DEBT_TYPES = [
  { value: "CREDIT_CARD", label: "Credit Card" },
  { value: "AUTO_LOAN", label: "Auto Loan" },
  { value: "STUDENT_LOAN", label: "Student Loan" },
  { value: "PERSONAL_LOAN", label: "Personal Loan" },
  { value: "BNPL", label: "Buy Now Pay Later" },
  { value: "MORTGAGE", label: "Mortgage" },
  { value: "OTHER", label: "Other" },
];

const DEBT_STATUSES = [
  { value: "CURRENT", label: "Current" },
  { value: "DEFERRED", label: "Deferred" },
  { value: "PAST_DUE", label: "Past Due" },
  { value: "IN_COLLECTIONS", label: "In Collections" },
  { value: "PAID_OFF", label: "Paid Off" },
];

interface BankAccount {
  id: string;
  name: string;
  bank: string;
  lastFour: string | null;
  isDefault?: boolean;
}

interface Debt {
  id: string;
  name: string;
  type: string;
  status: string;
  currentBalance: number;
  originalBalance: number;
  interestRate: number;
  minimumPayment: number;
  dueDay: number;
  notes: string | null;
  bankAccountId: string | null;
  effectiveRate?: number | null;
  totalRepayable?: number | null;
  pastDueAmount?: number | null;
  deferredUntil?: string | null;
  startDate?: string;
}

interface EditDebtFormProps {
  debtId: string;
}

export default function EditDebtForm({ debtId }: EditDebtFormProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [debt, setDebt] = useState<Debt | null>(null);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [selectedBankAccountId, setSelectedBankAccountId] = useState("");

  useEffect(() => {
    Promise.all([
      fetch(`/api/debts/${debtId}`).then((res) => res.json()),
      fetch("/api/bank-accounts").then((res) => res.json()),
    ])
      .then(([debtData, accountsData]) => {
        if (debtData.error) {
          setError(debtData.error);
        } else {
          setDebt(debtData);
          setSelectedBankAccountId(debtData.bankAccountId || "");
        }
        if (Array.isArray(accountsData)) {
          setBankAccounts(accountsData);
        }
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load debt");
        setLoading(false);
      });
  }, [debtId]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const formData = new FormData(e.currentTarget);

    const data: Record<string, unknown> = {
      name: formData.get("name"),
      type: formData.get("type"),
      currentBalance: parseFloat(formData.get("currentBalance") as string),
      originalBalance: parseFloat(formData.get("originalBalance") as string),
      interestRate: parseFloat(formData.get("interestRate") as string),
      minimumPayment: parseFloat(formData.get("minimumPayment") as string),
      dueDay: parseInt(formData.get("dueDay") as string, 10),
      status: formData.get("status"),
      notes: formData.get("notes") || null,
      bankAccountId: selectedBankAccountId || null,
    };

    const res = await fetch(`/api/debts/${debtId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (res.ok) {
      const url = new URL(window.location.href);
      const sort = url.searchParams.get("sort") || "name";
      const dir = url.searchParams.get("dir") || "asc";
      window.location.href = `/dashboard/debts?sort=${sort}&dir=${dir}`;
    } else {
      const result = await res.json();
      setError(result.error || "Failed to update debt");
      setSaving(false);
    }
  }

  const inputClasses =
    "w-full px-4 py-2 bg-theme-secondary border border-theme rounded-xl text-theme-primary placeholder-theme-muted focus:outline-none focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500";
  const labelClasses = "block text-sm font-medium text-theme-secondary mb-2";

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-accent-500" />
      </div>
    );
  }

  if (!debt) {
    return (
      <div className="text-center py-12">
        <p className="text-theme-secondary">Debt not found</p>
        <a href="/dashboard/debts" className="text-accent-500 hover:underline mt-2 inline-block">
          Back to debts
        </a>
      </div>
    );
  }

  const isBNPL = debt.type === "BNPL";

  return (
    <div className="animate-fade-in max-w-2xl mx-auto space-y-6 lg:space-y-8">
      <div className="flex items-center gap-4">
        <a href="/dashboard/debts">
          <Button variant="ghost" size="sm" leftIcon={<ArrowLeft className="h-4 w-4" />}>
            Back
          </Button>
        </a>
        <div>
          <h1 className="text-2xl font-bold text-theme-primary">Edit Debt</h1>
          <p className="text-theme-secondary mt-1">{debt.name}</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Debt Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3 rounded-xl bg-danger-50 dark:bg-danger-600/10 border border-danger-200 dark:border-danger-600/30 text-danger-700 dark:text-danger-400 text-sm">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="name" className={labelClasses}>
                Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                defaultValue={debt.name}
                className={inputClasses}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="type" className={labelClasses}>
                  Type
                </label>
                <select
                  id="type"
                  name="type"
                  required
                  defaultValue={debt.type}
                  className={inputClasses}
                >
                  {DEBT_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="status" className={labelClasses}>
                  Status
                </label>
                <select
                  id="status"
                  name="status"
                  required
                  defaultValue={debt.status}
                  className={inputClasses}
                >
                  {DEBT_STATUSES.map((status) => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="currentBalance" className={labelClasses}>
                  Current Balance ($)
                </label>
                <input
                  type="number"
                  id="currentBalance"
                  name="currentBalance"
                  required
                  min="0"
                  step="0.01"
                  inputMode="decimal"
                  defaultValue={debt.currentBalance}
                  className={inputClasses}
                />
              </div>

              <div>
                <label htmlFor="originalBalance" className={labelClasses}>
                  Original Balance ($)
                </label>
                <input
                  type="number"
                  id="originalBalance"
                  name="originalBalance"
                  required
                  min="0"
                  step="0.01"
                  inputMode="decimal"
                  defaultValue={debt.originalBalance}
                  className={inputClasses}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="interestRate" className={labelClasses}>
                  Interest Rate (% APR)
                </label>
                <input
                  type="number"
                  id="interestRate"
                  name="interestRate"
                  required
                  min="0"
                  max="100"
                  step="0.01"
                  inputMode="decimal"
                  defaultValue={debt.interestRate}
                  className={inputClasses}
                />
              </div>

              <div>
                <label htmlFor="minimumPayment" className={labelClasses}>
                  {isBNPL ? "Payment Amount ($)" : "Minimum Payment ($)"}
                </label>
                <input
                  type="number"
                  id="minimumPayment"
                  name="minimumPayment"
                  required
                  min="0"
                  step="0.01"
                  inputMode="decimal"
                  defaultValue={debt.minimumPayment}
                  className={inputClasses}
                />
              </div>
            </div>

            <div>
              <label htmlFor="dueDay" className={labelClasses}>
                Due Day of Month (1-31)
              </label>
              <input
                type="number"
                id="dueDay"
                name="dueDay"
                required
                min="1"
                max="31"
                defaultValue={debt.dueDay}
                className={inputClasses}
              />
            </div>

            {bankAccounts.length > 0 && (
              <div>
                <label className={labelClasses}>Payment Bank Account</label>
                <BankSelector
                  value={selectedBankAccountId}
                  onChange={setSelectedBankAccountId}
                  banks={bankAccounts}
                />
              </div>
            )}

            <div>
              <label htmlFor="notes" className={labelClasses}>
                Notes (optional)
              </label>
              <textarea
                id="notes"
                name="notes"
                rows={3}
                defaultValue={debt.notes || ""}
                placeholder="Any additional notes about this debt..."
                className={inputClasses}
              />
            </div>

            <div className="flex gap-4 pt-4">
              <Button type="submit" disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
              </Button>
              <a href="/dashboard/debts">
                <Button type="button" variant="secondary">
                  Cancel
                </Button>
              </a>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
