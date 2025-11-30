"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, Check, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Bill {
  id: string;
  name: string;
  amount: number | { toString(): string };
  payments: { dueDate: Date | string; status: string }[];
}

interface BNPLDebtGroup {
  debtId: string;
  debtName: string;
  bills: Bill[];
  totalAmount: number;
  paidCount: number;
  totalCount: number;
  nextPayment: { amount: number; dueDate: Date | string } | null;
}

export function BNPLGroup({ group }: { group: BNPLDebtGroup }) {
  const [expanded, setExpanded] = useState(false);

  const progressPercent = (group.paidCount / group.totalCount) * 100;
  const isComplete = group.paidCount === group.totalCount;

  return (
    <div className="rounded-lg bg-theme-secondary overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between py-3 px-4 hover:bg-theme-tertiary transition-colors"
      >
        <div className="flex items-center gap-3">
          {expanded ? (
            <ChevronDown className="h-4 w-4 text-theme-muted" />
          ) : (
            <ChevronRight className="h-4 w-4 text-theme-muted" />
          )}
          <div className="text-left">
            <p className="font-medium text-theme-primary">{group.debtName}</p>
            <div className="flex items-center gap-2 text-sm text-theme-secondary">
              <span>{group.paidCount} of {group.totalCount} payments</span>
              {isComplete ? (
                <Badge variant="success">Paid Off</Badge>
              ) : group.nextPayment && (
                <span className="text-theme-muted">
                  • Next: ${group.nextPayment.amount.toFixed(2)} on{" "}
                  {new Date(group.nextPayment.dueDate).toLocaleDateString("en-US", { 
                    month: "short", 
                    day: "numeric" 
                  })}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-lg font-semibold text-theme-primary">
              ${(group.totalAmount - group.bills
                .filter(b => b.payments[0]?.status === "PAID")
                .reduce((s, b) => s + Number(b.amount), 0)
              ).toFixed(2)}
            </p>
            <p className="text-xs text-theme-muted">remaining</p>
          </div>
          <div className="w-24 h-2 bg-theme-tertiary rounded-full overflow-hidden">
            <div 
              className="h-full bg-emerald-500 transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </button>

      {expanded && (
        <div className="border-t border-theme px-4 py-2 space-y-2">
          {group.bills.map((bill, index) => {
            const isPaid = bill.payments[0]?.status === "PAID";
            const dueDate = bill.payments[0]?.dueDate 
              ? new Date(bill.payments[0].dueDate)
              : null;

            return (
              <div
                key={bill.id}
                className={`flex items-center justify-between py-2 px-3 rounded ${
                  isPaid ? "opacity-60" : ""
                }`}
              >
                <div className="flex items-center gap-2">
                  {isPaid ? (
                    <Check className="h-4 w-4 text-emerald-500" />
                  ) : (
                    <Clock className="h-4 w-4 text-theme-muted" />
                  )}
                  <span className="text-sm text-theme-secondary">
                    Payment {index + 1}
                  </span>
                  {dueDate && (
                    <span className="text-xs text-theme-muted">
                      {dueDate.toLocaleDateString("en-US", { 
                        month: "short", 
                        day: "numeric",
                        year: "numeric"
                      })}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-medium ${isPaid ? "text-theme-muted line-through" : "text-theme-primary"}`}>
                    ${Number(bill.amount).toFixed(2)}
                  </span>
                  {isPaid && (
                    <Badge variant="success" className="text-xs">Paid</Badge>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
