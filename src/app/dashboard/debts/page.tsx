"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent, StatCard } from "@/components/ui/card";
import { Button, ToggleGroup } from "@/components/ui/button";
import { Badge, StatusBadge } from "@/components/ui/badge";
import { PaymentForm } from "./payment-form";
import { SearchInput } from "@/components/ui/search-input";
import { 
  Plus, 
  CreditCard, 
  Wallet, 
  TrendingDown, 
  Calendar,
  ArrowUpDown,
  ChevronRight,
  Trash2,
  Pencil,
  DollarSign,
  Clock,
  AlertCircle,
  Car,
  GraduationCap,
  Banknote,
  ShoppingBag,
  Home,
  FileText,
  type LucideIcon,
} from "lucide-react";

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
  effectiveRate: string | null;
  totalRepayable: string | null;
  minimumPayment: string;
  dueDay: number;
  deferredUntil: string | null;
  isActive: boolean;
  notes: string | null;
  payments?: DebtPayment[];
  scheduledPayments?: ScheduledPayment[];
}

type SortField = "name" | "interestRate" | "effectiveRate" | "currentBalance" | "dueDay" | "status";
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

const DEBT_TYPE_ICONS: Record<string, LucideIcon> = {
  CREDIT_CARD: CreditCard,
  AUTO_LOAN: Car,
  STUDENT_LOAN: GraduationCap,
  PERSONAL_LOAN: Banknote,
  BNPL: Calendar,
  MORTGAGE: Home,
  OTHER: FileText,
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

  let adjustedBalance = balance;
  if (isDeferred && debt.deferredUntil) {
    const deferredUntil = new Date(debt.deferredUntil);
    const now = new Date();
    if (deferredUntil > now) {
      const monthsDeferred = Math.ceil((deferredUntil.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 30));
      const monthlyRate = rate / 100 / 12;
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
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [debts, setDebts] = useState<Debt[]>([]);
  const [loading, setLoading] = useState(true);
  const [paymentDebt, setPaymentDebt] = useState<Debt | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  
  const urlSortField = searchParams.get("sort") as SortField | null;
  const urlSortDir = searchParams.get("dir") as SortDirection | null;
  const validSortFields: SortField[] = ["name", "interestRate", "effectiveRate", "currentBalance", "dueDay", "status"];
  
  const [sortField, setSortField] = useState<SortField>(
    urlSortField && validSortFields.includes(urlSortField) ? urlSortField : "effectiveRate"
  );
  const [sortDirection, setSortDirection] = useState<SortDirection>(
    urlSortDir === "asc" || urlSortDir === "desc" ? urlSortDir : "desc"
  );

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
    let newDirection: SortDirection;
    if (sortField === field) {
      newDirection = sortDirection === "asc" ? "desc" : "asc";
    } else {
      newDirection = field === "name" ? "asc" : "desc";
    }
    
    setSortField(field);
    setSortDirection(newDirection);
    
    const params = new URLSearchParams(searchParams.toString());
    params.set("sort", field);
    params.set("dir", newDirection);
    router.replace(`/dashboard/debts?${params.toString()}`, { scroll: false });
  }

  const filteredDebts = debts.filter((debt) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      debt.name.toLowerCase().includes(query) ||
      debt.type.toLowerCase().includes(query) ||
      debt.status.toLowerCase().includes(query) ||
      (debt.notes?.toLowerCase().includes(query) ?? false)
    );
  });

  const sortedDebts = [...filteredDebts].sort((a, b) => {
    let aVal: string | number;
    let bVal: string | number;

    switch (sortField) {
      case "name":
        const comparison = a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: "base" });
        return sortDirection === "asc" ? comparison : -comparison;
      case "interestRate":
        aVal = Number(a.interestRate);
        bVal = Number(b.interestRate);
        break;
      case "effectiveRate":
        aVal = Math.max(Number(a.effectiveRate) || 0, Number(a.interestRate) || 0);
        bVal = Math.max(Number(b.effectiveRate) || 0, Number(b.interestRate) || 0);
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
  const regularDebts = debts.filter(d => d.type !== "BNPL");
  const bnplDebts = debts.filter(d => d.type === "BNPL");
  
  const monthlyMinPayment = regularDebts.reduce((sum, d) => sum + Number(d.minimumPayment), 0);
  const bnplMonthlyEstimate = bnplDebts.reduce((sum, d) => {
    if (d.scheduledPayments && d.scheduledPayments.length > 0) {
      const unpaid = d.scheduledPayments.filter(p => !p.isPaid);
      if (unpaid.length === 0) return sum;
      const now = new Date();
      const in30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      const paymentsThisMonth = unpaid.filter(p => new Date(p.dueDate) <= in30Days);
      return sum + paymentsThisMonth.reduce((s, p) => s + Number(p.amount), 0);
    }
    return sum;
  }, 0);

  if (loading) {
    return (
      <div className="space-y-6 lg:space-y-8 animate-fade-in">
        <header>
          <h1 className="text-2xl lg:text-3xl font-bold text-theme-primary tracking-tight">Debts</h1>
          <p className="text-theme-secondary mt-1">Track and manage your debts</p>
        </header>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="py-5">
                <div className="animate-pulse space-y-3">
                  <div className="h-4 w-24 bg-theme-tertiary rounded" />
                  <div className="h-8 w-32 bg-theme-tertiary rounded" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const SortButton = ({ field, label }: { field: SortField; label: string }) => (
    <button
      onClick={() => handleSort(field)}
      className={`
        flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
        transition-all duration-200
        ${sortField === field
          ? "bg-accent-600 text-white shadow-sm"
          : "bg-theme-tertiary text-theme-secondary hover:bg-theme-secondary hover:text-theme-primary"
        }
      `}
    >
      {label}
      <ArrowUpDown className="h-3 w-3" />
    </button>
  );

  return (
    <div className="space-y-6 lg:space-y-8 animate-fade-in">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-theme-primary tracking-tight">Debts</h1>
          <p className="text-theme-secondary mt-1">
            Track and manage your debts
          </p>
        </div>
        <Link href="/dashboard/debts/new">
          <Button leftIcon={<Plus className="h-4 w-4" />}>
            Add Debt
          </Button>
        </Link>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          label="Total Debt"
          value={formatCurrency(totalDebt)}
          icon={<CreditCard className="h-5 w-5" />}
          variant="danger"
        />
        <StatCard
          label="Monthly Payments"
          value={formatCurrency(monthlyMinPayment)}
          icon={<Wallet className="h-5 w-5" />}
          variant="info"
        />
        <StatCard
          label="BNPL Due This Month"
          value={formatCurrency(bnplMonthlyEstimate)}
          icon={<TrendingDown className="h-5 w-5" />}
          variant="warning"
        />
      </div>

      {/* Search and Sort */}
      <div className="flex flex-col sm:flex-row gap-4">
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search debts..."
          className="sm:max-w-xs"
        />
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-theme-secondary text-sm font-medium">Sort:</span>
          <SortButton field="effectiveRate" label="Effective Rate" />
          <SortButton field="interestRate" label="APR" />
          <SortButton field="currentBalance" label="Balance" />
          <SortButton field="name" label="Name" />
        </div>
      </div>

      {/* Debts List */}
      {debts.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-theme-tertiary flex items-center justify-center mx-auto mb-4">
              <CreditCard className="h-8 w-8 text-theme-muted" />
            </div>
            <h3 className="text-lg font-semibold text-theme-primary mb-2">No debts yet</h3>
            <p className="text-theme-secondary mb-6">
              Start tracking your debts to monitor your progress
            </p>
            <Link href="/dashboard/debts/new">
              <Button leftIcon={<Plus className="h-4 w-4" />}>
                Add Your First Debt
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : filteredDebts.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-theme-tertiary flex items-center justify-center mx-auto mb-4">
              <CreditCard className="h-8 w-8 text-theme-muted" />
            </div>
            <h3 className="text-lg font-semibold text-theme-primary mb-2">No results found</h3>
            <p className="text-theme-secondary">
              No debts match &quot;{searchQuery}&quot;
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {sortedDebts.map((debt, index) => {
            const currentBalance = Number(debt.currentBalance);
            const originalBalance = Number(debt.originalBalance);
            const interestRate = Number(debt.interestRate);
            const effectiveRate = Number(debt.effectiveRate) || 0;
            const displayRate = Math.max(effectiveRate, interestRate);
            const progress = originalBalance > 0 ? ((originalBalance - currentBalance) / originalBalance) * 100 : 0;
            const payoffInfo = calculatePayoffInfo(debt);
            const isBNPL = debt.type === "BNPL";
            const hasEffectiveRate = isBNPL && effectiveRate > 0 && effectiveRate !== interestRate;
            const IconComponent = DEBT_TYPE_ICONS[debt.type] || FileText;
            const isPastDue = debt.status === "PAST_DUE" || debt.status === "IN_COLLECTIONS";

            return (
              <Card 
                key={debt.id} 
                className={`animate-fade-in-up stagger-${Math.min(index + 1, 5)} ${
                  isPastDue ? "border-danger-300 dark:border-danger-600/50 bg-danger-50/50 dark:bg-danger-600/5" : ""
                }`}
              >
                <CardContent className="py-5">
                  {/* Main Row: Icon, Name/Type, Balance, Actions */}
                  <div className="flex items-center gap-4">
                    <div className="p-2.5 rounded-lg bg-theme-tertiary shrink-0">
                      <IconComponent className="h-5 w-5 text-theme-secondary" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <Link href={`/dashboard/debts/${debt.id}`} className="group">
                        <h3 className="font-semibold text-theme-primary group-hover:text-accent-600 transition-colors truncate">
                          {debt.name}
                        </h3>
                      </Link>
                      <p className="text-sm text-theme-muted">
                        {DEBT_TYPE_LABELS[debt.type] || debt.type}
                        {displayRate > 0 && ` · ${hasEffectiveRate ? `~${effectiveRate.toFixed(1)}%` : `${interestRate}%`} APR`}
                        {isBNPL && displayRate === 0 && " · 0% APR"}
                        {debt.status !== "CURRENT" && ` · ${STATUS_LABELS[debt.status]}`}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      {isPastDue ? (
                        <div className="px-3 py-1.5 rounded-lg bg-danger-100 dark:bg-danger-600/20 border border-danger-200 dark:border-danger-600/30">
                          <p className="text-lg font-bold text-danger-700 dark:text-danger-400">{formatCurrency(currentBalance)}</p>
                          <p className="text-xs text-danger-600 dark:text-danger-400">PAST DUE</p>
                        </div>
                      ) : (
                        <>
                          <p className="text-lg font-bold text-theme-primary">{formatCurrency(currentBalance)}</p>
                          <p className="text-xs text-theme-muted">{formatCurrency(Number(debt.minimumPayment))}/mo</p>
                        </>
                      )}
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <Button size="sm" variant="ghost" onClick={() => setPaymentDebt(debt)}>
                        <DollarSign className="h-4 w-4" />
                      </Button>
                      <Link href={`/dashboard/debts/${debt.id}/edit?sort=${sortField}&dir=${sortDirection}`}>
                        <Button variant="ghost" size="sm">
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(debt.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-4">
                    <div className="flex justify-between text-xs text-theme-muted mb-1.5">
                      <span>{progress.toFixed(0)}% paid off</span>
                      <span>Payoff: {payoffInfo.date}</span>
                    </div>
                    <div className="progress-bar h-1.5">
                      <div
                        className="progress-bar-fill"
                        style={{ width: `${Math.min(progress, 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* BNPL Upcoming Payments - Compact */}
                  {isBNPL && debt.scheduledPayments && debt.scheduledPayments.filter(p => !p.isPaid).length > 0 && (
                    <div className="mt-4 pt-4 border-t border-theme">
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-theme-muted">Next payments:</span>
                        <div className="flex gap-3 flex-wrap">
                          {debt.scheduledPayments
                            .filter(p => !p.isPaid)
                            .slice(0, 3)
                            .map((payment) => (
                              <span key={payment.id} className="text-theme-secondary">
                                {new Date(payment.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                                <span className="text-theme-primary font-medium ml-1">{formatCurrency(Number(payment.amount))}</span>
                              </span>
                            ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Deferment Notice - Compact */}
                  {debt.status === "DEFERRED" && debt.deferredUntil && (
                    <div className="mt-3 flex items-center gap-2 text-sm text-theme-muted">
                      <AlertCircle className="h-4 w-4" />
                      <span>Deferred until {new Date(debt.deferredUntil).toLocaleDateString()}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Payment Modal */}
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
