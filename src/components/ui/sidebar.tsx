import type { ComponentType } from "react";
import { Link } from "./link";
import {
  LayoutDashboard,
  Receipt,
  CreditCard,
  Target,
  Settings,
  Calendar,
  PiggyBank,
  ChevronRight,
  Search,
  User,
  LogOut,
} from "lucide-react";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { ThemeToggleCompact } from "./theme-toggle";
import { ThemeProvider } from "@/lib/theme-context";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Bills", href: "/dashboard/bills", icon: Receipt },
  { name: "Debts", href: "/dashboard/debts", icon: CreditCard },
  { name: "Pay Periods", href: "/dashboard/pay-periods", icon: Calendar },
  { name: "Goals", href: "/dashboard/goals", icon: PiggyBank },
  { name: "FOO Plan", href: "/dashboard/foo", icon: Target },
];

const bottomNav = [
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

interface NavItem {
  name: string;
  href: string;
  icon: ComponentType<{ className?: string }>;
}

function NavLink({ item, isActive }: { item: NavItem; isActive: boolean }) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      aria-current={isActive ? "page" : undefined}
      className={`
        group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
        transition-all duration-150
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2
        ${isActive
          ? "bg-[#e6f2fc] text-[#0060f0] dark:bg-[#0060f0]/15 dark:text-[#60a5fa]"
          : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
        }
      `}
    >
      <Icon aria-hidden="true" className={`h-5 w-5 flex-shrink-0 ${isActive ? "" : "text-gray-500 dark:text-gray-400"}`} />
      <span className="flex-1">{item.name}</span>
      {isActive && <ChevronRight aria-hidden="true" className="h-4 w-4 opacity-60" />}
    </Link>
  );
}

interface SidebarProps {
  currentPath?: string;
}

export function Sidebar({ currentPath = "" }: SidebarProps) {
  return (
    <ThemeProvider>
      <aside className="hidden lg:flex h-screen w-64 flex-col bg-white border-r border-gray-200 dark:bg-[#1c2128] dark:border-[#30363d] sticky top-0">
        {/* Header */}
        <div className="flex items-center gap-3 px-5 h-16 border-b border-gray-200 dark:border-[#30363d]">
          <button
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Menu"
          >
            <svg className="h-5 w-5 text-gray-600 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <Link href="/dashboard" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-[#0060f0] flex items-center justify-center shadow-sm">
              <span className="text-white font-bold text-sm">OF</span>
            </div>
          </Link>
          <div className="flex-1" />
          <button
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Search"
          >
            <Search className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          </button>
          <Link
            href="/dashboard/settings"
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <User className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = currentPath === item.href || (item.href !== "/dashboard" && currentPath.startsWith(item.href));
            return <NavLink key={item.name} item={item} isActive={isActive} />;
          })}
        </nav>

        {/* Bottom section */}
        <div className="px-3 py-4 border-t border-gray-200 dark:border-[#30363d] space-y-1">
          {bottomNav.map((item) => {
            const isActive = currentPath === item.href || (item.href !== "/dashboard" && currentPath.startsWith(item.href));
            return <NavLink key={item.name} item={item} isActive={isActive} />;
          })}
          
          <div className="flex items-center justify-between pt-3 px-1">
            <SignOutButton />
            <ThemeToggleCompact />
          </div>
        </div>
      </aside>
    </ThemeProvider>
  );
}
