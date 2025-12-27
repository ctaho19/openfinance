/**
 * Script to migrate all bills and debts to use Navy Federal for payment,
 * EXCEPT American Express which stays on PNC due to stop payment block.
 * 
 * Run with: node scripts/migrate-bills-to-nfcu.mjs
 */

import { config } from "dotenv";
config();

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const PNC_ACCOUNT_ID = "cmilwdm3c0003l80246ay8r89";
const NFCU_ACCOUNT_ID = "cmilwe31w0005l802hq4x0mj1";

function isAmex(name) {
  const lowerName = name.toLowerCase();
  return lowerName.includes("american express") || lowerName.includes("amex");
}

async function main() {
  console.log("=== Bill Payment Migration to Navy Federal ===\n");

  // Verify accounts exist
  const [pncAccount, nfcuAccount] = await Promise.all([
    prisma.bankAccount.findUnique({ where: { id: PNC_ACCOUNT_ID } }),
    prisma.bankAccount.findUnique({ where: { id: NFCU_ACCOUNT_ID } }),
  ]);

  if (!pncAccount) {
    throw new Error(`PNC account ${PNC_ACCOUNT_ID} not found`);
  }
  if (!nfcuAccount) {
    throw new Error(`NFCU account ${NFCU_ACCOUNT_ID} not found`);
  }

  console.log(`PNC Account: ${pncAccount.name} (${pncAccount.bank})`);
  console.log(`NFCU Account: ${nfcuAccount.name} (${nfcuAccount.bank})\n`);

  // Rename NFCU account to reflect new purpose
  await prisma.bankAccount.update({
    where: { id: NFCU_ACCOUNT_ID },
    data: { name: "NFCU Bills Checking" },
  });
  console.log(`✓ Renamed NFCU account to "NFCU Bills Checking"\n`);

  // Get all bills and debts
  const [bills, debts] = await Promise.all([
    prisma.bill.findMany({ include: { bankAccount: true } }),
    prisma.debt.findMany({ include: { bankAccount: true } }),
  ]);

  console.log(`Found ${bills.length} bills and ${debts.length} debts.\n`);

  // Process Bills
  console.log("--- BILLS ---");
  let billsToNfcu = 0;
  let billsStayPnc = 0;
  let billsUnchanged = 0;

  for (const bill of bills) {
    if (isAmex(bill.name)) {
      // Amex stays on PNC
      if (bill.bankAccountId !== PNC_ACCOUNT_ID) {
        await prisma.bill.update({
          where: { id: bill.id },
          data: { bankAccountId: PNC_ACCOUNT_ID },
        });
        console.log(`[PNC] ${bill.name} → Stays on PNC (Amex stop payment block)`);
        billsStayPnc++;
      } else {
        console.log(`[PNC] ${bill.name} — Already on PNC`);
        billsUnchanged++;
      }
    } else {
      // All others go to NFCU
      if (bill.bankAccountId !== NFCU_ACCOUNT_ID) {
        const fromAccount = bill.bankAccount?.name ?? "None";
        await prisma.bill.update({
          where: { id: bill.id },
          data: { bankAccountId: NFCU_ACCOUNT_ID },
        });
        console.log(`[NFCU] ${bill.name} → Moved from ${fromAccount} to NFCU`);
        billsToNfcu++;
      } else {
        console.log(`[NFCU] ${bill.name} — Already on NFCU`);
        billsUnchanged++;
      }
    }
  }

  console.log(`\nBills: ${billsToNfcu} moved to NFCU, ${billsStayPnc} set to PNC, ${billsUnchanged} unchanged.\n`);

  // Process Debts
  console.log("--- DEBTS ---");
  let debtsToNfcu = 0;
  let debtsStayPnc = 0;
  let debtsUnchanged = 0;

  for (const debt of debts) {
    if (isAmex(debt.name)) {
      // Amex stays on PNC
      if (debt.bankAccountId !== PNC_ACCOUNT_ID) {
        await prisma.debt.update({
          where: { id: debt.id },
          data: { bankAccountId: PNC_ACCOUNT_ID },
        });
        console.log(`[PNC] ${debt.name} → Stays on PNC (Amex stop payment block)`);
        debtsStayPnc++;
      } else {
        console.log(`[PNC] ${debt.name} — Already on PNC`);
        debtsUnchanged++;
      }
    } else {
      // All others go to NFCU
      if (debt.bankAccountId !== NFCU_ACCOUNT_ID) {
        const fromAccount = debt.bankAccount?.name ?? "None";
        await prisma.debt.update({
          where: { id: debt.id },
          data: { bankAccountId: NFCU_ACCOUNT_ID },
        });
        console.log(`[NFCU] ${debt.name} → Moved from ${fromAccount} to NFCU`);
        debtsToNfcu++;
      } else {
        console.log(`[NFCU] ${debt.name} — Already on NFCU`);
        debtsUnchanged++;
      }
    }
  }

  console.log(`\nDebts: ${debtsToNfcu} moved to NFCU, ${debtsStayPnc} set to PNC, ${debtsUnchanged} unchanged.\n`);

  console.log("=== MIGRATION COMPLETE ===");
  console.log(`Total bills updated: ${billsToNfcu + billsStayPnc}`);
  console.log(`Total debts updated: ${debtsToNfcu + debtsStayPnc}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
