/**
 * Script to fix bill payment due dates that may have been stored with incorrect timezone handling.
 * 
 * This script:
 * 1. Finds all bill payments
 * 2. Checks if the stored dueDate matches the bill's dueDay
 * 3. If not, corrects the date to use UTC noon on the correct day
 * 
 * Run with: npx ts-node scripts/fix-bill-payment-dates.ts
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function fixBillPaymentDates() {
  console.log("Starting bill payment date fix...\n");

  // Get all bill payments with their associated bills
  const payments = await prisma.billPayment.findMany({
    include: {
      bill: true,
    },
  });

  console.log(`Found ${payments.length} bill payments to check\n`);

  let fixed = 0;
  let correct = 0;
  let deleted = 0;

  for (const payment of payments) {
    const storedDate = payment.dueDate;
    const expectedDueDay = payment.bill.dueDay;

    // Get the UTC date of the stored due date
    const storedUTCDay = storedDate.getUTCDate();

    if (storedUTCDay !== expectedDueDay) {
      console.log(`Payment ID: ${payment.id}`);
      console.log(`  Bill: ${payment.bill.name}`);
      console.log(`  Expected due day: ${expectedDueDay}`);
      console.log(`  Stored date: ${storedDate.toISOString()} (UTC day: ${storedUTCDay})`);

      // Calculate the correct date - use the same month/year but correct day
      const correctedDate = new Date(Date.UTC(
        storedDate.getUTCFullYear(),
        storedDate.getUTCMonth(),
        expectedDueDay,
        12, 0, 0, 0
      ));

      console.log(`  Corrected date: ${correctedDate.toISOString()}`);

      // Check if a payment already exists for the correct date
      const existingCorrect = await prisma.billPayment.findFirst({
        where: {
          billId: payment.billId,
          dueDate: correctedDate,
          id: { not: payment.id },
        },
      });

      if (existingCorrect) {
        // Delete the incorrect one since correct one already exists
        await prisma.billPayment.delete({
          where: { id: payment.id },
        });
        console.log(`  DELETED (duplicate of existing correct payment)\n`);
        deleted++;
      } else {
        // Update to the correct date
        await prisma.billPayment.update({
          where: { id: payment.id },
          data: { dueDate: correctedDate },
        });
        console.log(`  FIXED\n`);
        fixed++;
      }
    } else {
      correct++;
    }
  }

  console.log("\n=== Summary ===");
  console.log(`Total payments: ${payments.length}`);
  console.log(`Already correct: ${correct}`);
  console.log(`Fixed: ${fixed}`);
  console.log(`Deleted (duplicates): ${deleted}`);
}

fixBillPaymentDates()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
