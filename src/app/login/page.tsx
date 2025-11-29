import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import LoginForm from "./login-form";

export default async function LoginPage() {
  const session = await auth();

  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-theme-primary">
      <div className="max-w-md w-full mx-4">
        <div className="bg-theme-secondary rounded-2xl shadow-xl p-8 border border-theme">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-theme-primary mb-2">OpenFinance</h1>
            <p className="text-theme-secondary">
              Take control of your bi-weekly budget
            </p>
          </div>

          <LoginForm />

          <div className="mt-8 pt-6 border-t border-theme">
            <h2 className="text-sm font-medium text-theme-primary mb-4">
              What you&apos;ll get:
            </h2>
            <ul className="space-y-3 text-sm text-theme-secondary">
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 dark:text-emerald-500 mt-0.5">✓</span>
                Bi-weekly pay period tracking
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 dark:text-emerald-500 mt-0.5">✓</span>
                Bill & BNPL payment management
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 dark:text-emerald-500 mt-0.5">✓</span>
                Debt payoff strategies
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 dark:text-emerald-500 mt-0.5">✓</span>
                FOO (Financial Order of Operations) progress
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
