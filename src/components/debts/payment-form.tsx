import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface PaymentFormProps {
  debtId: string;
  debtName: string;
  currentBalance: number;
  minimumPayment: number;
  onClose: () => void;
}

export function PaymentForm({
  debtId,
  debtName,
  currentBalance,
  minimumPayment,
  onClose,
}: PaymentFormProps) {
  const [amount, setAmount] = useState(minimumPayment.toString());
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch(`/api/debts/${debtId}/payments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: Number(amount), date, notes }),
    });

    if (res.ok) {
      window.location.reload();
      onClose();
    } else {
      const data = await res.json();
      setError(data.error || "Failed to log payment");
    }
    setLoading(false);
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Log Payment - {debtName}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-theme-secondary mb-1">
                Amount
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                max={currentBalance}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-3 py-2 bg-theme-secondary border border-theme rounded-lg text-theme-primary focus:outline-none focus:ring-2 focus:ring-accent-500"
                required
              />
              <p className="text-xs text-theme-muted mt-1">
                Current balance: ${currentBalance.toFixed(2)}
              </p>
            </div>

            <div>
              <label className="block text-sm text-theme-secondary mb-1">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 bg-theme-secondary border border-theme rounded-lg text-theme-primary focus:outline-none focus:ring-2 focus:ring-accent-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-theme-secondary mb-1">
                Notes (optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                className="w-full px-3 py-2 bg-theme-secondary border border-theme rounded-lg text-theme-primary focus:outline-none focus:ring-2 focus:ring-accent-500 resize-none"
              />
            </div>

            {error && <p className="text-red-400 text-sm">{error}</p>}

            <div className="flex gap-3">
              <Button
                type="button"
                variant="secondary"
                onClick={onClose}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? "Saving..." : "Log Payment"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
