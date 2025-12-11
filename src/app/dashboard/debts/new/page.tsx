"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatPaymentPreview, calculateEffectiveAPR } from "@/lib/bnpl-utils";
import { BankSelector } from "@/components/banks/bank-badge";
import { ArrowLeft } from "lucide-react";

const DEBT_TYPES = [
  { value: "CREDIT_CARD", label: "Credit Card" },
  { value: "AUTO_LOAN", label: "Auto Loan" },
  { value: "STUDENT_LOAN", label: "Student Loan" },
  { value: "PERSONAL_LOAN", label: "Personal Loan" },
  { value: "BNPL", label: "Buy Now Pay Later" },
  { value: "MORTGAGE", label: "Mortgage" },
  { value: "OTHER", label: "Other" },
];

const PAYMENT_COUNTS = [2, 3, 4, 5, 6, 8, 10, 12, 18, 24, 36, 48, 60];

const PAYMENT_FREQUENCIES = [
  { value: "weekly", label: "Weekly" },
  { value: "biweekly", label: "Bi-weekly" },
  { value: "monthly", label: "Monthly" },
];

interface BankAccount {
  id: string;
  name: string;
  bank: string;
  lastFour: string | null;
  isDefault?: boolean;
}

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
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [selectedBankAccountId, setSelectedBankAccountId] = useState("");
  const [totalRepayable, setTotalRepayable] = useState("");
  const [interestRate, setInterestRate] = useState("");
  const [bnplHasInterest, setBnplHasInterest] = useState(false);

  const isBNPL = debtType === "BNPL";

  useEffect(() => {
    fetch("/api/bank-accounts")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setBankAccounts(data);
          const defaultAccount = data.find((a: BankAccount) => a.isDefault);
          if (defaultAccount) {
            setSelectedBankAccountId(defaultAccount.id);
          }
        }
      })
      .catch(() => {});
  }, []);

  const effectivePaymentCount = customPayments ? parseInt(customPayments, 10) : parseInt(numberOfPayments, 10);

  const paymentPreview = useMemo(() => {
    if (!isBNPL || !currentBalance || !effectivePaymentCount || !firstPaymentDate) {
      return null;
    }
    const balance = parseFloat(currentBalance);
    if (isNaN(balance) || isNaN(effectivePaymentCount) || balance <= 0 || effectivePaymentCount <= 0) {
      return null;
    }
    const total = totalRepayable ? parseFloat(totalRepayable) : balance;
    const paymentAmount = Math.round((total / effectivePaymentCount) * 100) / 100;
    return formatPaymentPreview(effectivePaymentCount, paymentAmount, new Date(firstPaymentDate + "T00:00:00"));
  }, [isBNPL, currentBalance, totalRepayable, effectivePaymentCount, firstPaymentDate]);

  const computedEffectiveAPR = useMemo(() => {
    if (!isBNPL || !currentBalance || !effectivePaymentCount) return null;
    const principal = parseFloat(currentBalance);
    const total = totalRepayable ? parseFloat(totalRepayable) : principal;
    if (isNaN(principal) || isNaN(total) || principal <= 0 || total <= 0) return null;
    if (Math.abs(total - principal) < 0.01) return null;
    
    return calculateEffectiveAPR({
      principal,
      totalRepayable: total,
      numberOfPayments: effectivePaymentCount,
      frequency: paymentFrequency as 'weekly' | 'biweekly' | 'monthly',
    });
  }, [isBNPL, currentBalance, totalRepayable, effectivePaymentCount, paymentFrequency]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    
    const balance = parseFloat(formData.get("currentBalance") as string);
    const total = isBNPL && totalRepayable ? parseFloat(totalRepayable) : balance;
    const paymentAmount = isBNPL && effectivePaymentCount > 0 
      ? Math.round((total / effectivePaymentCount) * 100) / 100
      : parseFloat(formData.get("minimumPayment") as string);

    const statedInterestRate = isBNPL 
      ? (bnplHasInterest && interestRate ? parseFloat(interestRate) : 0)
      : parseFloat(formData.get("interestRate") as string);

    const dueDay = isBNPL && firstPaymentDate
      ? new Date(firstPaymentDate + "T00:00:00").getDate()
      : parseInt(formData.get("dueDay") as string, 10);

    const data: Record<string, unknown> = {
      name: formData.get("name"),
      type: formData.get("type"),
      currentBalance: balance,
      originalBalance: parseFloat(formData.get("originalBalance") as string),
      interestRate: statedInterestRate,
      minimumPayment: paymentAmount,
      dueDay,
      notes: formData.get("notes") || null,
    };

    if (isBNPL) {
      data.numberOfPayments = effectivePaymentCount;
      data.firstPaymentDate = firstPaymentDate;
      data.paymentFrequency = paymentFrequency;
      if (totalRepayable && parseFloat(totalRepayable) !== balance) {
        data.totalRepayable = parseFloat(totalRepayable);
      }
    }

    if (selectedBankAccountId) {
      data.bankAccountId = selectedBankAccountId;
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
    "w-full px-4 py-2 bg-theme-secondary border border-theme rounded-xl text-theme-primary placeholder-theme-muted focus:outline-none focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500";
  const labelClasses = "block text-sm font-medium text-theme-secondary mb-2";

  return (
    <div className="animate-fade-in max-w-2xl mx-auto space-y-6 lg:space-y-8">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/debts">
          <Button variant="ghost" size="sm" leftIcon={<ArrowLeft className="h-4 w-4" />}>
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-theme-primary">Add New Debt</h1>
          <p className="text-theme-secondary mt-1">Track a new debt account</p>
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
                autoFocus
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
                  inputMode="decimal"
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
                  inputMode="decimal"
                  placeholder={isBNPL ? currentBalance || "1200.00" : "10000.00"}
                  defaultValue={isBNPL ? currentBalance : ""}
                  className={inputClasses}
                />
              </div>
            </div>

            {isBNPL && (
              <div className="p-4 bg-theme-tertiary border border-theme rounded-xl space-y-4">
                <h3 className="text-sm font-medium text-accent">BNPL Payment Schedule</h3>
                
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
                  <div className="p-3 bg-accent/10 border border-accent/30 rounded-xl text-theme-primary text-sm">
                    <span className="font-medium text-accent">Preview:</span> {paymentPreview}
                  </div>
                )}

                <div className="border-t border-theme pt-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="bnplHasInterest"
                      checked={bnplHasInterest}
                      onChange={(e) => setBnplHasInterest(e.target.checked)}
                      className="h-4 w-4 rounded border-theme bg-theme-secondary text-accent-600 focus:ring-accent-500"
                    />
                    <label htmlFor="bnplHasInterest" className="text-sm text-theme-secondary">
                      This BNPL loan has interest or finance charges
                    </label>
                  </div>

                  {bnplHasInterest && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-7">
                      <div>
                        <label htmlFor="bnplInterestRate" className={labelClasses}>
                          Stated APR (%) <span className="text-theme-muted font-normal">- if shown by provider</span>
                        </label>
                        <input
                          type="number"
                          id="bnplInterestRate"
                          min="0"
                          max="100"
                          step="0.01"
                          placeholder="0.00"
                          className={inputClasses}
                          value={interestRate}
                          onChange={(e) => setInterestRate(e.target.value)}
                        />
                      </div>
                      <div>
                        <label htmlFor="totalRepayable" className={labelClasses}>
                          Total to Repay ($) <span className="text-theme-muted font-normal">- if different from principal</span>
                        </label>
                        <input
                          type="number"
                          id="totalRepayable"
                          min="0"
                          step="0.01"
                          placeholder={currentBalance || "0.00"}
                          className={inputClasses}
                          value={totalRepayable}
                          onChange={(e) => setTotalRepayable(e.target.value)}
                        />
                        <p className="text-xs text-theme-muted mt-1">
                          Enter the total amount you&apos;ll pay including any built-in interest
                        </p>
                      </div>
                    </div>
                  )}

                  {computedEffectiveAPR !== null && computedEffectiveAPR > 0 && (
                    <div className="p-3 bg-warning-50 dark:bg-warning-600/10 border border-warning-200 dark:border-warning-600/30 rounded-xl text-sm">
                      <span className="font-medium text-warning-700 dark:text-warning-400">Effective APR:</span>{" "}
                      <span className="text-theme-primary">{computedEffectiveAPR.toFixed(2)}%</span>
                      <span className="text-theme-muted ml-2">
                        (computed from total repayable vs principal)
                      </span>
                    </div>
                  )}

                  {!bnplHasInterest && (
                    <p className="text-xs text-theme-muted pl-7">
                      Leave unchecked for 0% promo BNPL (Afterpay, Klarna Pay in 4, etc.)
                    </p>
                  )}
                </div>
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
                    inputMode="decimal"
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
                    inputMode="decimal"
                    placeholder="150.00"
                    className={inputClasses}
                  />
                </div>
              </div>
            )}

            {!isBNPL && (
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
                  placeholder="15"
                  className={inputClasses}
                />
              </div>
            )}

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
