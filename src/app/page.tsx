import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Calendar, CreditCard, Target, ArrowRight, Shield, Smartphone } from "lucide-react";

export default async function Home() {
  const session = await auth();

  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-theme-secondary flex flex-col">
      {/* Header */}
      <header className="border-b border-theme bg-theme-elevated">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-chase-gradient flex items-center justify-center shadow-theme">
              <span className="text-white font-bold text-lg">OF</span>
            </div>
            <span className="text-xl font-bold text-theme-primary tracking-tight">OpenFinance</span>
          </div>
          <Link
            href="/login"
            className="bg-accent-600 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-accent-700 transition-colors shadow-theme"
          >
            Sign In
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="py-16 lg:py-24 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-accent-50 dark:bg-accent-600/20 text-accent-600 dark:text-accent-400 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Shield className="h-4 w-4" />
              Secure & Open Source
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-theme-primary mb-6 tracking-tight">
              Your Personal Finance,{" "}
              <span className="text-accent-600 dark:text-accent-400">Simplified</span>
            </h1>
            <p className="text-xl text-theme-secondary mb-10 max-w-2xl mx-auto">
              Track your bi-weekly budget, manage bills, crush debt, and follow the
              Financial Order of Operations—all in one beautiful app.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 bg-chase-gradient text-white px-8 py-4 rounded-xl font-semibold hover:opacity-90 transition-opacity text-lg shadow-theme-md"
              >
                Get Started Free
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-16 px-4 bg-theme-elevated border-y border-theme">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-2xl lg:text-3xl font-bold text-theme-primary mb-4">
                Everything you need to manage your money
              </h2>
              <p className="text-theme-secondary max-w-2xl mx-auto">
                Built for people who get paid bi-weekly and want a simple way to stay on top of their finances.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-theme-secondary rounded-2xl p-6 border border-theme card-hover-lift">
                <div className="w-12 h-12 rounded-xl bg-accent-50 dark:bg-accent-600/20 flex items-center justify-center mb-4">
                  <Calendar className="h-6 w-6 text-accent-600 dark:text-accent-400" />
                </div>
                <h3 className="text-lg font-semibold text-theme-primary mb-2">
                  Pay Period Tracking
                </h3>
                <p className="text-theme-secondary text-sm leading-relaxed">
                  See exactly what&apos;s due each paycheck. Know your &quot;safe to spend&quot; amount instantly.
                </p>
              </div>

              <div className="bg-theme-secondary rounded-2xl p-6 border border-theme card-hover-lift">
                <div className="w-12 h-12 rounded-xl bg-danger-50 dark:bg-danger-600/20 flex items-center justify-center mb-4">
                  <CreditCard className="h-6 w-6 text-danger-600 dark:text-danger-400" />
                </div>
                <h3 className="text-lg font-semibold text-theme-primary mb-2">
                  Debt Management
                </h3>
                <p className="text-theme-secondary text-sm leading-relaxed">
                  Track credit cards, BNPL, and loans. See your debt-free date with smart payoff strategies.
                </p>
              </div>

              <div className="bg-theme-secondary rounded-2xl p-6 border border-theme card-hover-lift">
                <div className="w-12 h-12 rounded-xl bg-success-50 dark:bg-success-600/20 flex items-center justify-center mb-4">
                  <Target className="h-6 w-6 text-success-600 dark:text-success-400" />
                </div>
                <h3 className="text-lg font-semibold text-theme-primary mb-2">
                  FOO Progress
                </h3>
                <p className="text-theme-secondary text-sm leading-relaxed">
                  Follow the 9-step Financial Order of Operations to build wealth systematically.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Mobile First Section */}
        <section className="py-16 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-theme-elevated text-theme-secondary px-4 py-2 rounded-full text-sm font-medium mb-6 border border-theme">
              <Smartphone className="h-4 w-4" />
              Mobile-First Design
            </div>
            <h2 className="text-2xl lg:text-3xl font-bold text-theme-primary mb-4">
              Designed for the way you bank
            </h2>
            <p className="text-theme-secondary max-w-2xl mx-auto mb-8">
              A familiar, Chase-inspired interface that feels right at home on your phone or desktop.
            </p>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 text-accent-600 dark:text-accent-400 font-semibold hover:text-accent-700"
            >
              Start managing your finances
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-theme bg-theme-elevated py-8">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-chase-gradient flex items-center justify-center">
              <span className="text-white font-bold text-sm">OF</span>
            </div>
            <span className="font-semibold text-theme-primary">OpenFinance</span>
          </div>
          <p className="text-theme-muted text-sm">
            Open source personal finance management. Built with care.
          </p>
        </div>
      </footer>
    </div>
  );
}
