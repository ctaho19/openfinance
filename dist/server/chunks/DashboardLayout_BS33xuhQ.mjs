import { e as createComponent, f as createAstro, k as renderComponent, r as renderTemplate, m as maybeRenderHead, q as renderSlot } from './astro/server_CLo6n4dC.mjs';
import 'piccolore';
import { $ as $$BaseLayout } from './BaseLayout_BeU1-zxX.mjs';
import { jsx, jsxs, Fragment } from 'react/jsx-runtime';
import { useState, createContext, useEffect, useContext } from 'react';
import { Menu, User, X, ChevronRight, Settings, LogOut, Monitor, Moon, Sun, LayoutDashboard, Wallet, Receipt, CreditCard, Calendar, PiggyBank, Target, ArrowLeftRight, ListOrdered, Calculator, Lightbulb, ExternalLink } from 'lucide-react';

function Link({ href, children, ...props }) {
  return /* @__PURE__ */ jsx("a", { href, ...props, children });
}

const navItems$1 = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Paycheck Plan", href: "/dashboard/paycheck-plan" },
  { label: "Bills", href: "/dashboard/bills" },
  { label: "Debts", href: "/dashboard/debts" },
  { label: "Forecast", href: "/dashboard/pay-periods" },
  { label: "Goals", href: "/dashboard/goals" }
];
function ChaseHeader({ currentPath, user }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const isActive = (href) => {
    if (href === "/dashboard") return currentPath === "/dashboard";
    return currentPath.startsWith(href);
  };
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsxs("header", { className: "bg-[#0a3254] text-white sticky top-0 z-50", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between px-4 py-3", children: [
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => setMenuOpen(true),
            className: "p-2 -ml-2 rounded-lg hover:bg-white/10 transition-colors touch-target",
            "aria-label": "Open menu",
            children: /* @__PURE__ */ jsx(Menu, { className: "h-6 w-6" })
          }
        ),
        /* @__PURE__ */ jsx(Link, { href: "/dashboard", className: "flex items-center gap-2", children: /* @__PURE__ */ jsx("div", { className: "w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center", children: /* @__PURE__ */ jsx("span", { className: "font-bold text-sm", children: "OF" }) }) }),
        /* @__PURE__ */ jsx("div", { className: "flex items-center gap-1", children: /* @__PURE__ */ jsx(
          Link,
          {
            href: "/dashboard/settings",
            className: "p-2 rounded-lg hover:bg-white/10 transition-colors touch-target",
            children: /* @__PURE__ */ jsx(User, { className: "h-5 w-5" })
          }
        ) })
      ] }),
      /* @__PURE__ */ jsx("nav", { className: "flex items-center gap-1 px-4 overflow-x-auto scrollbar-hide", children: navItems$1.map((item) => /* @__PURE__ */ jsxs(
        Link,
        {
          href: item.href,
          className: `
                whitespace-nowrap px-3 py-3 text-sm font-medium relative transition-colors
                ${isActive(item.href) ? "text-white" : "text-white/70 hover:text-white/90"}
              `,
          children: [
            item.label,
            isActive(item.href) && /* @__PURE__ */ jsx("span", { className: "absolute bottom-0 left-3 right-3 h-[3px] bg-white rounded-t-sm" })
          ]
        },
        item.href
      )) })
    ] }),
    menuOpen && /* @__PURE__ */ jsxs("div", { className: "fixed inset-0 z-50 lg:hidden", children: [
      /* @__PURE__ */ jsx(
        "div",
        {
          className: "absolute inset-0 bg-black/60 backdrop-blur-sm",
          onClick: () => setMenuOpen(false)
        }
      ),
      /* @__PURE__ */ jsxs("div", { className: "absolute left-0 top-0 bottom-0 w-[300px] max-w-[85vw] bg-white shadow-xl animate-slide-in-right flex flex-col", children: [
        /* @__PURE__ */ jsxs("div", { className: "bg-[#0a3254] text-white p-5", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-5", children: [
            /* @__PURE__ */ jsx("span", { className: "font-semibold text-lg", children: "Menu" }),
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: () => setMenuOpen(false),
                className: "p-2 -mr-2 rounded-lg hover:bg-white/10 transition-colors",
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
        /* @__PURE__ */ jsx("nav", { className: "flex-1 py-2 overflow-y-auto", children: [
          { label: "Dashboard", href: "/dashboard" },
          { label: "Paycheck Plan", href: "/dashboard/paycheck-plan" },
          { label: "Forecast", href: "/dashboard/pay-periods" },
          { label: "Bills", href: "/dashboard/bills" },
          { label: "Debts", href: "/dashboard/debts" },
          { label: "Goals", href: "/dashboard/goals" },
          { label: "FOO Progress", href: "/dashboard/foo" }
        ].map((item) => {
          const active = isActive(item.href);
          return /* @__PURE__ */ jsxs(
            Link,
            {
              href: item.href,
              className: `
                      flex items-center justify-between px-5 py-3.5 transition-colors
                      ${active ? "bg-[#e6f2fc] text-[#0060f0] font-medium" : "text-gray-800 hover:bg-gray-50"}
                    `,
              onClick: () => setMenuOpen(false),
              children: [
                /* @__PURE__ */ jsx("span", { children: item.label }),
                /* @__PURE__ */ jsx(ChevronRight, { className: `h-4 w-4 ${active ? "text-[#0060f0]" : "text-gray-400"}` })
              ]
            },
            item.href
          );
        }) }),
        /* @__PURE__ */ jsxs("div", { className: "border-t border-gray-200 py-2", children: [
          /* @__PURE__ */ jsxs(
            Link,
            {
              href: "/dashboard/settings",
              className: "flex items-center gap-3 px-5 py-3.5 text-gray-800 hover:bg-gray-50 transition-colors",
              onClick: () => setMenuOpen(false),
              children: [
                /* @__PURE__ */ jsx(Settings, { className: "h-5 w-5 text-gray-500" }),
                /* @__PURE__ */ jsx("span", { children: "Settings" })
              ]
            }
          ),
          /* @__PURE__ */ jsx("form", { action: "/api/auth/signout", method: "POST", children: /* @__PURE__ */ jsxs(
            "button",
            {
              type: "submit",
              className: "flex items-center gap-3 px-5 py-3.5 text-gray-800 hover:bg-gray-50 transition-colors w-full text-left",
              children: [
                /* @__PURE__ */ jsx(LogOut, { className: "h-5 w-5 text-gray-500" }),
                /* @__PURE__ */ jsx("span", { children: "Sign out" })
              ]
            }
          ) })
        ] })
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

const modes = [
  { value: "light", icon: Sun, label: "Light" },
  { value: "dark", icon: Moon, label: "Dark" },
  { value: "system", icon: Monitor, label: "System" }
];
function ThemeToggle() {
  const { mode, setMode } = useTheme();
  return /* @__PURE__ */ jsx("div", { className: "flex items-center gap-1 p-1 rounded-xl bg-theme-tertiary", children: modes.map(({ value, icon: Icon, label }) => /* @__PURE__ */ jsxs(
    "button",
    {
      onClick: () => setMode(value),
      className: `
            flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium
            transition-all duration-200
            ${mode === value ? "bg-theme-elevated text-theme-primary shadow-sm" : "text-theme-secondary hover:text-theme-primary"}
          `,
      title: label,
      children: [
        /* @__PURE__ */ jsx(Icon, { className: "h-4 w-4" }),
        /* @__PURE__ */ jsx("span", { className: "hidden sm:inline", children: label })
      ]
    },
    value
  )) });
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
  { name: "Paycheck Plan", href: "/dashboard/paycheck-plan", icon: Wallet },
  { name: "Bills", href: "/dashboard/bills", icon: Receipt },
  { name: "Debts", href: "/dashboard/debts", icon: CreditCard },
  { name: "Forecast", href: "/dashboard/pay-periods", icon: Calendar },
  { name: "Goals", href: "/dashboard/goals", icon: PiggyBank },
  { name: "FOO Plan", href: "/dashboard/foo", icon: Target }
];
const bottomNav = [
  { name: "Settings", href: "/dashboard/settings", icon: Settings }
];
function NavLink({ item, isActive }) {
  const Icon = item.icon;
  return /* @__PURE__ */ jsxs(
    Link,
    {
      href: item.href,
      "aria-current": isActive ? "page" : void 0,
      className: `
        group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
        transition-all duration-150
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2
        ${isActive ? "bg-[#e6f2fc] text-[#0060f0] dark:bg-[#0060f0]/15 dark:text-[#60a5fa]" : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"}
      `,
      children: [
        /* @__PURE__ */ jsx(Icon, { "aria-hidden": "true", className: `h-5 w-5 flex-shrink-0 ${isActive ? "" : "text-gray-500 dark:text-gray-400"}` }),
        /* @__PURE__ */ jsx("span", { className: "flex-1", children: item.name }),
        isActive && /* @__PURE__ */ jsx(ChevronRight, { "aria-hidden": "true", className: "h-4 w-4 opacity-60" })
      ]
    }
  );
}
function Sidebar({ currentPath = "" }) {
  return /* @__PURE__ */ jsx(ThemeProvider, { children: /* @__PURE__ */ jsxs("aside", { className: "hidden lg:flex h-screen w-64 flex-col bg-white border-r border-gray-200 dark:bg-[#1c2128] dark:border-[#30363d] sticky top-0", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 px-5 h-16 border-b border-gray-200 dark:border-[#30363d]", children: [
      /* @__PURE__ */ jsx(
        "button",
        {
          className: "p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors",
          "aria-label": "Menu",
          children: /* @__PURE__ */ jsx("svg", { className: "h-5 w-5 text-gray-600 dark:text-gray-400", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M4 6h16M4 12h16M4 18h16" }) })
        }
      ),
      /* @__PURE__ */ jsx(Link, { href: "/dashboard", className: "flex items-center gap-2.5 group", children: /* @__PURE__ */ jsx("div", { className: "w-8 h-8 rounded-lg bg-[#0060f0] flex items-center justify-center shadow-sm", children: /* @__PURE__ */ jsx("span", { className: "text-white font-bold text-sm", children: "OF" }) }) }),
      /* @__PURE__ */ jsx("div", { className: "flex-1" }),
      /* @__PURE__ */ jsx(
        Link,
        {
          href: "/dashboard/settings",
          className: "p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors",
          children: /* @__PURE__ */ jsx(User, { className: "h-5 w-5 text-gray-600 dark:text-gray-400" })
        }
      )
    ] }),
    /* @__PURE__ */ jsx("nav", { className: "flex-1 px-3 py-4 space-y-1 overflow-y-auto", children: navigation.map((item) => {
      const isActive = currentPath === item.href || item.href !== "/dashboard" && currentPath.startsWith(item.href);
      return /* @__PURE__ */ jsx(NavLink, { item, isActive }, item.name);
    }) }),
    /* @__PURE__ */ jsxs("div", { className: "px-3 py-4 border-t border-gray-200 dark:border-[#30363d] space-y-1", children: [
      bottomNav.map((item) => {
        const isActive = currentPath === item.href || item.href !== "/dashboard" && currentPath.startsWith(item.href);
        return /* @__PURE__ */ jsx(NavLink, { item, isActive }, item.name);
      }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between pt-3 px-1", children: [
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
    name: "Bills",
    href: "/dashboard/bills",
    icon: ArrowLeftRight,
    activeMatch: (path) => path.startsWith("/dashboard/bills") || path.startsWith("/dashboard/pay-periods")
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
    name: "More",
    href: "/dashboard/settings",
    icon: Menu,
    activeMatch: (path) => path.startsWith("/dashboard/settings")
  }
];
function BottomNav({ currentPath = "" }) {
  return /* @__PURE__ */ jsxs("nav", { className: "fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 dark:bg-[#1c2128] dark:border-[#30363d] lg:hidden", children: [
    /* @__PURE__ */ jsx("div", { className: "mx-auto flex justify-around items-center h-14 max-w-lg", children: navItems.map((item) => {
      const isActive = item.activeMatch(currentPath);
      const Icon = item.icon;
      return /* @__PURE__ */ jsxs(
        Link,
        {
          href: item.href,
          "aria-current": isActive ? "page" : void 0,
          "aria-label": item.name,
          className: `
                flex flex-col items-center justify-center gap-0.5 py-1.5 px-4 min-w-[56px] min-h-[44px]
                transition-colors duration-150
                ${isActive ? "text-[#0060f0] dark:text-[#60a5fa]" : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"}
              `,
          children: [
            /* @__PURE__ */ jsx(Icon, { "aria-hidden": "true", className: "h-5 w-5" }),
            /* @__PURE__ */ jsx("span", { className: `text-[10px] font-medium ${isActive ? "font-semibold" : ""}`, children: item.name })
          ]
        },
        item.name
      );
    }) }),
    /* @__PURE__ */ jsx("div", { className: "h-[env(safe-area-inset-bottom)]" })
  ] });
}

const quickCards = [
  {
    title: "Financial Order of Operations",
    icon: ListOrdered,
    href: "/dashboard/foo",
    description: "Follow the Money Guy's proven 9-step plan"
  },
  {
    title: "Debt Payoff Calculator",
    icon: Calculator,
    href: "/dashboard/debts",
    description: "Plan your path to debt freedom"
  },
  {
    title: "Emergency Fund Goal",
    icon: PiggyBank,
    href: "/dashboard/goals",
    description: "Build your 3-6 month safety net"
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
  return /* @__PURE__ */ jsxs("aside", { className: "w-72 space-y-4", children: [
    quickCards.map((card) => {
      const Icon = card.icon;
      return /* @__PURE__ */ jsx(
        Link,
        {
          href: card.href,
          className: "block bg-white dark:bg-[#1c2128] border border-gray-200 dark:border-[#30363d] rounded-xl p-4 hover:shadow-md transition-all duration-150 group",
          children: /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
              /* @__PURE__ */ jsx("h3", { className: "font-semibold text-gray-900 dark:text-gray-100 text-sm mb-1", children: card.title }),
              /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-2", children: [
                /* @__PURE__ */ jsx(Icon, { className: "h-5 w-5 text-[#0060f0] flex-shrink-0 mt-0.5" }),
                /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-600 dark:text-gray-400 leading-relaxed", children: card.description })
              ] })
            ] }),
            /* @__PURE__ */ jsx(ChevronRight, { className: "h-4 w-4 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors flex-shrink-0" })
          ] })
        },
        card.title
      );
    }),
    /* @__PURE__ */ jsxs("div", { className: "bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 rounded-xl p-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-2", children: [
        /* @__PURE__ */ jsx(Lightbulb, { className: "h-4 w-4 text-amber-600 dark:text-amber-400" }),
        /* @__PURE__ */ jsx("h3", { className: "font-semibold text-amber-900 dark:text-amber-200 text-xs uppercase tracking-wide", children: "Tip" })
      ] }),
      /* @__PURE__ */ jsx("p", { className: "text-sm text-amber-800 dark:text-amber-300 leading-relaxed", children: randomTip })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-white dark:bg-[#1c2128] border border-gray-200 dark:border-[#30363d] rounded-xl p-4", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-semibold text-gray-900 dark:text-gray-100 text-sm mb-3", children: "Resources" }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-2.5", children: [
        /* @__PURE__ */ jsxs(
          "a",
          {
            href: "https://www.moneyguy.com/foo",
            target: "_blank",
            rel: "noopener noreferrer",
            className: "flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 hover:text-[#0060f0] dark:hover:text-[#60a5fa] transition-colors",
            children: [
              /* @__PURE__ */ jsx("span", { children: "Learn about FOO" }),
              /* @__PURE__ */ jsx(ExternalLink, { className: "h-3.5 w-3.5" })
            ]
          }
        ),
        /* @__PURE__ */ jsxs(
          "a",
          {
            href: "https://www.reddit.com/r/personalfinance/wiki/commontopics",
            target: "_blank",
            rel: "noopener noreferrer",
            className: "flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 hover:text-[#0060f0] dark:hover:text-[#60a5fa] transition-colors",
            children: [
              /* @__PURE__ */ jsx("span", { children: "r/personalfinance wiki" }),
              /* @__PURE__ */ jsx(ExternalLink, { className: "h-3.5 w-3.5" })
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
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": title }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="min-h-screen bg-[#f5f6f7] dark:bg-[#0d1117]"> <!-- Mobile: Chase header --> <div class="lg:hidden"> ${renderComponent($$result2, "ChaseHeader", ChaseHeader, { "client:load": true, "currentPath": currentPath, "user": user, "client:component-hydration": "load", "client:component-path": "/Users/chris/projects/dev/openfinance/src/components/ui/chase-header", "client:component-export": "ChaseHeader" })} </div> <div class="flex"> <!-- Desktop: Sidebar --> ${renderComponent($$result2, "Sidebar", Sidebar, { "client:load": true, "currentPath": currentPath, "client:component-hydration": "load", "client:component-path": "/Users/chris/projects/dev/openfinance/src/components/ui/sidebar", "client:component-export": "Sidebar" })} <!-- Main content area --> <div class="flex-1 flex flex-col lg:flex-row gap-6 lg:gap-6"> <main class="flex-1 min-w-0"> <div class="max-w-3xl mx-auto px-4 pt-5 pb-20 lg:px-8 lg:pt-6 lg:pb-8"> ${renderSlot($$result2, $$slots["default"])} </div> </main> <!-- Desktop: Explore sidebar - Chase style --> ${showExploreSidebar && renderTemplate`<div class="hidden lg:block pr-6 pt-6 pb-6"> ${renderComponent($$result2, "ExploreSidebar", ExploreSidebar, {})} </div>`} </div> </div> <!-- Mobile: Bottom nav --> ${renderComponent($$result2, "BottomNav", BottomNav, { "client:load": true, "currentPath": currentPath, "client:component-hydration": "load", "client:component-path": "/Users/chris/projects/dev/openfinance/src/components/ui/bottom-nav", "client:component-export": "BottomNav" })} </div> ` })}`;
}, "/Users/chris/projects/dev/openfinance/src/layouts/DashboardLayout.astro", void 0);

export { $$DashboardLayout as $, Link as L, ThemeProvider as T, ThemeToggle as a, useTheme as u };
//# sourceMappingURL=DashboardLayout_BS33xuhQ.mjs.map
