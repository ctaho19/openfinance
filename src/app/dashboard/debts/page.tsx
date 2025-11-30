"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PaymentForm } from "./payment-form";
import { ArrowUpDown } from "lucide-react";

interface ScheduledPayment {
  id: string;
  dueDate: string;
  amount: string;
  isPaid: boolean;
  paidAt: string | null;
}

interface DebtPayment {
  id: string;
  date: string;
  amount: string;
  principal: string;
  interest: string;
  newBalance: string;
  notes: string | null;
}

interface Debt {
  id: string;
  name: string;
  type: string;
  status: string;
  currentBalance: string;
  originalBalance: string;
  interestRate: string;
  minimumPayment: string;
  dueDay: number;
  deferredUntil: string | null;
  isActive: boolean;
  notes: string | null;
  payments?: DebtPayment[];
  scheduledPayments?: ScheduledPayment[];
}

type SortField = "name" | "interestRate" | "currentBalance" | "dueDay" | "status";
type SortDirection = "asc" | "desc";

const DEBT_TYPE_LABELS: Record<string, string> = {
  CREDIT_CARD: "Credit Card",
  AUTO_LOAN: "Auto Loan",
  STUDENT_LOAN: "Student Loan",
  PERSONAL_LOAN: "Personal Loan",
  BNPL: "BNPL",
  MORTGAGE: "Mortgage",
  OTHER: "Other",
};

const STATUS_LABELS: Record<string, string> = {
  CURRENT: "Current",
  DEFERRED: "Deferred",
  PAST_DUE: "Past Due",
  IN_COLLECTIONS: "In Collections",
  PAID_OFF: "Paid Off",
};

const STATUS_COLORS: Record<string, "default" | "success" | "warning" | "danger" | "info"> = {
  CURRENT: "success",
  DEFERRED: "info",
  PAST_DUE: "danger",
  IN_COLLECTIONS: "danger",
  PAID_OFF: "default",
};

function formatCurrency(value: string | number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(Number(value));
}

function calculatePayoffInfo(debt: Debt): { months: number | null; date: string; method: string } {
  const balance = Number(debt.currentBalance);
  const rate = Number(debt.interestRate);
  const payment = Number(debt.minimumPayment);
  const isBNPL = debt.type === "BNPL";
  const isDeferred = debt.status === "DEFERRED";

  // For BNPL, calculate based on scheduled payments
  if (isBNPL && debt.scheduledPayments && debt.scheduledPayments.length > 0) {
    const unpaidPayments = debt.scheduledPayments.filter(p => !p.isPaid);
    if (unpaidPayments.length === 0) {
      return { months: 0, date: "Paid Off", method: "fixed" };
    }
    const lastPayment = unpaidPayments[unpaidPayments.length - 1];
    const lastDate = new Date(lastPayment.dueDate);
    return {
      months: unpaidPayments.length,
      date: lastDate.toLocaleDateString("en-US", { month: "short", year: "numeric" }),
      method: "fixed",
    };
  }

  if (payment <= 0 || balance <= 0) {
    return { months: null, date: "N/A", method: "standard" };
  }

  // For deferred debts, add accrued interest during deferment
  let adjustedBalance = balance;
  if (isDeferred && debt.deferredUntil) {
    const deferredUntil = new Date(debt.deferredUntil);
    const now = new Date();
    if (deferredUntil > now) {
      const monthsDeferred = Math.ceil((deferredUntil.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 30));
      const monthlyRate = rate / 100 / 12;
      // Compound interest during deferment
      adjustedBalance = balance * Math.pow(1 + monthlyRate, monthsDeferred);
    }
  }

  const monthlyRate = rate / 100 / 12;
  
  if (monthlyRate === 0) {
    const months = Math.ceil(adjustedBalance / payment);
    const date = new Date();
    date.setMonth(date.getMonth() + months);
    return {
      months,
      date: date.toLocaleDateString("en-US", { month: "short", year: "numeric" }),
      method: "no-interest",
    };
  }

  const monthlyInterest = adjustedBalance * monthlyRate;
  if (payment <= monthlyInterest) {
    return { months: null, date: "Never (payment too low)", method: "standard" };
  }

  const months = Math.ceil(
    Math.log(payment / (payment - adjustedBalance * monthlyRate)) / Math.log(1 + monthlyRate)
  );
  const date = new Date();
  date.setMonth(date.getMonth() + months);

  return {
    months,
    date: date.toLocaleDateString("en-US", { month: "short", year: "numeric" }),
    method: "amortized",
  };
}

