import { e as createComponent, f as createAstro, k as renderComponent, r as renderTemplate, m as maybeRenderHead, n as renderSlot } from './astro/server_Cel7--ii.mjs';
import 'piccolore';
import { $ as $$BaseLayout } from './BaseLayout_Bte9BUna.mjs';
import { jsx, jsxs, Fragment } from 'react/jsx-runtime';
import { useState, createContext, useEffect, useContext } from 'react';
import { Menu, Search, Bell, X, User, LogOut, Monitor, Moon, Sun, LayoutDashboard, Calendar, Receipt, CreditCard, Target, PiggyBank, Settings, ChevronRight, Lightbulb, TrendingUp, ExternalLink } from 'lucide-react';

function Link({ href, children, ...props }) {
  return /* @__PURE__ */ jsx("a", { href, ...props, children });
}

function ChaseHeader({ currentPath, user }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const navItems = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Bills", href: "/dashboard/bills" },
    { label: "Debts", href: "/dashboard/debts" },
    { label: "Pay Periods", href: "/dashboard/pay-periods" },
    { label: "FOO Plan", href: "/dashboard/foo" },
    { label: "Settings", href: "/dashboard/settings" }
  ];
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("header", { className: "bg-chase-gradient text-white sticky top-0 z-50", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between px-4 py-3", children: [
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => setMenuOpen(true),
          className: "p-2 -ml-2 rounded-full hover:bg-white/10 transition-colors",
          "aria-label": "Open menu",
          children: /* @__PURE__ */ jsx(Menu, { className: "h-6 w-6" })
        }
      ),
      /* @__PURE__ */ jsx(Link, { href: "/dashboard", className: "font-semibold text-lg tracking-tight", children: "OpenFinance" }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1", children: [
        /* @__PURE__ */ jsx(
          "button",
          {
            className: "p-2 rounded-full hover:bg-white/10 transition-colors",
            "aria-label": "Search",
            children: /* @__PURE__ */ jsx(Search, { className: "h-5 w-5" })
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            className: "p-2 rounded-full hover:bg-white/10 transition-colors relative",
            "aria-label": "Notifications",
            children: /* @__PURE__ */ jsx(Bell, { className: "h-5 w-5" })
          }
        )
      ] })
    ] }) }),
    menuOpen && /* @__PURE__ */ jsxs("div", { className: "fixed inset-0 z-50 lg:hidden", children: [
      /* @__PURE__ */ jsx(
        "div",
        {
          className: "absolute inset-0 bg-black/50",
          onClick: () => setMenuOpen(false)
        }
      ),
      /* @__PURE__ */ jsxs("div", { className: "absolute left-0 top-0 bottom-0 w-80 max-w-[85vw] bg-theme-elevated shadow-xl animate-slide-in-right", children: [
        /* @__PURE__ */ jsxs("div", { className: "bg-chase-gradient text-white p-6", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-4", children: [
            /* @__PURE__ */ jsx("span", { className: "font-semibold text-lg", children: "Menu" }),
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: () => setMenuOpen(false),
                className: "p-2 -mr-2 rounded-full hover:bg-white/10 transition-colors",
                children: /* @__PURE__ */ jsx(X, { className: "h-5 w-5" })
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
            /* @__PURE__ */ jsx("div", { className: "w-12 h-12 rounded-full bg-white/20 flex items-center justify-center", children: /* @__PURE__ */ jsx(User, { className: "h-6 w-6" }) }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "font-semibold", children: user?.name || "User" }),
              /* @__PURE__ */ jsx("p", { className: "text-sm text-white/70", children: "Personal Account" })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsx("nav", { className: "p-4", children: navItems.map((item) => {
          const isActive = currentPath === item.href || item.href !== "/dashboard" && currentPath.startsWith(item.href);
          return /* @__PURE__ */ jsx(
            Link,
            {
              href: item.href,
              className: `
                      flex items-center px-4 py-3 rounded-xl transition-colors
                      ${isActive ? "bg-accent-50 text-accent-600 dark:bg-accent-600/20 dark:text-accent-400 font-medium" : "text-theme-primary hover:bg-theme-secondary"}
                    `,
              onClick: () => setMenuOpen(false),
              children: item.label
            },
            item.href
          );
        }) })
      ] })
    ] })
  ] });
}

