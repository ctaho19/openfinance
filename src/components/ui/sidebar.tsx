"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  Receipt,
  CreditCard,
  Target,
  Settings,
  Calendar,
  LogOut,
  PiggyBank,
  Menu,
  X,
} from "lucide-react";
import { signOut } from "next-auth/react";
import { ThemeToggleCompact } from "./theme-toggle";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Pay Periods", href: "/dashboard/pay-periods", icon: Calendar },
  { name: "Bills", href: "/dashboard/bills", icon: Receipt },
  { name: "Debts", href: "/dashboard/debts", icon: CreditCard },
  { name: "FOO Progress", href: "/dashboard/foo", icon: Target },
  { name: "Goals", href: "/dashboard/goals", icon: PiggyBank },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const NavContent = () => (
    <>
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navigation.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-accent-600/20 text-accent-600 dark:text-accent-400"
                  : "text-theme-secondary hover:bg-theme-tertiary hover:text-theme-primary"
              }`}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-theme">
        <div className="flex items-center justify-between">
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-theme-secondary hover:bg-theme-tertiary hover:text-theme-primary transition-colors"
          >
            <LogOut className="h-5 w-5" />
            Sign out
          </button>
          <ThemeToggleCompact />
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 h-14 bg-theme-secondary border-b border-theme flex items-center justify-between px-4">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-accent-600 flex items-center justify-center">
            <span className="text-white font-bold text-sm">OF</span>
          </div>
          <span className="text-lg font-bold text-theme-primary">OpenFinance</span>
        </Link>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded-lg text-theme-secondary hover:bg-theme-tertiary hover:text-theme-primary transition-colors"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile menu overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-30 bg-black/50"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile menu drawer */}
      <div
        className={`lg:hidden fixed top-14 left-0 bottom-0 z-40 w-64 bg-theme-secondary border-r border-theme transform transition-transform duration-200 ease-in-out ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          <NavContent />
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:flex h-full w-64 flex-col bg-theme-secondary border-r border-theme">
        <div className="flex h-16 items-center px-6 border-b border-theme">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-accent-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">OF</span>
            </div>
            <span className="text-xl font-bold text-theme-primary">OpenFinance</span>
          </Link>
        </div>
        <NavContent />
      </div>
    </>
  );
}
