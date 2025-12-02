"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Zap, Plus } from "lucide-react";
import { format } from "date-fns";
import { QuickPaymentForm } from "@/components/quick-payment-form";
import { useRouter } from "next/navigation";

interface QuickPayment {
  id: string;
  description: string;
  amount: { toString(): string } | number;
  paidAt: Date;
  category: string;
  notes: string | null;
  debt: { id: string; name: string; type: string } | null;
}

interface QuickPaymentsSectionProps {
  quickPayments: QuickPayment[];
  payPeriodStart: Date;
  payPeriodEnd: Date;
}

const CATEGORY_LABELS: Record<string, string> = {
  BNPL_CATCHUP: "BNPL Catch-up",
  DEBT_SURPLUS: "Extra Payment",
  ONE_TIME: "One-Time",
  OTHER: "Other",
};

const CATEGORY_VARIANTS: Record<string, "default" | "success" | "warning"> = {
  BNPL_CATCHUP: "warning",
  DEBT_SURPLUS: "success",
  ONE_TIME: "default",
  OTHER: "default",
};

export function QuickPaymentsSection({
  quickPayments,
}: QuickPaymentsSectionProps) {
  const [showForm, setShowForm] = useState(false);
  const router = useRouter();

  const handleSuccess = () => {
    setShowForm(false);
    router.refresh();
  };

  const total = quickPayments.reduce((sum, p) => sum + Number(p.amount), 0);

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-amber-500" />
            <CardTitle>Quick Payments</CardTitle>
            {quickPayments.length > 0 && (
              <Badge variant="accent">{quickPayments.length}</Badge>
            )}
          </div>
          <Button size="sm" onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-1" />
            Add Payment
          </Button>
        </CardHeader>
        <CardContent>
          {quickPayments.length === 0 ? (
            <div className="py-8 text-center">
              <Zap className="h-12 w-12 text-theme-muted mx-auto mb-4" />
              <p className="text-theme-secondary">No quick payments this period</p>
              <p className="text-sm text-theme-muted mt-1">
                Log one-time payments or extra debt payments here
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {quickPayments.map((payment) => (
                <div
                  key={payment.id}
                  className="flex items-center justify-between py-3 px-4 rounded-lg bg-theme-tertiary"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-theme-primary">
                        {payment.description}
                      </p>
                      <Badge variant={CATEGORY_VARIANTS[payment.category] || "default"}>
                        {CATEGORY_LABELS[payment.category] || payment.category}
                      </Badge>
                    </div>
                    <p className="text-sm text-theme-secondary">
                      Paid {format(new Date(payment.paidAt), "MMM d, yyyy")}
                      {payment.debt && (
                        <span className="text-theme-muted"> • {payment.debt.name}</span>
                      )}
                    </p>
                  </div>
                  <p className="text-lg font-semibold text-emerald-600 dark:text-emerald-400">
                    ${Number(payment.amount).toFixed(2)}
                  </p>
                </div>
              ))}
              <div className="flex justify-end pt-2 border-t border-theme">
                <p className="text-sm text-theme-secondary">
                  Total: <span className="font-semibold text-theme-primary">${total.toFixed(2)}</span>
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {showForm && (
        <QuickPaymentForm
          isModal
          onSuccess={handleSuccess}
          onCancel={() => setShowForm(false)}
        />
      )}
    </>
  );
}
