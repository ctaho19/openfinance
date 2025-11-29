import {
  addDays,
  startOfDay,
  isBefore,
  isAfter,
  isEqual,
  format,
  addWeeks,
  subWeeks,
} from "date-fns";

export interface PayPeriod {
  startDate: Date;
  endDate: Date;
  paycheckDate: Date;
}

// Reference paycheck date (Nov 26, 2025 - Wednesday)
const REFERENCE_PAYCHECK = new Date(2025, 10, 26); // Month is 0-indexed

/**
 * Get the paycheck date for a given date based on bi-weekly Wednesday schedule
 */
export function getPaycheckDateForDate(date: Date): Date {
  const target = startOfDay(date);
  const reference = startOfDay(REFERENCE_PAYCHECK);

  // Calculate weeks difference from reference
  const diffTime = target.getTime() - reference.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const diffWeeks = Math.floor(diffDays / 7);

  // Bi-weekly means every 2 weeks
  const periodsFromReference = Math.floor(diffWeeks / 2);
  const paycheckDate = addWeeks(reference, periodsFromReference * 2);

  // If the calculated paycheck is after the target, go back 2 weeks
  if (isAfter(paycheckDate, target)) {
    return subWeeks(paycheckDate, 2);
  }

  return paycheckDate;
}

/**
 * Get the pay period that contains the given date
 */
export function getPayPeriodForDate(date: Date): PayPeriod {
  const paycheckDate = getPaycheckDateForDate(date);

  return {
    startDate: paycheckDate,
    endDate: addDays(paycheckDate, 13), // 14 days total (day 0-13)
    paycheckDate,
  };
}

/**
 * Get the current pay period
 */
export function getCurrentPayPeriod(): PayPeriod {
  return getPayPeriodForDate(new Date());
}

/**
 * Get the next pay period
 */
export function getNextPayPeriod(): PayPeriod {
  const current = getCurrentPayPeriod();
  return getPayPeriodForDate(addDays(current.endDate, 1));
}

/**
 * Get the previous pay period
 */
export function getPreviousPayPeriod(): PayPeriod {
  const current = getCurrentPayPeriod();
  return getPayPeriodForDate(subWeeks(current.startDate, 1));
}

/**
 * Get multiple pay periods starting from a date
 */
export function getPayPeriods(
  startDate: Date,
  count: number,
  direction: "forward" | "backward" = "forward"
): PayPeriod[] {
  const periods: PayPeriod[] = [];
  let currentDate = startDate;

  for (let i = 0; i < count; i++) {
    const period = getPayPeriodForDate(currentDate);
    periods.push(period);

    if (direction === "forward") {
      currentDate = addDays(period.endDate, 1);
    } else {
      currentDate = subWeeks(period.startDate, 1);
    }
  }

  return direction === "backward" ? periods.reverse() : periods;
}

/**
 * Check if a date falls within a pay period
 */
export function isDateInPayPeriod(date: Date, payPeriod: PayPeriod): boolean {
  const target = startOfDay(date);
  const start = startOfDay(payPeriod.startDate);
  const end = startOfDay(payPeriod.endDate);

  return (
    (isAfter(target, start) || isEqual(target, start)) &&
    (isBefore(target, end) || isEqual(target, end))
  );
}

/**
 * Format a pay period for display
 */
export function formatPayPeriod(payPeriod: PayPeriod): string {
  return `${format(payPeriod.startDate, "MMM d")} - ${format(payPeriod.endDate, "MMM d, yyyy")}`;
}

/**
 * Get bills due in a specific pay period based on their due day
 */
export function getDueDatesInPeriod(
  dueDay: number,
  payPeriod: PayPeriod
): Date[] {
  const dates: Date[] = [];
  let currentDate = new Date(payPeriod.startDate);

  while (
    isBefore(currentDate, payPeriod.endDate) ||
    isEqual(currentDate, payPeriod.endDate)
  ) {
    if (currentDate.getDate() === dueDay) {
      dates.push(new Date(currentDate));
    }
    currentDate = addDays(currentDate, 1);
  }

  return dates;
}
