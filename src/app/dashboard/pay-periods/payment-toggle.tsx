"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, X, Loader2 } from "lucide-react";

interface PaymentToggleProps {
  paymentId: string;
  initialStatus: "UNPAID" | "PAID" | "SKIPPED";
}

export function PaymentToggle({ paymentId, initialStatus }: PaymentToggleProps) {
  const [status, setStatus] = useState(initialStatus);
  const [loading, setLoading] = useState(false);

  async function toggleStatus() {
    const newStatus = status === "PAID" ? "UNPAID" : "PAID";
    setLoading(true);

    try {
      const res = await fetch(`/api/bill-payments/${paymentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        setStatus(newStatus);
      }
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <Button variant="ghost" size="sm" disabled>
        <Loader2 className="h-4 w-4 animate-spin" />
      </Button>
    );
  }

  if (status === "PAID") {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={toggleStatus}
        className="text-emerald-400 hover:text-emerald-300"
      >
        <Check className="h-4 w-4 mr-1" />
        Paid
      </Button>
    );
  }

  return (
    <Button
      variant="secondary"
      size="sm"
      onClick={toggleStatus}
    >
      <X className="h-4 w-4 mr-1" />
      Mark Paid
    </Button>
  );
}
