"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, X, Receipt, CreditCard, Wallet } from "lucide-react";

const quickActions = [
  { label: "Add Bill", href: "/dashboard/bills/new", icon: Receipt },
  { label: "Add Debt", href: "/dashboard/debts/new", icon: CreditCard },
  { label: "Quick Payment", href: "/dashboard/pay-periods", icon: Wallet },
];

export function QuickAddFAB() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="lg:hidden fixed right-4 bottom-20 z-50">
      {/* Action buttons - shown when open */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 flex flex-col gap-3 items-end animate-fade-in-up">
          {quickActions.map((action) => (
            <Link
              key={action.label}
              href={action.href}
              className="flex items-center gap-3 pl-4 pr-3 py-2.5 rounded-full bg-theme-elevated shadow-lg border border-theme"
              onClick={() => setIsOpen(false)}
            >
              <span className="text-sm font-medium text-theme-primary">{action.label}</span>
              <div className="h-10 w-10 rounded-full bg-accent-100 dark:bg-accent-600/20 flex items-center justify-center">
                <action.icon className="h-5 w-5 text-accent-600 dark:text-accent-400" />
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Main FAB button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="h-14 w-14 rounded-full bg-accent-600 text-white shadow-lg shadow-black/20 flex items-center justify-center transition-transform duration-200 hover:bg-accent-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2"
        aria-label={isOpen ? "Close quick actions" : "Open quick actions"}
        aria-expanded={isOpen}
      >
        {isOpen ? <X className="h-6 w-6" /> : <Plus className="h-6 w-6" />}
      </button>
    </div>
  );
}