function SignOutButton() {
  const handleSignOut = async () => {
    try {
      const csrfRes = await fetch("/api/auth/csrf");
      const { csrfToken } = await csrfRes.json();
      await fetch("/api/auth/signout", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ csrfToken })
      });
    } catch {
    }
    window.location.href = "/login";
  };
  return /* @__PURE__ */ jsxs(
    "button",
    {
      onClick: handleSignOut,
      className: "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-theme-secondary hover:bg-theme-tertiary hover:text-theme-primary transition-all duration-200",
      children: [
        /* @__PURE__ */ jsx(LogOut, { className: "h-5 w-5" }),
        "Sign out"
      ]
    }
  );
}

const ThemeContext = createContext(void 0);
function getSystemTheme() {
  if (typeof window === "undefined") return "dark";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}
function ThemeProvider({ children }) {
  const [mode, setModeState] = useState("system");
  const [accentColor, setAccentColorState] = useState("chase");
  const [resolvedMode, setResolvedMode] = useState("dark");
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const savedMode = localStorage.getItem("theme-mode");
    const savedAccent = localStorage.getItem(
      "theme-accent"
    );
    if (savedMode) setModeState(savedMode);
    if (savedAccent) setAccentColorState(savedAccent);
    setMounted(true);
  }, []);
  useEffect(() => {
    if (!mounted) return;
    const updateResolvedMode = () => {
      const resolved = mode === "system" ? getSystemTheme() : mode;
      setResolvedMode(resolved);
      const root = document.documentElement;
      root.classList.remove("light", "dark");
      root.classList.add(resolved);
    };
    updateResolvedMode();
    if (mode === "system") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      const handler = () => updateResolvedMode();
      mediaQuery.addEventListener("change", handler);
      return () => mediaQuery.removeEventListener("change", handler);
    }
  }, [mode, mounted]);
  useEffect(() => {
    if (!mounted) return;
    const root = document.documentElement;
    root.classList.remove(
      "accent-chase",
      "accent-blue",
      "accent-purple",
      "accent-orange",
      "accent-pink"
    );
    root.classList.add(`accent-${accentColor}`);
  }, [accentColor, mounted]);
  const setMode = (newMode) => {
    setModeState(newMode);
    localStorage.setItem("theme-mode", newMode);
    const resolved = newMode === "system" ? getSystemTheme() : newMode;
    setResolvedMode(resolved);
    const root = document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(resolved);
  };
  const setAccentColor = (newColor) => {
    setAccentColorState(newColor);
    localStorage.setItem("theme-accent", newColor);
  };
  const value = {
    mode,
    setMode,
    accentColor,
    setAccentColor,
    resolvedMode
  };
  return /* @__PURE__ */ jsx(ThemeContext.Provider, { value, children });
}
function useTheme() {
  const context = useContext(ThemeContext);
  if (context === void 0) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

function ThemeToggleCompact() {
  const { resolvedMode, mode, setMode } = useTheme();
  const cycleMode = () => {
    const modeOrder = ["light", "dark", "system"];
    const currentIndex = modeOrder.indexOf(mode);
    const nextIndex = (currentIndex + 1) % modeOrder.length;
    setMode(modeOrder[nextIndex]);
  };
  const Icon = mode === "system" ? Monitor : resolvedMode === "dark" ? Moon : Sun;
  return /* @__PURE__ */ jsx(
    "button",
    {
      onClick: cycleMode,
      className: "p-2.5 rounded-xl text-theme-secondary hover:bg-theme-tertiary hover:text-theme-primary transition-all duration-200",
      title: `Theme: ${mode}`,
      "aria-label": `Current theme: ${mode}. Click to change.`,
      children: /* @__PURE__ */ jsx(Icon, { className: "h-5 w-5" })
    }
  );
}

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Pay Periods", href: "/dashboard/pay-periods", icon: Calendar },
  { name: "Bills", href: "/dashboard/bills", icon: Receipt },
  { name: "Debts", href: "/dashboard/debts", icon: CreditCard },
  { name: "FOO Progress", href: "/dashboard/foo", icon: Target },
  { name: "Goals", href: "/dashboard/goals", icon: PiggyBank }
];
const bottomNav = [
  { name: "Settings", href: "/dashboard/settings", icon: Settings }
];
function NavLink({ item, isActive }) {
  return /* @__PURE__ */ jsxs(
    Link,
    {
      href: item.href,
      "aria-current": isActive ? "page" : void 0,
      className: `
        group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
        transition-all duration-200
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2 focus-visible:ring-offset-theme-elevated
        ${isActive ? "bg-accent-600 text-white shadow-sm" : "text-theme-secondary hover:bg-theme-tertiary hover:text-theme-primary"}
      `,
      children: [
        /* @__PURE__ */ jsx(item.icon, { "aria-hidden": "true", className: `h-5 w-5 transition-transform duration-200 ${!isActive && "group-hover:scale-110"}` }),
        /* @__PURE__ */ jsx("span", { className: "flex-1", children: item.name }),
        isActive && /* @__PURE__ */ jsx(ChevronRight, { "aria-hidden": "true", className: "h-4 w-4 opacity-70" })
      ]
    }
  );
}
function Sidebar({ currentPath = "" }) {
  return /* @__PURE__ */ jsx(ThemeProvider, { children: /* @__PURE__ */ jsxs("aside", { className: "hidden lg:flex h-full w-72 flex-col bg-theme-elevated border-r border-theme", children: [
    /* @__PURE__ */ jsx("div", { className: "flex h-16 items-center px-6 border-b border-theme", children: /* @__PURE__ */ jsxs(Link, { href: "/dashboard", className: "flex items-center gap-3 group", children: [
      /* @__PURE__ */ jsx("div", { className: "w-10 h-10 rounded-xl bg-chase-gradient flex items-center justify-center shadow-sm transition-transform duration-200 group-hover:scale-105", children: /* @__PURE__ */ jsx("span", { className: "text-white font-bold text-lg", children: "OF" }) }),
      /* @__PURE__ */ jsx("div", { children: /* @__PURE__ */ jsx("span", { className: "text-xl font-bold text-theme-primary tracking-tight", children: "OpenFinance" }) })
    ] }) }),
    /* @__PURE__ */ jsx("nav", { className: "flex-1 px-3 py-4 space-y-1 overflow-y-auto", children: navigation.map((item) => {
      const isActive = currentPath === item.href || item.href !== "/dashboard" && currentPath.startsWith(item.href);
      return /* @__PURE__ */ jsx(NavLink, { item, isActive }, item.name);
    }) }),
    /* @__PURE__ */ jsxs("div", { className: "px-3 py-4 border-t border-theme space-y-1", children: [
      bottomNav.map((item) => {
        const isActive = currentPath === item.href || item.href !== "/dashboard" && currentPath.startsWith(item.href);
        return /* @__PURE__ */ jsx(NavLink, { item, isActive }, item.name);
      }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between pt-2", children: [
        /* @__PURE__ */ jsx(SignOutButton, {}),
        /* @__PURE__ */ jsx(ThemeToggleCompact, {})
      ] })
    ] })
  ] }) });
}

