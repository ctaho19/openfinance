/**
 * Extract Financial Data for 2026 Planning
 * Run with: node scripts/extract-financial-data.mjs
 */

import { config } from "dotenv";
config();

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Get the user
  const user = await prisma.user.findFirst({
    select: {
      id: true,
      name: true,
      email: true,
      paycheckAmount: true,
      paycheckFrequency: true,
      paycheckDay: true,
      lastPaycheckDate: true,
    },
  });

  if (!user) {
    console.log("No user found");
    return;
  }

  console.log("=== USER INFO ===");
  console.log(JSON.stringify(user, null, 2));

  // Get all active debts
  const debts = await prisma.debt.findMany({
    where: { userId: user.id, isActive: true },
    orderBy: [{ type: "asc" }, { currentBalance: "desc" }],
    select: {
      id: true,
      name: true,
      type: true,
      status: true,
      currentBalance: true,
      originalBalance: true,
      interestRate: true,
      effectiveRate: true,
      totalRepayable: true,
      minimumPayment: true,
      pastDueAmount: true,
      dueDay: true,
      paymentFrequency: true,
      deferredUntil: true,
      notes: true,
    },
  });

  console.log("\n=== DEBTS ===");
  console.log(JSON.stringify(debts, null, 2));

  // Calculate debt totals by type
  const debtSummary = {};
  let totalDebt = 0;
  let totalMinPayment = 0;

  for (const debt of debts) {
    const type = debt.type;
    const balance = Number(debt.currentBalance);
    const minPay = Number(debt.minimumPayment);

    if (!debtSummary[type]) {
      debtSummary[type] = { count: 0, totalBalance: 0, totalMinPayment: 0, items: [] };
    }
    debtSummary[type].count++;
    debtSummary[type].totalBalance += balance;
    debtSummary[type].totalMinPayment += minPay;
    debtSummary[type].items.push({
      name: debt.name,
      balance,
      minPayment: minPay,
      rate: Number(debt.interestRate),
      dueDay: debt.dueDay,
      status: debt.status,
    });

    totalDebt += balance;
    totalMinPayment += minPay;
  }

  console.log("\n=== DEBT SUMMARY ===");
  console.log(JSON.stringify(debtSummary, null, 2));
  console.log("\nTotal Debt:", totalDebt.toFixed(2));
  console.log("Total Minimum Monthly Payment:", totalMinPayment.toFixed(2));

  // Get all active bills (non-debt)
  const bills = await prisma.bill.findMany({
    where: { userId: user.id, isActive: true, debtId: null },
    orderBy: [{ category: "asc" }, { amount: "desc" }],
    select: {
      id: true,
      name: true,
      category: true,
      amount: true,
      dueDay: true,
      frequency: true,
      notes: true,
    },
  });

  console.log("\n=== RECURRING BILLS (Non-Debt) ===");
  console.log(JSON.stringify(bills, null, 2));

  // Calculate bill totals by category
  const billSummary = {};
  let totalMonthlyBills = 0;

  for (const bill of bills) {
    const category = bill.category;
    let monthlyAmount = Number(bill.amount);
    
    // Convert to monthly
    switch (bill.frequency) {
      case "WEEKLY":
        monthlyAmount *= 4.33;
        break;
      case "BIWEEKLY":
        monthlyAmount *= 2.17;
        break;
      case "YEARLY":
        monthlyAmount /= 12;
        break;
    }

    if (!billSummary[category]) {
      billSummary[category] = { count: 0, totalMonthly: 0, items: [] };
    }
    billSummary[category].count++;
    billSummary[category].totalMonthly += monthlyAmount;
    billSummary[category].items.push({
      name: bill.name,
      amount: Number(bill.amount),
      frequency: bill.frequency,
      monthlyEquivalent: monthlyAmount,
    });

    totalMonthlyBills += monthlyAmount;
  }

  console.log("\n=== BILL SUMMARY ===");
  console.log(JSON.stringify(billSummary, null, 2));
  console.log("\nTotal Monthly Bills (non-debt):", totalMonthlyBills.toFixed(2));

  // Get savings goals
  const savingsGoals = await prisma.savingsGoal.findMany({
    where: { userId: user.id },
    select: {
      name: true,
      targetAmount: true,
      currentAmount: true,
      deadline: true,
      fooStep: true,
    },
  });

  console.log("\n=== SAVINGS GOALS ===");
  console.log(JSON.stringify(savingsGoals, null, 2));

  // Get FOO progress
  const fooProgress = await prisma.fOOProgress.findMany({
    where: { userId: user.id },
    orderBy: { step: "asc" },
    select: {
      step: true,
      status: true,
      targetAmount: true,
      currentAmount: true,
    },
  });

  console.log("\n=== FOO PROGRESS ===");
  console.log(JSON.stringify(fooProgress, null, 2));

  // Get bank accounts
  const bankAccounts = await prisma.bankAccount.findMany({
    where: { userId: user.id },
    select: {
      name: true,
      bank: true,
      lastFour: true,
      isDefault: true,
    },
  });

  console.log("\n=== BANK ACCOUNTS ===");
  console.log(JSON.stringify(bankAccounts, null, 2));

  // Calculate income
  const paycheckAmount = Number(user.paycheckAmount || 0);
  let annualIncome = 0;
  let monthlyIncome = 0;
  
  switch (user.paycheckFrequency) {
    case "weekly":
      monthlyIncome = paycheckAmount * 4.33;
      annualIncome = paycheckAmount * 52;
      break;
    case "biweekly":
      monthlyIncome = paycheckAmount * 2.17;
      annualIncome = paycheckAmount * 26;
      break;
    case "monthly":
      monthlyIncome = paycheckAmount;
      annualIncome = paycheckAmount * 12;
      break;
  }

  console.log("\n=== INCOME SUMMARY ===");
  console.log("Paycheck Amount:", paycheckAmount.toFixed(2));
  console.log("Paycheck Frequency:", user.paycheckFrequency);
  console.log("Monthly Income (approx):", monthlyIncome.toFixed(2));
  console.log("Annual Income (approx):", annualIncome.toFixed(2));

  // Calculate monthly snapshot
  console.log("\n=== MONTHLY SNAPSHOT ===");
  console.log("Income:", monthlyIncome.toFixed(2));
  console.log("Bills (non-debt):", totalMonthlyBills.toFixed(2));
  console.log("Debt Minimum Payments:", totalMinPayment.toFixed(2));
  console.log("Total Obligations:", (totalMonthlyBills + totalMinPayment).toFixed(2));
  console.log("Net Remaining:", (monthlyIncome - totalMonthlyBills - totalMinPayment).toFixed(2));

  // Get upcoming scheduled payments for BNPL
  const scheduledPayments = await prisma.scheduledPayment.findMany({
    where: {
      debt: { userId: user.id },
      isPaid: false,
    },
    include: {
      debt: { select: { name: true, type: true } },
    },
    orderBy: { dueDate: "asc" },
  });

  console.log("\n=== UPCOMING BNPL SCHEDULED PAYMENTS (Next 3 months) ===");
  const next3Months = new Date();
  next3Months.setMonth(next3Months.getMonth() + 3);
  
  const upcomingBnpl = scheduledPayments
    .filter(p => p.dueDate <= next3Months)
    .map(p => ({
      name: p.debt.name,
      dueDate: p.dueDate.toISOString().split("T")[0],
      amount: Number(p.amount),
    }));
  
  console.log(JSON.stringify(upcomingBnpl, null, 2));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
