import { subWeeks, addDays, startOfDay, addWeeks, isAfter, format } from 'date-fns';

const REFERENCE_PAYCHECK = new Date(2025, 10, 26);
function getPaycheckDateForDate(date) {
  const target = startOfDay(date);
  const reference = startOfDay(REFERENCE_PAYCHECK);
  const diffTime = target.getTime() - reference.getTime();
  const diffDays = Math.floor(diffTime / (1e3 * 60 * 60 * 24));
  const diffWeeks = Math.floor(diffDays / 7);
  const periodsFromReference = Math.floor(diffWeeks / 2);
  const paycheckDate = addWeeks(reference, periodsFromReference * 2);
  if (isAfter(paycheckDate, target)) {
    return subWeeks(paycheckDate, 2);
  }
  return paycheckDate;
}
function getPayPeriodForDate(date) {
  const paycheckDate = getPaycheckDateForDate(date);
  return {
    startDate: paycheckDate,
    endDate: addDays(paycheckDate, 13),
    // 14 days total (day 0-13)
    paycheckDate
  };
}
function getCurrentPayPeriod() {
  return getPayPeriodForDate(/* @__PURE__ */ new Date());
}
function getNextPayPeriod() {
  const current = getCurrentPayPeriod();
  return getPayPeriodForDate(addDays(current.endDate, 1));
}
function getPreviousPayPeriod() {
  const current = getCurrentPayPeriod();
  return getPayPeriodForDate(subWeeks(current.startDate, 1));
}
function getPayPeriods(startDate, count, direction = "forward") {
  const periods = [];
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
function formatPayPeriod(payPeriod) {
  return `${format(payPeriod.startDate, "MMM d")} - ${format(payPeriod.endDate, "MMM d, yyyy")}`;
}

export { getPreviousPayPeriod as a, getNextPayPeriod as b, getPayPeriods as c, formatPayPeriod as f, getCurrentPayPeriod as g };
//# sourceMappingURL=pay-periods_DoSYQF1E.mjs.map
