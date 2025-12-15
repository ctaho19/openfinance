import { e as createComponent, f as createAstro, k as renderComponent, r as renderTemplate, m as maybeRenderHead } from '../../chunks/astro/server_B4LN2q8c.mjs';
import 'piccolore';
import { L as Link, $ as $$DashboardLayout } from '../../chunks/DashboardLayout_Bq6NtJ36.mjs';
import { C as Card, c as CardContent, a as CardHeader, b as CardTitle, S as StatCard } from '../../chunks/card_XHmopkrD.mjs';
import { jsxs, jsx, Fragment } from 'react/jsx-runtime';
import { useState } from 'react';
import { B as Button } from '../../chunks/button_VWZV24pY.mjs';
import { S as SearchInput } from '../../chunks/search-input_DAvPwjoS.mjs';
import { MoreVertical, Pencil, Power, Trash2, ChevronDown, ChevronRight, Loader2, Check, Receipt, Plus, ShoppingBag, FileText, CreditCard, ShieldCheck, Landmark, Zap, Tv, Calendar } from 'lucide-react';
import { g as getSession } from '../../chunks/get-session-astro_CVC6HSBT.mjs';
import { p as prisma } from '../../chunks/auth-config_mz_UKjvQ.mjs';
export { renderers } from '../../renderers.mjs';

function Badge({
  children,
  variant = "default",
  size = "md",
  dot = false,
  pulse = false,
  className = ""
}) {
  const baseStyles = `
    inline-flex items-center gap-1.5
    font-medium rounded-full
    whitespace-nowrap
    transition-colors duration-200
  `;
  const variants = {
    default: "bg-theme-tertiary text-theme-secondary border border-theme",
    success: "bg-success-50 text-success-700 border border-success-200 dark:bg-success-600/15 dark:text-success-400 dark:border-success-600/30",
    warning: "bg-warning-50 text-warning-700 border border-warning-200 dark:bg-warning-600/15 dark:text-warning-400 dark:border-warning-600/30",
    danger: "bg-danger-50 text-danger-700 border border-danger-200 dark:bg-danger-600/15 dark:text-danger-400 dark:border-danger-600/30",
    info: "bg-info-50 text-info-700 border border-info-200 dark:bg-info-600/15 dark:text-info-400 dark:border-info-600/30",
    accent: "bg-accent-50 text-accent-700 border border-accent-200 dark:bg-accent-600/15 dark:text-accent-400 dark:border-accent-600/30"
  };
  const sizes = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-2.5 py-0.5 text-xs",
    lg: "px-3 py-1 text-sm"
  };
  const dotColors = {
    default: "bg-theme-muted",
    success: "bg-success-500",
    warning: "bg-warning-500",
    danger: "bg-danger-500",
    info: "bg-info-500",
    accent: "bg-accent-500"
  };
  return /* @__PURE__ */ jsxs("span", { className: `${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`, children: [
    dot && /* @__PURE__ */ jsx("span", { className: `w-1.5 h-1.5 rounded-full ${dotColors[variant]} ${pulse ? "animate-pulse-subtle" : ""}` }),
    children
  ] });
}

function BillActions({ bill }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const handleToggleActive = async () => {
    await fetch(`/api/bills/${bill.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !bill.isActive })
    });
    window.location.reload();
    setIsOpen(false);
  };
  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete "${bill.name}"?`)) return;
    setIsDeleting(true);
    await fetch(`/api/bills/${bill.id}`, { method: "DELETE" });
    window.location.reload();
    setIsOpen(false);
    setIsDeleting(false);
  };
  return /* @__PURE__ */ jsxs("div", { className: "relative", children: [
    /* @__PURE__ */ jsx(
      Button,
      {
        variant: "ghost",
        size: "sm",
        onClick: () => setIsOpen(!isOpen),
        className: "h-8 w-8 p-0",
        children: /* @__PURE__ */ jsx(MoreVertical, { className: "h-4 w-4" })
      }
    ),
    isOpen && /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx(
        "div",
        {
          className: "fixed inset-0 z-10",
          onClick: () => setIsOpen(false)
        }
      ),
      /* @__PURE__ */ jsxs("div", { className: "absolute right-0 top-full mt-1 z-20 w-48 rounded-lg bg-theme-secondary border border-theme shadow-lg py-1", children: [
        /* @__PURE__ */ jsxs(
          "a",
          {
            href: `/dashboard/bills/${bill.id}/edit`,
            onClick: () => setIsOpen(false),
            className: "flex items-center gap-2 w-full px-4 py-2 text-sm text-theme-secondary hover:bg-theme-tertiary hover:text-theme-primary",
            children: [
              /* @__PURE__ */ jsx(Pencil, { className: "h-4 w-4" }),
              "Edit"
            ]
          }
        ),
        /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: handleToggleActive,
            className: "flex items-center gap-2 w-full px-4 py-2 text-sm text-theme-secondary hover:bg-theme-tertiary hover:text-theme-primary",
            children: [
              /* @__PURE__ */ jsx(Power, { className: "h-4 w-4" }),
              bill.isActive ? "Deactivate" : "Activate"
            ]
          }
        ),
        /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: handleDelete,
            disabled: isDeleting,
            className: "flex items-center gap-2 w-full px-4 py-2 text-sm text-red-400 hover:bg-theme-tertiary hover:text-red-300",
            children: [
              /* @__PURE__ */ jsx(Trash2, { className: "h-4 w-4" }),
              isDeleting ? "Deleting..." : "Delete"
            ]
          }
        )
      ] })
    ] })
  ] });
}

