"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge, CategoryBadge, StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/ui/search-input";
import { 
  Plus, 
  Receipt, 
  ChevronRight, 
  Calendar,
  Tv,
  Zap,
  Landmark,
  ShoppingBag,
  ShieldCheck,
  CreditCard,
  FileText,
} from "lucide-react";
import { BillActions } from "./bill-actions";
import { BNPLGroup } from "./bnpl-group";

type BillCategory = "SUBSCRIPTION" | "UTILITY" | "LOAN" | "BNPL" | "INSURANCE" | "CREDIT_CARD" | "OTHER";

interface Bill {
  id: string;
  name: string;
  category: BillCategory;
  amount: number;
  dueDay: number;
  isRecurring: boolean;
  frequency: string;
  debtId: string | null;
  notes: string | null;
  isActive: boolean;
  debt: { id: string; name: string } | null;
  payments: { dueDate: string; status: string }[];
}

interface BNPLDebtGroup {
  debtId: string;
  debtName: string;
  bills: Bill[];
  totalAmount: number;
  paidCount: number;
  totalCount: number;
  nextPayment: { amount: number; dueDate: string } | null;
}

interface BillsListProps {
  regularBills: Record<BillCategory, Bill[]>;
  bnplGroups: BNPLDebtGroup[];
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

const categoryIcons: Record<BillCategory, React.ComponentType<{ className?: string }>> = {
  SUBSCRIPTION: Tv,
  UTILITY: Zap,
  LOAN: Landmark,
  BNPL: ShoppingBag,
  INSURANCE: ShieldCheck,
  CREDIT_CARD: CreditCard,
  OTHER: FileText,
};

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
    return dueDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  }
  return `Day ${bill.dueDay}`;
}

export function BillsList({ regularBills, bnplGroups }: BillsListProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const categories = Object.keys(regularBills) as BillCategory[];

  // Filter regular bills by search
  const filteredRegularBills: Record<BillCategory, Bill[]> = {} as Record<BillCategory, Bill[]>;
  for (const category of categories) {
    const filtered = regularBills[category].filter((bill) => {
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      return (
        bill.name.toLowerCase().includes(query) ||
        bill.category.toLowerCase().includes(query) ||
        (bill.notes?.toLowerCase().includes(query) ?? false) ||
        (bill.debt?.name.toLowerCase().includes(query) ?? false)
      );
    });
    if (filtered.length > 0) {
      filteredRegularBills[category] = filtered;
    }
  }

  // Filter BNPL groups by search
  const filteredBnplGroups = bnplGroups.filter((group) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      group.debtName.toLowerCase().includes(query) ||
      group.bills.some((bill) => bill.name.toLowerCase().includes(query))
    );
  });

  const filteredCategories = Object.keys(filteredRegularBills) as BillCategory[];
  const hasResults = filteredCategories.length > 0 || filteredBnplGroups.length > 0;

  return (
    <div className="space-y-6">
      {/* Search */}
      <SearchInput
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder="Search bills..."
        className="max-w-md"
      />

      {/* Empty / No Results States */}
      {!hasResults && searchQuery ? (
        <Card>
          <CardContent className="py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-theme-tertiary flex items-center justify-center mx-auto mb-4">
              <Receipt className="h-8 w-8 text-theme-muted" />
            </div>
            <h3 className="text-lg font-semibold text-theme-primary mb-2">No bills found</h3>
            <p className="text-theme-secondary">
              No bills match &quot;{searchQuery}&quot;
            </p>
          </CardContent>
        </Card>
      ) : !hasResults ? (
        <Card>
          <CardContent className="py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-theme-tertiary flex items-center justify-center mx-auto mb-4">
              <Receipt className="h-8 w-8 text-theme-muted" />
            </div>
            <h3 className="text-lg font-semibold text-theme-primary mb-2">No bills yet</h3>
            <p className="text-theme-secondary mb-6">
              Add your first bill to start tracking your expenses
            </p>
            <Link href="/dashboard/bills/new">
              <Button leftIcon={<Plus className="h-4 w-4" />}>
                Add Your First Bill
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* BNPL Section */}
          {filteredBnplGroups.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-theme-tertiary">
                    <ShoppingBag className="h-5 w-5 text-theme-secondary" />
                  </div>
                  <div>
                    <CardTitle>Buy Now Pay Later</CardTitle>
                    <p className="text-sm text-theme-secondary mt-0.5">
                      {filteredBnplGroups.length} active plan{filteredBnplGroups.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent noPadding>
                <div className="divide-y divide-theme">
                  {filteredBnplGroups.map((group) => (
                    <BNPLGroup key={group.debtId} group={group} />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Regular Bills by Category */}
          {filteredCategories.map((category, categoryIndex) => {
            const IconComponent = categoryIcons[category];
            return (
            <Card key={category} className={`animate-fade-in-up stagger-${categoryIndex + 1}`}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-theme-tertiary">
                    <IconComponent className="h-5 w-5 text-theme-secondary" />
                  </div>
                  <div>
                    <CardTitle>{categoryLabels[category]}</CardTitle>
                    <p className="text-sm text-theme-secondary mt-0.5">
                      {filteredRegularBills[category].length} bill{filteredRegularBills[category].length !== 1 ? "s" : ""}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent noPadding>
                <div className="divide-y divide-theme">
                  {filteredRegularBills[category].map((bill) => (
                    <div
                      key={bill.id}
                      className={`flex items-center justify-between py-4 px-6 hover:bg-theme-secondary/50 transition-colors ${
                        !bill.isActive ? "opacity-50" : ""
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-medium text-theme-primary">{bill.name}</p>
                          {!bill.isActive && (
                            <Badge variant="default" size="sm">Inactive</Badge>
                          )}
                          {bill.debt && (
                            <Badge variant="warning" size="sm">Linked to debt</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-sm text-theme-secondary">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDueDate(bill)}
                          </span>
                          <span className="text-theme-muted">•</span>
                          <span>{formatFrequency(bill.frequency, bill.isRecurring)}</span>
                        </div>
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
          )
        })}
        </div>
      )}
    </div>
  );
}
