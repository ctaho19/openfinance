"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/ui/search-input";
import { Plus, Receipt } from "lucide-react";
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

const categoryColors: Record<BillCategory, "default" | "success" | "warning" | "danger" | "info"> = {
  SUBSCRIPTION: "info",
  UTILITY: "warning",
  LOAN: "danger",
  BNPL: "danger",
  INSURANCE: "success",
  CREDIT_CARD: "danger",
  OTHER: "default",
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
    return `Due ${dueDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;
  }
  return `Due on day ${bill.dueDay}`;
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
    <>
      <SearchInput
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder="Search bills..."
        className="max-w-sm"
      />

      {!hasResults && searchQuery ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Receipt className="h-12 w-12 text-theme-muted mx-auto mb-4" />
            <h3 className="text-lg font-medium text-theme-primary mb-2">No bills found</h3>
            <p className="text-theme-secondary">
              No bills match &quot;{searchQuery}&quot;
            </p>
          </CardContent>
        </Card>
      ) : !hasResults ? (
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
          {filteredBnplGroups.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Badge variant="danger">Buy Now Pay Later</Badge>
                  <span className="text-theme-secondary text-sm font-normal">
                    ({filteredBnplGroups.length} plans)
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {filteredBnplGroups.map((group) => (
                    <BNPLGroup key={group.debtId} group={group} />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Regular Bills by Category */}
          {filteredCategories.map((category) => (
            <Card key={category}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Badge variant={categoryColors[category]}>
                    {categoryLabels[category]}
                  </Badge>
                  <span className="text-theme-secondary text-sm font-normal">
                    ({filteredRegularBills[category].length} bills)
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {filteredRegularBills[category].map((bill) => (
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
    </>
  );
}
