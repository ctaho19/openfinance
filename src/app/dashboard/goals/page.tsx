import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-theme-primary">Savings Goals</h1>
          <p className="text-theme-secondary">Track your progress towards financial goals</p>
        </div>
        <Link href="/dashboard/goals/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Goal
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-900/50 rounded-lg">
                <Target className="h-5 w-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-sm text-theme-secondary">Total Goals</p>
                <p className="text-2xl font-bold text-theme-primary">{totalGoals}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-900/50 rounded-lg">
                <PiggyBank className="h-5 w-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-sm text-theme-secondary">Total Saved</p>
                <p className="text-2xl font-bold text-theme-primary">
                  ${totalSaved.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-900/50 rounded-lg">
                <TrendingUp className="h-5 w-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-sm text-theme-secondary">Overall Progress</p>
                <p className="text-2xl font-bold text-theme-primary">
                  {overallProgress.toFixed(1)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {totalTarget > 0 && (
        <Card>
          <CardContent className="py-4">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-theme-secondary">
                ${totalSaved.toLocaleString()} of ${totalTarget.toLocaleString()}
              </span>
              <span className="text-emerald-400">{overallProgress.toFixed(1)}%</span>
            </div>
            <div className="h-4 bg-theme-tertiary rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(overallProgress, 100)}%` }}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {goals.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <PiggyBank className="h-12 w-12 text-theme-muted mx-auto mb-4" />
            <h3 className="text-lg font-medium text-theme-primary mb-2">No goals yet</h3>
            <p className="text-theme-secondary mb-4">
              Create your first savings goal to start tracking your progress
            </p>
            <Link href="/dashboard/goals/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Goal
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
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
