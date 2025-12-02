"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge, StatusBadge } from "@/components/ui/badge";
import { Building2, CreditCard, ChevronDown, ChevronUp, Check } from "lucide-react";
import { useState } from "react";

interface BankAllocation {
  bankId: string | null;
  bankName: string;
  bankType: string;
  totalAmount: number;
  bills: {
    id: string;
    name: string;
    amount: number;
    dueDate: Date;
    status: string;
  }[];
}

interface BankAllocationProps {
  allocations: BankAllocation[];
}

const BANK_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  NAVY_FEDERAL: { bg: "bg-blue-100 dark:bg-blue-600/20", text: "text-blue-700 dark:text-blue-400", dot: "bg-blue-600" },
  PNC: { bg: "bg-orange-100 dark:bg-orange-600/20", text: "text-orange-700 dark:text-orange-400", dot: "bg-orange-500" },
  CAPITAL_ONE: { bg: "bg-red-100 dark:bg-red-600/20", text: "text-red-700 dark:text-red-400", dot: "bg-red-600" },
  TRUIST: { bg: "bg-purple-100 dark:bg-purple-600/20", text: "text-purple-700 dark:text-purple-400", dot: "bg-purple-600" },
  CHASE: { bg: "bg-blue-100 dark:bg-blue-600/20", text: "text-blue-700 dark:text-blue-400", dot: "bg-blue-800" },
  BANK_OF_AMERICA: { bg: "bg-red-100 dark:bg-red-600/20", text: "text-red-700 dark:text-red-400", dot: "bg-red-700" },
  WELLS_FARGO: { bg: "bg-yellow-100 dark:bg-yellow-600/20", text: "text-yellow-700 dark:text-yellow-400", dot: "bg-yellow-600" },
  OTHER: { bg: "bg-gray-100 dark:bg-gray-600/20", text: "text-gray-700 dark:text-gray-400", dot: "bg-gray-600" },
};

function AllocationCard({ allocation }: { allocation: BankAllocation }) {
  const [expanded, setExpanded] = useState(false);
  const colors = BANK_COLORS[allocation.bankType] || BANK_COLORS.OTHER;
  const paidBills = allocation.bills.filter(b => b.status === "PAID");
  const unpaidAmount = allocation.bills.filter(b => b.status !== "PAID").reduce((sum, b) => sum + b.amount, 0);

  return (
    <div className={`rounded-xl border border-theme overflow-hidden ${colors.bg}`}>
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full shrink-0 ${colors.dot}`} />
          <div className="text-left min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`font-semibold ${colors.text}`}>
                {allocation.bankName}
              </span>
              {!allocation.bankId && (
                <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-gray-200 text-gray-700 dark:bg-gray-600 dark:text-gray-200">
                  No Bank
                </span>
              )}
            </div>
            <p className="text-sm text-theme-muted mt-0.5">
              {allocation.bills.length} bill{allocation.bills.length !== 1 ? "s" : ""} • {paidBills.length} paid
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className={`text-xl font-bold ${colors.text}`}>
              ${unpaidAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
            {paidBills.length > 0 && (
              <p className="text-xs text-theme-muted">
                ${paidBills.reduce((s, b) => s + b.amount, 0).toFixed(2)} already paid
              </p>
            )}
          </div>
          {expanded ? (
            <ChevronUp className="h-5 w-5 text-theme-muted" />
          ) : (
            <ChevronDown className="h-5 w-5 text-theme-muted" />
          )}
        </div>
      </button>
      
      {expanded && (
        <div className="border-t border-theme/50 divide-y divide-theme/50">
          {allocation.bills.map((bill) => (
            <div
              key={bill.id}
              className="flex items-center justify-between py-3 px-4 text-sm"
            >
              <div className="flex items-center gap-2">
                {bill.status === "PAID" ? (
                  <Check className="h-4 w-4 text-success-600 dark:text-success-400" />
                ) : (
                  <CreditCard className="h-4 w-4 text-theme-muted" />
                )}
                <span className={bill.status === "PAID" ? "text-theme-muted line-through" : "text-theme-primary"}>
                  {bill.name}
                </span>
              </div>
              <span className={bill.status === "PAID" ? "text-theme-muted line-through" : "text-theme-primary font-medium"}>
                ${bill.amount.toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function BankAllocationSection({ allocations }: BankAllocationProps) {
  if (allocations.length === 0) {
    return null;
  }

  const totalToAllocate = allocations.reduce((sum, a) => {
    return sum + a.bills.filter(b => b.status !== "PAID").reduce((s, b) => s + b.amount, 0);
  }, 0);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-accent-100 dark:bg-accent-600/20">
              <Building2 className="h-5 w-5 text-accent-600 dark:text-accent-400" />
            </div>
            <div>
              <CardTitle>Payday Allocation</CardTitle>
              <p className="text-sm text-theme-secondary mt-0.5">
                How much to transfer to each account
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-theme-secondary">Total to Transfer</p>
            <p className="text-2xl font-bold text-accent-600 dark:text-accent-400">
              ${totalToAllocate.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {allocations.map((allocation) => (
            <AllocationCard key={allocation.bankId || "unassigned"} allocation={allocation} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
