"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X } from "lucide-react";

interface Debt {
  id: string;
  name: string;
  type: string;
}

interface QuickPaymentFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  isModal?: boolean;
}

const CATEGORIES = [
  { value: "ONE_TIME", label: "One-Time Payment" },
  { value: "DEBT_SURPLUS", label: "Extra Debt Payment" },
  { value: "BNPL_CATCHUP", label: "BNPL Catch-up" },
  { value: "OTHER", label: "Other" },
] as const;

export function QuickPaymentForm({
  onSuccess,
  onCancel,
  isModal = false,
}: QuickPaymentFormProps) {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [paidAt, setPaidAt] = useState(new Date().toISOString().split("T")[0]);
  const [debtId, setDebtId] = useState("");
  const [category, setCategory] = useState<string>("ONE_TIME");
  const [notes, setNotes] = useState("");
  const [debts, setDebts] = useState<Debt[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchDebts() {
      const res = await fetch("/api/debts");
      if (res.ok) {
        const data = await res.json();
        setDebts(data);
      }
    }
    fetchDebts();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/quick-payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description,
          amount,
          paidAt,
          debtId: debtId || null,
          category,
          notes: notes || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create payment");
      }

      setDescription("");
      setAmount("");
      setPaidAt(new Date().toISOString().split("T")[0]);
      setDebtId("");
      setCategory("ONE_TIME");
      setNotes("");

      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  }

  const formContent = (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 text-sm text-red-500 bg-red-100 dark:bg-red-900/30 rounded-lg">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-theme-secondary mb-1">
          Description *
        </label>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What was this payment for?"
          required
          className="w-full px-3 py-2 rounded-lg bg-theme-tertiary border border-theme text-theme-primary placeholder:text-theme-muted focus:outline-none focus:ring-2 focus:ring-accent-500"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-theme-secondary mb-1">
            Amount *
          </label>
          <input
            type="number"
            step="0.01"
            min="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            required
            className="w-full px-3 py-2 rounded-lg bg-theme-tertiary border border-theme text-theme-primary placeholder:text-theme-muted focus:outline-none focus:ring-2 focus:ring-accent-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-theme-secondary mb-1">
            Date Paid *
          </label>
          <input
            type="date"
            value={paidAt}
            onChange={(e) => setPaidAt(e.target.value)}
            required
            className="w-full px-3 py-2 rounded-lg bg-theme-tertiary border border-theme text-theme-primary focus:outline-none focus:ring-2 focus:ring-accent-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-theme-secondary mb-1">
          Category *
        </label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          required
          className="w-full px-3 py-2 rounded-lg bg-theme-tertiary border border-theme text-theme-primary focus:outline-none focus:ring-2 focus:ring-accent-500"
        >
          {CATEGORIES.map((cat) => (
            <option key={cat.value} value={cat.value}>
              {cat.label}
            </option>
          ))}
        </select>
      </div>

      {(category === "DEBT_SURPLUS" || category === "BNPL_CATCHUP") && (
        <div>
          <label className="block text-sm font-medium text-theme-secondary mb-1">
            Related Debt
          </label>
          <select
            value={debtId}
            onChange={(e) => setDebtId(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-theme-tertiary border border-theme text-theme-primary focus:outline-none focus:ring-2 focus:ring-accent-500"
          >
            <option value="">None</option>
            {debts.map((debt) => (
              <option key={debt.id} value={debt.id}>
                {debt.name} ({debt.type})
              </option>
            ))}
          </select>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-theme-secondary mb-1">
          Notes
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Optional notes..."
          rows={2}
          className="w-full px-3 py-2 rounded-lg bg-theme-tertiary border border-theme text-theme-primary placeholder:text-theme-muted focus:outline-none focus:ring-2 focus:ring-accent-500 resize-none"
        />
      </div>

      <div className="flex gap-3 pt-2">
        {onCancel && (
          <Button type="button" variant="secondary" onClick={onCancel} className="flex-1">
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={isLoading} className="flex-1">
          {isLoading ? "Saving..." : "Log Payment"}
        </Button>
      </div>
    </form>
  );

  if (isModal) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <Card className="w-full max-w-md mx-4">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Log Quick Payment</CardTitle>
            {onCancel && (
              <button
                onClick={onCancel}
                className="p-1 rounded hover:bg-theme-tertiary"
              >
                <X className="h-5 w-5 text-theme-secondary" />
              </button>
            )}
          </CardHeader>
          <CardContent>{formContent}</CardContent>
        </Card>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Log Quick Payment</CardTitle>
      </CardHeader>
      <CardContent>{formContent}</CardContent>
    </Card>
  );
}
