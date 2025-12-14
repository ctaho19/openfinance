import { Link } from "./link";
import {
  Lightbulb,
  TrendingUp,
  CreditCard,
  PiggyBank,
  ExternalLink,
} from "lucide-react";

interface QuickLink {
  label: string;
  href: string;
  icon: typeof Lightbulb;
  description?: string;
}

const quickLinks: QuickLink[] = [
  {
    label: "Financial Order of Operations",
    href: "/dashboard/foo",
    icon: TrendingUp,
    description: "Your personalized roadmap to financial freedom",
  },
  {
    label: "Debt Payoff Calculator",
    href: "/dashboard/debts/calculator",
    icon: CreditCard,
    description: "See how fast you can become debt-free",
  },
  {
    label: "Emergency Fund Goal",
    href: "/dashboard/goals",
    icon: PiggyBank,
    description: "Track your savings progress",
  },
];

const tips = [
  "Pay bills on payday to avoid late fees",
  "Review subscriptions monthly for unused services",
  "Set up autopay for recurring bills",
  "Keep 3-6 months expenses in emergency fund",
];

export function ExploreSidebar() {
  const randomTip = tips[Math.floor(Math.random() * tips.length)];

  return (
    <aside className="w-72 space-y-6">
      {/* Tip of the Day */}
      <div className="bg-theme-elevated rounded-2xl shadow-theme border border-theme p-5">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-full bg-warning-100 dark:bg-warning-600/20 flex items-center justify-center">
            <Lightbulb className="h-4 w-4 text-warning-600 dark:text-warning-400" />
          </div>
          <h3 className="font-semibold text-theme-primary text-sm">
            Tip of the Day
          </h3>
        </div>
        <p className="text-sm text-theme-secondary leading-relaxed">{randomTip}</p>
      </div>

      {/* Quick Links */}
      <div className="bg-theme-elevated rounded-2xl shadow-theme border border-theme p-5">
        <h3 className="font-semibold text-theme-primary text-sm mb-4">
          Explore
        </h3>
        <div className="space-y-3">
          {quickLinks.map((link) => {
            const Icon = link.icon;
            return (
            <Link
              key={link.href}
              href={link.href}
              className="group flex items-start gap-3 p-2 -mx-2 rounded-xl hover:bg-theme-secondary transition-colors"
            >
              <div className="w-9 h-9 rounded-lg bg-accent-50 dark:bg-accent-600/20 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                <Icon className="h-4 w-4 text-accent-600 dark:text-accent-400" />
              </div>
              <div className="min-w-0">
                <p className="font-medium text-sm text-theme-primary group-hover:text-accent-600 dark:group-hover:text-accent-400 transition-colors">
                  {link.label}
                </p>
                {link.description && (
                  <p className="text-xs text-theme-muted mt-0.5 line-clamp-2">
                    {link.description}
                  </p>
                )}
              </div>
            </Link>
          );
          })}
        </div>
      </div>

      {/* Resources */}
      <div className="bg-theme-elevated rounded-2xl shadow-theme border border-theme p-5">
        <h3 className="font-semibold text-theme-primary text-sm mb-3">
          Resources
        </h3>
        <div className="space-y-2">
          <a
            href="https://www.moneyguy.com/foo"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-theme-secondary hover:text-accent-600 dark:hover:text-accent-400 transition-colors"
          >
            Learn about FOO
            <ExternalLink className="h-3 w-3" />
          </a>
          <a
            href="https://www.reddit.com/r/personalfinance/wiki/commontopics"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-theme-secondary hover:text-accent-600 dark:hover:text-accent-400 transition-colors"
          >
            r/personalfinance wiki
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>
    </aside>
  );
}
