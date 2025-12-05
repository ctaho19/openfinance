"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2 } from "lucide-react";

interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: string;
  currentAmount: string;
  deadline: string | null;
  fooStep: string | null;
  notes: string | null;
}

const FOO_STEP_LABELS: Record<string, string> = {
  DEDUCTIBLES_COVERED: "Step 1: Deductibles",
  EMPLOYER_MATCH: "Step 2: Employer Match",
  HIGH_INTEREST_DEBT: "Step 3: High-Interest Debt",
  EMERGENCY_FUND: "Step 4: Emergency Fund",
  ROTH_HSA: "Step 5: Roth IRA/HSA",
  MAX_RETIREMENT: "Step 6: Max Retirement",
  HYPERACCUMULATION: "Step 7: Hyperaccumulation",
  PREPAY_FUTURE: "Step 8: Future Expenses",
  PREPAY_LOW_INTEREST: "Step 9: Low-Interest Debt",
};

export function GoalCard({ goal }: { goal: SavingsGoal }) {
  const router = useRouter();
  const [showAddFunds, setShowAddFunds] = useState(false);
  const [addAmount, setAddAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const target = parseFloat(goal.targetAmount);
  const current = parseFloat(goal.currentAmount);
  const progress = target > 0 ? Math.min((current / target) * 100, 100) : 0;

  const daysUntilDeadline = goal.deadline
    ? Math.ceil(
        (new Date(goal.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      )
    : null;

  const handleAddFunds = async () => {
    if (!addAmount || parseFloat(addAmount) <= 0) return;

    setIsLoading(true);
    try {
      const newAmount = current + parseFloat(addAmount);
      await fetch(`/api/goals/${goal.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentAmount: newAmount.toString() }),
      });
      setAddAmount("");
      setShowAddFunds(false);
      router.refresh();
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this goal?")) return;

    setIsLoading(true);
    try {
      await fetch(`/api/goals/${goal.id}`, { method: "DELETE" });
      router.refresh();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardContent className="py-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="text-lg font-semibold text-theme-primary">{goal.name}</h3>
            {goal.fooStep && (
              <Badge variant="info" className="mt-1">
                {FOO_STEP_LABELS[goal.fooStep]}
              </Badge>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAddFunds(!showAddFunds)}
            >
              <Plus className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push(`/dashboard/goals/${goal.id}/edit`)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              disabled={isLoading}
            >
              <Trash2 className="h-4 w-4 text-red-400" />
            </Button>
          </div>
        </div>

        <div className="mb-3">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-theme-secondary">
              ${current.toLocaleString()} of ${target.toLocaleString()}
            </span>
            <span className="text-accent-400">{progress.toFixed(1)}%</span>
          </div>
          <div className="h-3 bg-theme-tertiary rounded-full overflow-hidden">
            <div
              className="h-full bg-accent-500 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {daysUntilDeadline !== null && (
          <p className="text-sm text-theme-secondary">
            {daysUntilDeadline > 0
              ? `${daysUntilDeadline} days until deadline`
              : daysUntilDeadline === 0
                ? "Deadline is today"
                : `${Math.abs(daysUntilDeadline)} days past deadline`}
          </p>
        )}

        {showAddFunds && (
          <div className="mt-3 flex gap-2">
            <input
              type="number"
              value={addAmount}
              onChange={(e) => setAddAmount(e.target.value)}
              placeholder="Amount to add"
              className="flex-1 px-3 py-2 bg-theme-secondary border border-theme rounded-lg text-theme-primary placeholder-theme-muted focus:outline-none focus:ring-2 focus:ring-accent-500"
            />
            <Button
              onClick={handleAddFunds}
              disabled={isLoading || !addAmount}
              size="sm"
            >
              Add
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setShowAddFunds(false);
                setAddAmount("");
              }}
            >
              Cancel
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
