"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PaymentForm } from "../payment-form";

interface Payment {
  id: string;
  date: string;
  amount: number;
  principal: number;
  interest: number;
  newBalance: number;
  notes: string | null;
}

interface DebtDetailClientProps {
  debtId: string;
  debtName: string;
  currentBalance: number;
  minimumPayment: number;
  payments: Payment[];
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function DebtDetailClient({
  debtId,
  debtName,
  currentBalance,
  minimumPayment,
  payments,
}: DebtDetailClientProps) {
  const [showPaymentForm, setShowPaymentForm] = useState(false);

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Payment History</CardTitle>
          <Button onClick={() => setShowPaymentForm(true)}>Log Payment</Button>
        </CardHeader>
        <CardContent>
          {payments.length === 0 ? (
            <p className="text-theme-secondary text-center py-8">
              No payments logged yet. Log your first payment to start tracking
              progress.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-theme">
                    <th className="text-left py-3 px-4 text-theme-secondary text-sm font-medium">
                      Date
                    </th>
                    <th className="text-right py-3 px-4 text-theme-secondary text-sm font-medium">
                      Amount
                    </th>
                    <th className="text-right py-3 px-4 text-theme-secondary text-sm font-medium">
                      Principal
                    </th>
                    <th className="text-right py-3 px-4 text-theme-secondary text-sm font-medium">
                      Interest
                    </th>
                    <th className="text-right py-3 px-4 text-theme-secondary text-sm font-medium">
                      New Balance
                    </th>
                    <th className="text-left py-3 px-4 text-theme-secondary text-sm font-medium">
                      Notes
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((payment) => (
                    <tr
                      key={payment.id}
                      className="border-b border-theme/50 hover:bg-theme-tertiary/30"
                    >
                      <td className="py-3 px-4 text-theme-primary">
                        {formatDate(payment.date)}
                      </td>
                      <td className="py-3 px-4 text-right text-emerald-400 font-medium">
                        {formatCurrency(payment.amount)}
                      </td>
                      <td className="py-3 px-4 text-right text-theme-secondary">
                        {formatCurrency(payment.principal)}
                      </td>
                      <td className="py-3 px-4 text-right text-theme-secondary">
                        {formatCurrency(payment.interest)}
                      </td>
                      <td className="py-3 px-4 text-right text-theme-primary">
                        {formatCurrency(payment.newBalance)}
                      </td>
                      <td className="py-3 px-4 text-theme-muted text-sm max-w-[200px] truncate">
                        {payment.notes || "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {showPaymentForm && (
        <PaymentForm
          debtId={debtId}
          debtName={debtName}
          currentBalance={currentBalance}
          minimumPayment={minimumPayment}
          onClose={() => setShowPaymentForm(false)}
        />
      )}
    </>
  );
}
