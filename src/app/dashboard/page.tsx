import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  getCurrentPayPeriod,
  formatPayPeriod,
  getNextPayPeriod,
} from "@/lib/pay-periods";
import { format, differenceInDays, isToday, isTomorrow, addDays } from "date-fns";
import Link from "next/link";
import { ArrowRight, Calendar, CreditCard, Receipt, Target, AlertTriangle, DollarSign, CheckCircle } from "lucide-react";
import type { FOOStep } from "@prisma/client";

const FOO_STEP_NAMES: Record<FOOStep, { number: number; name: string }> = {
  DEDUCTIBLES_COVERED: { number: 1, name: "Cover Deductibles" },
  EMPLOYER_MATCH: { number: 2, name: "Get Employer Match" },
  HIGH_INTEREST_DEBT: { number: 3, name: "Pay Off High-Interest Debt" },
  EMERGENCY_FUND: { number: 4, name: "Build Emergency Fund" },
  ROTH_HSA: { number: 5, name: "Max Roth IRA & HSA" },
  MAX_RETIREMENT: { number: 6, name: "Max Out Retirement" },
  HYPERACCUMULATION: { number: 7, name: "Hyperaccumulation" },
  PREPAY_FUTURE: { number: 8, name: "Prepay Future Expenses" },
  PREPAY_LOW_INTEREST: { number: 9, name: "Prepay Low-Interest Debt" },
};

const FOO_STEP_ORDER: FOOStep[] = [
  "DEDUCTIBLES_COVERED",
  "EMPLOYER_MATCH",
  "HIGH_INTEREST_DEBT",
  "EMERGENCY_FUND",
  "ROTH_HSA",
  "MAX_RETIREMENT",
  "HYPERACCUMULATION",
  "PREPAY_FUTURE",
  "PREPAY_LOW_INTEREST",
];

async function getDashboardData(userId: string) {
  const currentPeriod = getCurrentPayPeriod();
  const nextPeriod = getNextPayPeriod();
  const today = new Date();
  const threeDaysFromNow = addDays(today, 3);

  const [user, bills, debts, fooProgress, upcomingPayments, quickPayments] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { paycheckAmount: true },
    }),
    prisma.bill.count({ where: { userId, isActive: true } }),
    prisma.debt.findMany({ where: { userId, isActive: true } }),
    prisma.fOOProgress.findMany({ where: { userId } }),
    prisma.billPayment.findMany({
      where: {
        bill: { userId },
        dueDate: {
          gte: currentPeriod.startDate,
          lte: currentPeriod.endDate,
        },
      },
      include: { bill: true },
      orderBy: { dueDate: "asc" },
    }),
    prisma.quickPayment.findMany({
      where: {
        userId,
        paidAt: {
          gte: currentPeriod.startDate,
          lte: currentPeriod.endDate,
        },
      },
    }),
  ]);

  const totalDebt = debts.reduce(
    (sum, d) => sum + Number(d.currentBalance),
    0
  );

  const paidPayments = upcomingPayments.filter((p) => p.status === "PAID");
  const unpaidPayments = upcomingPayments.filter((p) => p.status === "UNPAID");

  // Quick payments are always "paid" - they're logged after the fact
  const quickPaymentTotal = quickPayments.reduce(
    (sum, p) => sum + Number(p.amount),
    0
  );

  const totalDueThisPeriod = upcomingPayments.reduce(
    (sum, p) => sum + Number(p.amount),
    0
  ) + quickPaymentTotal; // Include quick payments in total due
  
  const totalPaidThisPeriod = paidPayments.reduce(
    (sum, p) => sum + Number(p.amount),
    0
  ) + quickPaymentTotal; // Quick payments are already paid

  const completedSteps = fooProgress.filter(
    (p) => p.status === "COMPLETED"
  ).length;

  const completedStepNames = fooProgress
    .filter((p) => p.status === "COMPLETED")
    .map((p) => p.step);
  
  const currentFooStep = FOO_STEP_ORDER.find(
    (step) => !completedStepNames.includes(step)
  );

  const overduePayments = unpaidPayments.filter(
    (p) => differenceInDays(p.dueDate, today) < 0
  );
  const dueSoonPayments = unpaidPayments.filter((p) => {
    const days = differenceInDays(p.dueDate, today);
    return days >= 0 && days <= 3;
  });
  const dueTodayPayments = unpaidPayments.filter((p) => isToday(p.dueDate));

  const bnplDebts = debts.filter((d) => d.type === "BNPL");
  const bnplBillsDueThisPeriod = upcomingPayments.filter(
    (p) => p.bill.category === "BNPL" && p.status === "UNPAID"
  );
  const bnplDueAmount = bnplBillsDueThisPeriod.reduce(
    (sum, p) => sum + Number(p.amount),
    0
  );

  const paycheckAmount = user?.paycheckAmount ? Number(user.paycheckAmount) : 0;
  const safeToSpend = paycheckAmount - totalDueThisPeriod + totalPaidThisPeriod;

  return {
    currentPeriod,
    nextPeriod,
    billCount: bills,
    totalDebt,
    debtCount: debts.length,
    upcomingPayments: unpaidPayments.slice(0, 5),
    totalDueThisPeriod,
    totalPaidThisPeriod,
    completedSteps,
    currentFooStep,
    overdueCount: overduePayments.length,
    dueSoonCount: dueSoonPayments.length,
    dueTodayCount: dueTodayPayments.length,
    bnplDueAmount,
    hasBnplDue: bnplBillsDueThisPeriod.length > 0,
    paycheckAmount,
    safeToSpend,
  };
}

