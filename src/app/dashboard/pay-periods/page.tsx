import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import {
  getCurrentPayPeriod,
  getPayPeriods,
  formatPayPeriod,
  type PayPeriod,
} from "@/lib/pay-periods";
import { ensureBillPaymentsForPayPeriod } from "@/lib/bill-payments";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, ChevronLeft, ChevronRight, DollarSign, Zap } from "lucide-react";
import Link from "next/link";
import { format, startOfDay, endOfDay } from "date-fns";
import { PaymentToggle } from "./payment-toggle";
import { QuickPaymentsSection } from "./quick-payments-section";
import { BankAllocationSection } from "./bank-allocation";

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
  // First, ensure all recurring bill payments exist for this period
  await ensureBillPaymentsForPayPeriod(userId, payPeriod.startDate, payPeriod.endDate);

  const payments = await prisma.billPayment.findMany({
    where: {
      bill: { userId },
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

  // For forward: get periods starting from current, return the one at offset index
  // For backward: get periods going back, the array is reversed so index 0 = furthest back
  if (offset > 0) {
    const periods = getPayPeriods(current.startDate, offset + 1, "forward");
    return periods[offset];
  } else {
    // Going backward: need to get |offset| periods before current
    const periods = getPayPeriods(current.startDate, Math.abs(offset) + 1, "backward");
    // After reverse, periods[0] is the furthest back, periods[|offset|] is current
    // We want periods[0] when offset=-|offset|
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

  // Calculate bank allocations for payday
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

  // Sort allocations: assigned banks first (sorted by amount), unassigned last
  const bankAllocations = Array.from(bankAllocationMap.values()).sort((a, b) => {
    if (!a.bankId && b.bankId) return 1;
    if (a.bankId && !b.bankId) return -1;
    return b.totalAmount - a.totalAmount;
  });

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-theme-primary">Pay Periods</h1>
          <p className="text-theme-secondary mt-1">
            Track bills and payments by pay period
          </p>
        </div>
      </div>

      <Card className="bg-gradient-to-r from-emerald-900/50 to-emerald-800/30 border-emerald-700/50">
        <CardContent className="py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-emerald-900/50">
                <Calendar className="h-6 w-6 text-emerald-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-emerald-400 text-sm font-medium">
                    {isCurrent ? "Current Pay Period" : "Pay Period"}
                  </p>
                  {isCurrent && <Badge variant="success">Active</Badge>}
                </div>
                <p className="text-2xl font-bold text-theme-primary">
                  {formatPayPeriod(payPeriod)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link href={`/dashboard/pay-periods?offset=${offset - 1}`}>
                <Button variant="secondary" size="sm">
                  <ChevronLeft className="h-4 w-4" />
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
                <Button variant="secondary" size="sm">
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/50">
                <DollarSign className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-theme-secondary">Total Due</p>
                <p className="text-xl font-bold text-theme-primary">
                  ${totalDue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/50">
                <DollarSign className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-sm text-theme-secondary">Total Paid</p>
                <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                  ${totalPaid.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </p>
                {quickPaid > 0 && (
                  <p className="text-xs text-theme-muted">
                    incl. ${quickPaid.toFixed(2)} quick payments
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-yellow-100 dark:bg-yellow-900/50">
                <DollarSign className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <p className="text-sm text-theme-secondary">Remaining</p>
                <p className="text-xl font-bold text-yellow-600 dark:text-yellow-400">
                  ${remaining.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Bills Due This Period</CardTitle>
        </CardHeader>
        <CardContent>
          {payments.length === 0 ? (
            <div className="py-8 text-center">
              <Calendar className="h-12 w-12 text-theme-muted mx-auto mb-4" />
              <p className="text-theme-secondary">No bills due in this pay period</p>
            </div>
          ) : (
            <div className="space-y-3">
              {payments.map((payment) => (
                <div
                  key={payment.id}
                  className="flex items-center justify-between py-3 px-4 rounded-lg bg-theme-tertiary"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-theme-primary">
                        {payment.bill.name}
                      </p>
                      <Badge
                        variant={payment.status === "PAID" ? "success" : "warning"}
                      >
                        {payment.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-theme-secondary">
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

      {isCurrent && bankAllocations.length > 0 && (
        <BankAllocationSection allocations={bankAllocations} />
      )}

      <QuickPaymentsSection
        quickPayments={quickPayments}
        payPeriodStart={payPeriod.startDate}
        payPeriodEnd={payPeriod.endDate}
      />
    </div>
  );
}
