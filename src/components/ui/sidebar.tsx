"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Receipt,
  CreditCard,
  Target,
  Settings,
  Calendar,
  PiggyBank,
  ChevronRight,
} from "lucide-react";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { ThemeToggleCompact } from "./theme-toggle";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Pay Periods", href: "/dashboard/pay-periods", icon: Calendar },
  { name: "Bills", href: "/dashboard/bills", icon: Receipt },
  { name: "Debts", href: "/dashboard/debts", icon: CreditCard },
  { name: "FOO Progress", href: "/dashboard/foo", icon: Target },
  { name: "Goals", href: "/dashboard/goals", icon: PiggyBank },
];

const bottomNav = [
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

function NavLink({ item, isActive }: { item: NavItem; isActive: boolean }) {
  return (
    <Link
      href={item.href}
      aria-current={isActive ? "page" : undefined}
      className={`
        group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
        transition-all duration-200
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2 focus-visible:ring-offset-theme-elevated
        ${isActive
          ? "bg-accent-600 text-white shadow-sm"
          : "text-theme-secondary hover:bg-theme-tertiary hover:text-theme-primary"
        }
      `}
    >
      <item.icon aria-hidden="true" className={`h-5 w-5 transition-transform duration-200 ${!isActive && "group-hover:scale-110"}`} />
      <span className="flex-1">{item.name}</span>
      {isActive && <ChevronRight aria-hidden="true" className="h-4 w-4 opacity-70" />}
    </Link>
  );
}

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex h-full w-72 flex-col bg-theme-elevated border-r border-theme">
      {/* Logo */}
      <div className="flex h-16 items-center px-6 border-b border-theme">
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-chase-gradient flex items-center justify-center shadow-sm transition-transform duration-200 group-hover:scale-105">
            <span className="text-white font-bold text-lg">OF</span>
          </div>
          <div>
            <span className="text-xl font-bold text-theme-primary tracking-tight">OpenFinance</span>
          </div>
        </Link>
      </div>

      {/* Main navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
          return <NavLink key={item.name} item={item} isActive={isActive} />;
        })}
      </nav>

      {/* Bottom section */}
      <div className="px-3 py-4 border-t border-theme space-y-1">
        {bottomNav.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
          return <NavLink key={item.name} item={item} isActive={isActive} />;
        })}
        
        <div className="flex items-center justify-between pt-2">
          <SignOutButton />
          <ThemeToggleCompact />
        </div>
      </div>
    </aside>
  );
}
