"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { BankSelector } from "@/components/banks/bank-badge";

const categories = [
  { value: "SUBSCRIPTION", label: "Subscription" },
  { value: "UTILITY", label: "Utility" },
  { value: "LOAN", label: "Loan" },
  { value: "BNPL", label: "Buy Now Pay Later" },
  { value: "INSURANCE", label: "Insurance" },
  { value: "CREDIT_CARD", label: "Credit Card" },
  { value: "OTHER", label: "Other" },
];

const frequencies = [
  { value: "ONCE", label: "One-time" },
  { value: "WEEKLY", label: "Weekly" },
  { value: "BIWEEKLY", label: "Bi-weekly" },
  { value: "MONTHLY", label: "Monthly" },
  { value: "YEARLY", label: "Yearly" },
];

interface Debt {
  id: string;
  name: string;
  type: string;
}

interface BankAccount {
  id: string;
  name: string;
  bank: string;
  lastFour: string | null;
  isDefault?: boolean;
}

export default function NewBillPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [debts, setDebts] = useState<Debt[]>([]);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [selectedBankAccountId, setSelectedBankAccountId] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    category: "OTHER",
    amount: "",
    dueDay: "",
    isRecurring: true,
    frequency: "MONTHLY",
    debtId: "",
    notes: "",
  });

  useEffect(() => {
    Promise.all([
      fetch("/api/debts").then((res) => res.json()),
      fetch("/api/bank-accounts").then((res) => res.json()),
    ])
      .then(([debtsData, accountsData]) => {
        if (Array.isArray(debtsData)) {
          setDebts(debtsData);
        }
        if (Array.isArray(accountsData)) {
          setBankAccounts(accountsData);
          const defaultAccount = accountsData.find((a: BankAccount) => a.isDefault);
          if (defaultAccount) {
            setSelectedBankAccountId(defaultAccount.id);
          }
        }
      })
      .catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/bills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          bankAccountId: selectedBankAccountId || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create bill");
      }

      router.push("/dashboard/bills");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const inputClasses =
    "w-full px-4 py-2 bg-theme-secondary border border-theme rounded-xl text-theme-primary placeholder-theme-muted focus:outline-none focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500";

  return (
    <div className="animate-fade-in space-y-6 lg:space-y-8">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/bills">
          <Button variant="ghost" size="sm" leftIcon={<ArrowLeft className="h-4 w-4" />}>
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-theme-primary">Add New Bill</h1>
          <p className="text-theme-secondary mt-1">Create a new recurring bill or payment</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Bill Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3 rounded-xl bg-danger-50 dark:bg-danger-600/10 border border-danger-200 dark:border-danger-600/30 text-danger-700 dark:text-danger-400 text-sm">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="name" className="block text-sm font-medium text-theme-secondary">
                  Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g., Netflix, Electric Bill"
                  className={inputClasses}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="category" className="block text-sm font-medium text-theme-secondary">
                  Category
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className={inputClasses}
                >
                  {categories.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label htmlFor="amount" className="block text-sm font-medium text-theme-secondary">
                  Amount *
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-theme-muted">$</span>
                  <input
                    type="number"
                    id="amount"
                    name="amount"
                    required
                    min="0"
                    step="0.01"
                    value={formData.amount}
                    onChange={handleChange}
                    placeholder="0.00"
                    className={`${inputClasses} pl-8`}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="dueDay" className="block text-sm font-medium text-theme-secondary">
                  Due Day (1-31) *
                </label>
                <input
                  type="number"
                  id="dueDay"
                  name="dueDay"
                  required
                  min="1"
                  max="31"
                  value={formData.dueDay}
                  onChange={handleChange}
                  placeholder="15"
                  className={inputClasses}
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="isRecurring"
                name="isRecurring"
                checked={formData.isRecurring}
                onChange={handleChange}
                className="h-4 w-4 rounded border-theme bg-theme-secondary text-accent-600 focus:ring-accent-500 focus:ring-offset-theme-primary"
              />
              <label htmlFor="isRecurring" className="text-sm font-medium text-theme-secondary">
                This is a recurring bill
              </label>
            </div>

            {formData.isRecurring && (
              <div className="space-y-2">
                <label htmlFor="frequency" className="block text-sm font-medium text-theme-secondary">
                  Frequency
                </label>
                <select
                  id="frequency"
                  name="frequency"
                  value={formData.frequency}
                  onChange={handleChange}
                  className={inputClasses}
                >
                  {frequencies.map((freq) => (
                    <option key={freq.value} value={freq.value}>
                      {freq.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {debts.length > 0 && (
              <div className="space-y-2">
                <label htmlFor="debtId" className="block text-sm font-medium text-theme-secondary">
                  Link to Debt Account (Optional)
                </label>
                <select
                  id="debtId"
                  name="debtId"
                  value={formData.debtId}
                  onChange={handleChange}
                  className={inputClasses}
                >
                  <option value="">None</option>
                  {debts.map((debt) => (
                    <option key={debt.id} value={debt.id}>
                      {debt.name} ({debt.type.toLowerCase().replace("_", " ")})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {bankAccounts.length > 0 && (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-theme-secondary">
                  Payment Bank Account
                </label>
                <BankSelector
                  value={selectedBankAccountId}
                  onChange={setSelectedBankAccountId}
                  banks={bankAccounts}
                />
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="notes" className="block text-sm font-medium text-theme-secondary">
                Notes (Optional)
              </label>
              <textarea
                id="notes"
                name="notes"
                rows={3}
                value={formData.notes}
                onChange={handleChange}
                placeholder="Any additional notes about this bill..."
                className={`${inputClasses} resize-none`}
              />
            </div>

            <div className="flex gap-4 pt-4">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Create Bill"}
              </Button>
              <Link href="/dashboard/bills">
                <Button type="button" variant="secondary">
                  Cancel
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