const navItems = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    activeMatch: (path) => path === "/dashboard"
  },
  {
    name: "Payments",
    href: "/dashboard/pay-periods",
    icon: Receipt,
    activeMatch: (path) => path.startsWith("/dashboard/pay-periods") || path.startsWith("/dashboard/bills")
  },
  {
    name: "Goals",
    href: "/dashboard/goals",
    icon: PiggyBank,
    activeMatch: (path) => path.startsWith("/dashboard/goals")
  },
  {
    name: "FOO",
    href: "/dashboard/foo",
    icon: Target,
    activeMatch: (path) => path.startsWith("/dashboard/foo") || path.startsWith("/dashboard/debts")
  },
  {
    name: "Settings",
    href: "/dashboard/settings",
    icon: Menu,
    activeMatch: (path) => path.startsWith("/dashboard/settings")
  }
];
function BottomNav({ currentPath = "" }) {
  return /* @__PURE__ */ jsxs("nav", { className: "fixed bottom-0 left-0 right-0 z-40 border-t border-theme bg-theme-elevated/95 backdrop-blur-md lg:hidden", children: [
    /* @__PURE__ */ jsx("div", { className: "mx-auto flex justify-around items-center h-16 max-w-lg px-2 pb-safe-area", children: navItems.map((item) => {
      const isActive = item.activeMatch(currentPath);
      return /* @__PURE__ */ jsxs(
        Link,
        {
          href: item.href,
          "aria-current": isActive ? "page" : void 0,
          "aria-label": item.name,
          className: `
                flex flex-col items-center justify-center gap-0.5 py-2 px-3 min-w-[4rem] min-h-[44px]
                transition-all duration-200
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2 focus-visible:ring-offset-theme-elevated
                ${isActive ? "text-accent-600" : "text-theme-muted hover:text-theme-secondary"}
              `,
          children: [
            /* @__PURE__ */ jsx("div", { className: `
                relative p-1.5 rounded-xl transition-all duration-200
                ${isActive ? "bg-accent-50 dark:bg-accent-600/20" : ""}
              `, children: /* @__PURE__ */ jsx(item.icon, { "aria-hidden": "true", className: `h-5 w-5 transition-transform duration-200 ${isActive ? "scale-110" : ""}` }) }),
            /* @__PURE__ */ jsx("span", { className: `text-[10px] font-medium tracking-wide ${isActive ? "font-semibold" : ""}`, children: item.name })
          ]
        },
        item.name
      );
    }) }),
    /* @__PURE__ */ jsx("div", { className: "h-[env(safe-area-inset-bottom)]" })
  ] });
}

