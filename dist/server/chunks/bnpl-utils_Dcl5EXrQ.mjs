function generatePaymentSchedule(schedule) {
  const paymentAmount = Math.round(schedule.totalAmount / schedule.numberOfPayments * 100) / 100;
  const paymentDates = [];
  for (let i = 0; i < schedule.numberOfPayments; i++) {
    const date = new Date(schedule.firstPaymentDate);
    switch (schedule.frequency) {
      case "weekly":
        date.setDate(date.getDate() + i * 7);
        break;
      case "biweekly":
        date.setDate(date.getDate() + i * 14);
        break;
      case "monthly":
        date.setMonth(date.getMonth() + i);
        break;
    }
    paymentDates.push(date);
  }
  return { paymentAmount, paymentDates };
}
function formatPaymentPreview(numberOfPayments, paymentAmount, firstPaymentDate) {
  const formatter = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" });
  return `${numberOfPayments} payments of $${paymentAmount.toFixed(2)} starting ${formatter.format(firstPaymentDate)}`;
}
function calculateEffectiveAPR(params) {
  const { principal, totalRepayable, numberOfPayments, frequency } = params;
  if (principal <= 0 || totalRepayable <= 0 || numberOfPayments <= 0) {
    return 0;
  }
  if (Math.abs(totalRepayable - principal) < 0.01) {
    return 0;
  }
  const financeCharge = totalRepayable - principal;
  let termInMonths;
  switch (frequency) {
    case "weekly":
      termInMonths = numberOfPayments * 7 / 30.44;
      break;
    case "biweekly":
      termInMonths = numberOfPayments * 14 / 30.44;
      break;
    case "monthly":
      termInMonths = numberOfPayments;
      break;
  }
  const termInYears = termInMonths / 12;
  const effectiveAPR = financeCharge / principal / termInYears * 100;
  return Math.round(effectiveAPR * 100) / 100;
}

export { calculateEffectiveAPR as c, formatPaymentPreview as f, generatePaymentSchedule as g };
//# sourceMappingURL=bnpl-utils_Dcl5EXrQ.mjs.map
