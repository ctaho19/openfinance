import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle, StatCard } from "@/components/ui/card";
import { Badge, StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  getCurrentPayPeriod,
  formatPayPeriod,
  getNextPayPeriod,
} from "@/lib/pay-periods";
import { format, differenceInDays, isToday, isTomorrow, startOfDay, endOfDay } from "date-fns";
import Link from "next/link";
import { 
  ArrowRight, 
  Calendar, 
  CreditCard, 
  Receipt, 
  Target, 
  AlertTriangle, 
  TrendingUp,
  Wallet,
  Clock,
  ChevronRight,
  Plus,
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
        bill: { userId },
        dueDate: {
          gte: periodStart,
          lte: periodEnd,
        },
      },
      include: { bill: true },
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
  if (days <= 7) return `In ${days} days`;
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
    <div className="space-y-6 lg:space-y-8 animate-fade-in">
      {/* Welcome Header */}
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-theme-primary tracking-tight">
            Welcome back{session.user.name ? `, ${session.user.name.split(" ")[0]}` : ""}
          </h1>
          <p className="text-theme-secondary mt-1">
            Here&apos;s your financial overview for this pay period
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/dashboard/bills/new">
            <Button variant="outline" size="sm" leftIcon={<Plus className="h-4 w-4" />}>
              Add Bill
            </Button>
          </Link>
          <Link href="/dashboard/pay-periods">
            <Button size="sm" rightIcon={<ArrowRight className="h-4 w-4" />}>
              View Period
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Pay Period Banner */}
      <Card variant="gradient" className="overflow-hidden">
        <CardContent className="py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {/* Current Period */}
            <div>
              <p className="text-white/80 text-sm font-medium uppercase tracking-wider">
                Current Pay Period
              </p>
              <p className="text-2xl lg:text-3xl font-bold text-white mt-2">
                {formatPayPeriod(data.currentPeriod)}
              </p>
            </div>
            
            {/* Safe to Spend - Featured */}
            <div className="md:text-center md:border-x md:border-white/20 md:px-8">
              <p className="text-white/80 text-sm font-medium uppercase tracking-wider">
                Safe to Spend
              </p>
              <p className="text-3xl lg:text-4xl font-bold text-white mt-2">
                ${data.safeToSpend.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              </p>
              <p className="text-white/60 text-sm mt-1">
                After all obligations
              </p>
            </div>
            
            {/* Next Payday */}
            <div className="md:text-right">
              <p className="text-white/80 text-sm font-medium uppercase tracking-wider">
                Next Payday
              </p>
              <p className="text-2xl lg:text-3xl font-bold text-white mt-2">
                {daysUntilPayday === 0
                  ? "Today!"
                  : daysUntilPayday === 1
                    ? "Tomorrow"
                    : `${daysUntilPayday} days`}
              </p>
              <p className="text-white/60 text-sm mt-1">
                {format(data.nextPeriod.startDate, "EEEE, MMM d")}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alert Strip */}
      {needsAttention && (
        <Card className="border-warning-300 dark:border-warning-600/50 bg-warning-50 dark:bg-warning-600/10 animate-fade-in-up">
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-warning-100 dark:bg-warning-600/20">
                <AlertTriangle className="h-5 w-5 text-warning-600 dark:text-warning-400" />
              </div>
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
              <Link href="/dashboard/pay-periods" className="ml-auto">
                <Button variant="ghost" size="sm">
                  View <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Due This Period"
          value={`$${data.billsDueThisPeriod.toLocaleString()}`}
          icon={<Receipt className="h-5 w-5" />}
          variant="info"
        />
        <StatCard
          label="Paid So Far"
          value={`$${data.totalPaidThisPeriod.toLocaleString()}`}
          icon={<Wallet className="h-5 w-5" />}
          variant="success"
        />
        <StatCard
          label="Total Debt"
          value={`$${data.totalDebt.toLocaleString()}`}
          icon={<CreditCard className="h-5 w-5" />}
          variant="danger"
        />
        <Link href="/dashboard/foo" className="block">
          <Card hover className="h-full">
            <CardContent className="py-5">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-accent-100 text-accent-600 dark:bg-accent-600/20 dark:text-accent-400">
                  <Target className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-theme-secondary">FOO Progress</p>
                  {data.currentFooStep ? (
                    <p className="text-lg font-bold text-theme-primary truncate mt-0.5">
                      Step {FOO_STEP_NAMES[data.currentFooStep].number}
                    </p>
                  ) : data.completedSteps === 9 ? (
                    <p className="text-lg font-bold text-success-600 dark:text-success-400 mt-0.5">
                      Complete! ✓
                    </p>
                  ) : (
                    <p className="text-lg font-bold text-theme-primary mt-0.5">
                      {data.completedSteps}/9
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Payments */}
        <Card>
          <CardHeader action={
            <Link href="/dashboard/pay-periods">
              <Button variant="ghost" size="sm" rightIcon={<ArrowRight className="h-4 w-4" />}>
                View all
              </Button>
            </Link>
          }>
            <CardTitle>Upcoming Payments</CardTitle>
          </CardHeader>
          <CardContent noPadding>
            {data.upcomingPayments.length === 0 ? (
              <div className="py-12 text-center px-6">
                <div className="w-12 h-12 rounded-full bg-success-100 dark:bg-success-600/20 flex items-center justify-center mx-auto mb-3">
                  <TrendingUp className="h-6 w-6 text-success-600 dark:text-success-400" />
                </div>
                <p className="text-theme-secondary font-medium">All caught up!</p>
                <p className="text-theme-muted text-sm mt-1">No upcoming payments this period</p>
              </div>
            ) : (
              <div className="divide-y divide-theme">
                {data.upcomingPayments.map((payment, index) => (
                  <div
                    key={payment.id}
                    className={`flex items-center justify-between py-4 px-6 hover:bg-theme-secondary/50 transition-colors stagger-${index + 1} animate-fade-in-up`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${
                        differenceInDays(payment.dueDate, new Date()) < 0
                          ? "bg-danger-500"
                          : differenceInDays(payment.dueDate, new Date()) <= 2
                            ? "bg-warning-500"
                            : "bg-theme-muted"
                      }`} />
                      <div>
                        <p className="font-medium text-theme-primary">
                          {payment.bill.name}
                        </p>
                        <p className="text-sm text-theme-muted flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDueDate(payment.dueDate)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-theme-primary">
                        ${Number(payment.amount).toFixed(2)}
                      </p>
                      <Badge variant={
                        differenceInDays(payment.dueDate, new Date()) < 0
                          ? "danger"
                          : differenceInDays(payment.dueDate, new Date()) <= 2
                            ? "warning"
                            : "default"
                      } size="sm">
                        {payment.bill.category.toLowerCase().replace("_", " ")}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {/* Context-aware primary action */}
              {hasOverdue ? (
                <Link
                  href="/dashboard/pay-periods"
                  className="col-span-2 flex items-center justify-between p-4 rounded-xl bg-danger-50 dark:bg-danger-600/10 border border-danger-200 dark:border-danger-600/30 hover:bg-danger-100 dark:hover:bg-danger-600/20 transition-all duration-200 group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-danger-100 dark:bg-danger-600/20">
                      <AlertTriangle className="h-5 w-5 text-danger-600 dark:text-danger-400" />
                    </div>
                    <div>
                      <span className="font-semibold text-danger-700 dark:text-danger-400">Pay Overdue Bills</span>
                      <p className="text-sm text-danger-600/80 dark:text-danger-400/80">{data.overdueCount} bill{data.overdueCount !== 1 ? "s" : ""} need attention</p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-danger-400 group-hover:translate-x-1 transition-transform" />
                </Link>
              ) : hasDueToday ? (
                <Link
                  href="/dashboard/pay-periods"
                  className="col-span-2 flex items-center justify-between p-4 rounded-xl bg-warning-50 dark:bg-warning-600/10 border border-warning-200 dark:border-warning-600/30 hover:bg-warning-100 dark:hover:bg-warning-600/20 transition-all duration-200 group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-warning-100 dark:bg-warning-600/20">
                      <Clock className="h-5 w-5 text-warning-600 dark:text-warning-400" />
                    </div>
                    <div>
                      <span className="font-semibold text-warning-700 dark:text-warning-400">Log Today&apos;s Payments</span>
                      <p className="text-sm text-warning-600/80 dark:text-warning-400/80">{data.dueTodayCount} due today</p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-warning-400 group-hover:translate-x-1 transition-transform" />
                </Link>
              ) : null}
              
              {/* Standard quick actions */}
              <Link
                href="/dashboard/bills/new"
                className="flex flex-col items-center justify-center p-5 rounded-xl bg-theme-secondary hover:bg-theme-tertiary border border-theme hover:border-accent-500/50 transition-all duration-200 group"
              >
                <div className="p-3 rounded-xl bg-theme-tertiary group-hover:bg-accent-100 dark:group-hover:bg-accent-600/20 transition-colors">
                  <Receipt className="h-6 w-6 text-theme-secondary group-hover:text-accent-600 dark:group-hover:text-accent-400 transition-colors" />
                </div>
                <span className="text-sm font-medium text-theme-primary mt-3">Add Bill</span>
              </Link>
              
              <Link
                href="/dashboard/debts/new"
                className="flex flex-col items-center justify-center p-5 rounded-xl bg-theme-secondary hover:bg-theme-tertiary border border-theme hover:border-accent-500/50 transition-all duration-200 group"
              >
                <div className="p-3 rounded-xl bg-theme-tertiary group-hover:bg-accent-100 dark:group-hover:bg-accent-600/20 transition-colors">
                  <CreditCard className="h-6 w-6 text-theme-secondary group-hover:text-accent-600 dark:group-hover:text-accent-400 transition-colors" />
                </div>
                <span className="text-sm font-medium text-theme-primary mt-3">Add Debt</span>
              </Link>
              
              <Link
                href="/dashboard/pay-periods"
                className="flex flex-col items-center justify-center p-5 rounded-xl bg-theme-secondary hover:bg-theme-tertiary border border-theme hover:border-accent-500/50 transition-all duration-200 group"
              >
                <div className="p-3 rounded-xl bg-theme-tertiary group-hover:bg-accent-100 dark:group-hover:bg-accent-600/20 transition-colors">
                  <Calendar className="h-6 w-6 text-theme-secondary group-hover:text-accent-600 dark:group-hover:text-accent-400 transition-colors" />
                </div>
                <span className="text-sm font-medium text-theme-primary mt-3">Pay Period</span>
              </Link>
              
              <Link
                href="/dashboard/foo"
                className="flex flex-col items-center justify-center p-5 rounded-xl bg-theme-secondary hover:bg-theme-tertiary border border-theme hover:border-accent-500/50 transition-all duration-200 group"
              >
                <div className="p-3 rounded-xl bg-theme-tertiary group-hover:bg-accent-100 dark:group-hover:bg-accent-600/20 transition-colors">
                  <Target className="h-6 w-6 text-theme-secondary group-hover:text-accent-600 dark:group-hover:text-accent-400 transition-colors" />
                </div>
                <span className="text-sm font-medium text-theme-primary mt-3">FOO Steps</span>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
