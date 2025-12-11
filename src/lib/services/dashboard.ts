import { prisma } from "@/lib/db";
import {
  getCurrentPayPeriod,
  getNextPayPeriod,
  type PayPeriod,
} from "@/lib/pay-periods";
import { startOfDay, endOfDay, differenceInDays } from "date-fns";
import type { FOOStep, BillPayment, Bill } from "@prisma/client";

export const FOO_STEP_NAMES: Record<FOOStep, { number: number; name: string }> = {
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

export const FOO_STEP_ORDER: FOOStep[] = [
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

export type UpcomingPayment = BillPayment & {
  bill: Pick<Bill, "id" | "name" | "category">;
};

export interface DashboardData {
  currentPeriod: PayPeriod;
  nextPeriod: PayPeriod;
  billCount: number;
  totalDebt: number;
  debtCount: number;
  upcomingPayments: UpcomingPayment[];
  billsDueThisPeriod: number;
  totalDueThisPeriod: number;
  totalPaidThisPeriod: number;
  completedSteps: number;
  currentFooStep: FOOStep | undefined;
  overdueCount: number;
  dueSoonCount: number;
  bnplDueAmount: number;
  hasBnplDue: boolean;
  paycheckAmount: number;
  safeToSpend: number;
}

export async function getDashboardData(userId: string): Promise<DashboardData> {
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
        bill: { select: { id: true, name: true, category: true } },
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
