export interface PayoffResult {
  months: number;
  totalPayment: number;
  totalInterest: number;
  payoffDate: Date;
  schedule: PayoffScheduleEntry[];
}

export interface PayoffScheduleEntry {
  month: number;
  payment: number;
  principal: number;
  interest: number;
  balance: number;
}

export interface DebtPayoffInput {
  balance: number;
  apr: number;
  minimumPayment: number;
  extraPayment?: number;
}

export function calculatePayoff(input: DebtPayoffInput): PayoffResult | null {
  const { balance, apr, minimumPayment, extraPayment = 0 } = input;
  
  if (balance <= 0) {
    return {
      months: 0,
      totalPayment: 0,
      totalInterest: 0,
      payoffDate: new Date(),
      schedule: [],
    };
  }

  const monthlyPayment = minimumPayment + extraPayment;
  const monthlyRate = apr / 100 / 12;
  
  if (monthlyPayment <= 0) {
    return null;
  }

  const schedule: PayoffScheduleEntry[] = [];
  let remainingBalance = balance;
  let totalPayment = 0;
  let totalInterest = 0;
  let month = 0;
  const maxMonths = 600;

  while (remainingBalance > 0.01 && month < maxMonths) {
    month++;
    const interestCharge = remainingBalance * monthlyRate;
    
    if (monthlyPayment <= interestCharge && apr > 0) {
      return null;
    }

    const actualPayment = Math.min(monthlyPayment, remainingBalance + interestCharge);
    const principalPayment = actualPayment - interestCharge;
    remainingBalance = Math.max(0, remainingBalance - principalPayment);

    totalPayment += actualPayment;
    totalInterest += interestCharge;

    schedule.push({
      month,
      payment: actualPayment,
      principal: principalPayment,
      interest: interestCharge,
      balance: remainingBalance,
    });
  }

  if (month >= maxMonths) {
    return null;
  }

  const payoffDate = new Date();
  payoffDate.setMonth(payoffDate.getMonth() + month);

  return {
    months: month,
    totalPayment,
    totalInterest,
    payoffDate,
    schedule,
  };
}

export function calculatePayoffComparison(input: DebtPayoffInput): {
  withMinimum: PayoffResult | null;
  withExtra: PayoffResult | null;
  monthsSaved: number;
  interestSaved: number;
} {
  const withMinimum = calculatePayoff({ ...input, extraPayment: 0 });
  const withExtra = input.extraPayment && input.extraPayment > 0
    ? calculatePayoff(input)
    : withMinimum;

  const monthsSaved = (withMinimum?.months ?? 0) - (withExtra?.months ?? 0);
  const interestSaved = (withMinimum?.totalInterest ?? 0) - (withExtra?.totalInterest ?? 0);

  return {
    withMinimum,
    withExtra,
    monthsSaved,
    interestSaved,
  };
}

export function formatMonthsToYearsMonths(totalMonths: number): string {
  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;
  
  if (years === 0) {
    return `${months} month${months !== 1 ? 's' : ''}`;
  }
  if (months === 0) {
    return `${years} year${years !== 1 ? 's' : ''}`;
  }
  return `${years}y ${months}mo`;
}
