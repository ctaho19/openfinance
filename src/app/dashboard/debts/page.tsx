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
  BNPL: ShoppingBag,
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
        <div className="space-y-4">
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

            return (
              <Card 
                key={debt.id} 
                className={`animate-fade-in-up stagger-${Math.min(index + 1, 5)}`}
                hover
              >
                <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3 flex-wrap">
                    <div className="p-2 rounded-xl bg-theme-tertiary">
                      {(() => {
                        const IconComponent = DEBT_TYPE_ICONS[debt.type] || FileText;
                        return <IconComponent className="h-5 w-5 text-theme-secondary" />;
                      })()}
                    </div>
                    <div>
                      <Link href={`/dashboard/debts/${debt.id}`}>
                        <CardTitle className="hover:text-accent-600 dark:hover:text-accent-400 cursor-pointer transition-colors">
                          {debt.name}
                        </CardTitle>
                      </Link>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        {displayRate > 0 && (
                          <Badge 
                            variant={displayRate > 15 ? "danger" : displayRate > 7 ? "warning" : "success"}
                            size="sm"
                          >
                            {hasEffectiveRate ? `~${effectiveRate.toFixed(1)}% eff.` : `${interestRate}% APR`}
                          </Badge>
                        )}
                        {isBNPL && displayRate === 0 && (
                          <Badge variant="success" size="sm">0% APR</Badge>
                        )}
                        <Badge size="sm">{DEBT_TYPE_LABELS[debt.type] || debt.type}</Badge>
                        {debt.status !== "CURRENT" && (
                          <StatusBadge status={debt.status === "DEFERRED" ? "deferred" : debt.status === "PAID_OFF" ? "paid" : "overdue"} />
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Button size="sm" onClick={() => setPaymentDebt(debt)} leftIcon={<DollarSign className="h-4 w-4" />}>
                      Log Payment
                    </Button>
                    <Link href={`/dashboard/debts/${debt.id}/edit`}>
                      <Button variant="ghost" size="sm" leftIcon={<Pencil className="h-4 w-4" />}>
                        Edit
                      </Button>
                    </Link>
                    <Button variant="danger" size="sm" onClick={() => handleDelete(debt.id)} leftIcon={<Trash2 className="h-4 w-4" />}>
                      Delete
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-3 rounded-xl bg-theme-secondary">
                      <p className="text-theme-muted text-xs font-medium uppercase tracking-wider">Balance</p>
                      <p className="text-xl font-bold text-theme-primary mt-1">{formatCurrency(currentBalance)}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-theme-secondary">
                      <p className="text-theme-muted text-xs font-medium uppercase tracking-wider">Original</p>
                      <p className="text-lg font-semibold text-theme-secondary mt-1">{formatCurrency(originalBalance)}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-theme-secondary">
                      <p className="text-theme-muted text-xs font-medium uppercase tracking-wider">
                        {isBNPL ? "Payment" : "Minimum"}
                      </p>
                      <p className="text-lg font-semibold text-theme-secondary mt-1">
                        {formatCurrency(Number(debt.minimumPayment))}
                        {!isBNPL && <span className="text-sm font-normal">/mo</span>}
                      </p>
                    </div>
                    <div className="p-3 rounded-xl bg-theme-secondary">
                      <p className="text-theme-muted text-xs font-medium uppercase tracking-wider">Est. Payoff</p>
                      <p className="text-lg font-semibold text-theme-secondary mt-1">{payoffInfo.date}</p>
                      {isBNPL && payoffInfo.months !== null && payoffInfo.months > 0 && (
                        <p className="text-xs text-theme-muted">{payoffInfo.months} payments left</p>
                      )}
                    </div>
                  </div>

                  {/* BNPL Scheduled Payments */}
                  {isBNPL && debt.scheduledPayments && debt.scheduledPayments.length > 0 && (
                    <div className="pt-4 border-t border-theme">
                      <p className="text-theme-muted text-xs font-medium uppercase tracking-wider mb-3 flex items-center gap-2">
                        <Calendar className="h-3.5 w-3.5" />
                        Upcoming Payments
                      </p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {debt.scheduledPayments
                          .filter(p => !p.isPaid)
                          .slice(0, 4)
                          .map((payment) => (
                            <div
                              key={payment.id}
                              className="flex justify-between items-center text-sm p-3 rounded-lg bg-theme-tertiary"
                            >
                              <span className="text-theme-muted flex items-center gap-1.5">
                                <Clock className="h-3 w-3" />
                                {new Date(payment.dueDate).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                })}
                              </span>
                              <span className="text-theme-primary font-semibold">
                                {formatCurrency(Number(payment.amount))}
                              </span>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}

                  {/* Deferment Alert */}
                  {debt.status === "DEFERRED" && debt.deferredUntil && (
                    <div className="flex items-center gap-3 p-4 rounded-xl bg-info-50 dark:bg-info-600/10 border border-info-200 dark:border-info-600/30">
                      <AlertCircle className="h-5 w-5 text-info-600 dark:text-info-400 shrink-0" />
                      <div className="text-sm">
                        <span className="text-info-700 dark:text-info-400 font-medium">
                          Deferred until {new Date(debt.deferredUntil).toLocaleDateString()}
                        </span>
                        {!isBNPL && (
                          <span className="text-info-600/80 dark:text-info-400/80"> — Interest continues to accrue</span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Progress Bar */}
                  <div className="pt-2">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-theme-secondary">
                        Paid off: {formatCurrency(originalBalance - currentBalance)}
                      </span>
                      <span className="text-accent-600 dark:text-accent-400 font-semibold">{progress.toFixed(1)}%</span>
                    </div>
                    <div className="progress-bar">
                      <div
                        className="progress-bar-fill"
                        style={{ width: `${Math.min(progress, 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Recent Payments */}
                  {debt.payments && debt.payments.length > 0 && (
                    <div className="pt-4 border-t border-theme">
                      <p className="text-theme-muted text-xs font-medium uppercase tracking-wider mb-3">Recent Payments</p>
                      <div className="space-y-2">
                        {debt.payments.slice(0, 3).map((payment) => (
                          <div key={payment.id} className="flex justify-between items-center text-sm py-1">
                            <span className="text-theme-muted">
                              {new Date(payment.date).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                              })}
                            </span>
                            <span className="text-success-600 dark:text-success-400 font-medium">
                              {formatCurrency(Number(payment.amount))}
                            </span>
                          </div>
                        ))}
                        {debt.payments.length > 3 && (
                          <Link
                            href={`/dashboard/debts/${debt.id}`}
                            className="text-sm text-accent-600 dark:text-accent-400 hover:underline flex items-center gap-1"
                          >
                            +{debt.payments.length - 3} more payments
                            <ChevronRight className="h-4 w-4" />
                          </Link>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Notes */}
                  {debt.notes && (
                    <p className="text-theme-muted text-sm pt-2 border-t border-theme italic">{debt.notes}</p>
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
