import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus, Receipt } from "lucide-react";
import { BillsList } from "./bills-list";

type BillCategory = "SUBSCRIPTION" | "UTILITY" | "LOAN" | "BNPL" | "INSURANCE" | "CREDIT_CARD" | "OTHER";
type BillFrequency = "ONCE" | "WEEKLY" | "BIWEEKLY" | "MONTHLY" | "YEARLY";

interface Bill {
  id: string;
  userId: string;
  name: string;
  category: BillCategory;
  amount: number | { toString(): string };
  dueDay: number;
  isRecurring: boolean;
  frequency: BillFrequency;
  debtId: string | null;
  notes: string | null;
  isActive: boolean;
  debt: { id: string; name: string } | null;
  payments: { dueDate: Date; status: string }[];
}

interface BNPLDebtGroup {
  debtId: string;
  debtName: string;
  bills: Bill[];
  totalAmount: number;
  paidCount: number;
  totalCount: number;
  nextPayment: { amount: number; dueDate: Date } | null;
}

interface BillsData {
  regularBills: Record<BillCategory, Bill[]>;
  bnplGroups: BNPLDebtGroup[];
}

async function getBills(userId: string): Promise<BillsData> {
  const bills = await prisma.bill.findMany({
    where: { userId },
    include: { 
      debt: true,
      payments: {
        select: { dueDate: true, status: true },
        orderBy: { dueDate: "asc" },
      },
    },
    orderBy: [{ category: "asc" }, { dueDay: "asc" }],
  });

  const regularBills: Record<BillCategory, Bill[]> = {} as Record<BillCategory, Bill[]>;
  const bnplByDebt: Record<string, Bill[]> = {};

  for (const bill of bills as unknown as Bill[]) {
    // All BNPL bills go to the BNPL section (grouped by debt or ungrouped)
    if (bill.category === "BNPL") {
      const key = bill.debtId || "ungrouped";
      if (!bnplByDebt[key]) {
        bnplByDebt[key] = [];
      }
      bnplByDebt[key].push(bill);
    } else {
      const category = bill.category;
      if (!regularBills[category]) {
        regularBills[category] = [];
      }
      regularBills[category].push(bill);
    }
  }

  // Convert BNPL groups to summary format
  const bnplGroups: BNPLDebtGroup[] = Object.entries(bnplByDebt).map(([debtId, debtBills]) => {
    const sortedBills = debtBills.sort((a, b) => {
      const aDate = a.payments[0]?.dueDate ? new Date(a.payments[0].dueDate).getTime() : 0;
      const bDate = b.payments[0]?.dueDate ? new Date(b.payments[0].dueDate).getTime() : 0;
      return aDate - bDate;
    });

    const paidCount = sortedBills.filter(b => 
      b.payments.length > 0 && b.payments[0].status === "PAID"
    ).length;

    const unpaidBill = sortedBills.find(b => 
      b.payments.length > 0 && b.payments[0].status !== "PAID"
    );

    return {
      debtId,
      debtName: debtBills[0].debt?.name || "Unknown BNPL",
      bills: sortedBills,
      totalAmount: sortedBills.reduce((sum, b) => sum + Number(b.amount), 0),
      paidCount,
      totalCount: sortedBills.length,
      nextPayment: unpaidBill ? {
        amount: Number(unpaidBill.amount),
        dueDate: new Date(unpaidBill.payments[0].dueDate),
      } : null,
    };
  });

  // Sort BNPL groups by next payment date
  bnplGroups.sort((a, b) => {
    if (!a.nextPayment) return 1;
    if (!b.nextPayment) return -1;
    return a.nextPayment.dueDate.getTime() - b.nextPayment.dueDate.getTime();
  });

  return { regularBills, bnplGroups };
}

export default async function BillsPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const { regularBills, bnplGroups } = await getBills(session.user.id);
  const categories = Object.keys(regularBills) as BillCategory[];

  const totalMonthly = Object.values(regularBills)
    .flat()
    .filter((b) => b.isActive && b.frequency === "MONTHLY")
    .reduce((sum, b) => sum + Number(b.amount), 0);

  const totalBNPLRemaining = bnplGroups.reduce((sum, g) => {
    const remaining = g.bills
      .filter(b => b.payments.length > 0 && b.payments[0].status !== "PAID")
      .reduce((s, b) => s + Number(b.amount), 0);
    return sum + remaining;
  }, 0);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-theme-primary">Bills</h1>
          <p className="text-theme-secondary mt-1">
            Manage your recurring bills and payments
          </p>
        </div>
        <Link href="/dashboard/bills/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Bill
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-blue-50 dark:bg-gray-800 border-blue-200 dark:border-blue-500/30">
          <CardContent className="py-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-500/20">
                <Receipt className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-blue-600 dark:text-blue-400 text-sm font-medium">
                  Monthly Recurring
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  ${totalMonthly.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-orange-50 dark:bg-gray-800 border-orange-200 dark:border-orange-500/30">
          <CardContent className="py-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-orange-100 dark:bg-orange-500/20">
                <Receipt className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-orange-600 dark:text-orange-400 text-sm font-medium">
                  BNPL Remaining
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  ${totalBNPLRemaining.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {bnplGroups.length} active plans
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <BillsList 
        regularBills={JSON.parse(JSON.stringify(regularBills))} 
        bnplGroups={JSON.parse(JSON.stringify(bnplGroups))} 
      />
    </div>
  );
}
