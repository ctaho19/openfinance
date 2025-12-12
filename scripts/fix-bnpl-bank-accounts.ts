/**
 * Script to fix existing BNPL bills that don't have bank accounts assigned.
 * This updates bills to inherit the bankAccountId from their linked debt.
 * 
 * Run with: npx tsx scripts/fix-bnpl-bank-accounts.ts
 */

import { config } from "dotenv";
config();

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Finding BNPL bills without bank accounts...\n");

  // Find all bills linked to debts where:
  // - The bill has no bankAccountId
  // - The linked debt has a bankAccountId
  const billsToFix = await prisma.bill.findMany({
    where: {
      bankAccountId: null,
      debtId: { not: null },
      debt: {
        bankAccountId: { not: null },
      },
    },
    include: {
      debt: {
        select: {
          id: true,
          name: true,
          bankAccountId: true,
          bankAccount: { select: { name: true } },
        },
      },
    },
  });

  console.log(`Found ${billsToFix.length} bills to update.\n`);

  if (billsToFix.length === 0) {
    console.log("No bills need updating.");
    return;
  }

  for (const bill of billsToFix) {
    console.log(`Updating bill "${bill.name}"`);
    console.log(`  → Assigning to bank: ${bill.debt?.bankAccount?.name}`);

    await prisma.bill.update({
      where: { id: bill.id },
      data: { bankAccountId: bill.debt!.bankAccountId },
    });
  }

  console.log(`\n✅ Updated ${billsToFix.length} bills.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
