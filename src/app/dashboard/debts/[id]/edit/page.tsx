"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

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

interface Debt {
  id: string;
  name: string;
  type: string;
  currentBalance: string;
  originalBalance: string;
  interestRate: string;
  minimumPayment: string;
  dueDay: number;
  isActive: boolean;
  status?: string;
  deferredUntil?: string;
  notes: string | null;
}

export default function EditDebtPage() {
  const router = useRouter();
  const params = useParams();
  const debtId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [debt, setDebt] = useState<Debt | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    type: "",
    currentBalance: "",
    originalBalance: "",
    interestRate: "",
    minimumPayment: "",
    dueDay: "",
    status: "CURRENT",
    deferredUntil: "",
    notes: "",
  });

  useEffect(() => {
    async function fetchDebt() {
      const res = await fetch(`/api/debts/${debtId}`);
      if (res.ok) {
        const data = await res.json();
        setDebt(data);
        setFormData({
          name: data.name || "",
          type: data.type || "",
          currentBalance: data.currentBalance || "",
          originalBalance: data.originalBalance || "",
          interestRate: data.interestRate || "",
          minimumPayment: data.minimumPayment || "",
          dueDay: data.dueDay?.toString() || "",
          status: data.status || "CURRENT",
          deferredUntil: data.deferredUntil ? data.deferredUntil.split("T")[0] : "",
          notes: data.notes || "",
        });
      } else {
        setError("Failed to load debt");
      }
      setLoading(false);
    }
    fetchDebt();
  }, [debtId]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const data = {
      name: formData.name,
      type: formData.type,
      currentBalance: parseFloat(formData.currentBalance),
      originalBalance: parseFloat(formData.originalBalance),
      interestRate: parseFloat(formData.interestRate),
      minimumPayment: parseFloat(formData.minimumPayment),
      dueDay: parseInt(formData.dueDay, 10),
      status: formData.status,
      deferredUntil: formData.deferredUntil || null,
      notes: formData.notes || null,
    };

    const res = await fetch(`/api/debts/${debtId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (res.ok) {
      router.push("/dashboard/debts");
    } else {
      const result = await res.json();
      setError(result.error || "Failed to update debt");
      setSaving(false);
    }
  }

  const inputClasses =
    "w-full px-4 py-2 bg-theme-secondary border border-theme rounded-lg text-theme-primary placeholder-theme-muted focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent";
  const labelClasses = "block text-sm font-medium text-theme-secondary mb-2";

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse text-theme-secondary">Loading...</div>
      </div>
    );
  }

  if (!debt) {
    return (
      <div className="p-6">
        <p className="text-red-400">Debt not found</p>
        <Link href="/dashboard/debts" className="text-emerald-400 hover:underline">
          Back to Debts
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <Link href="/dashboard/debts" className="text-theme-secondary hover:text-theme-primary text-sm">
          ← Back to Debts
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Edit Debt: {debt.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3 bg-red-900/50 border border-red-800 rounded-lg text-red-400 text-sm">
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
                required
                className={inputClasses}
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="type" className={labelClasses}>
                  Type
                </label>
                <select
                  id="type"
                  required
                  className={inputClasses}
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
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
                  required
                  className={inputClasses}
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  {DEBT_STATUSES.map((status) => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {formData.status === "DEFERRED" && (
              <div>
                <label htmlFor="deferredUntil" className={labelClasses}>
                  Deferred Until
                </label>
                <input
                  type="date"
                  id="deferredUntil"
                  className={inputClasses}
                  value={formData.deferredUntil}
                  onChange={(e) => setFormData({ ...formData, deferredUntil: e.target.value })}
                />
                <p className="text-xs text-theme-muted mt-1">
                  Interest will continue to accrue during deferment
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="currentBalance" className={labelClasses}>
                  Current Balance ($)
                </label>
                <input
                  type="number"
                  id="currentBalance"
                  required
                  min="0"
                  step="0.01"
                  className={inputClasses}
                  value={formData.currentBalance}
                  onChange={(e) => setFormData({ ...formData, currentBalance: e.target.value })}
                />
              </div>

              <div>
                <label htmlFor="originalBalance" className={labelClasses}>
                  Original Balance ($)
                </label>
                <input
                  type="number"
                  id="originalBalance"
                  required
                  min="0"
                  step="0.01"
                  className={inputClasses}
                  value={formData.originalBalance}
                  onChange={(e) => setFormData({ ...formData, originalBalance: e.target.value })}
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
                  required
                  min="0"
                  max="100"
                  step="0.01"
                  className={inputClasses}
                  value={formData.interestRate}
                  onChange={(e) => setFormData({ ...formData, interestRate: e.target.value })}
                />
              </div>

              <div>
                <label htmlFor="minimumPayment" className={labelClasses}>
                  Minimum Payment ($)
                </label>
                <input
                  type="number"
                  id="minimumPayment"
                  required
                  min="0"
                  step="0.01"
                  className={inputClasses}
                  value={formData.minimumPayment}
                  onChange={(e) => setFormData({ ...formData, minimumPayment: e.target.value })}
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
                required
                min="1"
                max="31"
                className={inputClasses}
                value={formData.dueDay}
                onChange={(e) => setFormData({ ...formData, dueDay: e.target.value })}
              />
            </div>

            <div>
              <label htmlFor="notes" className={labelClasses}>
                Notes (optional)
              </label>
              <textarea
                id="notes"
                rows={3}
                className={inputClasses}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>

            <div className="flex gap-4 pt-4">
              <Button type="submit" disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
              </Button>
              <Link href="/dashboard/debts">
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