function formatDueDate(date: Date): string {
  if (isToday(date)) return "Today";
  if (isTomorrow(date)) return "Tomorrow";
  const days = differenceInDays(date, new Date());
  if (days < 0) return `${Math.abs(days)}d overdue`;
  if (days <= 7) return `In ${days}d`;
  return format(date, "MMM d");
}

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const data = await getDashboardData(session.user.id);
  const daysUntilPayday = differenceInDays(
    data.nextPeriod.startDate,
    new Date()
  );

  const hasOverdue = data.overdueCount > 0;
  const hasDueToday = data.dueTodayCount > 0;
  const needsAttention = hasOverdue || data.dueSoonCount > 0 || data.hasBnplDue;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-theme-primary">
          Welcome back{session.user.name ? `, ${session.user.name.split(" ")[0]}` : ""}
        </h1>
        <p className="text-theme-secondary mt-1">
          Here&apos;s your financial overview for this pay period
        </p>
      </div>

      {/* Current Pay Period Banner */}
      <Card className="!bg-accent-600/20 !border-accent-600/50">
        <CardContent className="py-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-accent-600 dark:text-accent-400 text-sm font-medium">
                Current Pay Period
              </p>
              <p className="text-2xl font-bold text-theme-primary mt-1">
                {formatPayPeriod(data.currentPeriod)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-accent-600 dark:text-accent-400 text-sm font-medium">
                Safe to Spend
              </p>
              <p className="text-2xl font-bold text-theme-primary mt-1">
                ${data.safeToSpend.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              </p>
            </div>
            <div className="text-right">
              <p className="text-accent-600 dark:text-accent-400 text-sm font-medium">
                Next Payday
              </p>
              <p className="text-xl font-bold text-theme-primary mt-1">
                {daysUntilPayday === 0
                  ? "Today!"
                  : `${daysUntilPayday} days`}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* What Needs Attention Strip */}
      {needsAttention && (
        <Card className="!bg-theme-secondary !border-theme">
          <CardContent className="py-4">
            <div className="flex items-center gap-2 text-sm">
              <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400 shrink-0" />
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                {data.overdueCount > 0 && (
                  <span className="text-red-600 dark:text-red-400 font-medium">
                    {data.overdueCount} bill{data.overdueCount !== 1 ? "s" : ""} overdue
                  </span>
                )}
                {data.overdueCount > 0 && (data.dueSoonCount > 0 || data.hasBnplDue) && (
                  <span className="text-theme-muted">•</span>
                )}
                {data.dueSoonCount > 0 && (
                  <span className="text-yellow-600 dark:text-yellow-400 font-medium">
                    {data.dueSoonCount} due in 3 days
                  </span>
                )}
                {data.dueSoonCount > 0 && data.hasBnplDue && (
                  <span className="text-theme-muted">•</span>
                )}
                {data.hasBnplDue && (
                  <span className="text-theme-secondary font-medium">
                    ${data.bnplDueAmount.toLocaleString()} in BNPL this period
                  </span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/50">
                <Receipt className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-theme-muted">Due This Period</p>
                <p className="text-2xl font-bold text-theme-primary">
                  ${data.totalDueThisPeriod.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="py-4">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-emerald-100 dark:bg-emerald-900/50">
                <Calendar className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-sm text-theme-muted">Paid So Far</p>
                <p className="text-2xl font-bold text-theme-primary">
                  ${data.totalPaidThisPeriod.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="py-4">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-red-100 dark:bg-red-900/50">
                <CreditCard className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-sm text-theme-muted">Total Debt</p>
                <p className="text-2xl font-bold text-theme-primary">
                  ${data.totalDebt.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Link href="/dashboard/foo" className="block">
          <Card className="h-full hover:border-accent-600/50 transition-colors">
            <CardContent className="py-4">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-purple-100 dark:bg-purple-900/50">
                  <Target className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm text-theme-muted">FOO Progress</p>
                  {data.currentFooStep ? (
                    <p className="text-lg font-bold text-theme-primary truncate">
                      Step {FOO_STEP_NAMES[data.currentFooStep].number}: {FOO_STEP_NAMES[data.currentFooStep].name}
                    </p>
                  ) : data.completedSteps === 9 ? (
                    <p className="text-lg font-bold text-theme-primary">
                      All steps complete!
                    </p>
                  ) : (
                    <p className="text-lg font-bold text-theme-primary">
                      {data.completedSteps}/9 Steps
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Upcoming Payments & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Upcoming Payments</CardTitle>
            <Link
              href="/dashboard/pay-periods"
              className="text-sm text-accent-600 dark:text-accent-400 hover:opacity-80 flex items-center gap-1"
            >
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          </CardHeader>
          <CardContent>
            {data.upcomingPayments.length === 0 ? (
              <p className="text-theme-muted text-sm py-4 text-center">
                No upcoming payments this period. Nice work!
              </p>
            ) : (
              <div className="space-y-3">
                {data.upcomingPayments.map((payment) => (
                  <div
                    key={payment.id}
                    className="flex items-center justify-between py-2 border-b border-theme last:border-0"
                  >
                    <div>
                      <p className="font-medium text-theme-primary">
                        {payment.bill.name}
                      </p>
                      <p className="text-sm text-theme-muted">
                        {formatDueDate(payment.dueDate)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-theme-primary">
                        ${Number(payment.amount).toFixed(2)}
                      </p>
                      <Badge
                        variant={
                          differenceInDays(payment.dueDate, new Date()) < 0
                            ? "danger"
                            : differenceInDays(payment.dueDate, new Date()) <= 2
                              ? "warning"
                              : "info"
                        }
                      >
                        {payment.bill.category.toLowerCase().replace("_", " ")}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {/* Context-aware quick actions */}
              {hasOverdue ? (
                <Link
                  href="/dashboard/pay-periods"
                  className="flex flex-col items-center justify-center p-4 rounded-lg bg-red-100 dark:bg-red-900/30 hover:opacity-80 transition-colors"
                >
                  <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400 mb-2" />
                  <span className="text-sm font-medium text-theme-primary text-center">Pay Overdue Bills</span>
                </Link>
              ) : hasDueToday ? (
                <Link
                  href="/dashboard/pay-periods"
                  className="flex flex-col items-center justify-center p-4 rounded-lg bg-yellow-100 dark:bg-yellow-900/30 hover:opacity-80 transition-colors"
                >
                  <CheckCircle className="h-6 w-6 text-yellow-600 dark:text-yellow-400 mb-2" />
                  <span className="text-sm font-medium text-theme-primary text-center">Log Today&apos;s Payment</span>
                </Link>
              ) : (
                <Link
                  href="/dashboard/bills/new"
                  className="flex flex-col items-center justify-center p-4 rounded-lg bg-theme-tertiary hover:opacity-80 transition-colors"
                >
                  <Receipt className="h-6 w-6 text-accent-600 dark:text-accent-400 mb-2" />
                  <span className="text-sm font-medium text-theme-primary">Add Bill</span>
                </Link>
              )}
              <Link
                href="/dashboard/debts/new"
                className="flex flex-col items-center justify-center p-4 rounded-lg bg-theme-tertiary hover:opacity-80 transition-colors"
              >
                <CreditCard className="h-6 w-6 text-accent-600 dark:text-accent-400 mb-2" />
                <span className="text-sm font-medium text-theme-primary">Add Debt</span>
              </Link>
              <Link
                href="/dashboard/pay-periods"
                className="flex flex-col items-center justify-center p-4 rounded-lg bg-theme-tertiary hover:opacity-80 transition-colors"
              >
                <Calendar className="h-6 w-6 text-accent-600 dark:text-accent-400 mb-2" />
                <span className="text-sm font-medium text-theme-primary">
                  Pay Period
                </span>
              </Link>
              <Link
                href="/dashboard/foo"
                className="flex flex-col items-center justify-center p-4 rounded-lg bg-theme-tertiary hover:opacity-80 transition-colors"
              >
                <Target className="h-6 w-6 text-accent-600 dark:text-accent-400 mb-2" />
                <span className="text-sm font-medium text-theme-primary">
                  FOO Steps
                </span>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
