import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { AccountSummaryCard, SimpleBalanceCard } from "@/components/ui/account-summary-card";
import { QuickActionsGrid } from "@/components/ui/quick-actions-grid";
import { 
  TransactionList, 
  TransactionListHeader, 
  TransactionItem, 
  TransactionEmptyState,
  TransactionDivider 
} from "@/components/ui/transaction-list";
import { Badge } from "@/components/ui/badge";
import {
  getCurrentPayPeriod,
  formatPayPeriod,
  getNextPayPeriod,
} from "@/lib/pay-periods";
import { format, differenceInDays, isToday, isTomorrow, startOfDay, endOfDay } from "date-fns";
import Link from "next/link";
import { 
  Receipt, 
  CreditCard, 
  Target, 
  AlertTriangle, 
  TrendingUp,
  Wallet,
  Clock,
  ChevronRight,
  Calendar,
  CheckCircle2,
} from "lucide-react";
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
  
  const periodStart = startOfDay(currentPeriod.startDate);
  const periodEnd = endOfDay(currentPeriod.endDate);

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
        bill: { 
          userId,
          OR: [
            { debtId: null },
            {
              debt: {
                OR: [
                  { status: { not: "DEFERRED" } },
                  { deferredUntil: null },
                  { deferredUntil: { lte: periodEnd } },
                ],
              },
            },
          ],
        },
        dueDate: {
          gte: periodStart,
          lte: periodEnd,
        },
      },
      include: { 
        bill: { select: { id: true, name: true, category: true } } 
      },
      orderBy: { dueDate: "asc" },
    }),
    prisma.quickPayment.findMany({
      where: {
        userId,
        paidAt: {
          gte: periodStart,
          lte: periodEnd,
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

  const quickPaymentTotal = quickPayments.reduce(
    (sum, p) => sum + Number(p.amount),
    0
  );

  const billsDueThisPeriod = upcomingPayments.reduce(
    (sum, p) => sum + Number(p.amount),
    0
  );
  
  const totalDueThisPeriod = billsDueThisPeriod + quickPaymentTotal;
  
  const billsPaidThisPeriod = paidPayments.reduce(
    (sum, p) => sum + Number(p.amount),
    0
  );
  
  const totalPaidThisPeriod = billsPaidThisPeriod + quickPaymentTotal;

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

  const bnplDebts = debts.filter((d) => d.type === "BNPL");
  const bnplBillsDueThisPeriod = upcomingPayments.filter(
    (p) => p.bill.category === "BNPL" && p.status === "UNPAID"
  );
  const bnplDueAmount = bnplBillsDueThisPeriod.reduce(
    (sum, p) => sum + Number(p.amount),
    0
  );

  const paycheckAmount = user?.paycheckAmount ? Number(user.paycheckAmount) : 0;
  const safeToSpend = paycheckAmount - totalDueThisPeriod;

  return {
    currentPeriod,
    nextPeriod,
    billCount: bills,
    totalDebt,
    debtCount: debts.length,
    upcomingPayments: unpaidPayments.slice(0, 5),
    billsDueThisPeriod,
    totalDueThisPeriod,
    totalPaidThisPeriod,
    completedSteps,
    currentFooStep,
    overdueCount: overduePayments.length,
    dueSoonCount: dueSoonPayments.length,
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
  if (days <= 7) return `In ${days} days`;
  return format(date, "MMM d");
}

function getPaymentStatus(date: Date): "overdue" | "due-soon" | "due-today" | "pending" {
  if (isToday(date)) return "due-today";
  const days = differenceInDays(date, new Date());
  if (days < 0) return "overdue";
  if (days <= 3) return "due-soon";
  return "pending";
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
  const needsAttention = hasOverdue || data.dueSoonCount > 0 || data.hasBnplDue;

  const quickActions = [
    { label: "Add Bill", icon: Receipt, href: "/dashboard/bills/new" },
    { label: "Add Debt", icon: CreditCard, href: "/dashboard/debts/new" },
    { label: "Pay Period", icon: Calendar, href: "/dashboard/pay-periods" },
    { label: "FOO Plan", icon: Target, href: "/dashboard/foo" },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome Header - Mobile Only */}
      <header className="lg:hidden">
        <p className="text-sm text-theme-secondary">
          Welcome back{session.user.name ? `, ${session.user.name.split(" ")[0]}` : ""}
        </p>
      </header>

      {/* Desktop Welcome */}
      <header className="hidden lg:block">
        <h1 className="text-2xl font-bold text-theme-primary tracking-tight">
          Welcome back{session.user.name ? `, ${session.user.name.split(" ")[0]}` : ""}
        </h1>
        <p className="text-theme-secondary mt-1">
          Here&apos;s your financial overview for this pay period
        </p>
      </header>

      {/* Hero Account Summary Card */}
      <AccountSummaryCard
        title="Safe to Spend"
        subtitle={formatPayPeriod(data.currentPeriod)}
        primaryAmount={data.safeToSpend}
        primaryLabel="This Pay Period"
        secondaryItems={[
          {
            label: "Next Payday",
            value: daysUntilPayday === 0
              ? "Today!"
              : daysUntilPayday === 1
                ? "Tomorrow"
                : `${daysUntilPayday} days`,
          },
          {
            label: "Paycheck",
            value: `$${data.paycheckAmount.toLocaleString()}`,
          },
        ]}
      />

      {/* Alert Strip */}
      {needsAttention && (
        <div className="bg-warning-50 dark:bg-warning-600/10 border border-warning-200 dark:border-warning-600/30 rounded-2xl p-4 animate-fade-in-up">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-warning-100 dark:bg-warning-600/20">
              <AlertTriangle className="h-5 w-5 text-warning-600 dark:text-warning-400" />
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                {data.overdueCount > 0 && (
                  <span className="text-danger-600 dark:text-danger-400 font-semibold">
                    {data.overdueCount} bill{data.overdueCount !== 1 ? "s" : ""} overdue
                  </span>
                )}
                {data.dueSoonCount > 0 && (
                  <span className="text-warning-700 dark:text-warning-400 font-medium">
                    {data.dueSoonCount} due within 3 days
                  </span>
                )}
                {data.hasBnplDue && (
                  <span className="text-theme-secondary font-medium">
                    ${data.bnplDueAmount.toLocaleString()} BNPL due
                  </span>
                )}
              </div>
            </div>
            <Link 
              href="/dashboard/pay-periods"
              aria-label="Review your upcoming and overdue payments"
              className="inline-flex items-center gap-1.5 rounded-xl px-2 py-1 text-xs sm:text-sm font-medium text-warning-700 dark:text-warning-400 hover:bg-warning-100 dark:hover:bg-warning-600/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-warning-500 focus-visible:ring-offset-2 focus-visible:ring-offset-warning-50 dark:focus-visible:ring-offset-warning-900/10 transition-colors"
            >
              <span className="hidden sm:inline">Review</span>
              <ChevronRight aria-hidden="true" className="h-5 w-5" />
            </Link>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-theme-elevated rounded-2xl shadow-theme border border-theme p-2">
        <QuickActionsGrid actions={quickActions} />
      </div>

      {data.billCount === 0 && (
        <p className="text-xs text-theme-secondary px-1">
          Tip: Add your recurring bills so we can forecast this pay period for you.
        </p>
      )}

      {/* Stats Grid - Desktop */}
      <div className="hidden lg:grid lg:grid-cols-4 gap-4">
        <SimpleBalanceCard
          label="Due This Period"
          amount={data.billsDueThisPeriod}
        />
        <SimpleBalanceCard
          label="Paid So Far"
          amount={data.totalPaidThisPeriod}
          trend="up"
        />
        <SimpleBalanceCard
          label="Total Debt"
          amount={data.totalDebt}
          trend="down"
        />
        <Link href="/dashboard/foo" className="block">
          <div className="bg-theme-elevated rounded-2xl shadow-theme p-4 lg:p-5 border border-theme h-full card-hover-lift">
            <p className="text-label">FOO Progress</p>
            {data.currentFooStep ? (
              <p className="text-2xl font-semibold text-theme-primary mt-1">
                Step {FOO_STEP_NAMES[data.currentFooStep].number}
              </p>
            ) : data.completedSteps === 9 ? (
              <p className="text-2xl font-semibold text-success-600 dark:text-success-400 mt-1 flex items-center gap-2">
                Complete <CheckCircle2 className="h-5 w-5" />
              </p>
            ) : data.completedSteps === 0 ? (
              <p className="text-2xl font-semibold text-accent-600 dark:text-accent-400 mt-1">
                Start your FOO plan
              </p>
            ) : (
              <p className="text-2xl font-semibold text-theme-primary mt-1">
                {data.completedSteps}/9
              </p>
            )}
          </div>
        </Link>
      </div>

      {/* Mobile Stats Row */}
      <div className="lg:hidden grid grid-cols-2 gap-3">
        <SimpleBalanceCard
          label="Due This Period"
          amount={data.billsDueThisPeriod}
        />
        <SimpleBalanceCard
          label="Paid So Far"
          amount={data.totalPaidThisPeriod}
          trend="up"
        />
      </div>

      {/* Upcoming Payments */}
      <TransactionList>
        <TransactionListHeader 
          title="Upcoming Payments" 
          action={{ label: "View all", href: "/dashboard/pay-periods" }}
        />
        {data.upcomingPayments.length === 0 ? (
          <TransactionEmptyState
            icon={<TrendingUp className="h-6 w-6 text-success-600 dark:text-success-400" />}
            title="All caught up!"
            description="No upcoming payments this period"
          />
        ) : (
          data.upcomingPayments.map((payment, index) => (
            <div key={payment.id}>
              {index > 0 && <TransactionDivider />}
              <TransactionItem
                title={payment.bill.name}
                subtitle={formatDueDate(payment.dueDate)}
                amount={Number(payment.amount)}
                status={getPaymentStatus(payment.dueDate)}
                href="/dashboard/pay-periods"
              />
            </div>
          ))
        )}
      </TransactionList>

      {/* Mobile: FOO Progress Card */}
      <Link href="/dashboard/foo" className="block lg:hidden">
        <div className="bg-theme-elevated rounded-2xl shadow-theme p-4 border border-theme card-hover-lift">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-accent-50 dark:bg-accent-600/20">
              <Target className="h-6 w-6 text-accent-600 dark:text-accent-400" />
            </div>
            <div className="flex-1">
              <p className="text-label">FOO Progress</p>
              {data.currentFooStep ? (
                <p className="text-xl font-semibold text-theme-primary">
                  Step {FOO_STEP_NAMES[data.currentFooStep].number}: {FOO_STEP_NAMES[data.currentFooStep].name}
                </p>
              ) : data.completedSteps === 9 ? (
                <p className="text-xl font-semibold text-success-600 dark:text-success-400 flex items-center gap-2">
                  Complete! <CheckCircle2 className="h-5 w-5" />
                </p>
              ) : data.completedSteps === 0 ? (
                <p className="text-xl font-semibold text-accent-600 dark:text-accent-400">
                  Start your FOO plan →
                </p>
              ) : (
                <p className="text-xl font-semibold text-theme-primary">
                  {data.completedSteps}/9 Steps Complete
                </p>
              )}
            </div>
            <ChevronRight className="h-5 w-5 text-theme-muted" />
          </div>
        </div>
      </Link>

      {/* Mobile: Total Debt Card */}
      <Link href="/dashboard/debts" className="block lg:hidden">
        <div className="bg-theme-elevated rounded-2xl shadow-theme p-4 border border-theme card-hover-lift">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-danger-50 dark:bg-danger-600/20">
                <CreditCard className="h-6 w-6 text-danger-600 dark:text-danger-400" />
              </div>
              <div>
                <p className="text-label">Total Debt</p>
                <p className="text-xl font-semibold text-theme-primary">
                  {data.totalDebt === 0 ? "No debt tracked" : `$${data.totalDebt.toLocaleString()}`}
                </p>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-theme-muted" />
          </div>
        </div>
      </Link>
    </div>
  );
}
