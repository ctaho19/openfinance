import { useState, useEffect } from "react";
import { 
  ArrowRight, 
  CheckCircle2, 
  Circle, 
  CreditCard, 
  PiggyBank, 
  Wallet, 
  TrendingDown,
  AlertTriangle,
  Target,
  Zap,
  ArrowDown,
  Building2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { format } from "date-fns";

interface PlanStep {
  id: string;
  type: "TRANSFER" | "BILL_PAYMENT" | "EXTRA_DEBT_PAYMENT" | "SAVINGS_TRANSFER";
  order: number;
  label: string;
  amount: number;
  fromAccountId?: string;
  fromAccountName?: string;
  toAccountId?: string;
  toAccountName?: string;
  billPaymentId?: string;
  debtId?: string;
  savingsGoalId?: string;
  dueDate?: string;
  purpose?: string;
}

interface AvalancheTarget {
  debtId: string;
  debtName: string;
  bankAccountId: string | null;
  bankAccountName: string | null;
  interestRate: number;
  currentBalance: number;
}

interface PayoffProgress {
  startDate?: string;
  targetDate?: string;
  startDebt?: number;
  currentDebt: number;
  debtPaid?: number;
  debtProgressPct?: number;
  timeProgressPct?: number;
  onTrack?: boolean;
  monthsRemaining?: number;
}

interface DollarAllocationPlan {
  period: {
    startDate: string;
    endDate: string;
    paycheckDate: string;
  };
  paycheckAmount: number;
  totalBillsThisPeriod: number;      // All bills for period (paid + unpaid)
  billsRemainingThisPeriod: number;  // Only unpaid bills
  billsPaidThisPeriod: number;       // Already paid
  discretionaryThisPaycheck: number;
  surplusSplit: {
    surplus: number;
    savingsAllocation: number;
    debtAllocation: number;
    isNegative: boolean;
  };
  avalancheTarget?: AvalancheTarget;
  steps: PlanStep[];
  transfers: PlanStep[];
  billPayments: PlanStep[];
  extraDebtStep?: PlanStep;
  savingsStep?: PlanStep;
  payoffProgress: PayoffProgress;
  emergencyFundCurrent: number;
  emergencyFundTarget: number;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(amount);
}

function ChecklistItem({
  step,
  isCompleted,
  onToggle,
  isLoading,
}: {
  step: PlanStep;
  isCompleted: boolean;
  onToggle: () => void;
  isLoading: boolean;
}) {
  const getIcon = () => {
    switch (step.type) {
      case "TRANSFER":
        return <ArrowRight className="h-5 w-5" />;
      case "BILL_PAYMENT":
        return <CreditCard className="h-5 w-5" />;
      case "EXTRA_DEBT_PAYMENT":
        return <Zap className="h-5 w-5" />;
      case "SAVINGS_TRANSFER":
        return <PiggyBank className="h-5 w-5" />;
      default:
        return <Wallet className="h-5 w-5" />;
    }
  };

  const getBgColor = () => {
    if (isCompleted) return "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800";
    switch (step.type) {
      case "TRANSFER":
        return "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800";
      case "BILL_PAYMENT":
        return "bg-white dark:bg-[#1c2128] border-gray-200 dark:border-[#30363d]";
      case "EXTRA_DEBT_PAYMENT":
        return "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800";
      case "SAVINGS_TRANSFER":
        return "bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800";
      default:
        return "bg-white dark:bg-[#1c2128] border-gray-200 dark:border-[#30363d]";
    }
  };

  const getIconColor = () => {
    if (isCompleted) return "text-emerald-600 dark:text-emerald-400";
    switch (step.type) {
      case "TRANSFER":
        return "text-blue-600 dark:text-blue-400";
      case "EXTRA_DEBT_PAYMENT":
        return "text-amber-600 dark:text-amber-400";
      case "SAVINGS_TRANSFER":
        return "text-purple-600 dark:text-purple-400";
      default:
        return "text-gray-600 dark:text-gray-400";
    }
  };

  return (
    <div
      onClick={() => !isLoading && onToggle()}
      className={`
        flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer
        transition-all duration-200 hover:shadow-md
        ${getBgColor()}
        ${isCompleted ? "opacity-75" : ""}
      `}
    >
      <div className="flex-shrink-0 mt-0.5">
        {isLoading ? (
          <div className="h-6 w-6 rounded-full border-2 border-gray-300 border-t-blue-600 animate-spin" />
        ) : isCompleted ? (
          <CheckCircle2 className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
        ) : (
          <Circle className="h-6 w-6 text-gray-400 dark:text-gray-500" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className={getIconColor()}>{getIcon()}</span>
          <span className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
            {step.type.replace(/_/g, " ")}
          </span>
        </div>
        <p className={`font-medium ${isCompleted ? "line-through text-gray-500" : "text-gray-900 dark:text-gray-100"}`}>
          {step.label}
        </p>
        {step.dueDate && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Due: {format(new Date(step.dueDate), "MMM d, yyyy")}
          </p>
        )}
      </div>

      <div className="flex-shrink-0 text-right">
        <p className={`text-lg font-semibold ${isCompleted ? "text-gray-500 line-through" : "text-gray-900 dark:text-gray-100"}`}>
          {formatCurrency(step.amount)}
        </p>
      </div>
    </div>
  );
}

function ProgressBar({ 
  progress, 
  label, 
  color = "blue" 
}: { 
  progress: number; 
  label: string; 
  color?: "blue" | "emerald" | "amber" 
}) {
  const colors = {
    blue: "bg-blue-600 dark:bg-blue-500",
    emerald: "bg-emerald-600 dark:bg-emerald-500",
    amber: "bg-amber-600 dark:bg-amber-500",
  };

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="text-gray-600 dark:text-gray-400">{label}</span>
        <span className="font-medium text-gray-900 dark:text-gray-100">
          {(progress * 100).toFixed(1)}%
        </span>
      </div>
      <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div
          className={`h-full ${colors[color]} transition-all duration-500`}
          style={{ width: `${Math.min(100, progress * 100)}%` }}
        />
      </div>
    </div>
  );
}

export function PaycheckPlanView() {
  const [plan, setPlan] = useState<DollarAllocationPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
  const [processingStep, setProcessingStep] = useState<string | null>(null);

  useEffect(() => {
    fetchPlan();
    const saved = localStorage.getItem("paycheck-plan-completed");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.periodStart === plan?.period.startDate) {
          setCompletedSteps(new Set(parsed.steps));
        }
      } catch {}
    }
  }, []);

  useEffect(() => {
    if (plan) {
      localStorage.setItem(
        "paycheck-plan-completed",
        JSON.stringify({
          periodStart: plan.period.startDate,
          steps: Array.from(completedSteps),
        })
      );
    }
  }, [completedSteps, plan]);

  async function fetchPlan() {
    try {
      setLoading(true);
      const res = await fetch("/api/paycheck-plan");
      if (!res.ok) throw new Error("Failed to fetch plan");
      const data = await res.json();
      setPlan(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load plan");
    } finally {
      setLoading(false);
    }
  }

  async function handleToggleStep(step: PlanStep) {
    if (completedSteps.has(step.id)) {
      setCompletedSteps((prev) => {
        const next = new Set(prev);
        next.delete(step.id);
        return next;
      });
      return;
    }

    setProcessingStep(step.id);

    try {
      if (step.type === "BILL_PAYMENT" && step.billPaymentId) {
        await fetch(`/api/bill-payments/${step.billPaymentId}/pay`, {
          method: "POST",
        });
      } else if (step.type === "EXTRA_DEBT_PAYMENT" && step.debtId) {
        await fetch("/api/paycheck-plan/extra-payment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ debtId: step.debtId, amount: step.amount }),
        });
      } else if (step.type === "SAVINGS_TRANSFER") {
        await fetch("/api/paycheck-plan/emergency-fund", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amount: step.amount }),
        });
      }

      setCompletedSteps((prev) => new Set([...prev, step.id]));
      
      if (step.type === "EXTRA_DEBT_PAYMENT" || step.type === "BILL_PAYMENT") {
        fetchPlan();
      }
    } catch (err) {
      console.error("Failed to process step:", err);
    } finally {
      setProcessingStep(null);
    }
  }

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-xl" />
        <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded-xl" />
        <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-xl" />
      </div>
    );
  }

  if (error || !plan) {
    return (
      <Card variant="outlined" className="border-red-200 dark:border-red-800">
        <CardContent className="py-8 text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 dark:text-red-400 font-medium">{error || "Failed to load plan"}</p>
          <button
            onClick={fetchPlan}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </CardContent>
      </Card>
    );
  }

  const periodLabel = `${format(new Date(plan.period.startDate), "MMM d")} - ${format(new Date(plan.period.endDate), "MMM d, yyyy")}`;
  const completionPct = plan.steps.length > 0 
    ? (completedSteps.size / plan.steps.length) * 100 
    : 0;

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <Card variant="gradient" className="relative overflow-hidden">
        <CardContent className="py-6">
          <div className="flex items-center gap-2 mb-2">
            <Wallet className="h-5 w-5 text-white/80" />
            <span className="text-sm text-white/80 font-medium">Paycheck Plan</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-1">
            {formatCurrency(plan.paycheckAmount)}
          </h1>
          <p className="text-white/70">{periodLabel}</p>

          <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-white/60 uppercase tracking-wide">Total Bills</p>
              <p className="text-lg font-semibold text-white">
                {formatCurrency(plan.totalBillsThisPeriod)}
              </p>
            </div>
            <div>
              <p className="text-xs text-white/60 uppercase tracking-wide">Remaining</p>
              <p className="text-lg font-semibold text-amber-300">
                {formatCurrency(plan.billsRemainingThisPeriod)}
              </p>
              {plan.billsPaidThisPeriod > 0 && (
                <p className="text-xs text-white/50">
                  {formatCurrency(plan.billsPaidThisPeriod)} paid
                </p>
              )}
            </div>
            <div>
              <p className="text-xs text-white/60 uppercase tracking-wide">Spending</p>
              <p className="text-lg font-semibold text-white">
                {formatCurrency(plan.discretionaryThisPaycheck)}
              </p>
            </div>
            <div>
              <p className="text-xs text-white/60 uppercase tracking-wide">True Surplus</p>
              <p className={`text-lg font-semibold ${plan.surplusSplit.isNegative ? "text-red-300" : "text-emerald-300"}`}>
                {formatCurrency(plan.surplusSplit.surplus)}
              </p>
            </div>
          </div>

          {completionPct > 0 && (
            <div className="mt-4">
              <div className="flex justify-between text-xs text-white/70 mb-1">
                <span>Progress</span>
                <span>{completionPct.toFixed(0)}% complete</span>
              </div>
              <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white transition-all duration-500"
                  style={{ width: `${completionPct}%` }}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Negative Surplus Warning */}
      {plan.surplusSplit.isNegative && (
        <Card variant="outlined" className="border-red-300 dark:border-red-800 bg-red-50 dark:bg-red-900/20">
          <CardContent className="py-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-6 w-6 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-red-800 dark:text-red-200">
                  You're short {formatCurrency(Math.abs(plan.surplusSplit.surplus))} this paycheck
                </p>
                <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                  Your bills and spending budget exceed your paycheck. Consider which payments can be delayed or reduced.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 1: Transfers */}
      {plan.transfers.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
              1
            </div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Move Money Between Accounts
            </h2>
          </div>
          <div className="space-y-3">
            {plan.transfers.map((step) => (
              <ChecklistItem
                key={step.id}
                step={step}
                isCompleted={completedSteps.has(step.id)}
                onToggle={() => handleToggleStep(step)}
                isLoading={processingStep === step.id}
              />
            ))}
          </div>
        </div>
      )}

      {/* Step 2: Pay Bills */}
      {plan.billPayments.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-full bg-gray-600 text-white flex items-center justify-center font-bold text-sm">
              2
            </div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Pay Bills (In Order)
            </h2>
          </div>
          <div className="space-y-3">
            {plan.billPayments.map((step) => (
              <ChecklistItem
                key={step.id}
                step={step}
                isCompleted={completedSteps.has(step.id)}
                onToggle={() => handleToggleStep(step)}
                isLoading={processingStep === step.id}
              />
            ))}
          </div>
        </div>
      )}

      {/* Step 3: Extra Debt Payment */}
      {plan.extraDebtStep && plan.avalancheTarget && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-full bg-amber-600 text-white flex items-center justify-center font-bold text-sm">
              3
            </div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Extra Debt Attack (Avalanche)
            </h2>
          </div>
          
          <Card variant="outlined" className="mb-3 border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-900/10">
            <CardContent className="py-4">
              <div className="flex items-center gap-3 mb-3">
                <Target className="h-6 w-6 text-amber-600" />
                <div>
                  <p className="font-semibold text-gray-900 dark:text-gray-100">
                    Target: {plan.avalancheTarget.debtName}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {plan.avalancheTarget.interestRate.toFixed(2)}% APR • 
                    Balance: {formatCurrency(plan.avalancheTarget.currentBalance)}
                  </p>
                </div>
              </div>
              <p className="text-xs text-amber-700 dark:text-amber-400">
                This is your highest-APR debt. Every extra dollar here saves you the most in interest.
              </p>
            </CardContent>
          </Card>

          <ChecklistItem
            step={plan.extraDebtStep}
            isCompleted={completedSteps.has(plan.extraDebtStep.id)}
            onToggle={() => handleToggleStep(plan.extraDebtStep!)}
            isLoading={processingStep === plan.extraDebtStep.id}
          />
        </div>
      )}

      {/* Step 4: Emergency Fund */}
      {plan.savingsStep && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-sm">
              4
            </div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Build Emergency Fund
            </h2>
          </div>

          <Card variant="outlined" className="mb-3 border-purple-200 dark:border-purple-800 bg-purple-50/50 dark:bg-purple-900/10">
            <CardContent className="py-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <PiggyBank className="h-6 w-6 text-purple-600" />
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-gray-100">Emergency Fund</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {formatCurrency(plan.emergencyFundCurrent)} / {formatCurrency(plan.emergencyFundTarget)}
                    </p>
                  </div>
                </div>
              </div>
              <ProgressBar
                progress={plan.emergencyFundCurrent / plan.emergencyFundTarget}
                label="Progress to Goal"
                color="emerald"
              />
            </CardContent>
          </Card>

          <ChecklistItem
            step={plan.savingsStep}
            isCompleted={completedSteps.has(plan.savingsStep.id)}
            onToggle={() => handleToggleStep(plan.savingsStep!)}
            isLoading={processingStep === plan.savingsStep.id}
          />
        </div>
      )}

      {/* Payoff Progress */}
      {plan.payoffProgress.targetDate && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-emerald-600" />
              Path to Debt Freedom
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Current Debt</p>
                <p className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  {formatCurrency(plan.payoffProgress.currentDebt)}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Target Date</p>
                <p className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  {format(new Date(plan.payoffProgress.targetDate), "MMM yyyy")}
                </p>
              </div>
            </div>

            {plan.payoffProgress.debtPaid !== undefined && plan.payoffProgress.startDebt && (
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600 dark:text-gray-400">Debt Paid Off</span>
                  <span className="font-medium text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(plan.payoffProgress.debtPaid)}
                  </span>
                </div>
                <ProgressBar
                  progress={plan.payoffProgress.debtProgressPct ?? 0}
                  label="Debt Progress"
                  color="emerald"
                />
              </div>
            )}

            {plan.payoffProgress.timeProgressPct !== undefined && (
              <ProgressBar
                progress={plan.payoffProgress.timeProgressPct}
                label="Time Elapsed"
                color="blue"
              />
            )}

            {plan.payoffProgress.onTrack !== undefined && (
              <div className={`flex items-center gap-2 p-3 rounded-lg ${
                plan.payoffProgress.onTrack 
                  ? "bg-emerald-50 dark:bg-emerald-900/20" 
                  : "bg-amber-50 dark:bg-amber-900/20"
              }`}>
                {plan.payoffProgress.onTrack ? (
                  <>
                    <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                    <span className="font-medium text-emerald-700 dark:text-emerald-400">
                      You're on track! Keep it up!
                    </span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="h-5 w-5 text-amber-600" />
                    <span className="font-medium text-amber-700 dark:text-amber-400">
                      Slightly behind - focus on extra payments
                    </span>
                  </>
                )}
              </div>
            )}

            {plan.payoffProgress.monthsRemaining && plan.payoffProgress.monthsRemaining > 0 && (
              <p className="text-center text-gray-600 dark:text-gray-400">
                <span className="font-semibold text-gray-900 dark:text-gray-100">
                  {plan.payoffProgress.monthsRemaining}
                </span>{" "}
                months until target date
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* All Done! */}
      {completionPct === 100 && (
        <Card variant="outlined" className="border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-900/20">
          <CardContent className="py-8 text-center">
            <CheckCircle2 className="h-16 w-16 text-emerald-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-emerald-800 dark:text-emerald-200 mb-2">
              All Done!
            </h2>
            <p className="text-emerald-700 dark:text-emerald-300">
              You've completed all tasks for this pay period. Great job staying on track!
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
