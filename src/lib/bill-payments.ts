import { prisma } from "@/lib/db";
import { addDays, addWeeks, addMonths } from "date-fns";
import { Prisma } from "@prisma/client";

/**
 * Create a UTC date at noon to avoid timezone boundary issues.
 * Using noon ensures the date won't shift when converted between timezones.
 */
function createUTCDate(year: number, month: number, day: number): Date {
  return new Date(Date.UTC(year, month, day, 12, 0, 0, 0));
}

/**
 * Get start of day in UTC (at noon to avoid timezone issues)
 */
function startOfDayUTC(date: Date): Date {
  return createUTCDate(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
}

/**
 * Get end of day in UTC
 */
function endOfDayUTC(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 23, 59, 59, 999));
}

interface Bill {
  id: string;
  userId: string;
  name: string;
  amount: { toString(): string } | number;
  dueDay: number;
  isRecurring: boolean;
  frequency: "ONCE" | "WEEKLY" | "BIWEEKLY" | "MONTHLY" | "YEARLY";
  isActive: boolean;
}

/**
 * Get all due dates for a recurring bill within a date range
 */
function getDueDatesForBill(
  bill: Bill,
  startDate: Date,
  endDate: Date
): Date[] {
  const dates: Date[] = [];
  
  if (!bill.isRecurring || bill.frequency === "ONCE") {
    return dates;
  }

  // For monthly bills, check each day in range for matching dueDay
  if (bill.frequency === "MONTHLY") {
    let current = startOfDayUTC(startDate);
    const end = endOfDayUTC(endDate);
    while (current <= end) {
      if (current.getUTCDate() === bill.dueDay) {
        dates.push(new Date(current));
      }
      current = addDays(current, 1);
    }
  } else if (bill.frequency === "YEARLY") {
    // YEARLY: only match if both month and day match the bill's creation month
    // For now, skip auto-generation for yearly bills - they should be manually tracked
    // TODO: Add dueMonth field to Bill model for proper yearly support
    return dates;
  } else if (bill.frequency === "WEEKLY") {
    // For weekly, we need a reference point - use the dueDay of current month as anchor
    let current = createUTCDate(startDate.getUTCFullYear(), startDate.getUTCMonth(), bill.dueDay);
    const start = startOfDayUTC(startDate);
    const end = endOfDayUTC(endDate);
    if (current < start) {
      current = addWeeks(current, 1);
    }
    while (current <= end) {
      if (current >= start) {
        dates.push(new Date(current));
      }
      current = addWeeks(current, 1);
    }
  } else if (bill.frequency === "BIWEEKLY") {
    // For biweekly, similar approach
    let current = createUTCDate(startDate.getUTCFullYear(), startDate.getUTCMonth(), bill.dueDay);
    const start = startOfDayUTC(startDate);
    const end = endOfDayUTC(endDate);
    if (current < start) {
      current = addWeeks(current, 2);
    }
    while (current <= end) {
      if (current >= start) {
        dates.push(new Date(current));
      }
      current = addWeeks(current, 2);
    }
  }

  return dates;
}

/**
 * Ensure BillPayment records exist for all recurring bills within a date range.
 * Creates missing records, skips existing ones.
 * Excludes bills linked to deferred debts where deferment extends past the period.
 */
export async function ensureBillPaymentsForPeriod(
  userId: string,
  startDate: Date,
  endDate: Date
): Promise<{ created: number; existing: number }> {
  // Get all active recurring bills for the user
  // Exclude bills linked to debts that are deferred past this period
  const bills = await prisma.bill.findMany({
    where: {
      userId,
      isActive: true,
      isRecurring: true,
      OR: [
        { debtId: null },
        {
          debt: {
            OR: [
              { status: { not: "DEFERRED" } },
              { deferredUntil: null },
              { deferredUntil: { lte: endDate } },
            ],
          },
        },
      ],
    },
  });

  let created = 0;
  let existing = 0;

  for (const bill of bills) {
    const dueDates = getDueDatesForBill(bill as Bill, startDate, endDate);

    for (const dueDate of dueDates) {
      // Normalize to UTC noon to avoid timezone boundary issues
      const normalizedDate = startOfDayUTC(dueDate);

      // Check for existing payment using the unique constraint key
      const existingPayment = await prisma.billPayment.findUnique({
        where: {
          billId_dueDate: {
            billId: bill.id,
            dueDate: normalizedDate,
          },
        },
      });

      if (existingPayment) {
        existing++;
        continue;
      }

      // Create the payment record, handling race conditions
      try {
        await prisma.billPayment.create({
          data: {
            billId: bill.id,
            dueDate: normalizedDate,
            amount: bill.amount,
            status: "UNPAID",
          },
        });
        created++;
      } catch (e) {
        if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
          existing++;
        } else {
          throw e;
        }
      }
    }
  }

  return { created, existing };
}

/**
 * Ensure BillPayment records exist for a specific pay period
 */
export async function ensureBillPaymentsForPayPeriod(
  userId: string,
  payPeriodStart: Date,
  payPeriodEnd: Date
): Promise<{ created: number; existing: number }> {
  return ensureBillPaymentsForPeriod(
    userId,
    startOfDayUTC(payPeriodStart),
    endOfDayUTC(payPeriodEnd)
  );
}

/**
 * Generate BillPayment records for the next N months for all recurring bills
 */
export async function generateUpcomingBillPayments(
  userId: string,
  monthsAhead: number = 3
): Promise<{ created: number; existing: number }> {
  const startDate = startOfDayUTC(new Date());
  const endDate = addMonths(startDate, monthsAhead);

  return ensureBillPaymentsForPeriod(userId, startDate, endDate);
}
