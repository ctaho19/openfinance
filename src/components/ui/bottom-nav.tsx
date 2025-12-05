"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Receipt,
  PiggyBank,
  Target,
  Menu,
} from "lucide-react";

const navItems = [
  { 
    name: "Accounts", 
    href: "/dashboard", 
    icon: LayoutDashboard,
    activeMatch: (path: string) => path === "/dashboard"
  },
  { 
    name: "Pay", 
    href: "/dashboard/pay-periods", 
    icon: Receipt,
    activeMatch: (path: string) => path.startsWith("/dashboard/pay-periods") || path.startsWith("/dashboard/bills")
  },
  { 
    name: "Goals", 
    href: "/dashboard/goals", 
    icon: PiggyBank,
    activeMatch: (path: string) => path.startsWith("/dashboard/goals")
  },
  { 
    name: "Plan", 
    href: "/dashboard/foo", 
    icon: Target,
    activeMatch: (path: string) => path.startsWith("/dashboard/foo") || path.startsWith("/dashboard/debts")
  },
  { 
    name: "More", 
    href: "/dashboard/settings", 
    icon: Menu,
    activeMatch: (path: string) => path.startsWith("/dashboard/settings")
  },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-theme bg-theme-elevated/95 backdrop-blur-md lg:hidden pb-safe-area">
      <div className="mx-auto flex justify-around items-center h-16 max-w-lg px-2">
        {navItems.map((item) => {
          const isActive = item.activeMatch(pathname);
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`
                flex flex-col items-center justify-center gap-0.5 py-2 px-3 min-w-[4rem]
                transition-all duration-200
                ${isActive 
                  ? "text-accent-600" 
                  : "text-theme-muted hover:text-theme-secondary"
                }
              `}
            >
              <div className={`
                relative p-1.5 rounded-xl transition-all duration-200
                ${isActive ? "bg-accent-50 dark:bg-accent-600/20" : ""}
              `}>
                <item.icon className={`h-6 w-6 transition-transform duration-200 ${isActive ? "scale-110" : ""}`} />
              </div>
              <span className={`text-[10px] font-medium tracking-wide ${isActive ? "font-semibold" : ""}`}>
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
