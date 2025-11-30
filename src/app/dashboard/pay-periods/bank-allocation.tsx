"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, CreditCard } from "lucide-react";

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

const BANK_COLORS: Record<string, string> = {
  NAVY_FEDERAL: "bg-blue-600",
  PNC: "bg-orange-500",
  CAPITAL_ONE: "bg-red-600",
  TRUIST: "bg-purple-600",
  CHASE: "bg-blue-800",
  BANK_OF_AMERICA: "bg-red-700",
  WELLS_FARGO: "bg-yellow-600",
  OTHER: "bg-gray-600",
};

export function BankAllocationSection({ allocations }: BankAllocationProps) {
  if (allocations.length === 0) {
    return null;
  }

  const totalToAllocate = allocations.reduce((sum, a) => sum + a.totalAmount, 0);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-accent-600" />
            <CardTitle>Payday Allocation</CardTitle>
          </div>
          <div className="text-right">
            <p className="text-sm text-theme-secondary">Total to Transfer</p>
            <p className="text-xl font-bold text-accent-600">
              ${totalToAllocate.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-theme-secondary mb-4">
          Based on your bills this period, here&apos;s how much to send to each account:
        </p>
        <div className="space-y-4">
          {allocations.map((allocation) => (
            <div
              key={allocation.bankId || "unassigned"}
              className="p-4 rounded-lg bg-theme-tertiary"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      BANK_COLORS[allocation.bankType] || BANK_COLORS.OTHER
                    }`}
                  />
                  <span className="font-semibold text-theme-primary">
                    {allocation.bankName}
                  </span>
                  {!allocation.bankId && (
                    <Badge variant="warning">No Bank Assigned</Badge>
                  )}
                </div>
                <span className="text-xl font-bold text-theme-primary">
                  ${allocation.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="space-y-1 pl-6">
                {allocation.bills.map((bill) => (
                  <div
                    key={bill.id}
                    className="flex items-center justify-between text-sm"
                  >
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-3 w-3 text-theme-muted" />
                      <span className="text-theme-secondary">{bill.name}</span>
                      {bill.status === "PAID" && (
                        <Badge variant="success" className="text-xs">Paid</Badge>
                      )}
                    </div>
                    <span className={bill.status === "PAID" ? "text-theme-muted line-through" : "text-theme-secondary"}>
                      ${bill.amount.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
