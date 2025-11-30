import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus, Receipt, ChevronDown, ChevronRight } from "lucide-react";
import { BillActions } from "./bill-actions";
import { BNPLGroup } from "./bnpl-group";

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

const categoryLabels: Record<BillCategory, string> = {
  SUBSCRIPTION: "Subscriptions",
  UTILITY: "Utilities",
  LOAN: "Loans",
  BNPL: "Buy Now Pay Later",
  INSURANCE: "Insurance",
  CREDIT_CARD: "Credit Cards",
  OTHER: "Other",
};

const categoryColors: Record<BillCategory, "default" | "success" | "warning" | "danger" | "info"> = {
  SUBSCRIPTION: "info",
  UTILITY: "warning",
  LOAN: "danger",
  BNPL: "danger",
  INSURANCE: "success",
  CREDIT_CARD: "danger",
  OTHER: "default",
};

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
    if (bill.category === "BNPL" && bill.debtId) {
      if (!bnplByDebt[bill.debtId]) {
        bnplByDebt[bill.debtId] = [];
      }
      bnplByDebt[bill.debtId].push(bill);
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

function formatFrequency(frequency: string, isRecurring: boolean): string {
  if (!isRecurring) return "One-time";
  const labels: Record<string, string> = {
    ONCE: "One-time",
    WEEKLY: "Weekly",
    BIWEEKLY: "Bi-weekly",
    MONTHLY: "Monthly",
    YEARLY: "Yearly",
  };
  return labels[frequency] || frequency;
}

function formatDueDate(bill: Bill): string {
  if (!bill.isRecurring && bill.payments.length > 0) {
    const dueDate = new Date(bill.payments[0].dueDate);
    return `Due ${dueDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;
  }
  return `Due on day ${bill.dueDay}`;
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
        <Card className="bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-700/50">
          <CardContent className="py-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/50">
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

        <Card className="bg-orange-50 dark:bg-orange-900/30 border-orange-200 dark:border-orange-700/50">
          <CardContent className="py-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-orange-100 dark:bg-orange-900/50">
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

      {categories.length === 0 && bnplGroups.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Receipt className="h-12 w-12 text-theme-muted mx-auto mb-4" />
            <h3 className="text-lg font-medium text-theme-primary mb-2">No bills yet</h3>
            <p className="text-theme-secondary mb-4">
              Add your first bill to start tracking your expenses
            </p>
            <Link href="/dashboard/bills/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Bill
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* BNPL Section - Consolidated */}
          {bnplGroups.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Badge variant="danger">Buy Now Pay Later</Badge>
                  <span className="text-theme-secondary text-sm font-normal">
                    ({bnplGroups.length} plans)
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {bnplGroups.map((group) => (
                    <BNPLGroup key={group.debtId} group={group} />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Regular Bills by Category */}
          {categories.map((category) => (
            <Card key={category}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Badge variant={categoryColors[category]}>
                    {categoryLabels[category]}
                  </Badge>
                  <span className="text-theme-secondary text-sm font-normal">
                    ({regularBills[category].length} bills)
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {regularBills[category].map((bill) => (
                    <div
                      key={bill.id}
                      className={`flex items-center justify-between py-3 px-4 rounded-lg bg-theme-secondary ${
                        !bill.isActive ? "opacity-50" : ""
                      }`}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-theme-primary">{bill.name}</p>
                          {!bill.isActive && (
                            <Badge variant="default">Inactive</Badge>
                          )}
                          {bill.debt && (
                            <Badge variant="warning">Linked to debt</Badge>
                          )}
                        </div>
                        <p className="text-sm text-theme-secondary">
                          {formatDueDate(bill)} - {formatFrequency(bill.frequency, bill.isRecurring)}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <p className="text-lg font-semibold text-theme-primary">
                          ${Number(bill.amount).toFixed(2)}
                        </p>
                        <BillActions bill={{ id: bill.id, name: bill.name, isActive: bill.isActive }} />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
