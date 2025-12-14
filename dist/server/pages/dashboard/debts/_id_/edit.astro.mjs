import { e as createComponent, f as createAstro, k as renderComponent, r as renderTemplate } from '../../../../chunks/astro/server_B4LN2q8c.mjs';
import 'piccolore';
import { $ as $$DashboardLayout } from '../../../../chunks/DashboardLayout_CdcQ6Wnq.mjs';
import { jsx, jsxs } from 'react/jsx-runtime';
import { useState, useEffect } from 'react';
import { C as Card, a as CardHeader, b as CardTitle, c as CardContent } from '../../../../chunks/card_XHmopkrD.mjs';
import { B as Button } from '../../../../chunks/button_VWZV24pY.mjs';
import { B as BankSelector } from '../../../../chunks/bank-badge_CrB3W5ys.mjs';
import { Loader2, ArrowLeft } from 'lucide-react';
import { g as getSession } from '../../../../chunks/get-session-astro_CVC6HSBT.mjs';
export { renderers } from '../../../../renderers.mjs';

const DEBT_TYPES = [
  { value: "CREDIT_CARD", label: "Credit Card" },
  { value: "AUTO_LOAN", label: "Auto Loan" },
  { value: "STUDENT_LOAN", label: "Student Loan" },
  { value: "PERSONAL_LOAN", label: "Personal Loan" },
  { value: "BNPL", label: "Buy Now Pay Later" },
  { value: "MORTGAGE", label: "Mortgage" },
  { value: "OTHER", label: "Other" }
];
const DEBT_STATUSES = [
  { value: "CURRENT", label: "Current" },
  { value: "DEFERRED", label: "Deferred" },
  { value: "PAST_DUE", label: "Past Due" },
  { value: "IN_COLLECTIONS", label: "In Collections" },
  { value: "PAID_OFF", label: "Paid Off" }
];
function EditDebtForm({ debtId }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [debt, setDebt] = useState(null);
  const [bankAccounts, setBankAccounts] = useState([]);
  const [selectedBankAccountId, setSelectedBankAccountId] = useState("");
  useEffect(() => {
    Promise.all([
      fetch(`/api/debts/${debtId}`).then((res) => res.json()),
      fetch("/api/bank-accounts").then((res) => res.json())
    ]).then(([debtData, accountsData]) => {
      if (debtData.error) {
        setError(debtData.error);
      } else {
        setDebt(debtData);
        setSelectedBankAccountId(debtData.bankAccountId || "");
      }
      if (Array.isArray(accountsData)) {
        setBankAccounts(accountsData);
      }
      setLoading(false);
    }).catch(() => {
      setError("Failed to load debt");
      setLoading(false);
    });
  }, [debtId]);
  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name"),
      type: formData.get("type"),
      currentBalance: parseFloat(formData.get("currentBalance")),
      originalBalance: parseFloat(formData.get("originalBalance")),
      interestRate: parseFloat(formData.get("interestRate")),
      minimumPayment: parseFloat(formData.get("minimumPayment")),
      dueDay: parseInt(formData.get("dueDay"), 10),
      status: formData.get("status"),
      notes: formData.get("notes") || null,
      bankAccountId: selectedBankAccountId || null
    };
    const res = await fetch(`/api/debts/${debtId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
    if (res.ok) {
      const url = new URL(window.location.href);
      const sort = url.searchParams.get("sort") || "name";
      const dir = url.searchParams.get("dir") || "asc";
      window.location.href = `/dashboard/debts?sort=${sort}&dir=${dir}`;
    } else {
      const result = await res.json();
      setError(result.error || "Failed to update debt");
      setSaving(false);
    }
  }
  const inputClasses = "w-full px-4 py-2 bg-theme-secondary border border-theme rounded-xl text-theme-primary placeholder-theme-muted focus:outline-none focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500";
  const labelClasses = "block text-sm font-medium text-theme-secondary mb-2";
  if (loading) {
    return /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center py-12", children: /* @__PURE__ */ jsx(Loader2, { className: "h-8 w-8 animate-spin text-accent-500" }) });
  }
  if (!debt) {
    return /* @__PURE__ */ jsxs("div", { className: "text-center py-12", children: [
      /* @__PURE__ */ jsx("p", { className: "text-theme-secondary", children: "Debt not found" }),
      /* @__PURE__ */ jsx("a", { href: "/dashboard/debts", className: "text-accent-500 hover:underline mt-2 inline-block", children: "Back to debts" })
    ] });
  }
  const isBNPL = debt.type === "BNPL";
  return /* @__PURE__ */ jsxs("div", { className: "animate-fade-in max-w-2xl mx-auto space-y-6 lg:space-y-8", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
      /* @__PURE__ */ jsx("a", { href: "/dashboard/debts", children: /* @__PURE__ */ jsx(Button, { variant: "ghost", size: "sm", leftIcon: /* @__PURE__ */ jsx(ArrowLeft, { className: "h-4 w-4" }), children: "Back" }) }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold text-theme-primary", children: "Edit Debt" }),
        /* @__PURE__ */ jsx("p", { className: "text-theme-secondary mt-1", children: debt.name })
      ] })
    ] }),
    /* @__PURE__ */ jsxs(Card, { children: [
      /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsx(CardTitle, { children: "Debt Details" }) }),
      /* @__PURE__ */ jsx(CardContent, { children: /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, className: "space-y-6", children: [
        error && /* @__PURE__ */ jsx("div", { className: "p-3 rounded-xl bg-danger-50 dark:bg-danger-600/10 border border-danger-200 dark:border-danger-600/30 text-danger-700 dark:text-danger-400 text-sm", children: error }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { htmlFor: "name", className: labelClasses, children: "Name" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "text",
              id: "name",
              name: "name",
              required: true,
              defaultValue: debt.name,
              className: inputClasses
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { htmlFor: "type", className: labelClasses, children: "Type" }),
            /* @__PURE__ */ jsx(
              "select",
              {
                id: "type",
                name: "type",
                required: true,
                defaultValue: debt.type,
                className: inputClasses,
                children: DEBT_TYPES.map((type) => /* @__PURE__ */ jsx("option", { value: type.value, children: type.label }, type.value))
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { htmlFor: "status", className: labelClasses, children: "Status" }),
            /* @__PURE__ */ jsx(
              "select",
              {
                id: "status",
                name: "status",
                required: true,
                defaultValue: debt.status,
                className: inputClasses,
                children: DEBT_STATUSES.map((status) => /* @__PURE__ */ jsx("option", { value: status.value, children: status.label }, status.value))
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { htmlFor: "currentBalance", className: labelClasses, children: "Current Balance ($)" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "number",
                id: "currentBalance",
                name: "currentBalance",
                required: true,
                min: "0",
                step: "0.01",
                inputMode: "decimal",
                defaultValue: debt.currentBalance,
                className: inputClasses
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { htmlFor: "originalBalance", className: labelClasses, children: "Original Balance ($)" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "number",
                id: "originalBalance",
                name: "originalBalance",
                required: true,
                min: "0",
                step: "0.01",
                inputMode: "decimal",
                defaultValue: debt.originalBalance,
                className: inputClasses
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { htmlFor: "interestRate", className: labelClasses, children: "Interest Rate (% APR)" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "number",
                id: "interestRate",
                name: "interestRate",
                required: true,
                min: "0",
                max: "100",
                step: "0.01",
                inputMode: "decimal",
                defaultValue: debt.interestRate,
                className: inputClasses
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { htmlFor: "minimumPayment", className: labelClasses, children: isBNPL ? "Payment Amount ($)" : "Minimum Payment ($)" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "number",
                id: "minimumPayment",
                name: "minimumPayment",
                required: true,
                min: "0",
                step: "0.01",
                inputMode: "decimal",
                defaultValue: debt.minimumPayment,
                className: inputClasses
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { htmlFor: "dueDay", className: labelClasses, children: "Due Day of Month (1-31)" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "number",
              id: "dueDay",
              name: "dueDay",
              required: true,
              min: "1",
              max: "31",
              defaultValue: debt.dueDay,
              className: inputClasses
            }
          )
        ] }),
        bankAccounts.length > 0 && /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: labelClasses, children: "Payment Bank Account" }),
          /* @__PURE__ */ jsx(
            BankSelector,
            {
              value: selectedBankAccountId,
              onChange: setSelectedBankAccountId,
              banks: bankAccounts
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { htmlFor: "notes", className: labelClasses, children: "Notes (optional)" }),
          /* @__PURE__ */ jsx(
            "textarea",
            {
              id: "notes",
              name: "notes",
              rows: 3,
              defaultValue: debt.notes || "",
              placeholder: "Any additional notes about this debt...",
              className: inputClasses
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex gap-4 pt-4", children: [
          /* @__PURE__ */ jsx(Button, { type: "submit", disabled: saving, children: saving ? "Saving..." : "Save Changes" }),
          /* @__PURE__ */ jsx("a", { href: "/dashboard/debts", children: /* @__PURE__ */ jsx(Button, { type: "button", variant: "secondary", children: "Cancel" }) })
        ] })
      ] }) })
    ] })
  ] });
}

const $$Astro = createAstro();
const $$Edit = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Edit;
  const session = await getSession(Astro2.request);
  if (!session?.user?.id) {
    return Astro2.redirect("/login");
  }
  const { id } = Astro2.params;
  if (!id) {
    return Astro2.redirect("/dashboard/debts");
  }
  return renderTemplate`${renderComponent($$result, "DashboardLayout", $$DashboardLayout, { "title": "Edit Debt", "currentPath": "/dashboard/debts", "user": session.user, "showExploreSidebar": false }, { "default": async ($$result2) => renderTemplate` ${renderComponent($$result2, "EditDebtForm", EditDebtForm, { "client:load": true, "debtId": id, "client:component-hydration": "load", "client:component-path": "/Users/chris/projects/dev/openfinance/src/components/forms/edit-debt-form", "client:component-export": "default" })} ` })}`;
}, "/Users/chris/projects/dev/openfinance/src/pages/dashboard/debts/[id]/edit.astro", void 0);

const $$file = "/Users/chris/projects/dev/openfinance/src/pages/dashboard/debts/[id]/edit.astro";
const $$url = "/dashboard/debts/[id]/edit";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Edit,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
//# sourceMappingURL=edit.astro.mjs.map