function BNPLGroup({ group }) {
  const [expanded, setExpanded] = useState(false);
  const [loadingPayments, setLoadingPayments] = useState(/* @__PURE__ */ new Set());
  const handleTogglePayment = async (paymentId) => {
    setLoadingPayments((prev) => new Set(prev).add(paymentId));
    try {
      const response = await fetch(`/api/bill-payments/${paymentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ togglePaid: true })
      });
      if (response.ok) {
        window.location.reload();
      }
    } catch (error) {
      console.error("Failed to toggle payment:", error);
    } finally {
      setLoadingPayments((prev) => {
        const next = new Set(prev);
        next.delete(paymentId);
        return next;
      });
    }
  };
  const progressPercent = group.paidCount / group.totalCount * 100;
  const isComplete = group.paidCount === group.totalCount;
  return /* @__PURE__ */ jsxs("div", { className: "rounded-lg bg-theme-secondary overflow-hidden", children: [
    /* @__PURE__ */ jsxs(
      "button",
      {
        onClick: () => setExpanded(!expanded),
        className: "w-full flex items-center justify-between py-3 px-4 hover:bg-theme-tertiary transition-colors",
        children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
            expanded ? /* @__PURE__ */ jsx(ChevronDown, { className: "h-4 w-4 text-theme-muted" }) : /* @__PURE__ */ jsx(ChevronRight, { className: "h-4 w-4 text-theme-muted" }),
            /* @__PURE__ */ jsxs("div", { className: "text-left", children: [
              /* @__PURE__ */ jsx("p", { className: "font-medium text-theme-primary", children: group.debtName }),
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-sm text-theme-secondary", children: [
                /* @__PURE__ */ jsxs("span", { children: [
                  group.paidCount,
                  " of ",
                  group.totalCount,
                  " payments"
                ] }),
                isComplete ? /* @__PURE__ */ jsx(Badge, { variant: "success", children: "Paid Off" }) : group.nextPayment && /* @__PURE__ */ jsxs("span", { className: "text-theme-muted", children: [
                  "• Next: $",
                  group.nextPayment.amount.toFixed(2),
                  " on",
                  " ",
                  new Date(group.nextPayment.dueDate).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric"
                  })
                ] })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
            /* @__PURE__ */ jsxs("div", { className: "text-right", children: [
              /* @__PURE__ */ jsxs("p", { className: "text-lg font-semibold text-theme-primary", children: [
                "$",
                (group.totalAmount - group.bills.filter((b) => b.payments[0]?.status === "PAID").reduce((s, b) => s + Number(b.amount), 0)).toFixed(2)
              ] }),
              /* @__PURE__ */ jsx("p", { className: "text-xs text-theme-muted", children: "remaining" })
            ] }),
            /* @__PURE__ */ jsx("div", { className: "w-24 h-2 bg-theme-tertiary rounded-full overflow-hidden", children: /* @__PURE__ */ jsx(
              "div",
              {
                className: "h-full bg-accent-500 transition-all duration-300",
                style: { width: `${progressPercent}%` }
              }
            ) })
          ] })
        ]
      }
    ),
    expanded && /* @__PURE__ */ jsx("div", { className: "border-t border-theme px-4 py-2 space-y-2", children: group.bills.map((bill, index) => {
      const payment = bill.payments[0];
      const isPaid = payment?.status === "PAID";
      const isLoading = payment && loadingPayments.has(payment.id);
      const dueDate = payment?.dueDate ? new Date(payment.dueDate) : null;
      return /* @__PURE__ */ jsxs(
        "div",
        {
          className: `flex items-center justify-between py-2 px-3 rounded ${isPaid ? "opacity-60" : ""}`,
          children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
              payment && /* @__PURE__ */ jsx(
                "button",
                {
                  onClick: () => handleTogglePayment(payment.id),
                  disabled: isLoading,
                  className: `flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${isPaid ? "bg-accent-500 border-accent-500 text-white" : "border-theme-muted hover:border-accent-500 text-transparent hover:text-accent-500"} ${isLoading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`,
                  title: isPaid ? "Mark as unpaid" : "Mark as paid",
                  children: isLoading ? /* @__PURE__ */ jsx(Loader2, { className: "h-3 w-3 animate-spin text-theme-muted" }) : /* @__PURE__ */ jsx(Check, { className: "h-3 w-3" })
                }
              ),
              /* @__PURE__ */ jsxs("span", { className: "text-sm text-theme-secondary", children: [
                "Payment ",
                index + 1
              ] }),
              dueDate && /* @__PURE__ */ jsx("span", { className: "text-xs text-theme-muted", children: dueDate.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric"
              }) })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxs("span", { className: `text-sm font-medium ${isPaid ? "text-theme-muted line-through" : "text-theme-primary"}`, children: [
                "$",
                Number(bill.amount).toFixed(2)
              ] }),
              isPaid && /* @__PURE__ */ jsx(Badge, { variant: "success", className: "text-xs", children: "Paid" })
            ] })
          ]
        },
        bill.id
      );
    }) })
  ] });
}

const categoryLabels = {
  SUBSCRIPTION: "Subscriptions",
  UTILITY: "Utilities",
  LOAN: "Loans",
  BNPL: "Buy Now Pay Later",
  INSURANCE: "Insurance",
  CREDIT_CARD: "Credit Cards",
  OTHER: "Other"
};
const categoryIcons = {
  SUBSCRIPTION: Tv,
  UTILITY: Zap,
  LOAN: Landmark,
  BNPL: ShoppingBag,
  INSURANCE: ShieldCheck,
  CREDIT_CARD: CreditCard,
  OTHER: FileText
};
function formatFrequency(frequency, isRecurring) {
  if (!isRecurring) return "One-time";
  const labels = {
    ONCE: "One-time",
    WEEKLY: "Weekly",
    BIWEEKLY: "Bi-weekly",
    MONTHLY: "Monthly",
    YEARLY: "Yearly"
  };
  return labels[frequency] || frequency;
}
function formatDueDate(bill) {
  if (!bill.isRecurring && bill.payments.length > 0) {
    const dueDate = new Date(bill.payments[0].dueDate);
    return dueDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  }
  return `Day ${bill.dueDay}`;
}
function BillsList({ regularBills, bnplGroups }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [loadingPayments, setLoadingPayments] = useState(/* @__PURE__ */ new Set());
  const handleTogglePayment = async (paymentId) => {
    setLoadingPayments((prev) => new Set(prev).add(paymentId));
    try {
      const response = await fetch(`/api/bill-payments/${paymentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ togglePaid: true })
      });
      if (response.ok) {
        window.location.reload();
      }
    } catch (error) {
      console.error("Failed to toggle payment:", error);
    } finally {
      setLoadingPayments((prev) => {
        const next = new Set(prev);
        next.delete(paymentId);
        return next;
      });
    }
  };
  const categories = Object.keys(regularBills);
  const filteredRegularBills = {};
  for (const category of categories) {
    const filtered = regularBills[category].filter((bill) => {
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      return bill.name.toLowerCase().includes(query) || bill.category.toLowerCase().includes(query) || (bill.notes?.toLowerCase().includes(query) ?? false) || (bill.debt?.name.toLowerCase().includes(query) ?? false);
    });
    if (filtered.length > 0) {
      filteredRegularBills[category] = filtered;
    }
  }
  const filteredBnplGroups = bnplGroups.filter((group) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return group.debtName.toLowerCase().includes(query) || group.bills.some((bill) => bill.name.toLowerCase().includes(query));
  });
  const filteredCategories = Object.keys(filteredRegularBills);
  const hasResults = filteredCategories.length > 0 || filteredBnplGroups.length > 0;
  return /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsx(
      SearchInput,
      {
        value: searchQuery,
        onChange: setSearchQuery,
        placeholder: "Search bills...",
        className: "max-w-md"
      }
    ),
    !hasResults && searchQuery ? /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsxs(CardContent, { className: "py-16 text-center", children: [
      /* @__PURE__ */ jsx("div", { className: "w-16 h-16 rounded-full bg-theme-tertiary flex items-center justify-center mx-auto mb-4", children: /* @__PURE__ */ jsx(Receipt, { className: "h-8 w-8 text-theme-muted" }) }),
      /* @__PURE__ */ jsx("h3", { className: "text-lg font-semibold text-theme-primary mb-2", children: "No bills found" }),
      /* @__PURE__ */ jsxs("p", { className: "text-theme-secondary", children: [
        'No bills match "',
        searchQuery,
        '"'
      ] })
    ] }) }) : !hasResults ? /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsxs(CardContent, { className: "py-16 text-center", children: [
      /* @__PURE__ */ jsx("div", { className: "w-16 h-16 rounded-full bg-theme-tertiary flex items-center justify-center mx-auto mb-4", children: /* @__PURE__ */ jsx(Receipt, { className: "h-8 w-8 text-theme-muted" }) }),
      /* @__PURE__ */ jsx("h3", { className: "text-lg font-semibold text-theme-primary mb-2", children: "No bills yet" }),
      /* @__PURE__ */ jsx("p", { className: "text-theme-secondary mb-6", children: "Add your first bill to start tracking your expenses" }),
      /* @__PURE__ */ jsx(Link, { href: "/dashboard/bills/new", children: /* @__PURE__ */ jsx(Button, { leftIcon: /* @__PURE__ */ jsx(Plus, { className: "h-4 w-4" }), children: "Add Your First Bill" }) })
    ] }) }) : /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
      filteredBnplGroups.length > 0 && /* @__PURE__ */ jsxs(Card, { children: [
        /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsx("div", { className: "p-2 rounded-xl bg-theme-tertiary", children: /* @__PURE__ */ jsx(ShoppingBag, { className: "h-5 w-5 text-theme-secondary" }) }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(CardTitle, { children: "Buy Now Pay Later" }),
            /* @__PURE__ */ jsxs("p", { className: "text-sm text-theme-secondary mt-0.5", children: [
              filteredBnplGroups.length,
              " active plan",
              filteredBnplGroups.length !== 1 ? "s" : ""
            ] })
          ] })
        ] }) }),
        /* @__PURE__ */ jsx(CardContent, { noPadding: true, children: /* @__PURE__ */ jsx("div", { className: "divide-y divide-theme", children: filteredBnplGroups.map((group) => /* @__PURE__ */ jsx(BNPLGroup, { group }, group.debtId)) }) })
      ] }),
      filteredCategories.map((category, categoryIndex) => {
        const IconComponent = categoryIcons[category];
        return /* @__PURE__ */ jsxs(Card, { className: `animate-fade-in-up stagger-${categoryIndex + 1}`, children: [
          /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
            /* @__PURE__ */ jsx("div", { className: "p-2 rounded-xl bg-theme-tertiary", children: /* @__PURE__ */ jsx(IconComponent, { className: "h-5 w-5 text-theme-secondary" }) }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx(CardTitle, { children: categoryLabels[category] }),
              /* @__PURE__ */ jsxs("p", { className: "text-sm text-theme-secondary mt-0.5", children: [
                filteredRegularBills[category].length,
                " bill",
                filteredRegularBills[category].length !== 1 ? "s" : ""
              ] })
            ] })
          ] }) }),
          /* @__PURE__ */ jsx(CardContent, { noPadding: true, children: /* @__PURE__ */ jsx("div", { className: "divide-y divide-theme", children: filteredRegularBills[category].map((bill) => {
            const nextPayment = bill.payments[0];
            const isPaid = nextPayment?.status === "PAID";
            const isLoading = nextPayment && loadingPayments.has(nextPayment.id);
            return /* @__PURE__ */ jsxs(
              "div",
              {
                className: `flex items-center justify-between py-4 px-6 hover:bg-theme-secondary/50 transition-colors ${!bill.isActive ? "opacity-50" : ""}`,
                children: [
                  /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
                    nextPayment && /* @__PURE__ */ jsx(
                      "button",
                      {
                        onClick: () => handleTogglePayment(nextPayment.id),
                        disabled: isLoading,
                        className: `flex-shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${isPaid ? "bg-accent-500 border-accent-500 text-white" : "border-theme-muted hover:border-accent-500 text-transparent hover:text-accent-500"} ${isLoading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`,
                        title: isPaid ? "Mark as unpaid" : "Mark as paid",
                        children: isLoading ? /* @__PURE__ */ jsx(Loader2, { className: "h-4 w-4 animate-spin text-theme-muted" }) : /* @__PURE__ */ jsx(Check, { className: "h-4 w-4" })
                      }
                    ),
                    /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
                      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [
                        /* @__PURE__ */ jsx("p", { className: `font-medium ${isPaid ? "text-theme-muted line-through" : "text-theme-primary"}`, children: bill.name }),
                        !bill.isActive && /* @__PURE__ */ jsx(Badge, { variant: "default", size: "sm", children: "Inactive" }),
                        bill.debt && /* @__PURE__ */ jsx(Badge, { variant: "warning", size: "sm", children: "Linked to debt" }),
                        isPaid && /* @__PURE__ */ jsx(Badge, { variant: "success", size: "sm", children: "Paid" })
                      ] }),
                      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 mt-1 text-sm text-theme-secondary", children: [
                        /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1", children: [
                          /* @__PURE__ */ jsx(Calendar, { className: "h-3 w-3" }),
                          formatDueDate(bill)
                        ] }),
                        /* @__PURE__ */ jsx("span", { className: "text-theme-muted", children: "•" }),
                        /* @__PURE__ */ jsx("span", { children: formatFrequency(bill.frequency, bill.isRecurring) })
                      ] })
                    ] })
                  ] }),
                  /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
                    /* @__PURE__ */ jsxs("p", { className: `text-lg font-semibold ${isPaid ? "text-theme-muted" : "text-theme-primary"}`, children: [
                      "$",
                      Number(bill.amount).toFixed(2)
                    ] }),
                    /* @__PURE__ */ jsx(BillActions, { bill: { id: bill.id, name: bill.name, isActive: bill.isActive } })
                  ] })
                ]
              },
              bill.id
            );
          }) }) })
        ] }, category);
      })
    ] })
  ] });
}

