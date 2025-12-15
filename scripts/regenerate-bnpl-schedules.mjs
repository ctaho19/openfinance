/**
 * Regenerate BNPL Scheduled Payments and Bill Payments
 * 
 * This script fixes existing BNPL debts that were created before the paymentFrequency
 * field was added. It regenerates the schedule using the correct biweekly/monthly intervals.
 * 
 * Usage: node scripts/regenerate-bnpl-schedules.mjs
 */

import { PrismaClient } from '@prisma/client';
import { addDays, addWeeks, addMonths, format } from 'date-fns';

const prisma = new PrismaClient();

function generatePaymentSchedule(totalAmount, numberOfPayments, firstPaymentDate, frequency) {
  const paymentAmount = Math.round((totalAmount / numberOfPayments) * 100) / 100;
  const paymentDates = [];

  for (let i = 0; i < numberOfPayments; i++) {
    let date = new Date(firstPaymentDate);
    
    switch (frequency) {
      case 'weekly':
        date = addDays(date, i * 7);
        break;
      case 'biweekly':
        date = addDays(date, i * 14);
        break;
      case 'monthly':
        date = addMonths(date, i);
        break;
    }
    
    paymentDates.push(date);
  }

  return { paymentAmount, paymentDates };
}

async function regenerateBnplSchedule(debt) {
  const frequency = debt.paymentFrequency || 'monthly';
  
  // Get existing scheduled payments
  const scheduledPayments = await prisma.scheduledPayment.findMany({
    where: { debtId: debt.id },
    orderBy: { dueDate: 'asc' },
  });

  if (scheduledPayments.length === 0) {
    console.log(`  ⚠️ No scheduled payments found, skipping`);
    return { skipped: true };
  }

  // Find the first unpaid payment to use as the starting point
  const unpaidPayments = scheduledPayments.filter(p => !p.isPaid);
  const paidPayments = scheduledPayments.filter(p => p.isPaid);
  
  if (unpaidPayments.length === 0) {
    console.log(`  ✅ All payments are paid, skipping`);
    return { skipped: true };
  }

  // Calculate remaining balance based on unpaid scheduled payments
  const remainingAmount = unpaidPayments.reduce((sum, p) => sum + Number(p.amount), 0);
  const numberOfRemainingPayments = unpaidPayments.length;
  
  // Use the first unpaid payment date as the starting point
  const firstUnpaidDate = unpaidPayments[0].dueDate;
  
  console.log(`  Current: ${numberOfRemainingPayments} unpaid payments, $${remainingAmount.toFixed(2)} remaining`);
  console.log(`  Frequency: ${frequency}`);
  console.log(`  First unpaid date: ${format(firstUnpaidDate, 'yyyy-MM-dd')}`);

  // Generate new schedule with correct frequency
  const schedule = generatePaymentSchedule(
    remainingAmount,
    numberOfRemainingPayments,
    firstUnpaidDate,
    frequency
  );

  console.log(`  New schedule dates:`);
  schedule.paymentDates.forEach((date, i) => {
    console.log(`    Payment ${paidPayments.length + i + 1}: ${format(date, 'yyyy-MM-dd')} - $${schedule.paymentAmount.toFixed(2)}`);
  });

  // Delete unpaid scheduled payments
  await prisma.scheduledPayment.deleteMany({
    where: { 
      debtId: debt.id,
      isPaid: false,
    },
  });

  // Get and delete unpaid bill payments for this debt
  const existingBills = await prisma.bill.findMany({
    where: { debtId: debt.id },
    include: { payments: { where: { status: 'UNPAID' } } },
  });

  for (const bill of existingBills) {
    if (bill.payments.length > 0) {
      await prisma.billPayment.deleteMany({
        where: { billId: bill.id, status: 'UNPAID' },
      });
      
      const remainingPayments = await prisma.billPayment.count({
        where: { billId: bill.id },
      });
      
      if (remainingPayments === 0) {
        await prisma.bill.delete({ where: { id: bill.id } });
      }
    }
  }

  // Create new scheduled payments and bills with correct dates
  for (let i = 0; i < schedule.paymentDates.length; i++) {
    const paymentDate = schedule.paymentDates[i];
    const paymentNumber = paidPayments.length + i + 1;
    const totalPayments = paidPayments.length + numberOfRemainingPayments;

    await prisma.scheduledPayment.create({
      data: {
        debtId: debt.id,
        dueDate: paymentDate,
        amount: schedule.paymentAmount,
        notes: `Payment ${paymentNumber} of ${totalPayments}`,
      },
    });

    const bill = await prisma.bill.create({
      data: {
        userId: debt.userId,
        name: `${debt.name} - Payment ${paymentNumber} of ${totalPayments}`,
        category: 'BNPL',
        amount: schedule.paymentAmount,
        dueDay: paymentDate.getDate(),
        isRecurring: false,
        frequency: 'ONCE',
        debtId: debt.id,
        bankAccountId: debt.bankAccountId,
        notes: `Auto-generated BNPL payment for ${debt.name}`,
      },
    });

    await prisma.billPayment.create({
      data: {
        billId: bill.id,
        dueDate: paymentDate,
        amount: schedule.paymentAmount,
        status: 'UNPAID',
      },
    });
  }

  // Update the debt's minimum payment to match the schedule
  await prisma.debt.update({
    where: { id: debt.id },
    data: { minimumPayment: schedule.paymentAmount },
  });

  return { 
    success: true, 
    paymentsRegenerated: numberOfRemainingPayments,
    frequency,
  };
}

async function main() {
  console.log('=== BNPL Schedule Regeneration ===\n');

  // Get all BNPL debts
  const bnplDebts = await prisma.debt.findMany({
    where: { 
      type: 'BNPL',
      isActive: true,
    },
    orderBy: { name: 'asc' },
  });

  console.log(`Found ${bnplDebts.length} active BNPL debts\n`);

  let regenerated = 0;
  let skipped = 0;
  let errors = 0;

  for (const debt of bnplDebts) {
    console.log(`\n📦 ${debt.name}`);
    
    try {
      const result = await regenerateBnplSchedule(debt);
      
      if (result.skipped) {
        skipped++;
      } else if (result.success) {
        console.log(`  ✅ Regenerated ${result.paymentsRegenerated} payments (${result.frequency})`);
        regenerated++;
      }
    } catch (error) {
      console.log(`  ❌ Error: ${error.message}`);
      errors++;
    }
  }

  console.log('\n=== Summary ===');
  console.log(`Regenerated: ${regenerated}`);
  console.log(`Skipped: ${skipped}`);
  console.log(`Errors: ${errors}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
