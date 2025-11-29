import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Calendar, CreditCard, Target } from "lucide-react";

export default async function Home() {
  const session = await auth();

  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-theme-primary flex flex-col">
      <header className="border-b border-theme">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">OF</span>
            </div>
            <span className="text-xl font-bold text-theme-primary">OpenFinance</span>
          </div>
          <Link
            href="/login"
            className="bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-emerald-700 transition-colors"
          >
            Sign In
          </Link>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4">
        <div className="max-w-2xl text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-theme-primary mb-6">
            Your Personal Finance,{" "}
            <span className="text-emerald-600 dark:text-emerald-400">Your Way</span>
          </h1>
          <p className="text-xl text-theme-secondary mb-8">
            Track your bi-weekly budget, crush your debt, and follow the
            Financial Order of Operations—all in one simple, open-source app.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/login"
              className="bg-emerald-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-emerald-700 transition-colors text-lg"
            >
              Get Started
            </Link>
          </div>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            <div className="bg-theme-secondary rounded-xl p-6 border border-theme">
              <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center mb-4">
                <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold text-theme-primary mb-2">
                Bi-Weekly Tracking
              </h3>
              <p className="text-theme-secondary text-sm">
                See exactly what&apos;s due each paycheck. No more monthly
                spreadsheet confusion.
              </p>
            </div>

            <div className="bg-theme-secondary rounded-xl p-6 border border-theme">
              <div className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900/50 flex items-center justify-center mb-4">
                <CreditCard className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-lg font-semibold text-theme-primary mb-2">
                Debt Payoff
              </h3>
              <p className="text-theme-secondary text-sm">
                Track credit cards, BNPL, and loans. See your debt-free date
                with avalanche or snowball strategies.
              </p>
            </div>

            <div className="bg-theme-secondary rounded-xl p-6 border border-theme">
              <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center mb-4">
                <Target className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold text-theme-primary mb-2">
                FOO Progress
              </h3>
              <p className="text-theme-secondary text-sm">
                Follow Money Guy&apos;s 9-step Financial Order of Operations to
                build wealth systematically.
              </p>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-theme py-6">
        <div className="max-w-6xl mx-auto px-4 text-center text-theme-muted text-sm">
          Open source. Built for you.
        </div>
      </footer>
    </div>
  );
}
