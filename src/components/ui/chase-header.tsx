import { useState } from "react";
import { Menu, Bell, Search, X, User } from "lucide-react";
import { Link } from "./link";

interface ChaseHeaderProps {
  currentPath: string;
  user?: { name?: string | null };
}

export function ChaseHeader({ currentPath, user }: ChaseHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  const navItems = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Bills", href: "/dashboard/bills" },
    { label: "Debts", href: "/dashboard/debts" },
    { label: "Pay Periods", href: "/dashboard/pay-periods" },
    { label: "FOO Plan", href: "/dashboard/foo" },
    { label: "Settings", href: "/dashboard/settings" },
  ];

  return (
    <>
      <header className="bg-chase-gradient text-white sticky top-0 z-50">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={() => setMenuOpen(true)}
            className="p-2 -ml-2 rounded-full hover:bg-white/10 transition-colors"
            aria-label="Open menu"
          >
            <Menu className="h-6 w-6" />
          </button>

          <Link href="/dashboard" className="font-semibold text-lg tracking-tight">
            OpenFinance
          </Link>

          <div className="flex items-center gap-1">
            <button
              className="p-2 rounded-full hover:bg-white/10 transition-colors"
              aria-label="Search"
            >
              <Search className="h-5 w-5" />
            </button>
            <button
              className="p-2 rounded-full hover:bg-white/10 transition-colors relative"
              aria-label="Notifications"
            >
              <Bell className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile menu overlay */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setMenuOpen(false)}
          />
          <div className="absolute left-0 top-0 bottom-0 w-80 max-w-[85vw] bg-theme-elevated shadow-xl animate-slide-in-right">
            <div className="bg-chase-gradient text-white p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="font-semibold text-lg">Menu</span>
                <button
                  onClick={() => setMenuOpen(false)}
                  className="p-2 -mr-2 rounded-full hover:bg-white/10 transition-colors"
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

            <nav className="p-4">
              {navItems.map((item) => {
                const isActive =
                  currentPath === item.href ||
                  (item.href !== "/dashboard" && currentPath.startsWith(item.href));

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`
                      flex items-center px-4 py-3 rounded-xl transition-colors
                      ${
                        isActive
                          ? "bg-accent-50 text-accent-600 dark:bg-accent-600/20 dark:text-accent-400 font-medium"
                          : "text-theme-primary hover:bg-theme-secondary"
                      }
                    `}
                    onClick={() => setMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