const $$Astro = createAstro();
const $$Index = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Index;
  const session = await getSession(Astro2.request);
  if (!session?.user?.id) {
    return Astro2.redirect("/login");
  }
  function toBillDTO(bill) {
    return {
      id: bill.id,
      name: bill.name,
      category: bill.category,
      amount: Number(bill.amount),
      dueDay: bill.dueDay,
      isRecurring: bill.isRecurring,
      frequency: bill.frequency,
      debtId: bill.debtId,
      notes: bill.notes,
      isActive: bill.isActive,
      debt: bill.debt ? { id: bill.debt.id, name: bill.debt.name } : null,
      payments: bill.payments.map((p) => ({
        id: p.id,
        dueDate: p.dueDate.toISOString(),
        status: p.status
      }))
    };
  }
  const bills = await prisma.bill.findMany({
    where: { userId: session.user.id },
    include: {
      debt: { select: { id: true, name: true } },
      payments: {
        select: { id: true, dueDate: true, status: true },
        orderBy: { dueDate: "asc" }
      }
    },
    orderBy: [{ category: "asc" }, { dueDay: "asc" }]
  });
  const regularBills = {};
  const bnplByDebt = {};
  for (const bill of bills) {
    if (bill.category === "BNPL") {
      const key = bill.debtId || "ungrouped";
      if (!bnplByDebt[key]) {
        bnplByDebt[key] = [];
      }
      bnplByDebt[key].push(bill);
    } else {
      const category = bill.category;
      if (!regularBills[category]) {
        regularBills[category] = [];
      }
      regularBills[category].push(toBillDTO(bill));
    }
  }
  const bnplGroups = Object.entries(bnplByDebt).map(([debtId, debtBills]) => {
    const sortedBills = debtBills.sort((a, b) => {
      const aDate = a.payments[0]?.dueDate ? new Date(a.payments[0].dueDate).getTime() : 0;
      const bDate = b.payments[0]?.dueDate ? new Date(b.payments[0].dueDate).getTime() : 0;
      return aDate - bDate;
    });
    const paidCount = sortedBills.filter(
      (b) => b.payments.length > 0 && b.payments[0].status === "PAID"
    ).length;
    const unpaidBill = sortedBills.find(
      (b) => b.payments.length > 0 && b.payments[0].status !== "PAID"
    );
    return {
      debtId,
      debtName: debtBills[0].debt?.name || "Unknown BNPL",
      bills: sortedBills.map(toBillDTO),
      totalAmount: sortedBills.reduce((sum, b) => sum + Number(b.amount), 0),
      paidCount,
      totalCount: sortedBills.length,
      nextPayment: unpaidBill ? {
        amount: Number(unpaidBill.amount),
        dueDate: unpaidBill.payments[0].dueDate.toISOString()
      } : null
    };
  });
  bnplGroups.sort((a, b) => {
    if (!a.nextPayment) return 1;
    if (!b.nextPayment) return -1;
    return new Date(a.nextPayment.dueDate).getTime() - new Date(b.nextPayment.dueDate).getTime();
  });
  const totalMonthly = Object.values(regularBills).flat().filter((b) => b.isActive && b.frequency === "MONTHLY").reduce((sum, b) => sum + Number(b.amount), 0);
  const totalBNPLRemaining = bnplGroups.reduce((sum, g) => {
    const remaining = g.bills.filter((b) => b.payments.length > 0 && b.payments[0].status !== "PAID").reduce((s, b) => s + Number(b.amount), 0);
    return sum + remaining;
  }, 0);
  const totalBillCount = Object.values(regularBills).flat().length + bnplGroups.reduce((sum, g) => sum + g.bills.length, 0);
  return renderTemplate`${renderComponent($$result, "DashboardLayout", $$DashboardLayout, { "title": "Bills", "currentPath": "/dashboard/bills", "user": session.user, "showExploreSidebar": false }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="space-y-6 lg:space-y-8 animate-fade-in"> <header class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"> <div> <h1 class="text-2xl lg:text-3xl font-bold text-theme-primary tracking-tight">Bills</h1> <p class="text-theme-secondary mt-1">
Manage your recurring bills and payments
</p> </div> <a href="/dashboard/bills/new" class="inline-flex items-center gap-2 px-4 py-2 bg-accent-600 hover:bg-accent-700 text-white rounded-xl font-medium transition-colors"> <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"> <path d="M5 12h14"></path> <path d="M12 5v14"></path> </svg>
Add Bill
</a> </header> <div class="grid grid-cols-1 md:grid-cols-3 gap-4"> ${renderComponent($$result2, "StatCard", StatCard, { "client:visible": true, "label": "Monthly Recurring", "value": `$${totalMonthly.toLocaleString(void 0, { minimumFractionDigits: 2 })}`, "iconName": "receipt", "variant": "info", "client:component-hydration": "visible", "client:component-path": "/Users/chris/projects/dev/openfinance/src/components/ui/card", "client:component-export": "StatCard" })} ${renderComponent($$result2, "StatCard", StatCard, { "client:visible": true, "label": "BNPL Remaining", "value": `$${totalBNPLRemaining.toLocaleString(void 0, { minimumFractionDigits: 2 })}`, "iconName": "credit-card", "variant": "warning", "client:component-hydration": "visible", "client:component-path": "/Users/chris/projects/dev/openfinance/src/components/ui/card", "client:component-export": "StatCard" })} ${renderComponent($$result2, "StatCard", StatCard, { "client:visible": true, "label": "Active Bills", "value": totalBillCount.toString(), "iconName": "trending-down", "variant": "success", "client:component-hydration": "visible", "client:component-path": "/Users/chris/projects/dev/openfinance/src/components/ui/card", "client:component-export": "StatCard" })} </div> ${renderComponent($$result2, "BillsList", BillsList, { "client:load": true, "regularBills": regularBills, "bnplGroups": bnplGroups, "client:component-hydration": "load", "client:component-path": "@/components/bills/bills-list", "client:component-export": "BillsList" })} </div> ` })}`;
}, "/Users/chris/projects/dev/openfinance/src/pages/dashboard/bills/index.astro", void 0);

const $$file = "/Users/chris/projects/dev/openfinance/src/pages/dashboard/bills/index.astro";
const $$url = "/dashboard/bills";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
//# sourceMappingURL=bills.astro.mjs.map
