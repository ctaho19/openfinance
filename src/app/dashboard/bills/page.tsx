import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus, Receipt } from "lucide-react";
import { BillActions } from "./bill-actions";

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
  payments: { dueDate: Date }[];
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

async function getBills(userId: string): Promise<Record<BillCategory, Bill[]>> {
  const bills = await prisma.bill.findMany({
    where: { userId },
    include: { 
      debt: true,
      payments: {
        select: { dueDate: true },
        orderBy: { dueDate: "asc" },
        take: 1,
      },
    },
    orderBy: [{ category: "asc" }, { dueDay: "asc" }],
  });

  const grouped = (bills as unknown as Bill[]).reduce<Record<BillCategory, Bill[]>>(
    (acc, bill) => {
      const category = bill.category;
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(bill);
      return acc;
    },
    {} as Record<BillCategory, Bill[]>
  );

  return grouped;
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
  // For one-time bills (like BNPL), show the actual due date from payments
  if (!bill.isRecurring && bill.payments.length > 0) {
    const dueDate = new Date(bill.payments[0].dueDate);
    return `Due ${dueDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;
  }
  // For recurring bills, show the day of month
  return `Due on day ${bill.dueDay}`;
}

export default async function BillsPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const billsByCategory = await getBills(session.user.id);
  const categories = Object.keys(billsByCategory) as BillCategory[];

  const totalMonthly = Object.values(billsByCategory)
    .flat()
    .filter((b) => b.isActive && b.frequency === "MONTHLY")
    .reduce((sum, b) => sum + Number(b.amount), 0);

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

      <Card className="bg-gradient-to-r from-blue-900/50 to-blue-800/30 border-blue-700/50">
        <CardContent className="py-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-blue-900/50">
              <Receipt className="h-6 w-6 text-blue-400" />
            </div>
            <div>
              <p className="text-blue-400 text-sm font-medium">
                Monthly Bills Total
              </p>
              <p className="text-2xl font-bold text-theme-primary">
                ${totalMonthly.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {categories.length === 0 ? (
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
          {categories.map((category) => (
            <Card key={category}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Badge variant={categoryColors[category]}>
                    {categoryLabels[category]}
                  </Badge>
                  <span className="text-theme-secondary text-sm font-normal">
                    ({billsByCategory[category].length} bills)
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {billsByCategory[category].map((bill) => (
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
