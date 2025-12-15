import { Target, TrendingUp, CheckCircle2, X } from "lucide-react";
import { useState } from "react";

interface Debt {
  id: string;
  name: string;
  currentBalance: string;
  interestRate: string;
  minimumPayment: string;
  type: string;
  status: string;
  scheduledPayments?: { isPaid: boolean; dueDate: string; amount: string }[];
}

interface SnowballResult {
  debtFreeDate: Date;
  totalInterestSaved: number;
  nextDebtToPayOff: { name: string; monthsUntilPaid: number; interestSaved: number } | null;
  totalPaid: number;
  progressPercent: number;
  debtsEliminated: number;
  totalDebts: number;
}

function calculateSnowball(debts: Debt[]): SnowballResult | null {
  const activeDebts = debts.filter(
    (d) => d.status !== "PAID_OFF" && Number(d.currentBalance) > 0
  );

  if (activeDebts.length === 0) {
    return null;
  }

  const sortedDebts = [...activeDebts].sort(
    (a, b) => Number(a.currentBalance) - Number(b.currentBalance)
  );

  const totalMinPayment = sortedDebts.reduce(
    (sum, d) => sum + Number(d.minimumPayment),
    0
  );
  const totalBalance = sortedDebts.reduce(
    (sum, d) => sum + Number(d.currentBalance),
    0
  );
  const totalOriginal = debts.reduce((sum, d) => {
    if (d.status === "PAID_OFF") return sum;
    return sum + Number(d.currentBalance);
  }, 0);

  let debtStates = sortedDebts.map((d) => ({
    name: d.name,
    balance: Number(d.currentBalance),
    rate: Number(d.interestRate) / 100 / 12,
    minPayment: Number(d.minimumPayment),
    isPaidOff: false,
  }));

  let months = 0;
  let totalInterestPaid = 0;
  let minPaymentInterest = 0;
  let extraPayment = 0;
  let firstPaidOff: { name: string; monthsUntilPaid: number; interestSaved: number } | null = null;
  const maxMonths = 360;

  while (debtStates.some((d) => !d.isPaidOff) && months < maxMonths) {
    months++;
    let availableExtra = extraPayment;

    for (const debt of debtStates) {
      if (debt.isPaidOff) continue;

      const interest = debt.balance * debt.rate;
      totalInterestPaid += interest;
      debt.balance += interest;

      let payment = debt.minPayment + availableExtra;
      availableExtra = 0;

      if (payment >= debt.balance) {
        payment = debt.balance;
        debt.isPaidOff = true;
        extraPayment += debt.minPayment;

        if (!firstPaidOff) {
          firstPaidOff = {
            name: debt.name,
            monthsUntilPaid: months,
            interestSaved: 0,
          };
        }
      }

      debt.balance = Math.max(0, debt.balance - payment);
    }
  }

  for (const debt of sortedDebts) {
    let balance = Number(debt.currentBalance);
    const rate = Number(debt.interestRate) / 100 / 12;
    const minPayment = Number(debt.minimumPayment);

    for (let m = 0; m < maxMonths && balance > 0; m++) {
      const interest = balance * rate;
      minPaymentInterest += interest;
      balance = Math.max(0, balance + interest - minPayment);
    }
  }

  const interestSaved = Math.max(0, minPaymentInterest - totalInterestPaid);

  if (firstPaidOff) {
    firstPaidOff.interestSaved = Math.round(interestSaved / activeDebts.length);
  }

  const debtFreeDate = new Date();
  debtFreeDate.setMonth(debtFreeDate.getMonth() + months);

  const paidOffDebts = debts.filter((d) => d.status === "PAID_OFF").length;
  const progressPercent =
    totalOriginal > 0
      ? ((totalOriginal - totalBalance) / totalOriginal) * 100
      : 0;

  return {
    debtFreeDate,
    totalInterestSaved: Math.round(interestSaved),
    nextDebtToPayOff: firstPaidOff,
    totalPaid: totalOriginal - totalBalance,
    progressPercent: Math.max(0, Math.min(100, progressPercent)),
    debtsEliminated: paidOffDebts,
    totalDebts: debts.length,
  };
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

interface DebtFreedomCardProps {
  debts: Debt[];
}

export function DebtFreedomCard({ debts }: DebtFreedomCardProps) {
  const [dismissed, setDismissed] = useState(false);
  const result = calculateSnowball(debts);

  if (!result || dismissed) {
    return null;
  }

  const { debtFreeDate, totalInterestSaved, nextDebtToPayOff, progressPercent } = result;

  const formattedDate = debtFreeDate.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-accent-500 via-accent-600 to-accent-700 dark:from-accent-700 dark:via-accent-700 dark:to-accent-800 text-white shadow-lg">
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
      
      <button
        onClick={() => setDismissed(true)}
        className="absolute top-3 right-3 p-1 rounded-full hover:bg-white/20 transition-colors"
        aria-label="Dismiss"
      >
        <X className="h-4 w-4 text-white/70" />
      </button>

      <div className="relative p-5">
        <div className="flex items-center gap-2 mb-3">
          <div className="p-1.5 rounded-lg bg-white/20">
            <Target className="h-4 w-4" />
          </div>
          <h3 className="font-semibold text-sm">Debt Freedom Plan</h3>
        </div>

        <p className="text-white/80 text-sm mb-1">Stay consistent and be debt-free by</p>
        <p className="text-2xl font-bold tracking-tight mb-4">{formattedDate}</p>

        <div className="mb-4">
          <div className="flex justify-between text-xs text-white/70 mb-1.5">
            <span>{progressPercent.toFixed(0)}% paid off</span>
            {totalInterestSaved > 0 && (
              <span className="flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                Save {formatCurrency(totalInterestSaved)} in interest
              </span>
            )}
          </div>
          <div className="h-2 rounded-full bg-white/20 overflow-hidden">
            <div
              className="h-full rounded-full bg-white transition-all duration-500"
              style={{ width: `${Math.max(progressPercent, 2)}%` }}
            />
          </div>
        </div>

        {nextDebtToPayOff && (
          <div className="flex items-center gap-2 pt-3 border-t border-white/20">
            <CheckCircle2 className="h-4 w-4 text-white/80 shrink-0" />
            <p className="text-sm text-white/90">
              <span className="font-medium">Next milestone:</span>{" "}
              Pay off "{nextDebtToPayOff.name}" in {nextDebtToPayOff.monthsUntilPaid} month
              {nextDebtToPayOff.monthsUntilPaid !== 1 ? "s" : ""}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
