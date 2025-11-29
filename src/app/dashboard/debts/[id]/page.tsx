import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DebtDetailClient } from "./detail-client";

const DEBT_TYPE_LABELS: Record<string, string> = {
  CREDIT_CARD: "Credit Card",
  AUTO_LOAN: "Auto Loan",
  STUDENT_LOAN: "Student Loan",
  PERSONAL_LOAN: "Personal Loan",
  BNPL: "BNPL",
  MORTGAGE: "Mortgage",
  OTHER: "Other",
};

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

function calculatePayoffDate(
  balance: number,
  rate: number,
  payment: number
): Date | null {
  if (payment <= 0 || balance <= 0) return null;
  const monthlyRate = rate / 100 / 12;
  if (monthlyRate === 0) {
    const months = Math.ceil(balance / payment);
    const date = new Date();
    date.setMonth(date.getMonth() + months);
    return date;
  }
  const monthlyInterest = balance * monthlyRate;
  if (payment <= monthlyInterest) return null;
  const months =
    Math.log(payment / (payment - balance * monthlyRate)) /
    Math.log(1 + monthlyRate);
  const date = new Date();
  date.setMonth(date.getMonth() + Math.ceil(months));
  return date;
}

export default async function DebtDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const { id } = await params;

  const debt = await prisma.debt.findFirst({
    where: { id, userId: session.user.id },
    include: {
      payments: {
        orderBy: { date: "desc" },
      },
    },
  });

  if (!debt) {
    notFound();
  }

  const currentBalance = Number(debt.currentBalance);
  const originalBalance = Number(debt.originalBalance);
  const interestRate = Number(debt.interestRate);
  const minimumPayment = Number(debt.minimumPayment);
  const totalPaid = originalBalance - currentBalance;
  const progress = originalBalance > 0 ? (totalPaid / originalBalance) * 100 : 0;

  const payments = debt.payments.map((p) => ({
    id: p.id,
    date: p.date.toISOString(),
    amount: Number(p.amount),
    principal: Number(p.principal),
    interest: Number(p.interest),
    newBalance: Number(p.newBalance),
    notes: p.notes,
  }));

  const totalPaymentAmount = payments.reduce((sum, p) => sum + p.amount, 0);
  const averagePayment =
    payments.length > 0 ? totalPaymentAmount / payments.length : minimumPayment;
  const projectedPayoff = calculatePayoffDate(
    currentBalance,
    interestRate,
    averagePayment
  );

  const milestones = [25, 50, 75, 100];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/debts">
            <Button variant="ghost" size="sm">
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-theme-primary">{debt.name}</h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge
                variant={
                  interestRate > 15
                    ? "danger"
                    : interestRate > 7
                      ? "warning"
                      : "success"
                }
              >
                {interestRate}% APR
              </Badge>
              <Badge>{DEBT_TYPE_LABELS[debt.type] || debt.type}</Badge>
            </div>
          </div>
        </div>
        <Link href={`/dashboard/debts/${id}/edit`}>
          <Button variant="secondary">Edit Debt</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="py-4">
            <p className="text-theme-secondary text-sm">Current Balance</p>
            <p className="text-2xl font-bold text-theme-primary">
              {formatCurrency(currentBalance)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4">
            <p className="text-theme-secondary text-sm">Total Paid</p>
            <p className="text-2xl font-bold text-emerald-400">
              {formatCurrency(totalPaid)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4">
            <p className="text-theme-secondary text-sm">Avg Payment</p>
            <p className="text-2xl font-bold text-theme-primary">
              {formatCurrency(averagePayment)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4">
            <p className="text-theme-secondary text-sm">Projected Payoff</p>
            <p className="text-2xl font-bold text-theme-primary">
              {projectedPayoff
                ? projectedPayoff.toLocaleDateString("en-US", {
                    month: "short",
                    year: "numeric",
                  })
                : "N/A"}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Payoff Progress</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between text-sm">
            <span className="text-theme-secondary">
              Paid off: {formatCurrency(totalPaid)} of{" "}
              {formatCurrency(originalBalance)}
            </span>
            <span className="text-emerald-400 font-medium">
              {progress.toFixed(1)}%
            </span>
          </div>

          <div className="relative">
            <div className="h-6 bg-theme-tertiary rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 transition-all duration-500"
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>
            <div className="absolute inset-0 flex items-center">
              {milestones.map((milestone) => (
                <div
                  key={milestone}
                  className="absolute flex flex-col items-center"
                  style={{ left: `${milestone}%`, transform: "translateX(-50%)" }}
                >
                  <div
                    className={`w-0.5 h-6 ${
                      progress >= milestone ? "bg-emerald-300" : "bg-gray-600"
                    }`}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-between text-xs text-theme-muted">
            {milestones.map((milestone) => (
              <span
                key={milestone}
                className={progress >= milestone ? "text-emerald-400" : ""}
              >
                {milestone}%
              </span>
            ))}
          </div>
        </CardContent>
      </Card>

      <DebtDetailClient
        debtId={id}
        debtName={debt.name}
        currentBalance={currentBalance}
        minimumPayment={minimumPayment}
        payments={payments}
      />
    </div>
  );
}
