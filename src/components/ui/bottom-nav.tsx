import { Link } from "./link";
import {
  LayoutDashboard,
  ArrowLeftRight,
  PiggyBank,
  Target,
  Menu,
} from "lucide-react";

const navItems = [
  { 
    name: "Plan", 
    href: "/dashboard/paycheck-plan", 
    icon: LayoutDashboard,
    activeMatch: (path: string) => path === "/dashboard/paycheck-plan"
  },
  { 
    name: "Bills", 
    href: "/dashboard/bills", 
    icon: ArrowLeftRight,
    activeMatch: (path: string) => path.startsWith("/dashboard/bills") || path.startsWith("/dashboard/pay-periods")
  },
  { 
    name: "Goals", 
    href: "/dashboard/goals", 
    icon: PiggyBank,
    activeMatch: (path: string) => path.startsWith("/dashboard/goals")
  },
  { 
    name: "FOO", 
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

interface BottomNavProps {
  currentPath?: string;
}

export function BottomNav({ currentPath = "" }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 dark:bg-[#1c2128] dark:border-[#30363d] lg:hidden">
      <div className="mx-auto flex justify-around items-center h-14 max-w-lg">
        {navItems.map((item) => {
          const isActive = item.activeMatch(currentPath);
          const Icon = item.icon;
          
          return (
            <Link
              key={item.name}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              aria-label={item.name}
              className={`
                flex flex-col items-center justify-center gap-0.5 py-1.5 px-4 min-w-[56px] min-h-[44px]
                transition-colors duration-150
                ${isActive 
                  ? "text-[#0060f0] dark:text-[#60a5fa]" 
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                }
              `}
            >
              <Icon aria-hidden="true" className="h-5 w-5" />
              <span className={`text-[10px] font-medium ${isActive ? "font-semibold" : ""}`}>
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
      {/* Safe area padding for devices with home indicator */}
      <div className="h-[env(safe-area-inset-bottom)]" />
    </nav>
  );
}
