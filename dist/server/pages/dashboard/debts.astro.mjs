import { e as createComponent, f as createAstro, k as renderComponent, r as renderTemplate } from '../../chunks/astro/server_B4LN2q8c.mjs';
import 'piccolore';
import { $ as $$DashboardLayout } from '../../chunks/DashboardLayout_BPgctkYE.mjs';
import { jsx, jsxs, Fragment } from 'react/jsx-runtime';
import { useState, useEffect } from 'react';
import { C as Card, a as CardHeader, b as CardTitle, c as CardContent, S as StatCard } from '../../chunks/card_XHmopkrD.mjs';
import { B as Button } from '../../chunks/button_VWZV24pY.mjs';
import { X, Target, TrendingUp, CheckCircle2, Plus, CreditCard, Wallet, TrendingDown, FileText, Home, Calendar, Banknote, GraduationCap, Car, DollarSign, Pencil, Trash2, AlertCircle, ArrowUpDown } from 'lucide-react';
import { S as SearchInput } from '../../chunks/search-input_DAvPwjoS.mjs';
import { g as getSession } from '../../chunks/get-session-astro_CVC6HSBT.mjs';
export { renderers } from '../../renderers.mjs';

function PaymentForm({
  debtId,
  debtName,
  currentBalance,
  minimumPayment,
  onClose
}) {
  const [amount, setAmount] = useState(minimumPayment.toString());
  const [date, setDate] = useState((/* @__PURE__ */ new Date()).toISOString().split("T")[0]);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch(`/api/debts/${debtId}/payments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: Number(amount), date, notes })
    });
    if (res.ok) {
      window.location.reload();
      onClose();
    } else {
      const data = await res.json();
      setError(data.error || "Failed to log payment");
    }
    setLoading(false);
  }
  return /* @__PURE__ */ jsx("div", { className: "fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4", children: /* @__PURE__ */ jsxs(Card, { className: "w-full max-w-md", children: [
    /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsxs(CardTitle, { children: [
      "Log Payment - ",
      debtName
    ] }) }),
    /* @__PURE__ */ jsx(CardContent, { children: /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { className: "block text-sm text-theme-secondary mb-1", children: "Amount" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "number",
            step: "0.01",
            min: "0.01",
            max: currentBalance,
            value: amount,
            onChange: (e) => setAmount(e.target.value),
            className: "w-full px-3 py-2 bg-theme-secondary border border-theme rounded-lg text-theme-primary focus:outline-none focus:ring-2 focus:ring-accent-500",
            required: true
          }
        ),
        /* @__PURE__ */ jsxs("p", { className: "text-xs text-theme-muted mt-1", children: [
          "Current balance: $",
          currentBalance.toFixed(2)
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { className: "block text-sm text-theme-secondary mb-1", children: "Date" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "date",
            value: date,
            onChange: (e) => setDate(e.target.value),
            className: "w-full px-3 py-2 bg-theme-secondary border border-theme rounded-lg text-theme-primary focus:outline-none focus:ring-2 focus:ring-accent-500",
            required: true
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { className: "block text-sm text-theme-secondary mb-1", children: "Notes (optional)" }),
        /* @__PURE__ */ jsx(
          "textarea",
          {
            value: notes,
            onChange: (e) => setNotes(e.target.value),
            rows: 2,
            className: "w-full px-3 py-2 bg-theme-secondary border border-theme rounded-lg text-theme-primary focus:outline-none focus:ring-2 focus:ring-accent-500 resize-none"
          }
        )
      ] }),
      error && /* @__PURE__ */ jsx("p", { className: "text-red-400 text-sm", children: error }),
      /* @__PURE__ */ jsxs("div", { className: "flex gap-3", children: [
        /* @__PURE__ */ jsx(
          Button,
          {
            type: "button",
            variant: "secondary",
            onClick: onClose,
            className: "flex-1",
            children: "Cancel"
          }
        ),
        /* @__PURE__ */ jsx(Button, { type: "submit", disabled: loading, className: "flex-1", children: loading ? "Saving..." : "Log Payment" })
      ] })
    ] }) })
  ] }) });
}

function calculateSnowball(debts) {
  const activeDebts = debts.filter(
    (d) => d.status !== "PAID_OFF" && Number(d.currentBalance) > 0
  );
  if (activeDebts.length === 0) {
    return null;
  }
  const sortedDebts = [...activeDebts].sort(
    (a, b) => Number(a.currentBalance) - Number(b.currentBalance)
  );
  sortedDebts.reduce(
    (sum, d) => sum + Number(d.minimumPayment),
    0
  );
  const totalBalance = sortedDebts.reduce(
    (sum, d) => sum + Number(d.currentBalance),
    0
  );
  const totalOriginal = debts.reduce((sum, d) => {
    if (d.status === "PAID_OFF") return sum;
    return sum + Number(d.currentBalance);
  }, 0);
  let debtStates = sortedDebts.map((d) => ({
    name: d.name,
    balance: Number(d.currentBalance),
    rate: Number(d.interestRate) / 100 / 12,
    minPayment: Number(d.minimumPayment),
    isPaidOff: false
  }));
  let months = 0;
  let totalInterestPaid = 0;
  let minPaymentInterest = 0;
  let extraPayment = 0;
  let firstPaidOff = null;
  const maxMonths = 360;
  while (debtStates.some((d) => !d.isPaidOff) && months < maxMonths) {
    months++;
    let availableExtra = extraPayment;
    for (const debt of debtStates) {
      if (debt.isPaidOff) continue;
      const interest = debt.balance * debt.rate;
      totalInterestPaid += interest;
      debt.balance += interest;
      let payment = debt.minPayment + availableExtra;
      availableExtra = 0;
      if (payment >= debt.balance) {
        payment = debt.balance;
        debt.isPaidOff = true;
        extraPayment += debt.minPayment;
        if (!firstPaidOff) {
          firstPaidOff = {
            name: debt.name,
            monthsUntilPaid: months,
            interestSaved: 0
          };
        }
      }
      debt.balance = Math.max(0, debt.balance - payment);
    }
  }
  for (const debt of sortedDebts) {
    let balance = Number(debt.currentBalance);
    const rate = Number(debt.interestRate) / 100 / 12;
    const minPayment = Number(debt.minimumPayment);
    for (let m = 0; m < maxMonths && balance > 0; m++) {
      const interest = balance * rate;
      minPaymentInterest += interest;
      balance = Math.max(0, balance + interest - minPayment);
    }
  }
  const interestSaved = Math.max(0, minPaymentInterest - totalInterestPaid);
  if (firstPaidOff) {
    firstPaidOff.interestSaved = Math.round(interestSaved / activeDebts.length);
  }
  const debtFreeDate = /* @__PURE__ */ new Date();
  debtFreeDate.setMonth(debtFreeDate.getMonth() + months);
  const paidOffDebts = debts.filter((d) => d.status === "PAID_OFF").length;
  const progressPercent = totalOriginal > 0 ? (totalOriginal - totalBalance) / totalOriginal * 100 : 0;
  return {
    debtFreeDate,
    totalInterestSaved: Math.round(interestSaved),
    nextDebtToPayOff: firstPaidOff,
    totalPaid: totalOriginal - totalBalance,
    progressPercent: Math.max(0, Math.min(100, progressPercent)),
    debtsEliminated: paidOffDebts,
    totalDebts: debts.length
  };
}
function formatCurrency$1(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  }).format(value);
}
function DebtFreedomCard({ debts }) {
  const [dismissed, setDismissed] = useState(false);
  const result = calculateSnowball(debts);
  if (!result || dismissed) {
    return null;
  }
  const { debtFreeDate, totalInterestSaved, nextDebtToPayOff, progressPercent } = result;
  const formattedDate = debtFreeDate.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric"
  });
  return /* @__PURE__ */ jsxs("div", { className: "relative overflow-hidden rounded-xl bg-gradient-to-br from-accent-500 via-accent-600 to-accent-700 dark:from-accent-700 dark:via-accent-700 dark:to-accent-800 text-white shadow-lg", children: [
    /* @__PURE__ */ jsx("div", { className: "absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" }),
    /* @__PURE__ */ jsx("div", { className: "absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" }),
    /* @__PURE__ */ jsx(
      "button",
      {
        onClick: () => setDismissed(true),
        className: "absolute top-3 right-3 p-1 rounded-full hover:bg-white/20 transition-colors",
        "aria-label": "Dismiss",
        children: /* @__PURE__ */ jsx(X, { className: "h-4 w-4 text-white/70" })
      }
    ),
    /* @__PURE__ */ jsxs("div", { className: "relative p-5", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-3", children: [
        /* @__PURE__ */ jsx("div", { className: "p-1.5 rounded-lg bg-white/20", children: /* @__PURE__ */ jsx(Target, { className: "h-4 w-4" }) }),
        /* @__PURE__ */ jsx("h3", { className: "font-semibold text-sm", children: "Debt Freedom Plan" })
      ] }),
      /* @__PURE__ */ jsx("p", { className: "text-white/80 text-sm mb-1", children: "Stay consistent and be debt-free by" }),
      /* @__PURE__ */ jsx("p", { className: "text-2xl font-bold tracking-tight mb-4", children: formattedDate }),
      /* @__PURE__ */ jsxs("div", { className: "mb-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-xs text-white/70 mb-1.5", children: [
          /* @__PURE__ */ jsxs("span", { children: [
            progressPercent.toFixed(0),
            "% paid off"
          ] }),
          totalInterestSaved > 0 && /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1", children: [
            /* @__PURE__ */ jsx(TrendingUp, { className: "h-3 w-3" }),
            "Save ",
            formatCurrency$1(totalInterestSaved),
            " in interest"
          ] })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "h-2 rounded-full bg-white/20 overflow-hidden", children: /* @__PURE__ */ jsx(
          "div",
          {
            className: "h-full rounded-full bg-white transition-all duration-500",
            style: { width: `${Math.max(progressPercent, 2)}%` }
          }
        ) })
      ] }),
      nextDebtToPayOff && /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 pt-3 border-t border-white/20", children: [
        /* @__PURE__ */ jsx(CheckCircle2, { className: "h-4 w-4 text-white/80 shrink-0" }),
        /* @__PURE__ */ jsxs("p", { className: "text-sm text-white/90", children: [
          /* @__PURE__ */ jsx("span", { className: "font-medium", children: "Next milestone:" }),
          " ",
          'Pay off "',
          nextDebtToPayOff.name,
          '" in ',
          nextDebtToPayOff.monthsUntilPaid,
          " month",
          nextDebtToPayOff.monthsUntilPaid !== 1 ? "s" : ""
        ] })
      ] })
    ] })
  ] });
}

const DEBT_TYPE_LABELS = {
  CREDIT_CARD: "Credit Card",
  AUTO_LOAN: "Auto Loan",
  STUDENT_LOAN: "Student Loan",
  PERSONAL_LOAN: "Personal Loan",
  BNPL: "BNPL",
  MORTGAGE: "Mortgage",
  OTHER: "Other"
};
const DEBT_TYPE_ICONS = {
  CREDIT_CARD: CreditCard,
  AUTO_LOAN: Car,
  STUDENT_LOAN: GraduationCap,
  PERSONAL_LOAN: Banknote,
  BNPL: Calendar,
  MORTGAGE: Home,
  OTHER: FileText
};
const STATUS_LABELS = {
  CURRENT: "Current",
  DEFERRED: "Deferred",
  PAST_DUE: "Past Due",
  IN_COLLECTIONS: "In Collections",
  PAID_OFF: "Paid Off"
};
function formatCurrency(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD"
  }).format(Number(value));
}
function getMonthlyPaymentMultiplier(frequency) {
  switch (frequency?.toLowerCase()) {
    case "weekly":
      return 52 / 12;
    case "biweekly":
      return 26 / 12;
    case "yearly":
      return 1 / 12;
    case "monthly":
    default:
      return 1;
  }
}
function calculatePayoffInfo(debt) {
  const balance = Number(debt.currentBalance);
  const rate = Number(debt.interestRate);
  const payment = Number(debt.minimumPayment);
  const isBNPL = debt.type === "BNPL";
  const isDeferred = debt.status === "DEFERRED";
  if (isBNPL && debt.scheduledPayments && debt.scheduledPayments.length > 0) {
    const unpaidPayments = debt.scheduledPayments.filter((p) => !p.isPaid);
    if (unpaidPayments.length === 0) {
      return { months: 0, date: "Paid Off", method: "fixed" };
    }
    const lastPayment = unpaidPayments[unpaidPayments.length - 1];
    const lastDate = new Date(lastPayment.dueDate);
    return {
      months: unpaidPayments.length,
      date: lastDate.toLocaleDateString("en-US", { month: "short", year: "numeric" }),
      method: "fixed"
    };
  }
  if (payment <= 0 || balance <= 0) {
    return { months: null, date: "N/A", method: "standard" };
  }
  const monthlyMultiplier = getMonthlyPaymentMultiplier(debt.paymentFrequency);
  const monthlyPayment = payment * monthlyMultiplier;
  let adjustedBalance = balance;
  if (isDeferred && debt.deferredUntil) {
    const deferredUntil = new Date(debt.deferredUntil);
    const now = /* @__PURE__ */ new Date();
    if (deferredUntil > now) {
      const monthsDeferred = Math.ceil((deferredUntil.getTime() - now.getTime()) / (1e3 * 60 * 60 * 24 * 30));
      const monthlyRate2 = rate / 100 / 12;
      adjustedBalance = balance * Math.pow(1 + monthlyRate2, monthsDeferred);
    }
  }
  const monthlyRate = rate / 100 / 12;
  if (monthlyRate === 0) {
    const months2 = Math.ceil(adjustedBalance / monthlyPayment);
    const date2 = /* @__PURE__ */ new Date();
    date2.setMonth(date2.getMonth() + months2);
    return {
      months: months2,
      date: date2.toLocaleDateString("en-US", { month: "short", year: "numeric" }),
      method: "no-interest"
    };
  }
  const monthlyInterest = adjustedBalance * monthlyRate;
  if (monthlyPayment <= monthlyInterest) {
    return { months: null, date: "Never (payment too low)", method: "standard" };
  }
  const months = Math.ceil(
    Math.log(monthlyPayment / (monthlyPayment - adjustedBalance * monthlyRate)) / Math.log(1 + monthlyRate)
  );
  const date = /* @__PURE__ */ new Date();
  date.setMonth(date.getMonth() + months);
  return {
    months,
    date: date.toLocaleDateString("en-US", { month: "short", year: "numeric" }),
    method: "amortized"
  };
}
function DebtsPageContent() {
  const [debts, setDebts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paymentDebt, setPaymentDebt] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const urlParams = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
  const urlSortField = urlParams?.get("sort");
  const urlSortDir = urlParams?.get("dir");
  const validSortFields = ["name", "interestRate", "effectiveRate", "currentBalance", "dueDay", "status"];
  const [sortField, setSortField] = useState(
    urlSortField && validSortFields.includes(urlSortField) ? urlSortField : "effectiveRate"
  );
  const [sortDirection, setSortDirection] = useState(
    urlSortDir === "asc" || urlSortDir === "desc" ? urlSortDir : "desc"
  );
  useEffect(() => {
    fetchDebts();
  }, []);
  async function fetchDebts() {
    const res = await fetch("/api/debts");
    if (res.ok) {
      const data = await res.json();
      const debtsWithDetails = await Promise.all(
        data.map(async (debt) => {
          const [paymentsRes, scheduledRes] = await Promise.all([
            fetch(`/api/debts/${debt.id}/payments`),
            fetch(`/api/debts/${debt.id}/scheduled-payments`)
          ]);
          const payments = paymentsRes.ok ? await paymentsRes.json() : [];
          const scheduledPayments = scheduledRes.ok ? await scheduledRes.json() : [];
          return { ...debt, payments, scheduledPayments };
        })
      );
      setDebts(debtsWithDetails);
    }
    setLoading(false);
  }
  function handleSort(field) {
    let newDirection;
    if (sortField === field) {
      newDirection = sortDirection === "asc" ? "desc" : "asc";
    } else {
      newDirection = field === "name" ? "asc" : "desc";
    }
    setSortField(field);
    setSortDirection(newDirection);
    const params = new URLSearchParams(window.location.search);
    params.set("sort", field);
    params.set("dir", newDirection);
    window.history.replaceState({}, "", `/dashboard/debts?${params.toString()}`);
  }
  const filteredDebts = debts.filter((debt) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return debt.name.toLowerCase().includes(query) || debt.type.toLowerCase().includes(query) || debt.status.toLowerCase().includes(query) || (debt.notes?.toLowerCase().includes(query) ?? false);
  });
  const sortedDebts = [...filteredDebts].sort((a, b) => {
    let aVal;
    let bVal;
    switch (sortField) {
      case "name":
        const comparison = a.name.localeCompare(b.name, void 0, { numeric: true, sensitivity: "base" });
        return sortDirection === "asc" ? comparison : -comparison;
      case "interestRate":
        aVal = Number(a.interestRate);
        bVal = Number(b.interestRate);
        break;
      case "effectiveRate":
        aVal = Math.max(Number(a.effectiveRate) || 0, Number(a.interestRate) || 0);
        bVal = Math.max(Number(b.effectiveRate) || 0, Number(b.interestRate) || 0);
        break;
      case "currentBalance":
        aVal = Number(a.currentBalance);
        bVal = Number(b.currentBalance);
        break;
      case "dueDay":
        aVal = a.dueDay;
        bVal = b.dueDay;
        break;
      case "status":
        aVal = a.status;
        bVal = b.status;
        break;
      default:
        return 0;
    }
    if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
    if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });
  function handlePaymentClose() {
    setPaymentDebt(null);
    fetchDebts();
  }
  async function handleDelete(id) {
    if (!confirm("Are you sure you want to delete this debt?")) return;
    const res = await fetch(`/api/debts/${id}`, { method: "DELETE" });
    if (res.ok) {
      setDebts(debts.filter((d) => d.id !== id));
    }
  }
  const totalDebt = debts.reduce((sum, d) => sum + Number(d.currentBalance), 0);
  const regularDebts = debts.filter((d) => d.type !== "BNPL");
  const bnplDebts = debts.filter((d) => d.type === "BNPL");
  const monthlyMinPayment = regularDebts.reduce((sum, d) => sum + Number(d.minimumPayment), 0);
  const bnplMonthlyEstimate = bnplDebts.reduce((sum, d) => {
    if (d.scheduledPayments && d.scheduledPayments.length > 0) {
      const unpaid = d.scheduledPayments.filter((p) => !p.isPaid);
      if (unpaid.length === 0) return sum;
      const now = /* @__PURE__ */ new Date();
      const in30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1e3);
      const paymentsThisMonth = unpaid.filter((p) => new Date(p.dueDate) <= in30Days);
      return sum + paymentsThisMonth.reduce((s, p) => s + Number(p.amount), 0);
    }
    return sum;
  }, 0);
  if (loading) {
    return /* @__PURE__ */ jsxs("div", { className: "space-y-6 lg:space-y-8 animate-fade-in", children: [
      /* @__PURE__ */ jsxs("header", { children: [
        /* @__PURE__ */ jsx("h1", { className: "text-2xl lg:text-3xl font-bold text-theme-primary tracking-tight", children: "Debts" }),
        /* @__PURE__ */ jsx("p", { className: "text-theme-secondary mt-1", children: "Track and manage your debts" })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: [1, 2, 3].map((i) => /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsx(CardContent, { className: "py-5", children: /* @__PURE__ */ jsxs("div", { className: "animate-pulse space-y-3", children: [
        /* @__PURE__ */ jsx("div", { className: "h-4 w-24 bg-theme-tertiary rounded" }),
        /* @__PURE__ */ jsx("div", { className: "h-8 w-32 bg-theme-tertiary rounded" })
      ] }) }) }, i)) })
    ] });
  }
  const SortButton = ({ field, label }) => /* @__PURE__ */ jsxs(
    "button",
    {
      onClick: () => handleSort(field),
      className: `
        flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
        transition-all duration-200
        ${sortField === field ? "bg-accent-600 text-white shadow-sm" : "bg-theme-tertiary text-theme-secondary hover:bg-theme-secondary hover:text-theme-primary"}
      `,
      children: [
        label,
        /* @__PURE__ */ jsx(ArrowUpDown, { className: "h-3 w-3" })
      ]
    }
  );
  return /* @__PURE__ */ jsxs("div", { className: "space-y-6 lg:space-y-8 animate-fade-in", children: [
    /* @__PURE__ */ jsxs("header", { className: "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h1", { className: "text-2xl lg:text-3xl font-bold text-theme-primary tracking-tight", children: "Debts" }),
        /* @__PURE__ */ jsx("p", { className: "text-theme-secondary mt-1", children: "Track and manage your debts" })
      ] }),
      /* @__PURE__ */ jsx("a", { href: "/dashboard/debts/new", children: /* @__PURE__ */ jsx(Button, { leftIcon: /* @__PURE__ */ jsx(Plus, { className: "h-4 w-4" }), children: "Add Debt" }) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: [
      /* @__PURE__ */ jsx(
        StatCard,
        {
          label: "Total Debt",
          value: formatCurrency(totalDebt),
          icon: /* @__PURE__ */ jsx(CreditCard, { className: "h-5 w-5" }),
          variant: "danger"
        }
      ),
      /* @__PURE__ */ jsx(
        StatCard,
        {
          label: "Monthly Payments",
          value: formatCurrency(monthlyMinPayment),
          icon: /* @__PURE__ */ jsx(Wallet, { className: "h-5 w-5" }),
          variant: "info"
        }
      ),
      /* @__PURE__ */ jsx(
        StatCard,
        {
          label: "BNPL Due This Month",
          value: formatCurrency(bnplMonthlyEstimate),
          icon: /* @__PURE__ */ jsx(TrendingDown, { className: "h-5 w-5" }),
          variant: "warning"
        }
      )
    ] }),
    debts.length > 0 && /* @__PURE__ */ jsx(DebtFreedomCard, { debts }),
    /* @__PURE__ */ jsxs("div", { className: "flex flex-col sm:flex-row gap-4", children: [
      /* @__PURE__ */ jsx(
        SearchInput,
        {
          value: searchQuery,
          onChange: setSearchQuery,
          placeholder: "Search debts...",
          className: "sm:max-w-xs"
        }
      ),
      /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [
        /* @__PURE__ */ jsx("span", { className: "text-theme-secondary text-sm font-medium", children: "Sort:" }),
        /* @__PURE__ */ jsx(SortButton, { field: "effectiveRate", label: "Effective Rate" }),
        /* @__PURE__ */ jsx(SortButton, { field: "interestRate", label: "APR" }),
        /* @__PURE__ */ jsx(SortButton, { field: "currentBalance", label: "Balance" }),
        /* @__PURE__ */ jsx(SortButton, { field: "name", label: "Name" })
      ] })
    ] }),
    debts.length === 0 ? /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsxs(CardContent, { className: "py-16 text-center", children: [
      /* @__PURE__ */ jsx("div", { className: "w-16 h-16 rounded-full bg-theme-tertiary flex items-center justify-center mx-auto mb-4", children: /* @__PURE__ */ jsx(CreditCard, { className: "h-8 w-8 text-theme-muted" }) }),
      /* @__PURE__ */ jsx("h3", { className: "text-lg font-semibold text-theme-primary mb-2", children: "No debts yet" }),
      /* @__PURE__ */ jsx("p", { className: "text-theme-secondary mb-6", children: "Start tracking your debts to monitor your progress" }),
      /* @__PURE__ */ jsx("a", { href: "/dashboard/debts/new", children: /* @__PURE__ */ jsx(Button, { leftIcon: /* @__PURE__ */ jsx(Plus, { className: "h-4 w-4" }), children: "Add Your First Debt" }) })
    ] }) }) : filteredDebts.length === 0 ? /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsxs(CardContent, { className: "py-16 text-center", children: [
      /* @__PURE__ */ jsx("div", { className: "w-16 h-16 rounded-full bg-theme-tertiary flex items-center justify-center mx-auto mb-4", children: /* @__PURE__ */ jsx(CreditCard, { className: "h-8 w-8 text-theme-muted" }) }),
      /* @__PURE__ */ jsx("h3", { className: "text-lg font-semibold text-theme-primary mb-2", children: "No results found" }),
      /* @__PURE__ */ jsxs("p", { className: "text-theme-secondary", children: [
        'No debts match "',
        searchQuery,
        '"'
      ] })
    ] }) }) : /* @__PURE__ */ jsx("div", { className: "space-y-3", children: sortedDebts.map((debt, index) => {
      const currentBalance = Number(debt.currentBalance);
      const originalBalance = Number(debt.originalBalance);
      const interestRate = Number(debt.interestRate);
      const effectiveRate = Number(debt.effectiveRate) || 0;
      const displayRate = Math.max(effectiveRate, interestRate);
      const progress = originalBalance > 0 ? (originalBalance - currentBalance) / originalBalance * 100 : 0;
      const payoffInfo = calculatePayoffInfo(debt);
      const isBNPL = debt.type === "BNPL";
      const hasEffectiveRate = isBNPL && effectiveRate > 0 && effectiveRate !== interestRate;
      const IconComponent = DEBT_TYPE_ICONS[debt.type] || FileText;
      const isPastDue = debt.status === "PAST_DUE" || debt.status === "IN_COLLECTIONS";
      return /* @__PURE__ */ jsx(
        Card,
        {
          className: `animate-fade-in-up stagger-${Math.min(index + 1, 5)} ${isPastDue ? "border-danger-300 dark:border-danger-600/50 bg-danger-50/50 dark:bg-danger-600/5" : ""}`,
          children: /* @__PURE__ */ jsxs(CardContent, { className: "py-5", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
              /* @__PURE__ */ jsx("div", { className: "p-2.5 rounded-lg bg-theme-tertiary shrink-0", children: /* @__PURE__ */ jsx(IconComponent, { className: "h-5 w-5 text-theme-secondary" }) }),
              /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
                /* @__PURE__ */ jsx("a", { href: `/dashboard/debts/${debt.id}`, className: "group", children: /* @__PURE__ */ jsx("h3", { className: "font-semibold text-theme-primary group-hover:text-accent-600 transition-colors truncate", children: debt.name }) }),
                /* @__PURE__ */ jsxs("p", { className: "text-sm text-theme-muted", children: [
                  DEBT_TYPE_LABELS[debt.type] || debt.type,
                  displayRate > 0 && ` · ${hasEffectiveRate ? `~${effectiveRate.toFixed(1)}%` : `${interestRate}%`} APR`,
                  isBNPL && displayRate === 0 && " · 0% APR",
                  debt.status !== "CURRENT" && ` · ${STATUS_LABELS[debt.status]}`
                ] })
              ] }),
              /* @__PURE__ */ jsx("div", { className: "text-right shrink-0", children: isPastDue ? /* @__PURE__ */ jsxs("div", { className: "px-3 py-1.5 rounded-lg bg-danger-100 dark:bg-danger-600/20 border border-danger-200 dark:border-danger-600/30", children: [
                /* @__PURE__ */ jsx("p", { className: "text-lg font-bold text-danger-700 dark:text-danger-400", children: formatCurrency(currentBalance) }),
                debt.pastDueAmount ? /* @__PURE__ */ jsxs("p", { className: "text-xs text-danger-600 dark:text-danger-400 font-medium", children: [
                  formatCurrency(Number(debt.pastDueAmount)),
                  " PAST DUE"
                ] }) : /* @__PURE__ */ jsx("p", { className: "text-xs text-danger-600 dark:text-danger-400", children: "PAST DUE" })
              ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
                /* @__PURE__ */ jsx("p", { className: "text-lg font-bold text-theme-primary", children: formatCurrency(currentBalance) }),
                /* @__PURE__ */ jsxs("p", { className: "text-xs text-theme-muted", children: [
                  formatCurrency(Number(debt.minimumPayment)),
                  "/mo"
                ] })
              ] }) }),
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1 shrink-0", children: [
                /* @__PURE__ */ jsx(Button, { size: "sm", variant: "ghost", onClick: () => setPaymentDebt(debt), children: /* @__PURE__ */ jsx(DollarSign, { className: "h-4 w-4" }) }),
                /* @__PURE__ */ jsx("a", { href: `/dashboard/debts/${debt.id}/edit?sort=${sortField}&dir=${sortDirection}`, children: /* @__PURE__ */ jsx(Button, { variant: "ghost", size: "sm", children: /* @__PURE__ */ jsx(Pencil, { className: "h-4 w-4" }) }) }),
                /* @__PURE__ */ jsx(Button, { variant: "ghost", size: "sm", onClick: () => handleDelete(debt.id), children: /* @__PURE__ */ jsx(Trash2, { className: "h-4 w-4" }) })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "mt-4", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-xs text-theme-muted mb-1.5", children: [
                /* @__PURE__ */ jsxs("span", { children: [
                  progress.toFixed(0),
                  "% paid off"
                ] }),
                /* @__PURE__ */ jsxs("span", { children: [
                  "Payoff: ",
                  payoffInfo.date
                ] })
              ] }),
              /* @__PURE__ */ jsx("div", { className: "progress-bar h-1.5", children: /* @__PURE__ */ jsx(
                "div",
                {
                  className: "progress-bar-fill",
                  style: { width: `${Math.min(progress, 100)}%` }
                }
              ) })
            ] }),
            isBNPL && debt.scheduledPayments && debt.scheduledPayments.filter((p) => !p.isPaid).length > 0 && /* @__PURE__ */ jsx("div", { className: "mt-4 pt-4 border-t border-theme", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4 text-sm", children: [
              /* @__PURE__ */ jsx("span", { className: "text-theme-muted", children: "Next payments:" }),
              /* @__PURE__ */ jsx("div", { className: "flex gap-3 flex-wrap", children: debt.scheduledPayments.filter((p) => !p.isPaid).slice(0, 3).map((payment) => /* @__PURE__ */ jsxs("span", { className: "text-theme-secondary", children: [
                new Date(payment.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
                /* @__PURE__ */ jsx("span", { className: "text-theme-primary font-medium ml-1", children: formatCurrency(Number(payment.amount)) })
              ] }, payment.id)) })
            ] }) }),
            debt.status === "DEFERRED" && debt.deferredUntil && /* @__PURE__ */ jsxs("div", { className: "mt-3 flex items-center gap-2 text-sm text-theme-muted", children: [
              /* @__PURE__ */ jsx(AlertCircle, { className: "h-4 w-4" }),
              /* @__PURE__ */ jsxs("span", { children: [
                "Deferred until ",
                new Date(debt.deferredUntil).toLocaleDateString()
              ] })
            ] })
          ] })
        },
        debt.id
      );
    }) }),
    paymentDebt && /* @__PURE__ */ jsx(
      PaymentForm,
      {
        debtId: paymentDebt.id,
        debtName: paymentDebt.name,
        currentBalance: Number(paymentDebt.currentBalance),
        minimumPayment: Number(paymentDebt.minimumPayment),
        onClose: handlePaymentClose
      }
    )
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
  return renderTemplate`${renderComponent($$result, "DashboardLayout", $$DashboardLayout, { "title": "Debts", "currentPath": "/dashboard/debts", "user": session.user, "showExploreSidebar": false }, { "default": async ($$result2) => renderTemplate` ${renderComponent($$result2, "DebtsPageContent", DebtsPageContent, { "client:load": true, "client:component-hydration": "load", "client:component-path": "/Users/chris/projects/dev/openfinance/src/components/pages/debts-page-content", "client:component-export": "default" })} ` })}`;
}, "/Users/chris/projects/dev/openfinance/src/pages/dashboard/debts/index.astro", void 0);

const $$file = "/Users/chris/projects/dev/openfinance/src/pages/dashboard/debts/index.astro";
const $$url = "/dashboard/debts";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
//# sourceMappingURL=debts.astro.mjs.map
