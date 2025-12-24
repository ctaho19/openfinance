/**
 * Reconcile Affirm BNPL Loans
 * 
 * Updates Affirm debts to match user's manually tracked data.
 * - Fixes currentBalance, minimumPayment, dueDay discrepancies
 * - Deletes duplicate entry (Affirm - 12)
 * - Renames debts based on remaining payments
 * - Regenerates scheduled payments
 * - Records Dec 24th payments for loans 1-7
 * 
 * Run with: node scripts/reconcile-affirm-loans.mjs
 */

import { config } from "dotenv";
config();

import { PrismaClient, Prisma } from "@prisma/client";

const prisma = new PrismaClient();

function formatDate(date) {
  return date.toISOString().split("T")[0];
}

// User's manually tracked data as of Dec 24, 2025 (AFTER today's payments)
// Loans 1-7 were paid today, so their balances reflect post-payment state
const LOAN_UPDATES = [
  // Paid today (Dec 24) - balances are AFTER payment
  { dbName: "Affirm - 1", newName: "Affirm - 4 payments left", currentBalance: 333.34, minimumPayment: 83.33, dueDay: 27, remainingPayments: 4, finalPaymentAmount: 83.35, paidToday: true },
  { dbName: "Affirm - 2", newName: "Affirm - 3 payments left (due 29th)", currentBalance: 271.97, minimumPayment: 91.38, dueDay: 29, remainingPayments: 3, finalPaymentAmount: 89.21, paidToday: true },
  { dbName: "Affirm - 3", newName: "Affirm - 10 payments left (due 27th)", currentBalance: 789.17, minimumPayment: 78.95, dueDay: 27, remainingPayments: 10, finalPaymentAmount: 78.62, paidToday: true },
  { dbName: "Affirm - 4", newName: "Affirm - 10 payments left (due 28th)", currentBalance: 591.75, minimumPayment: 59.21, dueDay: 28, remainingPayments: 10, finalPaymentAmount: 58.66, paidToday: true },
  { dbName: "Affirm - 5", newName: "Affirm - 4 payments left (due 27th)", currentBalance: 533.34, minimumPayment: 133.33, dueDay: 27, remainingPayments: 4, finalPaymentAmount: 133.35, paidToday: true },
  { dbName: "Affirm - 11", newName: "Affirm - 3 payments left (due 24th)", currentBalance: 277.79, minimumPayment: 93.21, dueDay: 24, remainingPayments: 3, finalPaymentAmount: 91.37, paidToday: true },
  { dbName: "Affirm - 6", newName: "Affirm - 4 payments left (due 28th)", currentBalance: 219.05, minimumPayment: 54.85, dueDay: 28, remainingPayments: 4, finalPaymentAmount: 54.50, paidToday: true },
  // NOT paid today - future payments only
  { dbName: "Affirm - 13", newName: "Affirm - 12 payments (due 8th)", currentBalance: 947.28, minimumPayment: 78.94, dueDay: 8, remainingPayments: 12, paidToday: false },
  { dbName: "Affirm - 14", newName: "Affirm - 12 payments (due 8th) B", currentBalance: 355.26, minimumPayment: 29.60, dueDay: 8, remainingPayments: 12, finalPaymentAmount: 29.66, paidToday: false },
  { dbName: "Affirm - 15", newName: "Affirm - 12 payments (due 10th)", currentBalance: 355.25, minimumPayment: 29.60, dueDay: 10, remainingPayments: 12, finalPaymentAmount: 29.65, paidToday: false },
  { dbName: "Affirm - 7", newName: "Affirm - 10 payments (due 14th)", currentBalance: 591.83, minimumPayment: 59.21, dueDay: 14, remainingPayments: 10, finalPaymentAmount: 58.94, paidToday: false },
  { dbName: "Affirm - 8", newName: "Affirm - 5 payments (due 17th)", currentBalance: 500.00, minimumPayment: 100.00, dueDay: 17, remainingPayments: 5, paidToday: false },
  { dbName: "Affirm - 9", newName: "Affirm - Final Jan 21", currentBalance: 259.91, minimumPayment: 259.91, dueDay: 21, remainingPayments: 1, paidToday: false },
  { dbName: "Affirm - 10", newName: "Affirm - Final Jan 21 (B)", currentBalance: 34.60, minimumPayment: 34.60, dueDay: 21, remainingPayments: 1, paidToday: false },
];

const DUPLICATE_TO_DELETE = "Affirm - 12";

