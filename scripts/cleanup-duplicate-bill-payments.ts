/**
 * Script to find and optionally clean up duplicate bill payments
 * Run with: npx tsx scripts/cleanup-duplicate-bill-payments.ts
 * Add --dry-run to preview without deleting
 */
import { PrismaClient } from "@prisma/client";
import { startOfDay } from "date-fns";

const prisma = new PrismaClient();
const isDryRun = process.argv.includes("--dry-run");

async function findDuplicateBillPayments() {
  console.log("Searching for duplicate bill payments...\n");

  // Find all bill payments grouped by billId and date (normalized to start of day)
  const allPayments = await prisma.billPayment.findMany({
    include: {
      bill: {
        select: { id: true, name: true },
      },
    },
    orderBy: [{ billId: "asc" }, { dueDate: "asc" }, { createdAt: "asc" }],
  });

  // Group by billId + normalized date
  const grouped = new Map<
    string,
    Array<{
      id: string;
      billId: string;
      billName: string;
      dueDate: Date;
      createdAt: Date;
      status: string;
    }>
  >();

  for (const payment of allPayments) {
    const normalizedDate = startOfDay(payment.dueDate);
    const key = `${payment.billId}:${normalizedDate.toISOString().split("T")[0]}`;

    if (!grouped.has(key)) {
      grouped.set(key, []);
    }
    grouped.get(key)!.push({
      id: payment.id,
      billId: payment.billId,
      billName: payment.bill.name,
      dueDate: payment.dueDate,
      createdAt: payment.createdAt,
      status: payment.status,
    });
  }

  // Find groups with more than one payment
  const duplicates: Array<{ key: string; payments: typeof allPayments }> = [];
  for (const [key, payments] of grouped) {
    if (payments.length > 1) {
      duplicates.push({ key, payments: payments as typeof allPayments });
    }
  }

  if (duplicates.length === 0) {
    console.log("No duplicate bill payments found.");
    return;
  }

  console.log(`Found ${duplicates.length} groups with duplicate payments:\n`);

  let totalToDelete = 0;
  const idsToDelete: string[] = [];

  for (const { key, payments } of duplicates) {
    console.log(`Bill payment group: ${key}`);
    console.log(`  Bill: ${payments[0].billName}`);
    console.log(`  Payments (${payments.length}):`);

    // Keep the oldest one (or the paid one if any)
    const sortedPayments = [...payments].sort((a, b) => {
      // Prefer PAID status
      if (a.status === "PAID" && b.status !== "PAID") return -1;
      if (b.status === "PAID" && a.status !== "PAID") return 1;
      // Otherwise prefer oldest
      return a.createdAt.getTime() - b.createdAt.getTime();
    });

    const keep = sortedPayments[0];
    const toDelete = sortedPayments.slice(1);

    for (const p of sortedPayments) {
      const action = p.id === keep.id ? "KEEP" : "DELETE";
      console.log(
        `    - ${p.id} | ${p.dueDate.toISOString()} | ${p.status} | created ${p.createdAt.toISOString()} [${action}]`
      );
      if (action === "DELETE") {
        idsToDelete.push(p.id);
        totalToDelete++;
      }
    }
    console.log();
  }

  if (isDryRun) {
    console.log(
      `\nDry run: Would delete ${totalToDelete} duplicate bill payments.`
    );
    console.log("Run without --dry-run to actually delete.");
  } else {
    console.log(`\nDeleting ${totalToDelete} duplicate bill payments...`);
    const result = await prisma.billPayment.deleteMany({
      where: { id: { in: idsToDelete } },
    });
    console.log(`Deleted ${result.count} bill payments.`);
  }
}

findDuplicateBillPayments()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
