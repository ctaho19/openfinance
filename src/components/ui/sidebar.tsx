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
  ChevronRight,
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
];

const bottomNav = [
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const NavLink = ({ item, onClick }: { item: typeof navigation[0]; onClick?: () => void }) => {
    const isActive =
      pathname === item.href ||
      (item.href !== "/dashboard" && pathname.startsWith(item.href));
    
    return (
      <Link
        href={item.href}
        onClick={onClick}
        className={`
          group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
          transition-all duration-200
          ${isActive
            ? "bg-accent-600 text-white shadow-sm"
            : "text-theme-secondary hover:bg-theme-tertiary hover:text-theme-primary"
          }
        `}
      >
        <item.icon className={`h-5 w-5 transition-transform duration-200 ${!isActive && "group-hover:scale-110"}`} />
        <span className="flex-1">{item.name}</span>
        {isActive && <ChevronRight className="h-4 w-4 opacity-70" />}
      </Link>
    );
  };

  const NavContent = () => (
    <div className="flex flex-col h-full">
      {/* Main navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navigation.map((item) => (
          <NavLink key={item.name} item={item} onClick={() => setMobileOpen(false)} />
        ))}
      </nav>

      {/* Bottom section */}
      <div className="px-3 py-4 border-t border-theme space-y-1">
        {bottomNav.map((item) => (
          <NavLink key={item.name} item={item} onClick={() => setMobileOpen(false)} />
        ))}
        
        <div className="flex items-center justify-between pt-2">
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-theme-secondary hover:bg-theme-tertiary hover:text-theme-primary transition-all duration-200"
          >
            <LogOut className="h-5 w-5" />
            Sign out
          </button>
          <ThemeToggleCompact />
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 h-16 bg-theme-elevated border-b border-theme flex items-center justify-between px-4 shadow-sm">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-500 to-accent-700 flex items-center justify-center shadow-sm">
            <span className="text-white font-bold text-lg">OF</span>
          </div>
          <div>
            <span className="text-lg font-bold text-theme-primary tracking-tight">OpenFinance</span>
          </div>
        </Link>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2.5 rounded-xl text-theme-secondary hover:bg-theme-tertiary hover:text-theme-primary transition-all duration-200"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </header>

      {/* Mobile menu overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile menu drawer */}
      <div
        className={`
          lg:hidden fixed top-16 left-0 bottom-0 z-50 w-72 
          bg-theme-elevated border-r border-theme shadow-xl
          transform transition-transform duration-300 ease-out
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <NavContent />
      </div>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex h-full w-72 flex-col bg-theme-elevated border-r border-theme">
        {/* Logo */}
        <div className="flex h-16 items-center px-6 border-b border-theme">
          <Link href="/dashboard" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-500 to-accent-700 flex items-center justify-center shadow-sm transition-transform duration-200 group-hover:scale-105">
              <span className="text-white font-bold text-lg">OF</span>
            </div>
            <div>
              <span className="text-xl font-bold text-theme-primary tracking-tight">OpenFinance</span>
            </div>
          </Link>
        </div>
        <NavContent />
      </aside>
    </>
  );
}
