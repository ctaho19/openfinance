/**
 * Script to fix Zip and Sezzle BNPL debts that should be biweekly.
 * Regenerates their payment schedules with biweekly frequency.
 * 
 * Run with: node scripts/fix-biweekly-bnpl.mjs
 */

import { config } from "dotenv";
config();

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function generatePaymentSchedule(totalAmount, numberOfPayments, firstPaymentDate, frequency) {
  const paymentAmount = Math.round((totalAmount / numberOfPayments) * 100) / 100;
  const paymentDates = [];

  for (let i = 0; i < numberOfPayments; i++) {
    const date = new Date(firstPaymentDate);
    
    switch (frequency) {
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

async function main() {
  console.log("Finding Zip and Sezzle BNPL debts to fix...\n");

  // Find debts with Zip or Sezzle in the name
  const debts = await prisma.debt.findMany({
    where: {
      type: "BNPL",
      OR: [
        { name: { contains: "Zip", mode: "insensitive" } },
        { name: { contains: "Sezzle", mode: "insensitive" } },
      ],
    },
    include: {
      scheduledPayments: { orderBy: { dueDate: "asc" } },
    },
  });

  console.log(`Found ${debts.length} debts to process.\n`);

  for (const debt of debts) {
    console.log(`\nProcessing: ${debt.name}`);
    
    // Get unpaid scheduled payments
    const unpaidPayments = debt.scheduledPayments.filter(p => !p.isPaid);
    const paidPayments = debt.scheduledPayments.filter(p => p.isPaid);
    
    if (unpaidPayments.length === 0) {
      console.log("  → No unpaid payments, skipping");
      continue;
    }

    // Check current frequency
    if (debt.scheduledPayments.length >= 2) {
      const date1 = new Date(debt.scheduledPayments[0].dueDate);
      const date2 = new Date(debt.scheduledPayments[1].dueDate);
      const daysDiff = Math.round((date2.getTime() - date1.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff <= 16) {
        console.log(`  → Already biweekly (${daysDiff} days between payments), skipping`);
        continue;
      }
      console.log(`  → Current frequency: ${daysDiff} days (monthly)`);
    }

    // Get first unpaid payment date as the new start
    const firstUnpaidDate = new Date(unpaidPayments[0].dueDate);
    const totalUnpaid = unpaidPayments.reduce((sum, p) => sum + Number(p.amount), 0);
    const numberOfPayments = unpaidPayments.length;

    console.log(`  → Regenerating ${numberOfPayments} payments as biweekly`);
    console.log(`  → Starting from: ${firstUnpaidDate.toLocaleDateString()}`);

    // Generate new biweekly schedule
    const schedule = generatePaymentSchedule(
      totalUnpaid,
      numberOfPayments,
      firstUnpaidDate,
      'biweekly'
    );

    // Delete unpaid scheduled payments
    await prisma.scheduledPayment.deleteMany({
      where: { debtId: debt.id, isPaid: false },
    });

    // Delete unpaid bills and bill payments for this debt
    const existingBills = await prisma.bill.findMany({
      where: { debtId: debt.id },
      include: { payments: true },
    });

    for (const bill of existingBills) {
      const unpaidBillPayments = bill.payments.filter(p => p.status === "UNPAID");
      if (unpaidBillPayments.length > 0) {
        await prisma.billPayment.deleteMany({
          where: { billId: bill.id, status: "UNPAID" },
        });
        const remainingPayments = await prisma.billPayment.count({
          where: { billId: bill.id },
        });
        if (remainingPayments === 0) {
          await prisma.bill.delete({ where: { id: bill.id } });
        }
      }
    }

    // Create new scheduled payments and bills
    for (let i = 0; i < schedule.paymentDates.length; i++) {
      const paymentDate = schedule.paymentDates[i];
      const paymentNumber = paidPayments.length + i + 1;
      const totalPaymentCount = paidPayments.length + numberOfPayments;

      await prisma.scheduledPayment.create({
        data: {
          debtId: debt.id,
          dueDate: paymentDate,
          amount: schedule.paymentAmount,
          notes: `Payment ${paymentNumber} of ${totalPaymentCount}`,
        },
      });

      const bill = await prisma.bill.create({
        data: {
          userId: debt.userId,
          name: `${debt.name} - Payment ${paymentNumber} of ${totalPaymentCount}`,
          category: "BNPL",
          amount: schedule.paymentAmount,
          dueDay: paymentDate.getDate(),
          isRecurring: false,
          frequency: "ONCE",
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
          status: "UNPAID",
        },
      });
    }

    // Update debt minimum payment
    await prisma.debt.update({
      where: { id: debt.id },
      data: { minimumPayment: schedule.paymentAmount },
    });

    console.log(`  ✅ Created ${numberOfPayments} biweekly payments`);
  }

  console.log("\n✅ Done!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
