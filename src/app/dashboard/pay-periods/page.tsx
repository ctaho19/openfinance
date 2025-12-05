import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import {
  getCurrentPayPeriod,
  getPayPeriods,
  formatPayPeriod,
  type PayPeriod,
} from "@/lib/pay-periods";
import { ensureBillPaymentsForPayPeriod } from "@/lib/bill-payments";
import { Card, CardContent, CardHeader, CardTitle, StatCard } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge, StatusBadge } from "@/components/ui/badge";
import { Calendar, ChevronLeft, ChevronRight, DollarSign, Wallet, TrendingUp } from "lucide-react";
import Link from "next/link";
import { format, startOfDay, endOfDay } from "date-fns";
import { PaymentToggle } from "./payment-toggle";
import { QuickPaymentsSection } from "./quick-payments-section";
import { BankAllocationSection } from "./bank-allocation";
import { AllocationForecast } from "./allocation-forecast";

interface BillPaymentWithBill {
  id: string;
  billId: string;
  dueDate: Date;
  amount: { toString(): string } | number;
  status: "UNPAID" | "PAID" | "SKIPPED";
  paidAt: Date | null;
  bill: {
    id: string;
    name: string;
    category: string;
    bankAccountId: string | null;
    bankAccount: {
      id: string;
      name: string;
      bank: string;
    } | null;
  };
}

async function getPaymentsForPeriod(
  userId: string,
  payPeriod: PayPeriod
): Promise<BillPaymentWithBill[]> {
  await ensureBillPaymentsForPayPeriod(userId, payPeriod.startDate, payPeriod.endDate);

  const payments = await prisma.billPayment.findMany({
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
                { deferredUntil: { lte: payPeriod.endDate } },
              ],
            },
          },
        ],
      },
      dueDate: {
        gte: startOfDay(payPeriod.startDate),
        lte: endOfDay(payPeriod.endDate),
      },
    },
    include: {
      bill: {
        select: {
          id: true,
          name: true,
          category: true,
          bankAccountId: true,
          bankAccount: {
            select: { id: true, name: true, bank: true },
          },
        },
      },
    },
    orderBy: { dueDate: "asc" },
  });

  return payments as unknown as BillPaymentWithBill[];
}

interface QuickPaymentWithDebt {
  id: string;
  description: string;
  amount: { toString(): string } | number;
  paidAt: Date;
  category: string;
  notes: string | null;
  debt: { id: string; name: string; type: string } | null;
}

async function getQuickPaymentsForPeriod(
  userId: string,
  payPeriod: PayPeriod
): Promise<QuickPaymentWithDebt[]> {
  const quickPayments = await prisma.quickPayment.findMany({
    where: {
      userId,
      paidAt: {
        gte: startOfDay(payPeriod.startDate),
        lte: endOfDay(payPeriod.endDate),
      },
    },
    include: {
      debt: { select: { id: true, name: true, type: true } },
    },
    orderBy: { paidAt: "asc" },
  });

  return quickPayments as unknown as QuickPaymentWithDebt[];
}

function getPeriodFromOffset(offset: number): PayPeriod {
  const current = getCurrentPayPeriod();
  if (offset === 0) return current;

  if (offset > 0) {
    const periods = getPayPeriods(current.startDate, offset + 1, "forward");
    return periods[offset];
  } else {
    const periods = getPayPeriods(current.startDate, Math.abs(offset) + 1, "backward");
    return periods[0];
  }
}

