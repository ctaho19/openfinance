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
