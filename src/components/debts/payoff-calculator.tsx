import { useEffect, useState, useMemo } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  calculatePayoffComparison, 
  formatMonthsToYearsMonths,
  type PayoffResult 
} from "@/lib/payoff-calculator";
import { 
  Calculator, 
  ArrowLeft, 
  TrendingDown, 
  Calendar, 
  DollarSign,
  Check,
  CreditCard,
  Car,
  GraduationCap,
  Banknote,
  Home,
  ShoppingBag,
  FileText,
  type LucideIcon,
} from "lucide-react";

interface Debt {
  id: string;
  name: string;
  type: string;
  currentBalance: string;
  interestRate: string;
  minimumPayment: string;
}

const DEBT_TYPE_ICONS: Record<string, LucideIcon> = {
  CREDIT_CARD: CreditCard,
  AUTO_LOAN: Car,
  STUDENT_LOAN: GraduationCap,
  PERSONAL_LOAN: Banknote,
  BNPL: ShoppingBag,
  MORTGAGE: Home,
  OTHER: FileText,
};

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatCurrencyPrecise(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

export default function PayoffCalculator() {
  const [debts, setDebts] = useState<Debt[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDebtIds, setSelectedDebtIds] = useState<Set<string>>(new Set());
  const [extraPayment, setExtraPayment] = useState<string>("");

  useEffect(() => {
    fetchDebts();
  }, []);

  async function fetchDebts() {
    try {
      const res = await fetch("/api/debts");
      if (res.ok) {
        const data = await res.json();
        const activeDebts = data.filter((d: Debt) => Number(d.currentBalance) > 0);
        setDebts(activeDebts);
        if (activeDebts.length > 0) {
          setSelectedDebtIds(new Set([activeDebts[0].id]));
        }
      }
    } finally {
      setLoading(false);
    }
  }

  function toggleDebt(id: string) {
    setSelectedDebtIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  function selectAllDebts() {
    setSelectedDebtIds(new Set(debts.map(d => d.id)));
  }

  function clearSelection() {
    setSelectedDebtIds(new Set());
  }

  const selectedDebts = debts.filter(d => selectedDebtIds.has(d.id));

  const totals = useMemo(() => {
    return selectedDebts.reduce((acc, debt) => ({
      balance: acc.balance + Number(debt.currentBalance),
      minimumPayment: acc.minimumPayment + Number(debt.minimumPayment),
      weightedApr: acc.weightedApr + (Number(debt.interestRate) * Number(debt.currentBalance)),
    }), { balance: 0, minimumPayment: 0, weightedApr: 0 });
  }, [selectedDebts]);

  const averageApr = totals.balance > 0 ? totals.weightedApr / totals.balance : 0;
  const extraPaymentNum = parseFloat(extraPayment) || 0;

  const comparison = useMemo(() => {
    if (selectedDebts.length === 0 || totals.balance <= 0) {
      return null;
    }

    return calculatePayoffComparison({
      balance: totals.balance,
      apr: averageApr,
      minimumPayment: totals.minimumPayment,
      extraPayment: extraPaymentNum,
    });
  }, [selectedDebts, totals, averageApr, extraPaymentNum]);

  if (loading) {
    return (
      <div className="space-y-6">
        <header>
          <h1 className="text-2xl font-bold text-theme-primary">Debt Payoff Calculator</h1>
        </header>
        <Card>
          <CardContent className="py-16 text-center">
            <div className="animate-pulse space-y-4">
              <div className="h-8 w-48 bg-theme-tertiary rounded mx-auto" />
              <div className="h-4 w-64 bg-theme-tertiary rounded mx-auto" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (debts.length === 0) {
    return (
      <div className="space-y-6">
        <header>
          <h1 className="text-2xl font-bold text-theme-primary">Debt Payoff Calculator</h1>
        </header>
        <Card>
          <CardContent className="py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-accent-50 dark:bg-accent-600/20 flex items-center justify-center mx-auto mb-4">
              <Calculator className="h-8 w-8 text-accent-600" />
            </div>
            <h2 className="text-xl font-semibold text-theme-primary mb-2">No Active Debts</h2>
            <p className="text-theme-secondary mb-6">Add some debts first to calculate your payoff timeline.</p>
            <a href="/dashboard/debts/new">
              <Button>Add Your First Debt</Button>
            </a>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-theme-primary">Debt Payoff Calculator</h1>
          <p className="text-theme-secondary mt-1">See how extra payments can accelerate your debt payoff</p>
        </div>
        <a href="/dashboard/debts">
          <Button variant="ghost" leftIcon={<ArrowLeft className="h-4 w-4" />}>
            Back
          </Button>
        </a>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Select Debts</CardTitle>
                <div className="flex gap-2">
                  <button 
                    onClick={selectAllDebts}
                    className="text-xs text-accent-600 hover:text-accent-700 font-medium"
                  >
                    All
                  </button>
                  <span className="text-theme-muted">·</span>
                  <button 
                    onClick={clearSelection}
                    className="text-xs text-accent-600 hover:text-accent-700 font-medium"
                  >
                    None
                  </button>
                </div>
              </div>
            </CardHeader>
            <CardContent noPadding>
              <div className="divide-y divide-theme">
                {debts.map((debt) => {
                  const isSelected = selectedDebtIds.has(debt.id);
                  const IconComponent = DEBT_TYPE_ICONS[debt.type] || FileText;
                  
                  return (
                    <button
                      key={debt.id}
                      onClick={() => toggleDebt(debt.id)}
                      className={`
                        w-full flex items-center gap-3 p-4 text-left transition-colors
                        ${isSelected 
                          ? "bg-accent-50 dark:bg-accent-600/10" 
                          : "hover:bg-theme-secondary"
                        }
                      `}
                    >
                      <div className={`
                        w-5 h-5 rounded border-2 flex items-center justify-center shrink-0
                        transition-colors
                        ${isSelected 
                          ? "bg-accent-600 border-accent-600 text-white" 
                          : "border-gray-300 dark:border-gray-600"
                        }
                      `}>
                        {isSelected && <Check className="h-3 w-3" />}
                      </div>
                      <div className="p-1.5 rounded bg-theme-tertiary shrink-0">
                        <IconComponent className="h-4 w-4 text-theme-secondary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-theme-primary truncate">{debt.name}</p>
                        <p className="text-xs text-theme-muted">
                          {formatCurrency(Number(debt.currentBalance))} · {debt.interestRate}% APR
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Extra Monthly Payment</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-theme-muted" />
                <input
                  type="number"
                  min="0"
                  step="50"
                  value={extraPayment}
                  onChange={(e) => setExtraPayment(e.target.value)}
                  placeholder="0"
                  className="
                    w-full pl-10 pr-4 py-3 rounded-xl
                    bg-theme-secondary border border-theme
                    text-theme-primary text-lg font-medium
                    placeholder:text-theme-muted
                    focus:outline-none focus:ring-2 focus:ring-accent-600 focus:border-transparent
                  "
                />
              </div>
              <p className="text-xs text-theme-muted mt-2">
                Enter an additional amount to pay each month
              </p>
              <div className="flex gap-2 mt-3">
                {[50, 100, 200, 500].map((amount) => (
                  <button
                    key={amount}
                    onClick={() => setExtraPayment(amount.toString())}
                    className={`
                      flex-1 py-2 rounded-lg text-sm font-medium transition-colors
                      ${extraPayment === amount.toString()
                        ? "bg-accent-600 text-white"
                        : "bg-theme-tertiary text-theme-secondary hover:bg-theme-secondary"
                      }
                    `}
                  >
                    ${amount}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-4">
          {selectedDebts.length === 0 ? (
            <Card>
              <CardContent className="py-16 text-center">
                <div className="w-16 h-16 rounded-full bg-theme-tertiary flex items-center justify-center mx-auto mb-4">
                  <Calculator className="h-8 w-8 text-theme-muted" />
                </div>
                <h3 className="text-lg font-semibold text-theme-primary mb-2">Select debts to calculate</h3>
                <p className="text-theme-secondary">
                  Choose one or more debts from the list to see your payoff timeline
                </p>
              </CardContent>
            </Card>
          ) : comparison ? (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Card>
                  <CardContent className="py-4">
                    <p className="text-xs text-theme-muted uppercase tracking-wide mb-1">Total Balance</p>
                    <p className="text-xl font-bold text-theme-primary">{formatCurrency(totals.balance)}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="py-4">
                    <p className="text-xs text-theme-muted uppercase tracking-wide mb-1">Monthly Payment</p>
                    <p className="text-xl font-bold text-theme-primary">
                      {formatCurrency(totals.minimumPayment + extraPaymentNum)}
                    </p>
                    {extraPaymentNum > 0 && (
                      <p className="text-xs text-emerald-600 dark:text-emerald-400">
                        +{formatCurrency(extraPaymentNum)} extra
                      </p>
                    )}
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="py-4">
                    <p className="text-xs text-theme-muted uppercase tracking-wide mb-1">Avg. APR</p>
                    <p className="text-xl font-bold text-theme-primary">{averageApr.toFixed(1)}%</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="py-4">
                    <p className="text-xs text-theme-muted uppercase tracking-wide mb-1">Debts Selected</p>
                    <p className="text-xl font-bold text-theme-primary">{selectedDebts.length}</p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Payoff Comparison</CardTitle>
                </CardHeader>
                <CardContent>
                  {comparison.withMinimum === null ? (
                    <div className="text-center py-8">
                      <p className="text-danger-600 dark:text-danger-400 font-medium">
                        Minimum payment is too low to pay off this debt
                      </p>
                      <p className="text-theme-secondary text-sm mt-2">
                        The monthly interest exceeds your minimum payment
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <PayoffCard
                          title="With Minimum Payments"
                          result={comparison.withMinimum}
                          isHighlighted={false}
                          payment={totals.minimumPayment}
                        />
                        {extraPaymentNum > 0 && comparison.withExtra && (
                          <PayoffCard
                            title="With Extra Payments"
                            result={comparison.withExtra}
                            isHighlighted={true}
                            payment={totals.minimumPayment + extraPaymentNum}
                          />
                        )}
                      </div>

                      {extraPaymentNum > 0 && comparison.monthsSaved > 0 && (
                        <div className="bg-emerald-50 dark:bg-emerald-600/10 border border-emerald-200 dark:border-emerald-600/30 rounded-xl p-5">
                          <div className="flex items-start gap-4">
                            <div className="p-2.5 rounded-lg bg-emerald-100 dark:bg-emerald-600/20">
                              <TrendingDown className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-emerald-700 dark:text-emerald-400">
                                You'll save {formatMonthsToYearsMonths(comparison.monthsSaved)}!
                              </h4>
                              <p className="text-emerald-600 dark:text-emerald-400/80 mt-1">
                                Plus <strong>{formatCurrencyPrecise(comparison.interestSaved)}</strong> in interest charges
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      <PayoffTimeline 
                        withMinimum={comparison.withMinimum} 
                        withExtra={comparison.withExtra} 
                        hasExtra={extraPaymentNum > 0}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function PayoffCard({ 
  title, 
  result, 
  isHighlighted,
  payment,
}: { 
  title: string; 
  result: PayoffResult; 
  isHighlighted: boolean;
  payment: number;
}) {
  return (
    <div className={`
      rounded-xl border p-5 transition-all
      ${isHighlighted 
        ? "border-accent-300 dark:border-accent-600/50 bg-accent-50/50 dark:bg-accent-600/5" 
        : "border-theme bg-theme-secondary"
      }
    `}>
      <h4 className={`font-semibold mb-4 ${isHighlighted ? "text-accent-600" : "text-theme-secondary"}`}>
        {title}
      </h4>
      <div className="space-y-3">
        <div className="flex justify-between">
          <span className="text-theme-muted">Monthly Payment</span>
          <span className="font-medium text-theme-primary">{formatCurrency(payment)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-theme-muted">Time to Payoff</span>
          <span className="font-medium text-theme-primary">{formatMonthsToYearsMonths(result.months)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-theme-muted">Payoff Date</span>
          <span className="font-medium text-theme-primary">
            {result.payoffDate.toLocaleDateString("en-US", { month: "short", year: "numeric" })}
          </span>
        </div>
        <div className="border-t border-theme pt-3 mt-3">
          <div className="flex justify-between">
            <span className="text-theme-muted">Total Interest</span>
            <span className={`font-bold ${isHighlighted ? "text-emerald-600 dark:text-emerald-400" : "text-theme-primary"}`}>
              {formatCurrencyPrecise(result.totalInterest)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function PayoffTimeline({ 
  withMinimum, 
  withExtra, 
  hasExtra 
}: { 
  withMinimum: PayoffResult; 
  withExtra: PayoffResult | null;
  hasExtra: boolean;
}) {
  const maxMonths = withMinimum.months;
  const extraMonths = withExtra?.months ?? maxMonths;
  
  const minimumPercentage = 100;
  const extraPercentage = maxMonths > 0 ? (extraMonths / maxMonths) * 100 : 100;

  return (
    <div className="space-y-3">
      <h4 className="font-medium text-theme-primary flex items-center gap-2">
        <Calendar className="h-4 w-4 text-theme-muted" />
        Payoff Timeline
      </h4>
      
      <div className="space-y-3">
        <div className="space-y-1.5">
          <div className="flex justify-between text-sm">
            <span className="text-theme-muted">Minimum payments</span>
            <span className="text-theme-secondary font-medium">
              {formatMonthsToYearsMonths(withMinimum.months)}
            </span>
          </div>
          <div className="h-3 bg-theme-tertiary rounded-full overflow-hidden">
            <div 
              className="h-full bg-gray-400 dark:bg-gray-500 rounded-full transition-all duration-500"
              style={{ width: `${minimumPercentage}%` }}
            />
          </div>
        </div>

        {hasExtra && withExtra && (
          <div className="space-y-1.5">
            <div className="flex justify-between text-sm">
              <span className="text-accent-600 font-medium">With extra payments</span>
              <span className="text-accent-600 font-medium">
                {formatMonthsToYearsMonths(withExtra.months)}
              </span>
            </div>
            <div className="h-3 bg-theme-tertiary rounded-full overflow-hidden">
              <div 
                className="h-full bg-accent-600 rounded-full transition-all duration-500"
                style={{ width: `${extraPercentage}%` }}
              />
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-between text-xs text-theme-muted pt-2 border-t border-theme">
        <span>Today</span>
        <span>{withMinimum.payoffDate.toLocaleDateString("en-US", { month: "short", year: "numeric" })}</span>
      </div>
    </div>
  );
}