export default function DebtsPage() {
  const [debts, setDebts] = useState<Debt[]>([]);
  const [loading, setLoading] = useState(true);
  const [paymentDebt, setPaymentDebt] = useState<Debt | null>(null);
  const [sortField, setSortField] = useState<SortField>("interestRate");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  useEffect(() => {
    fetchDebts();
  }, []);

  async function fetchDebts() {
    const res = await fetch("/api/debts");
    if (res.ok) {
      const data = await res.json();
      const debtsWithDetails = await Promise.all(
        data.map(async (debt: Debt) => {
          const [paymentsRes, scheduledRes] = await Promise.all([
            fetch(`/api/debts/${debt.id}/payments`),
            fetch(`/api/debts/${debt.id}/scheduled-payments`),
          ]);
          
          const payments = paymentsRes.ok ? await paymentsRes.json() : [];
          const scheduledPayments = scheduledRes.ok ? await scheduledRes.json() : [];
          
          return { ...debt, payments, scheduledPayments };
        })
      );
      setDebts(debtsWithDetails);
    }
    setLoading(false);
  }

  function handleSort(field: SortField) {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection(field === "name" ? "asc" : "desc");
    }
  }

  const sortedDebts = [...debts].sort((a, b) => {
    let aVal: string | number;
    let bVal: string | number;

    switch (sortField) {
      case "name":
        aVal = a.name.toLowerCase();
        bVal = b.name.toLowerCase();
        break;
      case "interestRate":
        aVal = Number(a.interestRate);
        bVal = Number(b.interestRate);
        break;
      case "currentBalance":
        aVal = Number(a.currentBalance);
        bVal = Number(b.currentBalance);
        break;
      case "dueDay":
        aVal = a.dueDay;
        bVal = b.dueDay;
        break;
      case "status":
        aVal = a.status;
        bVal = b.status;
        break;
      default:
        return 0;
    }

    if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
    if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });

  function handlePaymentClose() {
    setPaymentDebt(null);
    fetchDebts();
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this debt?")) return;
    const res = await fetch(`/api/debts/${id}`, { method: "DELETE" });
    if (res.ok) {
      setDebts(debts.filter((d) => d.id !== id));
    }
  }

  const totalDebt = debts.reduce((sum, d) => sum + Number(d.currentBalance), 0);
  const totalMinPayment = debts.reduce((sum, d) => sum + Number(d.minimumPayment), 0);

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse text-theme-secondary">Loading debts...</div>
      </div>
    );
  }

  const SortButton = ({ field, label }: { field: SortField; label: string }) => (
    <button
      onClick={() => handleSort(field)}
      className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors ${
        sortField === field
          ? "bg-accent text-white"
          : "bg-theme-tertiary text-theme-secondary hover:bg-theme-secondary"
      }`}
    >
      {label}
      <ArrowUpDown className="h-3 w-3" />
    </button>
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-theme-primary">Debts</h1>
          <p className="text-theme-secondary text-sm mt-1">
            Track and manage your debts
          </p>
        </div>
        <Link href="/dashboard/debts/new">
          <Button>Add Debt</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="py-4">
            <p className="text-theme-secondary text-sm">Total Debt</p>
            <p className="text-2xl font-bold text-theme-primary">{formatCurrency(totalDebt)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4">
            <p className="text-theme-secondary text-sm">Total Minimum Payments</p>
            <p className="text-2xl font-bold text-theme-primary">{formatCurrency(totalMinPayment)}</p>
            <p className="text-theme-muted text-xs mt-1">per month</p>
          </CardContent>
        </Card>
      </div>

      {/* Sort controls */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-theme-secondary text-sm">Sort by:</span>
        <SortButton field="name" label="Name" />
        <SortButton field="interestRate" label="Interest Rate" />
        <SortButton field="currentBalance" label="Balance" />
        <SortButton field="dueDay" label="Due Day" />
        <SortButton field="status" label="Status" />
      </div>

      {debts.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-theme-secondary">No debts added yet.</p>
            <Link href="/dashboard/debts/new">
              <Button className="mt-4">Add Your First Debt</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {sortedDebts.map((debt) => {
            const currentBalance = Number(debt.currentBalance);
            const originalBalance = Number(debt.originalBalance);
            const interestRate = Number(debt.interestRate);
            const progress = originalBalance > 0 ? ((originalBalance - currentBalance) / originalBalance) * 100 : 0;
            const payoffInfo = calculatePayoffInfo(debt);
            const isBNPL = debt.type === "BNPL";

            return (
              <Card key={debt.id}>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div className="flex items-center gap-3 flex-wrap">
                    <Link href={`/dashboard/debts/${debt.id}`}>
                      <CardTitle className="hover:text-accent cursor-pointer">
                        {debt.name}
                      </CardTitle>
                    </Link>
                    {!isBNPL && (
                      <Badge variant={interestRate > 15 ? "danger" : interestRate > 7 ? "warning" : "success"}>
                        {interestRate}% APR
                      </Badge>
                    )}
                    <Badge>{DEBT_TYPE_LABELS[debt.type] || debt.type}</Badge>
                    {debt.status !== "CURRENT" && (
                      <Badge variant={STATUS_COLORS[debt.status] || "default"}>
                        {STATUS_LABELS[debt.status] || debt.status}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" onClick={() => setPaymentDebt(debt)}>
                      Log Payment
                    </Button>
                    <Link href={`/dashboard/debts/${debt.id}/edit`}>
                      <Button variant="ghost" size="sm">Edit</Button>
                    </Link>
                    <Button variant="danger" size="sm" onClick={() => handleDelete(debt.id)}>
                      Delete
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-theme-secondary text-sm">Current Balance</p>
                      <p className="text-xl font-semibold text-theme-primary">{formatCurrency(currentBalance)}</p>
                    </div>
                    <div>
                      <p className="text-theme-secondary text-sm">Original Balance</p>
                      <p className="text-lg text-theme-secondary">{formatCurrency(originalBalance)}</p>
                    </div>
                    <div>
                      <p className="text-theme-secondary text-sm">
                        {isBNPL ? "Payment Amount" : "Minimum Payment"}
                      </p>
                      <p className="text-lg text-theme-secondary">
                        {formatCurrency(Number(debt.minimumPayment))}
                        {!isBNPL && "/mo"}
                      </p>
                    </div>
                    <div>
                      <p className="text-theme-secondary text-sm">Est. Payoff</p>
                      <p className="text-lg text-theme-secondary">{payoffInfo.date}</p>
                      {isBNPL && payoffInfo.months !== null && payoffInfo.months > 0 && (
                        <p className="text-xs text-theme-muted">{payoffInfo.months} payments left</p>
                      )}
                    </div>
                  </div>

                  {/* Scheduled payments for BNPL */}
                  {isBNPL && debt.scheduledPayments && debt.scheduledPayments.length > 0 && (
                    <div className="pt-2 border-t border-theme">
                      <p className="text-theme-secondary text-xs mb-2">Upcoming Payments</p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {debt.scheduledPayments
                          .filter(p => !p.isPaid)
                          .slice(0, 4)
                          .map((payment) => (
                            <div
                              key={payment.id}
                              className="flex justify-between text-sm p-2 rounded bg-theme-tertiary"
                            >
                              <span className="text-theme-muted">
                                {new Date(payment.dueDate).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                })}
                              </span>
                              <span className="text-theme-primary font-medium">
                                {formatCurrency(Number(payment.amount))}
                              </span>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}

                  {/* Deferment info */}
                  {debt.status === "DEFERRED" && debt.deferredUntil && (
                    <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/30 text-sm">
                      <span className="text-blue-400">
                        Deferred until {new Date(debt.deferredUntil).toLocaleDateString()}
                      </span>
                      <span className="text-theme-muted"> — Interest continues to accrue</span>
                    </div>
                  )}

                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-theme-secondary">
                        Paid off: {formatCurrency(originalBalance - currentBalance)} of {formatCurrency(originalBalance)}
                      </span>
                      <span className="text-accent font-medium">{progress.toFixed(1)}%</span>
                    </div>
                    <div className="h-3 bg-theme-tertiary rounded-full overflow-hidden">
                      <div
                        className="h-full bg-accent transition-all duration-500"
                        style={{ width: `${Math.min(progress, 100)}%` }}
                      />
                    </div>
                  </div>

                  {debt.payments && debt.payments.length > 0 && (
                    <div className="pt-2 border-t border-theme">
                      <p className="text-theme-secondary text-xs mb-2">Recent Payments</p>
                      <div className="space-y-1">
                        {debt.payments.slice(0, 3).map((payment) => (
                          <div key={payment.id} className="flex justify-between text-sm">
                            <span className="text-theme-muted">
                              {new Date(payment.date).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                              })}
                            </span>
                            <span className="text-accent">
                              {formatCurrency(Number(payment.amount))}
                            </span>
                          </div>
                        ))}
                        {debt.payments.length > 3 && (
                          <Link
                            href={`/dashboard/debts/${debt.id}`}
                            className="text-xs text-theme-muted hover:text-accent"
                          >
                            +{debt.payments.length - 3} more payments
                          </Link>
                        )}
                      </div>
                    </div>
                  )}

                  {debt.notes && (
                    <p className="text-theme-muted text-sm">{debt.notes}</p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {paymentDebt && (
        <PaymentForm
          debtId={paymentDebt.id}
          debtName={paymentDebt.name}
          currentBalance={Number(paymentDebt.currentBalance)}
          minimumPayment={Number(paymentDebt.minimumPayment)}
          onClose={handlePaymentClose}
        />
      )}
    </div>
  );
}
