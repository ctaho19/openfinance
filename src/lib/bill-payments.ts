import { prisma } from "@/lib/db";
import { addDays, addWeeks, addMonths, startOfDay, endOfDay } from "date-fns";
import { Prisma } from "@prisma/client";

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
    let current = new Date(startDate);
    while (current <= endDate) {
      if (current.getDate() === bill.dueDay) {
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
    let current = new Date(startDate.getFullYear(), startDate.getMonth(), bill.dueDay);
    if (current < startDate) {
      current = addWeeks(current, 1);
    }
    while (current <= endDate) {
      if (current >= startDate) {
        dates.push(new Date(current));
      }
      current = addWeeks(current, 1);
    }
  } else if (bill.frequency === "BIWEEKLY") {
    // For biweekly, similar approach
    let current = new Date(startDate.getFullYear(), startDate.getMonth(), bill.dueDay);
    if (current < startDate) {
      current = addWeeks(current, 2);
    }
    while (current <= endDate) {
      if (current >= startDate) {
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
 */
export async function ensureBillPaymentsForPeriod(
  userId: string,
  startDate: Date,
  endDate: Date
): Promise<{ created: number; existing: number }> {
  // Get all active recurring bills for the user
  const bills = await prisma.bill.findMany({
    where: {
      userId,
      isActive: true,
      isRecurring: true,
    },
  });

  let created = 0;
  let existing = 0;

  for (const bill of bills) {
    const dueDates = getDueDatesForBill(bill as Bill, startDate, endDate);

    for (const dueDate of dueDates) {
      const dayStart = startOfDay(dueDate);
      const dayEnd = addDays(dayStart, 1);

      // Check if payment record already exists for this calendar day
      // Use range check to handle timezone differences in existing data
      const existingPayment = await prisma.billPayment.findFirst({
        where: {
          billId: bill.id,
          dueDate: {
            gte: dayStart,
            lt: dayEnd,
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
            dueDate: dayStart,
            amount: bill.amount,
            status: "UNPAID",
          },
        });
        created++;
      } catch (e) {
        // Handle unique constraint violation (race condition with another request)
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
    startOfDay(payPeriodStart),
    endOfDay(payPeriodEnd)
  );
}

/**
 * Generate BillPayment records for the next N months for all recurring bills
 */
export async function generateUpcomingBillPayments(
  userId: string,
  monthsAhead: number = 3
): Promise<{ created: number; existing: number }> {
  const startDate = startOfDay(new Date());
  const endDate = addMonths(startDate, monthsAhead);

  return ensureBillPaymentsForPeriod(userId, startDate, endDate);
}
