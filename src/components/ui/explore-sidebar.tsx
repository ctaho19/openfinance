import { Link } from "./link";
import {
  Lightbulb,
  Calculator,
  PiggyBank,
  ExternalLink,
  ListOrdered,
  ChevronRight,
} from "lucide-react";

interface SidebarCard {
  title: string;
  icon: typeof Calculator;
  href: string;
  description: string;
}

const quickCards: SidebarCard[] = [
  {
    title: "Financial Order of Operations",
    icon: ListOrdered,
    href: "/dashboard/foo",
    description: "Follow the Money Guy's proven 9-step plan",
  },
  {
    title: "Debt Payoff Calculator",
    icon: Calculator,
    href: "/dashboard/debts",
    description: "Plan your path to debt freedom",
  },
  {
    title: "Emergency Fund Goal",
    icon: PiggyBank,
    href: "/dashboard/goals",
    description: "Build your 3-6 month safety net",
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
    <aside className="w-72 space-y-4">
      {/* Quick Cards */}
      {quickCards.map((card) => {
        const Icon = card.icon;
        return (
          <Link
            key={card.title}
            href={card.href}
            className="block bg-white dark:bg-[#1c2128] border border-gray-200 dark:border-[#30363d] rounded-xl p-4 hover:shadow-md transition-all duration-150 group"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm mb-1">
                  {card.title}
                </h3>
                <div className="flex items-start gap-2">
                  <Icon className="h-5 w-5 text-[#0060f0] flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                    {card.description}
                  </p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors flex-shrink-0" />
            </div>
          </Link>
        );
      })}

      {/* Tip of the Day */}
      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-2">
          <Lightbulb className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          <h3 className="font-semibold text-amber-900 dark:text-amber-200 text-xs uppercase tracking-wide">
            Tip
          </h3>
        </div>
        <p className="text-sm text-amber-800 dark:text-amber-300 leading-relaxed">
          {randomTip}
        </p>
      </div>

      {/* Resources */}
      <div className="bg-white dark:bg-[#1c2128] border border-gray-200 dark:border-[#30363d] rounded-xl p-4">
        <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm mb-3">
          Resources
        </h3>
        <div className="space-y-2.5">
          <a
            href="https://www.moneyguy.com/foo"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 hover:text-[#0060f0] dark:hover:text-[#60a5fa] transition-colors"
          >
            <span>Learn about FOO</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
          <a
            href="https://www.reddit.com/r/personalfinance/wiki/commontopics"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 hover:text-[#0060f0] dark:hover:text-[#60a5fa] transition-colors"
          >
            <span>r/personalfinance wiki</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>
    </aside>
  );
}
