import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const payments = await prisma.billPayment.findMany({
    where: {
      bill: {
        name: { contains: 'Clearcover' }
      }
    },
    include: { bill: true },
    orderBy: { dueDate: 'asc' }
  });
  
  for (const p of payments) {
    console.log(p.id, p.dueDate.toISOString(), p.status, p.bill.name, 'dueDay:', p.bill.dueDay);
  }
}

main().then(() => prisma.$disconnect());
