import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import LoginForm from "./login-form";
import { CheckCircle2 } from "lucide-react";

export default async function LoginPage() {
  const session = await auth();

  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-theme-secondary">
      <div className="max-w-md w-full mx-4">
        {/* Logo and Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-chase-gradient shadow-theme-lg mb-4">
            <span className="text-white font-bold text-2xl">OF</span>
          </div>
          <h1 className="text-3xl font-bold text-theme-primary tracking-tight">OpenFinance</h1>
          <p className="text-theme-secondary mt-2">
            Take control of your financial future
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-theme-elevated rounded-2xl shadow-theme-md p-8 border border-theme">
          <LoginForm />
        </div>

        {/* Features */}
        <div className="mt-8 bg-theme-elevated rounded-2xl shadow-theme p-6 border border-theme">
          <h2 className="text-sm font-semibold text-theme-primary mb-4 uppercase tracking-wide">
            What you&apos;ll get
          </h2>
          <ul className="space-y-3">
            {[
              "Bi-weekly pay period tracking",
              "Bill & BNPL payment management",
              "Debt payoff strategies",
              "Financial Order of Operations progress",
            ].map((feature, index) => (
              <li key={index} className="flex items-center gap-3 text-sm text-theme-secondary">
                <CheckCircle2 className="h-4 w-4 text-accent-600 flex-shrink-0" />
                {feature}
              </li>
            ))}
          </ul>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-theme-muted mt-6">
          Secure &amp; private financial management
        </p>
      </div>
    </div>
  );
}
