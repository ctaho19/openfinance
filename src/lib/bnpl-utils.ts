export interface BNPLSchedule {
  totalAmount: number;
  numberOfPayments: number;
  firstPaymentDate: Date;
  frequency: 'weekly' | 'biweekly' | 'monthly';
}

export interface PaymentScheduleResult {
  paymentAmount: number;
  paymentDates: Date[];
}

export function generatePaymentSchedule(schedule: BNPLSchedule): PaymentScheduleResult {
  const paymentAmount = Math.round((schedule.totalAmount / schedule.numberOfPayments) * 100) / 100;
  const paymentDates: Date[] = [];

  for (let i = 0; i < schedule.numberOfPayments; i++) {
    const date = new Date(schedule.firstPaymentDate);
    
    switch (schedule.frequency) {
      case 'weekly':
        date.setDate(date.getDate() + (i * 7));
        break;
      case 'biweekly':
        date.setDate(date.getDate() + (i * 14));
        break;
      case 'monthly':
        date.setMonth(date.getMonth() + i);
        break;
    }
    
    paymentDates.push(date);
  }

  return { paymentAmount, paymentDates };
}

export function formatPaymentPreview(
  numberOfPayments: number,
  paymentAmount: number,
  firstPaymentDate: Date
): string {
  const formatter = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' });
  return `${numberOfPayments} payments of $${paymentAmount.toFixed(2)} starting ${formatter.format(firstPaymentDate)}`;
}

/**
 * Calculate effective APR from a BNPL payment schedule.
 * This computes the implied interest rate when total repayable differs from principal.
 * 
 * Uses a simple APR approximation: ((totalRepayable - principal) / principal) * (12 / months) * 100
 * For more accuracy, we could use Newton-Raphson to solve for IRR, but this is sufficient for display.
 */
export function calculateEffectiveAPR(params: {
  principal: number;
  totalRepayable: number;
  numberOfPayments: number;
  frequency: 'weekly' | 'biweekly' | 'monthly';
}): number {
  const { principal, totalRepayable, numberOfPayments, frequency } = params;
  
  if (principal <= 0 || totalRepayable <= 0 || numberOfPayments <= 0) {
    return 0;
  }
  
  // If no interest (total equals principal), return 0
  if (Math.abs(totalRepayable - principal) < 0.01) {
    return 0;
  }
  
  // Calculate total finance charge
  const financeCharge = totalRepayable - principal;
  
  // Determine loan term in months based on frequency
  let termInMonths: number;
  switch (frequency) {
    case 'weekly':
      termInMonths = (numberOfPayments * 7) / 30.44; // Average days per month
      break;
    case 'biweekly':
      termInMonths = (numberOfPayments * 14) / 30.44;
      break;
    case 'monthly':
      termInMonths = numberOfPayments;
      break;
  }
  
  // Simple APR approximation
  // APR = (Finance Charge / Principal) / (Term in Years) * 100
  const termInYears = termInMonths / 12;
  const effectiveAPR = (financeCharge / principal) / termInYears * 100;
  
  // Round to 2 decimal places
  return Math.round(effectiveAPR * 100) / 100;
}

/**
 * Calculate the "effective rate" to use for sorting/prioritization.
 * Returns the higher of stated APR or computed effective APR.
 */
export function getEffectiveRateForSorting(params: {
  statedAPR: number;
  principal: number;
  totalRepayable: number;
  numberOfPayments: number;
  frequency: 'weekly' | 'biweekly' | 'monthly';
}): number {
  const computedAPR = calculateEffectiveAPR({
    principal: params.principal,
    totalRepayable: params.totalRepayable,
    numberOfPayments: params.numberOfPayments,
    frequency: params.frequency,
  });
  
  // Use whichever is higher - stated or computed
  return Math.max(params.statedAPR, computedAPR);
}
