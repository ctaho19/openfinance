import { e as createComponent, f as createAstro, k as renderComponent, r as renderTemplate } from '../../../chunks/astro/server_CLo6n4dC.mjs';
import 'piccolore';
import { $ as $$DashboardLayout } from '../../../chunks/DashboardLayout_Dtx_fU2x.mjs';
import { jsxs, jsx } from 'react/jsx-runtime';
import { useState, useEffect } from 'react';
import { C as Card, a as CardHeader, b as CardTitle, c as CardContent } from '../../../chunks/card_XHmopkrD.mjs';
import { B as Button } from '../../../chunks/button_VWZV24pY.mjs';
import { B as BankSelector } from '../../../chunks/bank-badge_CGzskWB7.mjs';
import { ArrowLeft } from 'lucide-react';
import { g as getSession } from '../../../chunks/get-session-astro_CVC6HSBT.mjs';
export { renderers } from '../../../renderers.mjs';

const categories = [
  { value: "SUBSCRIPTION", label: "Subscription" },
  { value: "UTILITY", label: "Utility" },
  { value: "LOAN", label: "Loan" },
  { value: "BNPL", label: "Buy Now Pay Later" },
  { value: "INSURANCE", label: "Insurance" },
  { value: "CREDIT_CARD", label: "Credit Card" },
  { value: "OTHER", label: "Other" }
];
const frequencies = [
  { value: "ONCE", label: "One-time" },
  { value: "WEEKLY", label: "Weekly" },
  { value: "BIWEEKLY", label: "Bi-weekly" },
  { value: "MONTHLY", label: "Monthly" },
  { value: "YEARLY", label: "Yearly" }
];
function NewBillForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [debts, setDebts] = useState([]);
  const [bankAccounts, setBankAccounts] = useState([]);
  const [selectedBankAccountId, setSelectedBankAccountId] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    category: "OTHER",
    amount: "",
    dueDay: "",
    isRecurring: true,
    frequency: "MONTHLY",
    debtId: "",
    notes: ""
  });
  useEffect(() => {
    Promise.all([
      fetch("/api/debts").then((res) => res.json()),
      fetch("/api/bank-accounts").then((res) => res.json())
    ]).then(([debtsData, accountsData]) => {
      if (Array.isArray(debtsData)) {
        setDebts(debtsData);
      }
      if (Array.isArray(accountsData)) {
        setBankAccounts(accountsData);
        const defaultAccount = accountsData.find((a) => a.isDefault);
        if (defaultAccount) {
          setSelectedBankAccountId(defaultAccount.id);
        }
      }
    }).catch(() => {
    });
  }, []);
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/bills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          bankAccountId: selectedBankAccountId || null
        })
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create bill");
      }
      window.location.href = "/dashboard/bills";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? e.target.checked : value
    }));
  };
  const inputClasses = "w-full px-4 py-2 bg-theme-secondary border border-theme rounded-xl text-theme-primary placeholder-theme-muted focus:outline-none focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500";
  return /* @__PURE__ */ jsxs("div", { className: "animate-fade-in space-y-6 lg:space-y-8", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
      /* @__PURE__ */ jsx("a", { href: "/dashboard/bills", children: /* @__PURE__ */ jsx(Button, { variant: "ghost", size: "sm", leftIcon: /* @__PURE__ */ jsx(ArrowLeft, { className: "h-4 w-4" }), children: "Back" }) }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold text-theme-primary", children: "Add New Bill" }),
        /* @__PURE__ */ jsx("p", { className: "text-theme-secondary mt-1", children: "Create a new recurring bill or payment" })
      ] })
    ] }),
    /* @__PURE__ */ jsxs(Card, { children: [
      /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsx(CardTitle, { children: "Bill Details" }) }),
      /* @__PURE__ */ jsx(CardContent, { children: /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, className: "space-y-6", children: [
        error && /* @__PURE__ */ jsx("div", { className: "p-3 rounded-xl bg-danger-50 dark:bg-danger-600/10 border border-danger-200 dark:border-danger-600/30 text-danger-700 dark:text-danger-400 text-sm", children: error }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [
          /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsx("label", { htmlFor: "name", className: "block text-sm font-medium text-theme-secondary", children: "Name *" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "text",
                id: "name",
                name: "name",
                required: true,
                autoFocus: true,
                value: formData.name,
                onChange: handleChange,
                placeholder: "e.g., Netflix, Electric Bill",
                className: inputClasses
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsx("label", { htmlFor: "category", className: "block text-sm font-medium text-theme-secondary", children: "Category" }),
            /* @__PURE__ */ jsx(
              "select",
              {
                id: "category",
                name: "category",
                value: formData.category,
                onChange: handleChange,
                className: inputClasses,
                children: categories.map((cat) => /* @__PURE__ */ jsx("option", { value: cat.value, children: cat.label }, cat.value))
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsx("label", { htmlFor: "amount", className: "block text-sm font-medium text-theme-secondary", children: "Amount *" }),
            /* @__PURE__ */ jsxs("div", { className: "relative", children: [
              /* @__PURE__ */ jsx("span", { className: "absolute left-4 top-1/2 -translate-y-1/2 text-theme-muted", children: "$" }),
              /* @__PURE__ */ jsx(
                "input",
                {
                  type: "number",
                  id: "amount",
                  name: "amount",
                  required: true,
                  min: "0",
                  step: "0.01",
                  inputMode: "decimal",
                  value: formData.amount,
                  onChange: handleChange,
                  placeholder: "0.00",
                  className: `${inputClasses} pl-8`
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsx("label", { htmlFor: "dueDay", className: "block text-sm font-medium text-theme-secondary", children: "Due Day (1-31) *" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "number",
                id: "dueDay",
                name: "dueDay",
                required: true,
                min: "1",
                max: "31",
                value: formData.dueDay,
                onChange: handleChange,
                placeholder: "15",
                className: inputClasses
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "checkbox",
              id: "isRecurring",
              name: "isRecurring",
              checked: formData.isRecurring,
              onChange: handleChange,
              className: "h-4 w-4 rounded border-theme bg-theme-secondary text-accent-600 focus:ring-accent-500 focus:ring-offset-theme-primary"
            }
          ),
          /* @__PURE__ */ jsx("label", { htmlFor: "isRecurring", className: "text-sm font-medium text-theme-secondary", children: "This is a recurring bill" })
        ] }),
        formData.isRecurring && /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsx("label", { htmlFor: "frequency", className: "block text-sm font-medium text-theme-secondary", children: "Frequency" }),
          /* @__PURE__ */ jsx(
            "select",
            {
              id: "frequency",
              name: "frequency",
              value: formData.frequency,
              onChange: handleChange,
              className: inputClasses,
              children: frequencies.map((freq) => /* @__PURE__ */ jsx("option", { value: freq.value, children: freq.label }, freq.value))
            }
          )
        ] }),
        debts.length > 0 && /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsx("label", { htmlFor: "debtId", className: "block text-sm font-medium text-theme-secondary", children: "Link to Debt Account (Optional)" }),
          /* @__PURE__ */ jsxs(
            "select",
            {
              id: "debtId",
              name: "debtId",
              value: formData.debtId,
              onChange: handleChange,
              className: inputClasses,
              children: [
                /* @__PURE__ */ jsx("option", { value: "", children: "None" }),
                debts.map((debt) => /* @__PURE__ */ jsxs("option", { value: debt.id, children: [
                  debt.name,
                  " (",
                  debt.type.toLowerCase().replace("_", " "),
                  ")"
                ] }, debt.id))
              ]
            }
          )
        ] }),
        bankAccounts.length > 0 && /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-theme-secondary", children: "Payment Bank Account" }),
          /* @__PURE__ */ jsx(
            BankSelector,
            {
              value: selectedBankAccountId,
              onChange: setSelectedBankAccountId,
              banks: bankAccounts
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsx("label", { htmlFor: "notes", className: "block text-sm font-medium text-theme-secondary", children: "Notes (Optional)" }),
          /* @__PURE__ */ jsx(
            "textarea",
            {
              id: "notes",
              name: "notes",
              rows: 3,
              value: formData.notes,
              onChange: handleChange,
              placeholder: "Any additional notes about this bill...",
              className: `${inputClasses} resize-none`
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex gap-4 pt-4", children: [
          /* @__PURE__ */ jsx(Button, { type: "submit", disabled: isSubmitting, children: isSubmitting ? "Creating..." : "Create Bill" }),
          /* @__PURE__ */ jsx("a", { href: "/dashboard/bills", children: /* @__PURE__ */ jsx(Button, { type: "button", variant: "secondary", children: "Cancel" }) })
        ] })
      ] }) })
    ] })
  ] });
}

const $$Astro = createAstro();
const $$New = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$New;
  const session = await getSession(Astro2.request);
  if (!session?.user?.id) {
    return Astro2.redirect("/login");
  }
  return renderTemplate`${renderComponent($$result, "DashboardLayout", $$DashboardLayout, { "title": "Add Bill", "currentPath": "/dashboard/bills", "user": session.user, "showExploreSidebar": false }, { "default": async ($$result2) => renderTemplate` ${renderComponent($$result2, "NewBillForm", NewBillForm, { "client:load": true, "client:component-hydration": "load", "client:component-path": "/Users/chris/projects/dev/openfinance/src/components/forms/new-bill-form", "client:component-export": "default" })} ` })}`;
}, "/Users/chris/projects/dev/openfinance/src/pages/dashboard/bills/new.astro", void 0);

const $$file = "/Users/chris/projects/dev/openfinance/src/pages/dashboard/bills/new.astro";
const $$url = "/dashboard/bills/new";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$New,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
//# sourceMappingURL=new.astro.mjs.map
