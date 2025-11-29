"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PaymentForm } from "./payment-form";

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
  currentBalance: string;
  originalBalance: string;
  interestRate: string;
  minimumPayment: string;
  dueDay: number;
  isActive: boolean;
  notes: string | null;
  payments?: DebtPayment[];
}

const DEBT_TYPE_LABELS: Record<string, string> = {
  CREDIT_CARD: "Credit Card",
  AUTO_LOAN: "Auto Loan",
  STUDENT_LOAN: "Student Loan",
  PERSONAL_LOAN: "Personal Loan",
  BNPL: "BNPL",
  MORTGAGE: "Mortgage",
  OTHER: "Other",
};

function formatCurrency(value: string | number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(Number(value));
}

function calculatePayoffMonths(balance: number, rate: number, payment: number): number | null {
  if (payment <= 0 || balance <= 0) return null;
  const monthlyRate = rate / 100 / 12;
  if (monthlyRate === 0) {
    return Math.ceil(balance / payment);
  }
  const monthlyInterest = balance * monthlyRate;
  if (payment <= monthlyInterest) return null;
  const months = Math.log(payment / (payment - balance * monthlyRate)) / Math.log(1 + monthlyRate);
  return Math.ceil(months);
}

function getPayoffDate(months: number | null): string {
  if (months === null) return "Never (payment too low)";
  const date = new Date();
  date.setMonth(date.getMonth() + months);
  return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

export default function DebtsPage() {
  const [debts, setDebts] = useState<Debt[]>([]);
  const [loading, setLoading] = useState(true);
  const [paymentDebt, setPaymentDebt] = useState<Debt | null>(null);

  useEffect(() => {
    fetchDebts();
  }, []);

  async function fetchDebts() {
    const res = await fetch("/api/debts");
    if (res.ok) {
      const data = await res.json();
      const debtsWithPayments = await Promise.all(
        data.map(async (debt: Debt) => {
          const paymentsRes = await fetch(`/api/debts/${debt.id}/payments`);
          if (paymentsRes.ok) {
            const payments = await paymentsRes.json();
            return { ...debt, payments };
          }
          return { ...debt, payments: [] };
        })
      );
      setDebts(debtsWithPayments);
    }
    setLoading(false);
  }

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

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-theme-primary">Debts</h1>
          <p className="text-theme-secondary text-sm mt-1">
            Sorted by interest rate (avalanche method)
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
          {debts.map((debt) => {
            const currentBalance = Number(debt.currentBalance);
            const originalBalance = Number(debt.originalBalance);
            const interestRate = Number(debt.interestRate);
            const minimumPayment = Number(debt.minimumPayment);
            const progress = originalBalance > 0 ? ((originalBalance - currentBalance) / originalBalance) * 100 : 0;
            const payoffMonths = calculatePayoffMonths(currentBalance, interestRate, minimumPayment);

            return (
              <Card key={debt.id}>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Link href={`/dashboard/debts/${debt.id}`}>
                      <CardTitle className="hover:text-emerald-400 cursor-pointer">
                        {debt.name}
                      </CardTitle>
                    </Link>
                    <Badge variant={interestRate > 15 ? "danger" : interestRate > 7 ? "warning" : "success"}>
                      {interestRate}% APR
                    </Badge>
                    <Badge>{DEBT_TYPE_LABELS[debt.type] || debt.type}</Badge>
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
                      <p className="text-theme-secondary text-sm">Minimum Payment</p>
                      <p className="text-lg text-theme-secondary">{formatCurrency(minimumPayment)}/mo</p>
                    </div>
                    <div>
                      <p className="text-theme-secondary text-sm">Est. Payoff</p>
                      <p className="text-lg text-theme-secondary">{getPayoffDate(payoffMonths)}</p>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-theme-secondary">
                        Paid off: {formatCurrency(originalBalance - currentBalance)} of {formatCurrency(originalBalance)}
                      </span>
                      <span className="text-emerald-400 font-medium">{progress.toFixed(1)}%</span>
                    </div>
                    <div className="h-3 bg-theme-tertiary rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 transition-all duration-500"
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
                            <span className="text-emerald-400">
                              {formatCurrency(Number(payment.amount))}
                            </span>
                          </div>
                        ))}
                        {debt.payments.length > 3 && (
                          <Link
                            href={`/dashboard/debts/${debt.id}`}
                            className="text-xs text-theme-muted hover:text-emerald-400"
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
