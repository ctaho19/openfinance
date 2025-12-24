import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  // Update the first payment of Sezzle - Clearcover (2) to Jan 7th
  const result = await prisma.billPayment.update({
    where: { id: 'cmjja35zu000bl202t551rxfs' },
    data: { dueDate: new Date('2026-01-07T00:00:00.000Z') }
  });
  
  // Also update the bill's dueDay
  await prisma.bill.update({
    where: { id: result.billId },
    data: { dueDay: 7 }
  });
  
  console.log('Updated payment to:', result.dueDate.toISOString());
  
  // Verify
  const payment = await prisma.billPayment.findUnique({
    where: { id: 'cmjja35zu000bl202t551rxfs' },
    include: { bill: true }
  });
  console.log('Verified:', payment.dueDate.toISOString(), 'dueDay:', payment.bill.dueDay);
}

main().then(() => prisma.$disconnect());
