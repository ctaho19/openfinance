import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Card, CardContent, StatCard } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GoalCard } from "./goal-card";
import { Plus, PiggyBank, Target, TrendingUp } from "lucide-react";

export default async function GoalsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const goals = await prisma.savingsGoal.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  const totalGoals = goals.length;
  const totalSaved = goals.reduce(
    (sum, g) => sum + Number(g.currentAmount),
    0
  );
  const totalTarget = goals.reduce(
    (sum, g) => sum + Number(g.targetAmount),
    0
  );
  const overallProgress =
    totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0;

  return (
    <div className="space-y-6 animate-fade-in">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-theme-primary tracking-tight">Savings Goals</h1>
          <p className="text-theme-secondary mt-1">Track your progress towards financial goals</p>
        </div>
        <Link href="/dashboard/goals/new">
          <Button leftIcon={<Plus className="h-4 w-4" />}>
            New Goal
          </Button>
        </Link>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 animate-fade-in-up">
        <StatCard
          label="Total Goals"
          value={totalGoals}
          icon={<Target className="h-5 w-5" />}
          variant="success"
        />
        <StatCard
          label="Total Saved"
          value={`$${totalSaved.toLocaleString()}`}
          icon={<PiggyBank className="h-5 w-5" />}
          variant="success"
        />
        <StatCard
          label="Overall Progress"
          value={`${overallProgress.toFixed(1)}%`}
          icon={<TrendingUp className="h-5 w-5" />}
          variant="success"
          className="col-span-2 md:col-span-1"
        />
      </div>

      {totalTarget > 0 && (
        <Card className="animate-fade-in-up">
          <CardContent className="py-4">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-theme-secondary">
                ${totalSaved.toLocaleString()} of ${totalTarget.toLocaleString()}
              </span>
              <span className="text-accent-500">{overallProgress.toFixed(1)}%</span>
            </div>
            <div className="progress-bar">
              <div
                className="progress-bar-fill"
                style={{ width: `${Math.min(overallProgress, 100)}%` }}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {goals.length === 0 ? (
        <Card className="animate-fade-in-up">
          <CardContent className="py-12 text-center">
            <PiggyBank className="h-12 w-12 text-theme-muted mx-auto mb-4" />
            <h3 className="text-lg font-medium text-theme-primary mb-2">No goals yet</h3>
            <p className="text-theme-secondary mb-4">
              Create your first savings goal to start tracking your progress
            </p>
            <Link href="/dashboard/goals/new">
              <Button leftIcon={<Plus className="h-4 w-4" />}>
                Create Goal
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4 animate-fade-in-up">
          <h2 className="text-lg font-semibold text-theme-primary">Your Goals</h2>
          <div className="grid gap-4">
            {goals.map((goal) => (
              <GoalCard
                key={goal.id}
                goal={{
                  ...goal,
                  targetAmount: goal.targetAmount.toString(),
                  currentAmount: goal.currentAmount.toString(),
                  deadline: goal.deadline?.toISOString() ?? null,
                }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
