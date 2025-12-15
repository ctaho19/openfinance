import { useState } from "react";
import { Menu, User, X, LogOut, Settings, ChevronRight } from "lucide-react";
import { Link } from "./link";

interface ChaseHeaderProps {
  currentPath: string;
  user?: { name?: string | null };
}

const navItems = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Bills", href: "/dashboard/bills" },
  { label: "Debts", href: "/dashboard/debts" },
  { label: "Pay Periods", href: "/dashboard/pay-periods" },
  { label: "Goals", href: "/dashboard/goals" },
  { label: "FOO Plan", href: "/dashboard/foo" },
];

export function ChaseHeader({ currentPath, user }: ChaseHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === "/dashboard") return currentPath === "/dashboard";
    return currentPath.startsWith(href);
  };

  return (
    <>
      {/* Mobile Header */}
      <header className="bg-[#0a3254] text-white sticky top-0 z-50">
        {/* Top bar with hamburger, logo, and actions */}
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={() => setMenuOpen(true)}
            className="p-2 -ml-2 rounded-lg hover:bg-white/10 transition-colors touch-target"
            aria-label="Open menu"
          >
            <Menu className="h-6 w-6" />
          </button>

          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
              <span className="font-bold text-sm">OF</span>
            </div>
          </Link>

          <div className="flex items-center gap-1">
            <Link
              href="/dashboard/settings"
              className="p-2 rounded-lg hover:bg-white/10 transition-colors touch-target"
            >
              <User className="h-5 w-5" />
            </Link>
          </div>
        </div>

        {/* Horizontal nav - scrollable on mobile */}
        <nav className="flex items-center gap-1 px-4 overflow-x-auto scrollbar-hide">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`
                whitespace-nowrap px-3 py-3 text-sm font-medium relative transition-colors
                ${isActive(item.href)
                  ? "text-white"
                  : "text-white/70 hover:text-white/90"
                }
              `}
            >
              {item.label}
              {isActive(item.href) && (
                <span className="absolute bottom-0 left-3 right-3 h-[3px] bg-white rounded-t-sm" />
              )}
            </Link>
          ))}
        </nav>
      </header>

      {/* Mobile menu overlay */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMenuOpen(false)}
          />
          <div className="absolute left-0 top-0 bottom-0 w-[300px] max-w-[85vw] bg-white shadow-xl animate-slide-in-right flex flex-col">
            {/* Menu Header */}
            <div className="bg-[#0a3254] text-white p-5">
              <div className="flex items-center justify-between mb-5">
                <span className="font-semibold text-lg">Menu</span>
                <button
                  onClick={() => setMenuOpen(false)}
                  className="p-2 -mr-2 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                  <User className="h-6 w-6" />
                </div>
                <div>
                  <p className="font-semibold">{user?.name || "User"}</p>
                  <p className="text-sm text-white/70">Personal Account</p>
                </div>
              </div>
            </div>

            {/* Menu Items */}
            <nav className="flex-1 py-2 overflow-y-auto">
              {[
                { label: "Dashboard", href: "/dashboard" },
                { label: "Pay Periods", href: "/dashboard/pay-periods" },
                { label: "Bills", href: "/dashboard/bills" },
                { label: "Debts", href: "/dashboard/debts" },
                { label: "Goals", href: "/dashboard/goals" },
                { label: "FOO Progress", href: "/dashboard/foo" },
              ].map((item) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`
                      flex items-center justify-between px-5 py-3.5 transition-colors
                      ${active
                        ? "bg-[#e6f2fc] text-[#0060f0] font-medium"
                        : "text-gray-800 hover:bg-gray-50"
                      }
                    `}
                    onClick={() => setMenuOpen(false)}
                  >
                    <span>{item.label}</span>
                    <ChevronRight className={`h-4 w-4 ${active ? 'text-[#0060f0]' : 'text-gray-400'}`} />
                  </Link>
                );
              })}
            </nav>

            {/* Menu Footer */}
            <div className="border-t border-gray-200 py-2">
              <Link
                href="/dashboard/settings"
                className="flex items-center gap-3 px-5 py-3.5 text-gray-800 hover:bg-gray-50 transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                <Settings className="h-5 w-5 text-gray-500" />
                <span>Settings</span>
              </Link>
              <form action="/api/auth/signout" method="POST">
                <button
                  type="submit"
                  className="flex items-center gap-3 px-5 py-3.5 text-gray-800 hover:bg-gray-50 transition-colors w-full text-left"
                >
                  <LogOut className="h-5 w-5 text-gray-500" />
                  <span>Sign out</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
