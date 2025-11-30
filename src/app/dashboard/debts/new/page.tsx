"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatPaymentPreview } from "@/lib/bnpl-utils";

const DEBT_TYPES = [
  { value: "CREDIT_CARD", label: "Credit Card" },
  { value: "AUTO_LOAN", label: "Auto Loan" },
  { value: "STUDENT_LOAN", label: "Student Loan" },
  { value: "PERSONAL_LOAN", label: "Personal Loan" },
  { value: "BNPL", label: "Buy Now Pay Later" },
  { value: "MORTGAGE", label: "Mortgage" },
  { value: "OTHER", label: "Other" },
];

// Extended payment count options
const PAYMENT_COUNTS = [2, 3, 4, 5, 6, 8, 10, 12, 18, 24, 36, 48, 60];

const PAYMENT_FREQUENCIES = [
  { value: "weekly", label: "Weekly" },
  { value: "biweekly", label: "Bi-weekly" },
  { value: "monthly", label: "Monthly" },
];

export default function NewDebtPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [debtType, setDebtType] = useState("");
  const [currentBalance, setCurrentBalance] = useState("");
  const [numberOfPayments, setNumberOfPayments] = useState("4");
  const [customPayments, setCustomPayments] = useState("");
  const [firstPaymentDate, setFirstPaymentDate] = useState("");
  const [paymentFrequency, setPaymentFrequency] = useState("monthly");

  const isBNPL = debtType === "BNPL";

  // Use custom payment count if provided, otherwise use dropdown
  const effectivePaymentCount = customPayments ? parseInt(customPayments, 10) : parseInt(numberOfPayments, 10);

  const paymentPreview = useMemo(() => {
    if (!isBNPL || !currentBalance || !effectivePaymentCount || !firstPaymentDate) {
      return null;
    }
    const balance = parseFloat(currentBalance);
    if (isNaN(balance) || isNaN(effectivePaymentCount) || balance <= 0 || effectivePaymentCount <= 0) {
      return null;
    }
    const paymentAmount = Math.round((balance / effectivePaymentCount) * 100) / 100;
    return formatPaymentPreview(effectivePaymentCount, paymentAmount, new Date(firstPaymentDate + "T00:00:00"));
  }, [isBNPL, currentBalance, effectivePaymentCount, firstPaymentDate]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    
    // Calculate payment amount for BNPL
    const balance = parseFloat(formData.get("currentBalance") as string);
    const paymentAmount = isBNPL && effectivePaymentCount > 0 
      ? Math.round((balance / effectivePaymentCount) * 100) / 100
      : parseFloat(formData.get("minimumPayment") as string);

    const data: Record<string, unknown> = {
      name: formData.get("name"),
      type: formData.get("type"),
      currentBalance: balance,
      originalBalance: parseFloat(formData.get("originalBalance") as string),
      interestRate: isBNPL ? 0 : parseFloat(formData.get("interestRate") as string),
      minimumPayment: paymentAmount,
      dueDay: parseInt(formData.get("dueDay") as string, 10),
      notes: formData.get("notes") || null,
    };

    if (isBNPL) {
      data.numberOfPayments = effectivePaymentCount;
      data.firstPaymentDate = firstPaymentDate;
      data.paymentFrequency = paymentFrequency;
    }

    const res = await fetch("/api/debts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (res.ok) {
      router.push("/dashboard/debts");
    } else {
      const result = await res.json();
      setError(result.error || "Failed to create debt");
      setLoading(false);
    }
  }

  const inputClasses =
    "w-full px-4 py-2 bg-theme-secondary border border-theme rounded-lg text-theme-primary placeholder-theme-muted focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent";
  const labelClasses = "block text-sm font-medium text-theme-secondary mb-2";

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <Link href="/dashboard/debts" className="text-theme-secondary hover:text-theme-primary text-sm">
          ← Back to Debts
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Add New Debt</CardTitle>
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
                name="name"
                required
                placeholder="e.g., Chase Sapphire or Affirm - Laptop"
                className={inputClasses}
              />
            </div>

            <div>
              <label htmlFor="type" className={labelClasses}>
                Type
              </label>
              <select
                id="type"
                name="type"
                required
                className={inputClasses}
                value={debtType}
                onChange={(e) => setDebtType(e.target.value)}
              >
                <option value="">Select type...</option>
                {DEBT_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="currentBalance" className={labelClasses}>
                  {isBNPL ? "Total Amount ($)" : "Current Balance ($)"}
                </label>
                <input
                  type="number"
                  id="currentBalance"
                  name="currentBalance"
                  required
                  min="0"
                  step="0.01"
                  placeholder={isBNPL ? "1200.00" : "5000.00"}
                  className={inputClasses}
                  value={currentBalance}
                  onChange={(e) => setCurrentBalance(e.target.value)}
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
                  placeholder={isBNPL ? currentBalance || "1200.00" : "10000.00"}
                  defaultValue={isBNPL ? currentBalance : ""}
                  className={inputClasses}
                />
              </div>
            </div>

            {isBNPL && (
              <div className="p-4 bg-theme-tertiary border border-theme rounded-lg space-y-4">
                <h3 className="text-sm font-medium text-accent">BNPL Payment Schedule</h3>
                <p className="text-xs text-theme-muted">
                  For BNPL loans like Affirm, Klarna, or Afterpay, the interest is typically built into the fixed payment amount.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="numberOfPayments" className={labelClasses}>
                      Number of Payments
                    </label>
                    <select
                      id="numberOfPayments"
                      name="numberOfPayments"
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
                      name="firstPaymentDate"
                      required
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
                      name="paymentFrequency"
                      required
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
                    <span className="font-medium text-accent">Preview:</span> {paymentPreview}
                  </div>
                )}
              </div>
            )}

            {!isBNPL && (
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
                    placeholder="19.99"
                    className={inputClasses}
                  />
                </div>

                <div>
                  <label htmlFor="minimumPayment" className={labelClasses}>
                    Minimum Payment ($)
                  </label>
                  <input
                    type="number"
                    id="minimumPayment"
                    name="minimumPayment"
                    required
                    min="0"
                    step="0.01"
                    placeholder="150.00"
                    className={inputClasses}
                  />
                </div>
              </div>
            )}

            {/* Hidden fields for BNPL */}
            {isBNPL && (
              <>
                <input type="hidden" name="interestRate" value="0" />
                <input type="hidden" name="minimumPayment" value={currentBalance && effectivePaymentCount ? (parseFloat(currentBalance) / effectivePaymentCount).toFixed(2) : "0"} />
              </>
            )}

            <div>
              <label htmlFor="dueDay" className={labelClasses}>
                {isBNPL ? "First Payment Day of Month (1-31)" : "Due Day of Month (1-31)"}
              </label>
              <input
                type="number"
                id="dueDay"
                name="dueDay"
                required
                min="1"
                max="31"
                placeholder="15"
                className={inputClasses}
              />
            </div>

            <div>
              <label htmlFor="notes" className={labelClasses}>
                Notes (optional)
              </label>
              <textarea
                id="notes"
                name="notes"
                rows={3}
                placeholder="Any additional notes about this debt..."
                className={inputClasses}
              />
            </div>

            <div className="flex gap-4 pt-4">
              <Button type="submit" disabled={loading}>
                {loading ? "Creating..." : "Add Debt"}
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
