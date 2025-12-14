import { useState } from "react";
import { ChevronDown, ChevronRight, Check, Clock, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Bill {
  id: string;
  name: string;
  amount: number | { toString(): string };
  payments: { id: string; dueDate: Date | string; status: string }[];
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
  const [loadingPayments, setLoadingPayments] = useState<Set<string>>(new Set());

  const handleTogglePayment = async (paymentId: string) => {
    setLoadingPayments(prev => new Set(prev).add(paymentId));
    try {
      const response = await fetch(`/api/bill-payments/${paymentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ togglePaid: true }),
      });
      if (response.ok) {
        window.location.reload();
      }
    } catch (error) {
      console.error("Failed to toggle payment:", error);
    } finally {
      setLoadingPayments(prev => {
        const next = new Set(prev);
        next.delete(paymentId);
        return next;
      });
    }
  };

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
              className="h-full bg-accent-500 transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </button>

      {expanded && (
        <div className="border-t border-theme px-4 py-2 space-y-2">
          {group.bills.map((bill, index) => {
            const payment = bill.payments[0];
            const isPaid = payment?.status === "PAID";
            const isLoading = payment && loadingPayments.has(payment.id);
            const dueDate = payment?.dueDate
              ? new Date(payment.dueDate)
              : null;

            return (
              <div
                key={bill.id}
                className={`flex items-center justify-between py-2 px-3 rounded ${
                  isPaid ? "opacity-60" : ""
                }`}
              >
                <div className="flex items-center gap-2">
                  {payment && (
                    <button
                      onClick={() => handleTogglePayment(payment.id)}
                      disabled={isLoading}
                      className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                        isPaid 
                          ? "bg-accent-500 border-accent-500 text-white" 
                          : "border-theme-muted hover:border-accent-500 text-transparent hover:text-accent-500"
                      } ${isLoading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                      title={isPaid ? "Mark as unpaid" : "Mark as paid"}
                    >
                      {isLoading ? (
                        <Loader2 className="h-3 w-3 animate-spin text-theme-muted" />
                      ) : (
                        <Check className="h-3 w-3" />
                      )}
                    </button>
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