const quickLinks = [
  {
    label: "Financial Order of Operations",
    href: "/dashboard/foo",
    icon: TrendingUp,
    description: "Your personalized roadmap to financial freedom"
  },
  {
    label: "Debt Payoff Calculator",
    href: "/dashboard/debts/calculator",
    icon: CreditCard,
    description: "See how fast you can become debt-free"
  },
  {
    label: "Emergency Fund Goal",
    href: "/dashboard/goals",
    icon: PiggyBank,
    description: "Track your savings progress"
  }
];
const tips = [
  "Pay bills on payday to avoid late fees",
  "Review subscriptions monthly for unused services",
  "Set up autopay for recurring bills",
  "Keep 3-6 months expenses in emergency fund"
];
function ExploreSidebar() {
  const randomTip = tips[Math.floor(Math.random() * tips.length)];
  return /* @__PURE__ */ jsxs("aside", { className: "w-72 space-y-6", children: [
    /* @__PURE__ */ jsxs("div", { className: "bg-theme-elevated rounded-2xl shadow-theme border border-theme p-5", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-3", children: [
        /* @__PURE__ */ jsx("div", { className: "w-8 h-8 rounded-full bg-warning-100 dark:bg-warning-600/20 flex items-center justify-center", children: /* @__PURE__ */ jsx(Lightbulb, { className: "h-4 w-4 text-warning-600 dark:text-warning-400" }) }),
        /* @__PURE__ */ jsx("h3", { className: "font-semibold text-theme-primary text-sm", children: "Tip of the Day" })
      ] }),
      /* @__PURE__ */ jsx("p", { className: "text-sm text-theme-secondary leading-relaxed", children: randomTip })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-theme-elevated rounded-2xl shadow-theme border border-theme p-5", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-semibold text-theme-primary text-sm mb-4", children: "Explore" }),
      /* @__PURE__ */ jsx("div", { className: "space-y-3", children: quickLinks.map((link) => /* @__PURE__ */ jsxs(
        Link,
        {
          href: link.href,
          className: "group flex items-start gap-3 p-2 -mx-2 rounded-xl hover:bg-theme-secondary transition-colors",
          children: [
            /* @__PURE__ */ jsx("div", { className: "w-9 h-9 rounded-lg bg-accent-50 dark:bg-accent-600/20 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform", children: /* @__PURE__ */ jsx(link.icon, { className: "h-4 w-4 text-accent-600 dark:text-accent-400" }) }),
            /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
              /* @__PURE__ */ jsx("p", { className: "font-medium text-sm text-theme-primary group-hover:text-accent-600 dark:group-hover:text-accent-400 transition-colors", children: link.label }),
              link.description && /* @__PURE__ */ jsx("p", { className: "text-xs text-theme-muted mt-0.5 line-clamp-2", children: link.description })
            ] })
          ]
        },
        link.href
      )) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-theme-elevated rounded-2xl shadow-theme border border-theme p-5", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-semibold text-theme-primary text-sm mb-3", children: "Resources" }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxs(
          "a",
          {
            href: "https://www.moneyguy.com/foo",
            target: "_blank",
            rel: "noopener noreferrer",
            className: "flex items-center gap-2 text-sm text-theme-secondary hover:text-accent-600 dark:hover:text-accent-400 transition-colors",
            children: [
              "Learn about FOO",
              /* @__PURE__ */ jsx(ExternalLink, { className: "h-3 w-3" })
            ]
          }
        ),
        /* @__PURE__ */ jsxs(
          "a",
          {
            href: "https://www.reddit.com/r/personalfinance/wiki/commontopics",
            target: "_blank",
            rel: "noopener noreferrer",
            className: "flex items-center gap-2 text-sm text-theme-secondary hover:text-accent-600 dark:hover:text-accent-400 transition-colors",
            children: [
              "r/personalfinance wiki",
              /* @__PURE__ */ jsx(ExternalLink, { className: "h-3 w-3" })
            ]
          }
        )
      ] })
    ] })
  ] });
}

