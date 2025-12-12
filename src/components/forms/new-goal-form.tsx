import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function NewGoalForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    targetAmount: "",
    currentAmount: "",
    deadline: "",
    notes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          targetAmount: parseFloat(formData.targetAmount),
          currentAmount: formData.currentAmount ? parseFloat(formData.currentAmount) : 0,
          deadline: formData.deadline || null,
          notes: formData.notes || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create goal");
      }

      window.location.href = "/dashboard/goals";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const inputClasses =
    "w-full px-4 py-2 bg-theme-secondary border border-theme rounded-xl text-theme-primary placeholder-theme-muted focus:outline-none focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500";

  return (
    <div className="animate-fade-in space-y-6 lg:space-y-8">
      <div className="flex items-center gap-4">
        <a href="/dashboard/goals">
          <Button variant="ghost" size="sm" leftIcon={<ArrowLeft className="h-4 w-4" />}>
            Back
          </Button>
        </a>
        <div>
          <h1 className="text-2xl font-bold text-theme-primary">Add New Goal</h1>
          <p className="text-theme-secondary mt-1">Create a new savings goal to track your progress</p>
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="name" className="block text-sm font-medium text-theme-secondary">
                  Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  autoFocus
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g., Emergency Fund, Vacation"
                  className={inputClasses}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="targetAmount" className="block text-sm font-medium text-theme-secondary">
                  Target Amount *
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-theme-muted">$</span>
                  <input
                    type="number"
                    id="targetAmount"
                    name="targetAmount"
                    required
                    min="0"
                    step="0.01"
                    inputMode="decimal"
                    value={formData.targetAmount}
                    onChange={handleChange}
                    placeholder="0.00"
                    className={`${inputClasses} pl-8`}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="currentAmount" className="block text-sm font-medium text-theme-secondary">
                  Current Amount
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-theme-muted">$</span>
                  <input
                    type="number"
                    id="currentAmount"
                    name="currentAmount"
                    min="0"
                    step="0.01"
                    inputMode="decimal"
                    value={formData.currentAmount}
                    onChange={handleChange}
                    placeholder="0.00"
                    className={`${inputClasses} pl-8`}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="deadline" className="block text-sm font-medium text-theme-secondary">
                  Deadline
                </label>
                <input
                  type="date"
                  id="deadline"
                  name="deadline"
                  value={formData.deadline}
                  onChange={handleChange}
                  className={inputClasses}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="notes" className="block text-sm font-medium text-theme-secondary">
                Notes
              </label>
              <textarea
                id="notes"
                name="notes"
                rows={3}
                value={formData.notes}
                onChange={handleChange}
                placeholder="Any additional notes about this goal..."
                className={`${inputClasses} resize-none`}
              />
            </div>

            <div className="flex gap-4 pt-4">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Create Goal"}
              </Button>
              <a href="/dashboard/goals">
                <Button type="button" variant="secondary">
                  Cancel
                </Button>
              </a>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
