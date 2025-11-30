"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatPaymentPreview } from "@/lib/bnpl-utils";
import { BankSelector } from "@/components/banks/bank-badge";

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

const PAYMENT_COUNTS = [2, 3, 4, 5, 6, 8, 10, 12, 18, 24, 36, 48, 60];

const PAYMENT_FREQUENCIES = [
  { value: "weekly", label: "Weekly" },
  { value: "biweekly", label: "Bi-weekly" },
  { value: "monthly", label: "Monthly" },
];

interface ScheduledPayment {
  id: string;
  dueDate: string;
  amount: string;
  isPaid: boolean;
}

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
  const [scheduledPayments, setScheduledPayments] = useState<ScheduledPayment[]>([]);

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

  // BNPL specific state
  const [numberOfPayments, setNumberOfPayments] = useState("4");
  const [customPayments, setCustomPayments] = useState("");
  const [firstPaymentDate, setFirstPaymentDate] = useState("");
  const [paymentFrequency, setPaymentFrequency] = useState("monthly");
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [selectedBankAccountId, setSelectedBankAccountId] = useState("");

  const isBNPL = formData.type === "BNPL";
  const effectivePaymentCount = customPayments ? parseInt(customPayments, 10) : parseInt(numberOfPayments, 10);

  const paymentPreview = useMemo(() => {
    if (!isBNPL || !formData.currentBalance || !effectivePaymentCount || !firstPaymentDate) {
      return null;
    }
    const balance = parseFloat(formData.currentBalance);
    if (isNaN(balance) || isNaN(effectivePaymentCount) || balance <= 0 || effectivePaymentCount <= 0) {
      return null;
    }
    const paymentAmount = Math.round((balance / effectivePaymentCount) * 100) / 100;
    return formatPaymentPreview(effectivePaymentCount, paymentAmount, new Date(firstPaymentDate + "T00:00:00"));
  }, [isBNPL, formData.currentBalance, effectivePaymentCount, firstPaymentDate]);

  useEffect(() => {
    async function fetchData() {
      const [debtRes, scheduledRes, bankRes] = await Promise.all([
        fetch(`/api/debts/${debtId}`),
        fetch(`/api/debts/${debtId}/scheduled-payments`),
        fetch("/api/bank-accounts"),
      ]);

      if (debtRes.ok) {
        const data = await debtRes.json();
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
        if (data.bankAccountId) {
          setSelectedBankAccountId(data.bankAccountId);
        }
      } else {
        setError("Failed to load debt");
      }

      if (scheduledRes.ok) {
        const payments = await scheduledRes.json();
        setScheduledPayments(payments);
        
        // If there are scheduled payments, set BNPL form state
        if (payments.length > 0) {
          setNumberOfPayments(payments.length.toString());
          const firstPayment = payments[0];
          if (firstPayment?.dueDate) {
            setFirstPaymentDate(firstPayment.dueDate.split("T")[0]);
          }
        }
      }

      if (bankRes.ok) {
        const accounts = await bankRes.json();
        if (Array.isArray(accounts)) {
          setBankAccounts(accounts);
        }
      }

      setLoading(false);
    }
    fetchData();
  }, [debtId]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError("");

    // Calculate payment amount for BNPL
    const balance = parseFloat(formData.currentBalance);
    const paymentAmount = isBNPL && effectivePaymentCount > 0 
      ? Math.round((balance / effectivePaymentCount) * 100) / 100
      : parseFloat(formData.minimumPayment);

    const data: Record<string, unknown> = {
      name: formData.name,
      type: formData.type,
      currentBalance: balance,
      originalBalance: parseFloat(formData.originalBalance),
      interestRate: isBNPL ? 0 : parseFloat(formData.interestRate),
      minimumPayment: paymentAmount,
      dueDay: parseInt(formData.dueDay, 10),
      status: formData.status,
      deferredUntil: formData.deferredUntil || null,
      notes: formData.notes || null,
    };

    // Include BNPL schedule info if updating to regenerate payments
    if (isBNPL && firstPaymentDate) {
      data.numberOfPayments = effectivePaymentCount;
      data.firstPaymentDate = firstPaymentDate;
      data.paymentFrequency = paymentFrequency;
      data.regenerateSchedule = true;
    }

    data.bankAccountId = selectedBankAccountId || null;

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
    "w-full px-4 py-2 bg-theme-secondary border border-theme rounded-lg text-theme-primary placeholder-theme-muted focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent";
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
        <p className="text-red-500 dark:text-red-400">Debt not found</p>
        <Link href="/dashboard/debts" className="text-accent hover:underline">
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
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-600 dark:text-red-400 text-sm">
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

            {/* BNPL Payment Schedule */}
            {isBNPL && (
              <div className="p-4 bg-theme-tertiary border border-theme rounded-lg space-y-4">
                <h3 className="text-sm font-medium text-accent">BNPL Payment Schedule</h3>
                
                {scheduledPayments.length > 0 && (
                  <div className="p-3 bg-theme-secondary rounded-lg">
                    <p className="text-xs text-theme-muted mb-2">Current Schedule: {scheduledPayments.length} payments</p>
                    <div className="flex flex-wrap gap-2">
                      {scheduledPayments.slice(0, 6).map((payment, i) => (
                        <span
                          key={payment.id}
                          className={`text-xs px-2 py-1 rounded ${
                            payment.isPaid 
                              ? "bg-green-500/20 text-green-600 dark:text-green-400 line-through" 
                              : "bg-theme-tertiary text-theme-secondary"
                          }`}
                        >
                          {new Date(payment.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </span>
                      ))}
                      {scheduledPayments.length > 6 && (
                        <span className="text-xs text-theme-muted">+{scheduledPayments.length - 6} more</span>
                      )}
                    </div>
                  </div>
                )}

                <p className="text-xs text-theme-muted">
                  Update the schedule below to regenerate payment dates
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="numberOfPayments" className={labelClasses}>
                      Number of Payments
                    </label>
                    <select
                      id="numberOfPayments"
                      className={inputClasses}
                      value={numberOfPayments}
                      onChange={(e) => {
                        setNumberOfPayments(e.target.value);
                        setCustomPayments("");
                      }}
                    >
                      {PAYMENT_COUNTS.map((count) => (
                        <option key={count} value={count}>
                          {count} payments
                        </option>
                      ))}
                    </select>
                    <div className="mt-2">
                      <input
                        type="number"
                        placeholder="Or enter custom..."
                        min="1"
                        max="360"
                        className={`${inputClasses} text-sm`}
                        value={customPayments}
                        onChange={(e) => setCustomPayments(e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="firstPaymentDate" className={labelClasses}>
                      First Payment Date
                    </label>
                    <input
                      type="date"
                      id="firstPaymentDate"
                      className={inputClasses}
                      value={firstPaymentDate}
                      onChange={(e) => setFirstPaymentDate(e.target.value)}
                    />
                  </div>

                  <div>
                    <label htmlFor="paymentFrequency" className={labelClasses}>
                      Payment Frequency
                    </label>
                    <select
                      id="paymentFrequency"
                      className={inputClasses}
                      value={paymentFrequency}
                      onChange={(e) => setPaymentFrequency(e.target.value)}
                    >
                      {PAYMENT_FREQUENCIES.map((freq) => (
                        <option key={freq.value} value={freq.value}>
                          {freq.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {paymentPreview && (
                  <div className="p-3 bg-accent/10 border border-accent/30 rounded-lg text-theme-primary text-sm">
                    <span className="font-medium text-accent">New Schedule:</span> {paymentPreview}
                  </div>
                )}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="currentBalance" className={labelClasses}>
                  {isBNPL ? "Total Amount ($)" : "Current Balance ($)"}
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

            {!isBNPL && (
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
            )}

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
