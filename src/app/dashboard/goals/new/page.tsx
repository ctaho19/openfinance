"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const FOO_STEPS = [
  { value: "DEDUCTIBLES_COVERED", label: "Step 1: Deductibles" },
  { value: "EMPLOYER_MATCH", label: "Step 2: Employer Match" },
  { value: "HIGH_INTEREST_DEBT", label: "Step 3: High-Interest Debt" },
  { value: "EMERGENCY_FUND", label: "Step 4: Emergency Fund" },
  { value: "ROTH_HSA", label: "Step 5: Roth IRA/HSA" },
  { value: "MAX_RETIREMENT", label: "Step 6: Max Retirement" },
  { value: "HYPERACCUMULATION", label: "Step 7: Hyperaccumulation" },
  { value: "PREPAY_FUTURE", label: "Step 8: Future Expenses" },
  { value: "PREPAY_LOW_INTEREST", label: "Step 9: Low-Interest Debt" },
];

export default function NewGoalPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const [name, setName] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [currentAmount, setCurrentAmount] = useState("");
  const [deadline, setDeadline] = useState("");
  const [fooStep, setFooStep] = useState("");
  const [notes, setNotes] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          targetAmount,
          currentAmount: currentAmount || "0",
          deadline: deadline || null,
          fooStep: fooStep || null,
          notes: notes || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create goal");
      }

      router.push("/dashboard/goals");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const inputClasses =
    "w-full px-4 py-2 bg-theme-secondary border border-theme rounded-xl text-theme-primary placeholder-theme-muted focus:outline-none focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500";

  return (
    <div className="animate-fade-in max-w-2xl mx-auto space-y-6 lg:space-y-8">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/goals">
          <Button variant="ghost" size="sm" leftIcon={<ArrowLeft className="h-4 w-4" />}>
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-theme-primary">Create New Goal</h1>
          <p className="text-theme-secondary mt-1">Set up a new savings goal</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Goal Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3 rounded-xl bg-danger-50 dark:bg-danger-600/10 border border-danger-200 dark:border-danger-600/30 text-danger-700 dark:text-danger-400 text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-theme-secondary mb-2">
                Goal Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Emergency Fund"
                required
                className={inputClasses}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-theme-secondary mb-2">
                  Target Amount *
                </label>
                <input
                  type="number"
                  value={targetAmount}
                  onChange={(e) => setTargetAmount(e.target.value)}
                  placeholder="10000"
                  required
                  min="0"
                  step="0.01"
                  className={inputClasses}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-theme-secondary mb-2">
                  Current Amount
                </label>
                <input
                  type="number"
                  value={currentAmount}
                  onChange={(e) => setCurrentAmount(e.target.value)}
                  placeholder="0"
                  min="0"
                  step="0.01"
                  className={inputClasses}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-theme-secondary mb-2">
                Deadline (optional)
              </label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className={inputClasses}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-theme-secondary mb-2">
                Linked FOO Step (optional)
              </label>
              <select
                value={fooStep}
                onChange={(e) => setFooStep(e.target.value)}
                className={inputClasses}
              >
                <option value="">None</option>
                {FOO_STEPS.map((step) => (
                  <option key={step.value} value={step.value}>
                    {step.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-theme-secondary mb-2">
                Notes (optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any additional details about this goal..."
                rows={3}
                className={`${inputClasses} resize-none`}
              />
            </div>

            <div className="flex gap-4 pt-4">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Creating..." : "Create Goal"}
              </Button>
              <Link href="/dashboard/goals">
                <Button type="button" variant="secondary">
                  Cancel
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