async function main() {
  console.log("=== Affirm Loan Reconciliation ===\n");

  await prisma.$transaction(async (tx) => {
    // Step 1: Delete the duplicate Affirm - 12
    console.log("Step 1: Deleting duplicate entry (Affirm - 12)...");
    const duplicateDebt = await tx.debt.findFirst({
      where: { name: DUPLICATE_TO_DELETE, type: "BNPL" },
    });

    if (duplicateDebt) {
      const deletedScheduled = await tx.scheduledPayment.deleteMany({
        where: { debtId: duplicateDebt.id },
      });
      console.log(`  Deleted ${deletedScheduled.count} scheduled payments`);

      const deletedPayments = await tx.debtPayment.deleteMany({
        where: { debtId: duplicateDebt.id },
      });
      console.log(`  Deleted ${deletedPayments.count} debt payments`);

      const bills = await tx.bill.findMany({
        where: { debtId: duplicateDebt.id },
      });
      for (const bill of bills) {
        await tx.billPayment.deleteMany({ where: { billId: bill.id } });
      }
      const deletedBills = await tx.bill.deleteMany({
        where: { debtId: duplicateDebt.id },
      });
      console.log(`  Deleted ${deletedBills.count} bills`);

      await tx.debt.delete({ where: { id: duplicateDebt.id } });
      console.log(`  ✅ Deleted Affirm - 12\n`);
    } else {
      console.log("  Affirm - 12 not found (already deleted?)\n");
    }

    // Step 2: Update each loan
    console.log("Step 2: Updating loan data...");
    for (const loan of LOAN_UPDATES) {
      const debt = await tx.debt.findFirst({
        where: { name: loan.dbName, type: "BNPL" },
      });

      if (!debt) {
        console.log(`  ⚠️ ${loan.dbName} not found, skipping`);
        continue;
      }

      await tx.debt.update({
        where: { id: debt.id },
        data: {
          name: loan.newName,
          currentBalance: loan.currentBalance,
          minimumPayment: loan.minimumPayment,
          dueDay: loan.dueDay,
        },
      });
      console.log(`  ✅ ${loan.dbName} → ${loan.newName}`);
      console.log(`     Balance: $${loan.currentBalance}, Payment: $${loan.minimumPayment}, Due: ${loan.dueDay}`);
    }

    // Step 3: Delete all existing scheduled payments and bills for these debts
    console.log("\nStep 3: Clearing existing scheduled payments and bills...");
    for (const loan of LOAN_UPDATES) {
      const debt = await tx.debt.findFirst({
        where: { name: loan.newName, type: "BNPL" },
      });

      if (!debt) continue;

      const deletedScheduled = await tx.scheduledPayment.deleteMany({
        where: { debtId: debt.id },
      });

      const bills = await tx.bill.findMany({
        where: { debtId: debt.id },
      });
      let billPaymentCount = 0;
      for (const bill of bills) {
        const deleted = await tx.billPayment.deleteMany({ where: { billId: bill.id } });
        billPaymentCount += deleted.count;
      }
      const deletedBills = await tx.bill.deleteMany({
        where: { debtId: debt.id },
      });

      if (deletedScheduled.count > 0 || deletedBills.count > 0) {
        console.log(`  ${loan.newName}: ${deletedScheduled.count} scheduled, ${deletedBills.count} bills, ${billPaymentCount} bill payments`);
      }
    }

    // Step 4: Regenerate scheduled payments
    console.log("\nStep 4: Regenerating scheduled payments...");
    for (const loan of LOAN_UPDATES) {
      const debt = await tx.debt.findFirst({
        where: { name: loan.newName, type: "BNPL" },
        include: { bankAccount: true },
      });

      if (!debt) continue;

      // Calculate payment dates - all remaining payments are future (Jan 2026+)
      const payments = [];

      for (let i = 0; i < loan.remainingPayments; i++) {
        // All payments start from January 2026 (month index 0 = Jan)
        let paymentDate = new Date(2026, i, loan.dueDay);
        
        // Handle edge case for Feb 29/30/31 -> clamp to valid day
        if (paymentDate.getMonth() !== i) {
          paymentDate = new Date(2026, i + 1, 0); // Last day of intended month
        }

        // Determine amount (final payment may differ)
        let amount = loan.minimumPayment;
        if (i === loan.remainingPayments - 1 && loan.finalPaymentAmount) {
          amount = loan.finalPaymentAmount;
        }

        payments.push({
          date: paymentDate,
          amount,
          isPaid: false,
        });
      }

      console.log(`\n  ${loan.newName}:`);
      for (const payment of payments) {
        // Create scheduled payment
        await tx.scheduledPayment.create({
          data: {
            debtId: debt.id,
            dueDate: payment.date,
            amount: payment.amount,
            isPaid: payment.isPaid,
            paidAt: payment.isPaid ? new Date("2025-12-24") : null,
            paidAmount: payment.isPaid ? payment.amount : null,
            notes: `Payment ${payments.indexOf(payment) + 1} of ${payments.length}`,
          },
        });

        // Create bill
        const bill = await tx.bill.create({
          data: {
            userId: debt.userId,
            name: `${loan.newName} - ${formatDate(payment.date)}`,
            category: "BNPL",
            amount: payment.amount,
            dueDay: payment.date.getDate(),
            isRecurring: false,
            frequency: "ONCE",
            debtId: debt.id,
            bankAccountId: debt.bankAccountId,
          },
        });

        // Create bill payment
        await tx.billPayment.create({
          data: {
            billId: bill.id,
            dueDate: payment.date,
            amount: payment.amount,
            status: payment.isPaid ? "PAID" : "UNPAID",
            paidAt: payment.isPaid ? new Date("2025-12-24") : null,
          },
        });

        const status = payment.isPaid ? "✅ PAID" : "⏳";
        console.log(`    ${status} ${formatDate(payment.date)}: $${payment.amount.toFixed(2)}`);
      }

      // Create DebtPayment record for today's paid loans
      if (loan.paidToday) {
        const paidAmount = loan.minimumPayment;
        const newBalance = loan.currentBalance;
        
        await tx.debtPayment.create({
          data: {
            debtId: debt.id,
            date: new Date("2025-12-24"),
            amount: paidAmount,
            principal: paidAmount,
            interest: 0,
            newBalance: newBalance,
            notes: "December 24, 2025 payment - manually reconciled",
          },
        });
        console.log(`    📝 DebtPayment recorded: $${paidAmount.toFixed(2)} paid today, balance now: $${newBalance.toFixed(2)}`);
      }
    }

    console.log("\n=== Reconciliation Complete ===");
  }, {
    timeout: 120000,
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