const $$Astro = createAstro();
const $$DashboardLayout = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$DashboardLayout;
  const {
    title = "Dashboard",
    currentPath = Astro2.url.pathname,
    user,
    showExploreSidebar = true
  } = Astro2.props;
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": title }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="min-h-screen bg-theme-secondary"> <!-- Mobile: Chase header --> <div class="lg:hidden"> ${renderComponent($$result2, "ChaseHeader", ChaseHeader, { "client:load": true, "currentPath": currentPath, "user": user, "client:component-hydration": "load", "client:component-path": "/Users/chris/projects/dev/openfinance/src/components/ui/chase-header", "client:component-export": "ChaseHeader" })} </div> <div class="flex"> <!-- Desktop: Sidebar --> ${renderComponent($$result2, "Sidebar", Sidebar, { "client:load": true, "currentPath": currentPath, "client:component-hydration": "load", "client:component-path": "/Users/chris/projects/dev/openfinance/src/components/ui/sidebar", "client:component-export": "Sidebar" })} <!-- Main content --> <div class="flex-1 flex flex-col lg:flex-row gap-6 lg:gap-8"> <main class="flex-1 min-w-0"> <div class="max-w-3xl mx-auto px-4 pt-4 pb-24 lg:px-8 lg:pt-8 lg:pb-8"> ${renderSlot($$result2, $$slots["default"])} </div> </main> <!-- Desktop: Explore sidebar --> ${showExploreSidebar && renderTemplate`<div class="hidden lg:block pr-8 pt-8"> ${renderComponent($$result2, "ExploreSidebar", ExploreSidebar, {})} </div>`} </div> </div> <!-- Mobile: Bottom nav --> ${renderComponent($$result2, "BottomNav", BottomNav, { "client:load": true, "currentPath": currentPath, "client:component-hydration": "load", "client:component-path": "/Users/chris/projects/dev/openfinance/src/components/ui/bottom-nav", "client:component-export": "BottomNav" })} </div> ` })}`;
}, "/Users/chris/projects/dev/openfinance/src/layouts/DashboardLayout.astro", void 0);

export { $$DashboardLayout as $, Link as L };
//# sourceMappingURL=DashboardLayout_PUHTqK68.mjs.map