export default async function PayPeriodsPage({
  searchParams,
}: {
  searchParams: Promise<{ offset?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) return null;

  const params = await searchParams;
  const offset = parseInt(params.offset || "0", 10);
  const payPeriod = getPeriodFromOffset(offset);
  const currentPeriod = getCurrentPayPeriod();
  const isCurrent =
    payPeriod.startDate.getTime() === currentPeriod.startDate.getTime();

  const payments = await getPaymentsForPeriod(session.user.id, payPeriod);
  const quickPayments = await getQuickPaymentsForPeriod(session.user.id, payPeriod);

  const totalDue = payments.reduce((sum, p) => sum + Number(p.amount), 0);
  const billsPaid = payments
    .filter((p) => p.status === "PAID")
    .reduce((sum, p) => sum + Number(p.amount), 0);
  const quickPaid = quickPayments.reduce((sum, p) => sum + Number(p.amount), 0);
  const totalPaid = billsPaid + quickPaid;
  const remaining = totalDue - billsPaid;

  // Calculate bank allocations
  const bankAllocationMap = new Map<string, {
    bankId: string | null;
    bankName: string;
    bankType: string;
    totalAmount: number;
    bills: { id: string; name: string; amount: number; dueDate: Date; status: string }[];
  }>();

  for (const payment of payments) {
    const bankId = payment.bill.bankAccountId || "unassigned";
    const bankName = payment.bill.bankAccount?.name || "Unassigned Bills";
    const bankType = payment.bill.bankAccount?.bank || "OTHER";

    if (!bankAllocationMap.has(bankId)) {
      bankAllocationMap.set(bankId, {
        bankId: payment.bill.bankAccountId,
        bankName,
        bankType,
        totalAmount: 0,
        bills: [],
      });
    }

    const allocation = bankAllocationMap.get(bankId)!;
    allocation.totalAmount += Number(payment.amount);
    allocation.bills.push({
      id: payment.id,
      name: payment.bill.name,
      amount: Number(payment.amount),
      dueDate: payment.dueDate,
      status: payment.status,
    });
  }

  const bankAllocations = Array.from(bankAllocationMap.values()).sort((a, b) => {
    if (!a.bankId && b.bankId) return 1;
    if (a.bankId && !b.bankId) return -1;
    return b.totalAmount - a.totalAmount;
  });

  // Generate forecast for next 3 pay periods (only show on current period)
  let forecastPeriods: {
    periodLabel: string;
    startDate: string;
    endDate: string;
    allocations: { bankId: string | null; bankName: string; bankType: string; amount: number }[];
    totalAmount: number;
  }[] = [];

  if (isCurrent) {
    const upcomingPeriods = getPayPeriods(payPeriod.startDate, 4, "forward").slice(1); // Skip current
    
    for (const period of upcomingPeriods) {
      await ensureBillPaymentsForPayPeriod(session.user.id, period.startDate, period.endDate);
      
      const periodPayments = await prisma.billPayment.findMany({
        where: {
          bill: {
            userId: session.user.id,
            OR: [
              { debtId: null },
              {
                debt: {
                  OR: [
                    { status: { not: "DEFERRED" } },
                    { deferredUntil: null },
                    { deferredUntil: { lte: period.endDate } },
                  ],
                },
              },
            ],
          },
          dueDate: {
            gte: startOfDay(period.startDate),
            lte: endOfDay(period.endDate),
          },
          status: "UNPAID",
        },
        include: {
          bill: {
            select: {
              bankAccountId: true,
              bankAccount: { select: { id: true, name: true, bank: true } },
            },
          },
        },
      });

      const periodAllocMap = new Map<string, { bankId: string | null; bankName: string; bankType: string; amount: number }>();
      
      for (const payment of periodPayments) {
        const bankId = payment.bill.bankAccountId || "unassigned";
        const bankName = payment.bill.bankAccount?.name || "Unassigned Bills";
        const bankType = payment.bill.bankAccount?.bank || "OTHER";

        if (!periodAllocMap.has(bankId)) {
          periodAllocMap.set(bankId, { bankId: payment.bill.bankAccountId, bankName, bankType, amount: 0 });
        }
        periodAllocMap.get(bankId)!.amount += Number(payment.amount);
      }

      const periodAllocations = Array.from(periodAllocMap.values()).sort((a, b) => b.amount - a.amount);
      const totalAmount = periodAllocations.reduce((sum, a) => sum + a.amount, 0);

      forecastPeriods.push({
        periodLabel: formatPayPeriod(period),
        startDate: format(period.startDate, "MMM d"),
        endDate: format(period.endDate, "MMM d"),
        allocations: periodAllocations,
        totalAmount,
      });
    }
  }

  return (
    <div className="space-y-6 lg:space-y-8 animate-fade-in">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-theme-primary tracking-tight">Pay Periods</h1>
          <p className="text-theme-secondary mt-1">
            Track bills and payments by pay period
          </p>
        </div>
      </header>

      {/* Period Navigation Card */}
      <Card variant="gradient">
        <CardContent className="py-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl" style={{ backgroundColor: "rgba(255,255,255,0.1)" }}>
                <Calendar className="h-6 w-6" style={{ color: "#ffffff" }} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p style={{ color: "rgba(255,255,255,0.8)" }} className="text-sm font-medium">
                    {isCurrent ? "Current Pay Period" : "Pay Period"}
                  </p>
                  {isCurrent && <Badge variant="success" size="sm">Active</Badge>}
                </div>
                <p style={{ color: "#ffffff" }} className="text-2xl font-bold mt-1">
                  {formatPayPeriod(payPeriod)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link href={`/dashboard/pay-periods?offset=${offset - 1}`}>
                <Button variant="secondary" size="sm" leftIcon={<ChevronLeft className="h-4 w-4" />}>
                  Previous
                </Button>
              </Link>
              {offset !== 0 && (
                <Link href="/dashboard/pay-periods">
                  <Button variant="secondary" size="sm">
                    Current
                  </Button>
                </Link>
              )}
              <Link href={`/dashboard/pay-periods?offset=${offset + 1}`}>
                <Button variant="secondary" size="sm" rightIcon={<ChevronRight className="h-4 w-4" />}>
                  Next
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          label="Total Due"
          value={`$${totalDue.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
          icon={<DollarSign className="h-5 w-5" />}
          variant="info"
        />
        <StatCard
          label="Total Paid"
          value={`$${totalPaid.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
          icon={<Wallet className="h-5 w-5" />}
          variant="success"
        />
        <StatCard
          label="Remaining"
          value={`$${remaining.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
          icon={<TrendingUp className="h-5 w-5" />}
          variant={remaining > 0 ? "warning" : "success"}
        />
      </div>

      {/* Bills Due This Period */}
      <Card>
        <CardHeader>
          <CardTitle>Bills Due This Period</CardTitle>
        </CardHeader>
        <CardContent noPadding>
          {payments.length === 0 ? (
            <div className="py-12 text-center px-6">
              <div className="w-16 h-16 rounded-full bg-success-100 dark:bg-success-600/20 flex items-center justify-center mx-auto mb-4">
                <Calendar className="h-8 w-8 text-success-600 dark:text-success-400" />
              </div>
              <p className="text-lg font-medium text-theme-primary">No bills due</p>
              <p className="text-theme-secondary mt-1">Nothing due in this pay period</p>
            </div>
          ) : (
            <div className="divide-y divide-theme">
              {payments.map((payment, index) => (
                <div
                  key={payment.id}
                  className={`flex items-center justify-between py-4 px-6 hover:bg-theme-secondary/50 transition-colors animate-fade-in-up stagger-${Math.min(index + 1, 5)}`}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-theme-primary">
                        {payment.bill.name}
                      </p>
                      <StatusBadge status={payment.status === "PAID" ? "paid" : "unpaid"} />
                    </div>
                    <p className="text-sm text-theme-secondary mt-0.5">
                      Due {format(new Date(payment.dueDate), "MMM d, yyyy")}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <p className="text-lg font-semibold text-theme-primary">
                      ${Number(payment.amount).toFixed(2)}
                    </p>
                    <PaymentToggle
                      paymentId={payment.id}
                      initialStatus={payment.status}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bank Allocation */}
      {bankAllocations.length > 0 && (
        <BankAllocationSection allocations={bankAllocations} />
      )}

      {/* Allocation Forecast (only on current period) */}
      {isCurrent && forecastPeriods.length > 0 && (
        <AllocationForecast periods={forecastPeriods} />
      )}

      {/* Quick Payments */}
      <QuickPaymentsSection
        quickPayments={quickPayments}
        payPeriodStart={payPeriod.startDate}
        payPeriodEnd={payPeriod.endDate}
      />
    </div>
  );
}
