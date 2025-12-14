import { e as createComponent, f as createAstro, k as renderComponent, r as renderTemplate } from '../../../chunks/astro/server_B4LN2q8c.mjs';
import 'piccolore';
import { $ as $$DashboardLayout } from '../../../chunks/DashboardLayout_BuTua2F1.mjs';
import { jsxs, jsx } from 'react/jsx-runtime';
import { useState, useEffect, useMemo } from 'react';
import { C as Card, a as CardHeader, b as CardTitle, c as CardContent } from '../../../chunks/card_XHmopkrD.mjs';
import { B as Button } from '../../../chunks/button_VWZV24pY.mjs';
import { f as formatPaymentPreview, c as calculateEffectiveAPR } from '../../../chunks/bnpl-utils_Dcl5EXrQ.mjs';
import { B as BankSelector } from '../../../chunks/bank-badge_CrB3W5ys.mjs';
import { ArrowLeft } from 'lucide-react';
import { g as getSession } from '../../../chunks/get-session-astro_CVC6HSBT.mjs';
export { renderers } from '../../../renderers.mjs';

const DEBT_TYPES = [
  { value: "CREDIT_CARD", label: "Credit Card" },
  { value: "AUTO_LOAN", label: "Auto Loan" },
  { value: "STUDENT_LOAN", label: "Student Loan" },
  { value: "PERSONAL_LOAN", label: "Personal Loan" },
  { value: "BNPL", label: "Buy Now Pay Later" },
  { value: "MORTGAGE", label: "Mortgage" },
  { value: "OTHER", label: "Other" }
];
const PAYMENT_COUNTS = [2, 3, 4, 5, 6, 8, 10, 12, 18, 24, 36, 48, 60];
const PAYMENT_FREQUENCIES = [
  { value: "weekly", label: "Weekly" },
  { value: "biweekly", label: "Bi-weekly" },
  { value: "monthly", label: "Monthly" }
];
function NewDebtForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [debtType, setDebtType] = useState("");
  const [currentBalance, setCurrentBalance] = useState("");
  const [numberOfPayments, setNumberOfPayments] = useState("4");
  const [customPayments, setCustomPayments] = useState("");
  const [firstPaymentDate, setFirstPaymentDate] = useState("");
  const [paymentFrequency, setPaymentFrequency] = useState("monthly");
  const [bankAccounts, setBankAccounts] = useState([]);
  const [selectedBankAccountId, setSelectedBankAccountId] = useState("");
  const [totalRepayable, setTotalRepayable] = useState("");
  const [interestRate, setInterestRate] = useState("");
  const [bnplHasInterest, setBnplHasInterest] = useState(false);
  const isBNPL = debtType === "BNPL";
  useEffect(() => {
    fetch("/api/bank-accounts").then((res) => res.json()).then((data) => {
      if (Array.isArray(data)) {
        setBankAccounts(data);
        const defaultAccount = data.find((a) => a.isDefault);
        if (defaultAccount) {
          setSelectedBankAccountId(defaultAccount.id);
        }
      }
    }).catch(() => {
    });
  }, []);
  const effectivePaymentCount = customPayments ? parseInt(customPayments, 10) : parseInt(numberOfPayments, 10);
  const paymentPreview = useMemo(() => {
    if (!isBNPL || !currentBalance || !effectivePaymentCount || !firstPaymentDate) {
      return null;
    }
    const balance = parseFloat(currentBalance);
    if (isNaN(balance) || isNaN(effectivePaymentCount) || balance <= 0 || effectivePaymentCount <= 0) {
      return null;
    }
    const total = totalRepayable ? parseFloat(totalRepayable) : balance;
    const paymentAmount = Math.round(total / effectivePaymentCount * 100) / 100;
    return formatPaymentPreview(effectivePaymentCount, paymentAmount, /* @__PURE__ */ new Date(firstPaymentDate + "T00:00:00"));
  }, [isBNPL, currentBalance, totalRepayable, effectivePaymentCount, firstPaymentDate]);
  const computedEffectiveAPR = useMemo(() => {
    if (!isBNPL || !currentBalance || !effectivePaymentCount) return null;
    const principal = parseFloat(currentBalance);
    const total = totalRepayable ? parseFloat(totalRepayable) : principal;
    if (isNaN(principal) || isNaN(total) || principal <= 0 || total <= 0) return null;
    if (Math.abs(total - principal) < 0.01) return null;
    return calculateEffectiveAPR({
      principal,
      totalRepayable: total,
      numberOfPayments: effectivePaymentCount,
      frequency: paymentFrequency
    });
  }, [isBNPL, currentBalance, totalRepayable, effectivePaymentCount, paymentFrequency]);
  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const formData = new FormData(e.currentTarget);
    const balance = parseFloat(formData.get("currentBalance"));
    const total = isBNPL && totalRepayable ? parseFloat(totalRepayable) : balance;
    const paymentAmount = isBNPL && effectivePaymentCount > 0 ? Math.round(total / effectivePaymentCount * 100) / 100 : parseFloat(formData.get("minimumPayment"));
    const statedInterestRate = isBNPL ? bnplHasInterest && interestRate ? parseFloat(interestRate) : 0 : parseFloat(formData.get("interestRate"));
    const dueDay = isBNPL && firstPaymentDate ? (/* @__PURE__ */ new Date(firstPaymentDate + "T00:00:00")).getDate() : parseInt(formData.get("dueDay"), 10);
    const data = {
      name: formData.get("name"),
      type: formData.get("type"),
      currentBalance: balance,
      originalBalance: parseFloat(formData.get("originalBalance")),
      interestRate: statedInterestRate,
      minimumPayment: paymentAmount,
      dueDay,
      notes: formData.get("notes") || null
    };
    if (isBNPL) {
      data.numberOfPayments = effectivePaymentCount;
      data.firstPaymentDate = firstPaymentDate;
      data.paymentFrequency = paymentFrequency;
      if (totalRepayable && parseFloat(totalRepayable) !== balance) {
        data.totalRepayable = parseFloat(totalRepayable);
      }
    }
    if (selectedBankAccountId) {
      data.bankAccountId = selectedBankAccountId;
    }
    const res = await fetch("/api/debts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
    if (res.ok) {
      window.location.href = "/dashboard/debts";
    } else {
      const result = await res.json();
      setError(result.error || "Failed to create debt");
      setLoading(false);
    }
  }
  const inputClasses = "w-full px-4 py-2 bg-theme-secondary border border-theme rounded-xl text-theme-primary placeholder-theme-muted focus:outline-none focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500";
  const labelClasses = "block text-sm font-medium text-theme-secondary mb-2";
  return /* @__PURE__ */ jsxs("div", { className: "animate-fade-in max-w-2xl mx-auto space-y-6 lg:space-y-8", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
      /* @__PURE__ */ jsx("a", { href: "/dashboard/debts", children: /* @__PURE__ */ jsx(Button, { variant: "ghost", size: "sm", leftIcon: /* @__PURE__ */ jsx(ArrowLeft, { className: "h-4 w-4" }), children: "Back" }) }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold text-theme-primary", children: "Add New Debt" }),
        /* @__PURE__ */ jsx("p", { className: "text-theme-secondary mt-1", children: "Track a new debt account" })
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
              autoFocus: true,
              placeholder: "e.g., Chase Sapphire or Affirm - Laptop",
              className: inputClasses
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { htmlFor: "type", className: labelClasses, children: "Type" }),
          /* @__PURE__ */ jsxs(
            "select",
            {
              id: "type",
              name: "type",
              required: true,
              className: inputClasses,
              value: debtType,
              onChange: (e) => setDebtType(e.target.value),
              children: [
                /* @__PURE__ */ jsx("option", { value: "", children: "Select type..." }),
                DEBT_TYPES.map((type) => /* @__PURE__ */ jsx("option", { value: type.value, children: type.label }, type.value))
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { htmlFor: "currentBalance", className: labelClasses, children: isBNPL ? "Total Amount ($)" : "Current Balance ($)" }),
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
                placeholder: isBNPL ? "1200.00" : "5000.00",
                className: inputClasses,
                value: currentBalance,
                onChange: (e) => setCurrentBalance(e.target.value)
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
                placeholder: isBNPL ? currentBalance || "1200.00" : "10000.00",
                defaultValue: isBNPL ? currentBalance : "",
                className: inputClasses
              }
            )
          ] })
        ] }),
        isBNPL && /* @__PURE__ */ jsxs("div", { className: "p-4 bg-theme-tertiary border border-theme rounded-xl space-y-4", children: [
          /* @__PURE__ */ jsx("h3", { className: "text-sm font-medium text-accent", children: "BNPL Payment Schedule" }),
          /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { htmlFor: "numberOfPayments", className: labelClasses, children: "Number of Payments" }),
              /* @__PURE__ */ jsx(
                "select",
                {
                  id: "numberOfPayments",
                  name: "numberOfPayments",
                  className: inputClasses,
                  value: numberOfPayments,
                  onChange: (e) => {
                    setNumberOfPayments(e.target.value);
                    setCustomPayments("");
                  },
                  children: PAYMENT_COUNTS.map((count) => /* @__PURE__ */ jsxs("option", { value: count, children: [
                    count,
                    " payments"
                  ] }, count))
                }
              ),
              /* @__PURE__ */ jsx("div", { className: "mt-2", children: /* @__PURE__ */ jsx(
                "input",
                {
                  type: "number",
                  placeholder: "Or enter custom...",
                  min: "1",
                  max: "360",
                  className: `${inputClasses} text-sm`,
                  value: customPayments,
                  onChange: (e) => setCustomPayments(e.target.value)
                }
              ) })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { htmlFor: "firstPaymentDate", className: labelClasses, children: "First Payment Date" }),
              /* @__PURE__ */ jsx(
                "input",
                {
                  type: "date",
                  id: "firstPaymentDate",
                  name: "firstPaymentDate",
                  required: true,
                  className: inputClasses,
                  value: firstPaymentDate,
                  onChange: (e) => setFirstPaymentDate(e.target.value)
                }
              )
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { htmlFor: "paymentFrequency", className: labelClasses, children: "Payment Frequency" }),
              /* @__PURE__ */ jsx(
                "select",
                {
                  id: "paymentFrequency",
                  name: "paymentFrequency",
                  required: true,
                  className: inputClasses,
                  value: paymentFrequency,
                  onChange: (e) => setPaymentFrequency(e.target.value),
                  children: PAYMENT_FREQUENCIES.map((freq) => /* @__PURE__ */ jsx("option", { value: freq.value, children: freq.label }, freq.value))
                }
              )
            ] })
          ] }),
          paymentPreview && /* @__PURE__ */ jsxs("div", { className: "p-3 bg-accent/10 border border-accent/30 rounded-xl text-theme-primary text-sm", children: [
            /* @__PURE__ */ jsx("span", { className: "font-medium text-accent", children: "Preview:" }),
            " ",
            paymentPreview
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "border-t border-theme pt-4 space-y-3", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
              /* @__PURE__ */ jsx(
                "input",
                {
                  type: "checkbox",
                  id: "bnplHasInterest",
                  checked: bnplHasInterest,
                  onChange: (e) => setBnplHasInterest(e.target.checked),
                  className: "h-4 w-4 rounded border-theme bg-theme-secondary text-accent-600 focus:ring-accent-500"
                }
              ),
              /* @__PURE__ */ jsx("label", { htmlFor: "bnplHasInterest", className: "text-sm text-theme-secondary", children: "This BNPL loan has interest or finance charges" })
            ] }),
            bnplHasInterest && /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4 pl-7", children: [
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsxs("label", { htmlFor: "bnplInterestRate", className: labelClasses, children: [
                  "Stated APR (%) ",
                  /* @__PURE__ */ jsx("span", { className: "text-theme-muted font-normal", children: "- if shown by provider" })
                ] }),
                /* @__PURE__ */ jsx(
                  "input",
                  {
                    type: "number",
                    id: "bnplInterestRate",
                    min: "0",
                    max: "100",
                    step: "0.01",
                    placeholder: "0.00",
                    className: inputClasses,
                    value: interestRate,
                    onChange: (e) => setInterestRate(e.target.value)
                  }
                )
              ] }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsxs("label", { htmlFor: "totalRepayable", className: labelClasses, children: [
                  "Total to Repay ($) ",
                  /* @__PURE__ */ jsx("span", { className: "text-theme-muted font-normal", children: "- if different from principal" })
                ] }),
                /* @__PURE__ */ jsx(
                  "input",
                  {
                    type: "number",
                    id: "totalRepayable",
                    min: "0",
                    step: "0.01",
                    placeholder: currentBalance || "0.00",
                    className: inputClasses,
                    value: totalRepayable,
                    onChange: (e) => setTotalRepayable(e.target.value)
                  }
                ),
                /* @__PURE__ */ jsx("p", { className: "text-xs text-theme-muted mt-1", children: "Enter the total amount you'll pay including any built-in interest" })
              ] })
            ] }),
            computedEffectiveAPR !== null && computedEffectiveAPR > 0 && /* @__PURE__ */ jsxs("div", { className: "p-3 bg-warning-50 dark:bg-warning-600/10 border border-warning-200 dark:border-warning-600/30 rounded-xl text-sm", children: [
              /* @__PURE__ */ jsx("span", { className: "font-medium text-warning-700 dark:text-warning-400", children: "Effective APR:" }),
              " ",
              /* @__PURE__ */ jsxs("span", { className: "text-theme-primary", children: [
                computedEffectiveAPR.toFixed(2),
                "%"
              ] }),
              /* @__PURE__ */ jsx("span", { className: "text-theme-muted ml-2", children: "(computed from total repayable vs principal)" })
            ] }),
            !bnplHasInterest && /* @__PURE__ */ jsx("p", { className: "text-xs text-theme-muted pl-7", children: "Leave unchecked for 0% promo BNPL (Afterpay, Klarna Pay in 4, etc.)" })
          ] })
        ] }),
        !isBNPL && /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [
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
                placeholder: "19.99",
                className: inputClasses
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { htmlFor: "minimumPayment", className: labelClasses, children: "Minimum Payment ($)" }),
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
                placeholder: "150.00",
                className: inputClasses
              }
            )
          ] })
        ] }),
        !isBNPL && /* @__PURE__ */ jsxs("div", { children: [
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
              placeholder: "15",
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
              placeholder: "Any additional notes about this debt...",
              className: inputClasses
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex gap-4 pt-4", children: [
          /* @__PURE__ */ jsx(Button, { type: "submit", disabled: loading, children: loading ? "Creating..." : "Add Debt" }),
          /* @__PURE__ */ jsx("a", { href: "/dashboard/debts", children: /* @__PURE__ */ jsx(Button, { type: "button", variant: "secondary", children: "Cancel" }) })
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
  return renderTemplate`${renderComponent($$result, "DashboardLayout", $$DashboardLayout, { "title": "Add Debt", "currentPath": "/dashboard/debts", "user": session.user, "showExploreSidebar": false }, { "default": async ($$result2) => renderTemplate` ${renderComponent($$result2, "NewDebtForm", NewDebtForm, { "client:load": true, "client:component-hydration": "load", "client:component-path": "/Users/chris/projects/dev/openfinance/src/components/forms/new-debt-form", "client:component-export": "default" })} ` })}`;
}, "/Users/chris/projects/dev/openfinance/src/pages/dashboard/debts/new.astro", void 0);

const $$file = "/Users/chris/projects/dev/openfinance/src/pages/dashboard/debts/new.astro";
const $$url = "/dashboard/debts/new";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$New,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
//# sourceMappingURL=new.astro.mjs.map
