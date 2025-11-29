import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import type { FOOStep, FOOStatus, FOOProgress } from "@prisma/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Circle, Target } from "lucide-react";
import { FOOStepCard } from "./foo-step-card";

const FOO_STEPS = [
  {
    step: "DEDUCTIBLES_COVERED" as FOOStep,
    number: 1,
    name: "Cover Deductibles",
    description: "Save enough to cover your highest insurance deductible",
    explanation:
      "Before anything else, ensure you can handle unexpected expenses. Save enough to cover your highest insurance deductible (health, auto, or home) so an emergency doesn't derail your finances.",
    hasAmount: true,
  },
  {
    step: "EMPLOYER_MATCH" as FOOStep,
    number: 2,
    name: "Get Employer Match",
    description: "Contribute enough to 401k to get full employer match",
    explanation:
      "This is free money! Contribute at least enough to your 401(k) to get your full employer match. Not doing this is like leaving part of your salary on the table.",
    hasAmount: false,
  },
  {
    step: "HIGH_INTEREST_DEBT" as FOOStep,
    number: 3,
    name: "Pay Off High-Interest Debt",
    description: "Pay off all high-interest debt (credit cards, high-rate loans)",
    explanation:
      "Credit cards and high-interest loans (typically 10%+ APR) are wealth destroyers. Focus all extra money here before investing—no investment reliably beats 20%+ credit card interest.",
    hasAmount: true,
  },
  {
    step: "EMERGENCY_FUND" as FOOStep,
    number: 4,
    name: "Build Emergency Fund",
    description: "Build 3-6 months of expenses in savings",
    explanation:
      "Life happens. Job loss, medical issues, car repairs—an emergency fund of 3-6 months of expenses provides a safety net so you don't go back into debt when the unexpected occurs.",
    hasAmount: true,
  },
  {
    step: "ROTH_HSA" as FOOStep,
    number: 5,
    name: "Max Roth IRA & HSA",
    description: "Max out Roth IRA and HSA contributions",
    explanation:
      "Roth IRAs grow tax-free and withdrawals in retirement are tax-free. HSAs offer triple tax advantages: tax-deductible contributions, tax-free growth, and tax-free withdrawals for medical expenses.",
    hasAmount: true,
  },
  {
    step: "MAX_RETIREMENT" as FOOStep,
    number: 6,
    name: "Max Out Retirement",
    description: "Max out 401k/403b contributions",
    explanation:
      "After getting the match and maxing Roth/HSA, contribute the maximum allowed to your 401(k) or 403(b). This builds serious long-term wealth through tax-advantaged compound growth.",
    hasAmount: true,
  },
  {
    step: "HYPERACCUMULATION" as FOOStep,
    number: 7,
    name: "Hyperaccumulation",
    description: "Save 25%+ of gross income",
    explanation:
      "You've optimized tax-advantaged accounts. Now focus on building taxable investment accounts, saving 25% or more of your gross income. This accelerates your path to financial independence.",
    hasAmount: false,
  },
  {
    step: "PREPAY_FUTURE" as FOOStep,
    number: 8,
    name: "Prepay Future Expenses",
    description: "Save for kids' college, vacation home, etc.",
    explanation:
      "With wealth-building on autopilot, you can now save for big future goals: children's education (529 plans), a vacation property, or other major life goals.",
    hasAmount: true,
  },
  {
    step: "PREPAY_LOW_INTEREST" as FOOStep,
    number: 9,
    name: "Pay Off Low-Interest Debt",
    description: "Pay off mortgage and low-interest debt",
    explanation:
      "The final step: eliminate remaining debt including your mortgage. While low-interest debt isn't urgent, becoming completely debt-free provides peace of mind and maximum financial flexibility.",
    hasAmount: true,
  },
];

async function getFOOProgress(userId: string): Promise<Map<FOOStep, FOOProgress>> {
  const progress = await prisma.fOOProgress.findMany({
    where: { userId },
  });

  const progressMap = new Map<FOOStep, FOOProgress>(
    progress.map((p: FOOProgress) => [p.step as FOOStep, p])
  );
  return progressMap;
}

function getCurrentStep(progressMap: Map<FOOStep, FOOProgress>): number {
  for (let i = 0; i < FOO_STEPS.length; i++) {
    const stepProgress = progressMap.get(FOO_STEPS[i].step);
    if (!stepProgress || stepProgress.status !== "COMPLETED") {
      return i + 1;
    }
  }
  return FOO_STEPS.length + 1;
}

export default async function FOOPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const progressMap = await getFOOProgress(session.user.id);
  const currentStep = getCurrentStep(progressMap);
  const completedCount = Array.from(progressMap.values()).filter(
    (p) => p.status === "COMPLETED"
  ).length;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-theme-primary">
          Financial Order of Operations
        </h1>
        <p className="text-theme-secondary mt-1">
          Follow these 9 steps in order to build a strong financial foundation
        </p>
      </div>

      <Card className="bg-gradient-to-r from-emerald-900/50 to-emerald-800/30 border-emerald-700/50">
        <CardContent className="py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-emerald-600/30">
                <Target className="h-8 w-8 text-emerald-400" />
              </div>
              <div>
                <p className="text-emerald-400 text-sm font-medium">
                  Your Progress
                </p>
                <p className="text-2xl font-bold text-theme-primary mt-1">
                  {completedCount} of 9 Steps Complete
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-emerald-400 text-sm font-medium">
                Current Focus
              </p>
              <p className="text-xl font-bold text-theme-primary mt-1">
                {currentStep <= 9
                  ? `Step ${currentStep}: ${FOO_STEPS[currentStep - 1].name}`
                  : "All Complete!"}
              </p>
            </div>
          </div>

          <div className="mt-6">
            <div className="flex gap-1">
              {FOO_STEPS.map((step, i) => {
                const progress = progressMap.get(step.step);
                const status = progress?.status || "NOT_STARTED";
                return (
                  <div
                    key={step.step}
                    className={`h-2 flex-1 rounded-full ${
                      status === "COMPLETED"
                        ? "bg-emerald-500"
                        : status === "IN_PROGRESS"
                          ? "bg-emerald-500/50"
                          : "bg-theme-tertiary"
                    }`}
                    title={`Step ${i + 1}: ${step.name}`}
                  />
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {FOO_STEPS.map((step) => {
          const progress = progressMap.get(step.step);
          const status = progress?.status || "NOT_STARTED";
          const isCurrentStep = step.number === currentStep;

          return (
            <FOOStepCard
              key={step.step}
              step={step.step}
              number={step.number}
              name={step.name}
              description={step.description}
              explanation={step.explanation}
              hasAmount={step.hasAmount}
              status={status}
              targetAmount={progress?.targetAmount ? Number(progress.targetAmount) : undefined}
              currentAmount={progress?.currentAmount ? Number(progress.currentAmount) : undefined}
              notes={progress?.notes || undefined}
              isCurrentStep={isCurrentStep}
              completedAt={progress?.completedAt || undefined}
            />
          );
        })}
      </div>
    </div>
  );
}
