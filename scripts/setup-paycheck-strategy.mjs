/**
 * Setup Paycheck Strategy for Chris
 * Run with: node scripts/setup-paycheck-strategy.mjs
 * 
 * This script configures the paycheck strategy based on the Excel financial model.
 */

import { config } from "dotenv";
config();

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findFirst({
    select: { id: true, email: true },
  });

  if (!user) {
    console.log("No user found");
    return;
  }

  console.log(`Setting up paycheck strategy for user: ${user.email}`);

  const bankAccounts = await prisma.bankAccount.findMany({
    where: { userId: user.id },
  });

  console.log("\nAvailable bank accounts:");
  bankAccounts.forEach((ba) => {
    console.log(`  - ${ba.name} (${ba.bank}) - ID: ${ba.id}`);
  });

  const capitalOneAccount = bankAccounts.find((ba) => ba.bank === "CAPITAL_ONE");
  const navyFederalAccount = bankAccounts.find((ba) => ba.bank === "NAVY_FEDERAL");

  if (!capitalOneAccount || !navyFederalAccount) {
    console.log("\nMissing required bank accounts. Creating them...");
    
    if (!capitalOneAccount) {
      const newAccount = await prisma.bankAccount.create({
        data: {
          userId: user.id,
          name: "Capital One Checking",
          bank: "CAPITAL_ONE",
          isDefault: true,
        },
      });
      console.log(`  Created Capital One account: ${newAccount.id}`);
    }

    if (!navyFederalAccount) {
      const newAccount = await prisma.bankAccount.create({
        data: {
          userId: user.id,
          name: "Navy Federal Checking",
          bank: "NAVY_FEDERAL",
          isDefault: false,
        },
      });
      console.log(`  Created Navy Federal account: ${newAccount.id}`);
    }
  }

  const updatedBankAccounts = await prisma.bankAccount.findMany({
    where: { userId: user.id },
  });

  const paycheckAccount = updatedBankAccounts.find((ba) => ba.bank === "CAPITAL_ONE");
  const spendingAccount = updatedBankAccounts.find((ba) => ba.bank === "NAVY_FEDERAL");

  const debts = await prisma.debt.findMany({
    where: { userId: user.id, isActive: true },
  });

  const totalDebt = debts.reduce((sum, d) => sum + Number(d.currentBalance), 0);
  console.log(`\nCurrent total debt: $${totalDebt.toFixed(2)}`);

  const strategyData = {
    paycheckBankAccountId: paycheckAccount?.id,
    spendingBankAccountId: spendingAccount?.id,
    discretionaryBudgetMonthly: 750,
    emergencyFundTarget: 1000,
    debtSurplusPercent: 0.8,
    savingsSurplusPercent: 0.2,
    payoffStartDate: new Date("2025-12-27"),
    payoffStartTotalDebt: totalDebt,
    payoffTargetDate: new Date("2028-05-31"), // Per Excel model: CC/BNPL debt-free Aug 2026, fully debt-free May 2028
  };

  console.log("\nApplying strategy settings:");
  console.log(JSON.stringify(strategyData, null, 2));

  await prisma.user.update({
    where: { id: user.id },
    data: strategyData,
  });

  console.log("\n✅ Paycheck strategy configured successfully!");

  const existingEmergencyFund = await prisma.savingsGoal.findFirst({
    where: {
      userId: user.id,
      OR: [
        { fooStep: "EMERGENCY_FUND" },
        { name: { contains: "Emergency", mode: "insensitive" } },
      ],
    },
  });

  if (!existingEmergencyFund) {
    await prisma.savingsGoal.create({
      data: {
        userId: user.id,
        name: "Emergency Fund",
        targetAmount: 1000,
        currentAmount: 0,
        fooStep: "EMERGENCY_FUND",
        notes: "First $1,000 emergency fund - 20% of surplus goes here until full",
      },
    });
    console.log("✅ Created Emergency Fund savings goal");
  } else {
    console.log(`ℹ️  Emergency Fund goal already exists: $${Number(existingEmergencyFund.currentAmount).toFixed(2)} / $${Number(existingEmergencyFund.targetAmount).toFixed(2)}`);
  }

  console.log("\n🎯 Your paycheck plan is ready at: /dashboard/paycheck-plan");
  console.log("📊 Configure settings at: /dashboard/settings/strategy");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
