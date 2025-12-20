import { e as createComponent, f as createAstro, k as renderComponent, r as renderTemplate, m as maybeRenderHead } from '../../../chunks/astro/server_B4LN2q8c.mjs';
import 'piccolore';
import { $ as $$DashboardLayout } from '../../../chunks/DashboardLayout_D7aHZw7-.mjs';
import { g as getSession } from '../../../chunks/get-session-astro_CVC6HSBT.mjs';
import { jsx, jsxs, Fragment } from 'react/jsx-runtime';
import { useState, useEffect } from 'react';
import { a as BankAccountCard } from '../../../chunks/bank-account-card_SiXbaX8W.mjs';
import { B as Button } from '../../../chunks/button_VWZV24pY.mjs';
import { b as BANK_OPTIONS } from '../../../chunks/bank-badge_CGzskWB7.mjs';
import { Building2, Plus, X, ArrowLeft } from 'lucide-react';
export { renderers } from '../../../renderers.mjs';

function BankAccountsManager() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    bank: "CHASE",
    lastFour: "",
    isDefault: false
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    fetchAccounts();
  }, []);
  async function fetchAccounts() {
    try {
      const res = await fetch("/api/bank-accounts");
      if (res.ok) {
        const data = await res.json();
        setAccounts(data);
      }
    } catch {
    } finally {
      setLoading(false);
    }
  }
  function resetForm() {
    setFormData({ name: "", bank: "CHASE", lastFour: "", isDefault: false });
    setEditingId(null);
    setShowForm(false);
    setError("");
  }
  function handleEdit(id) {
    const account = accounts.find((a) => a.id === id);
    if (account) {
      setFormData({
        name: account.name,
        bank: account.bank,
        lastFour: account.lastFour || "",
        isDefault: account.isDefault
      });
      setEditingId(id);
      setShowForm(true);
    }
  }
  async function handleDelete(id) {
    if (!confirm("Are you sure you want to delete this bank account?")) return;
    try {
      const res = await fetch(`/api/bank-accounts/${id}`, { method: "DELETE" });
      if (res.ok) {
        setAccounts(accounts.filter((a) => a.id !== id));
      }
    } catch {
      setError("Failed to delete account");
    }
  }
  async function handleSetDefault(id) {
    try {
      const res = await fetch(`/api/bank-accounts/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isDefault: true })
      });
      if (res.ok) {
        setAccounts(
          accounts.map((a) => ({
            ...a,
            isDefault: a.id === id
          }))
        );
      }
    } catch {
      setError("Failed to set default account");
    }
  }
  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const url = editingId ? `/api/bank-accounts/${editingId}` : "/api/bank-accounts";
      const method = editingId ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          bank: formData.bank,
          lastFour: formData.lastFour || null,
          isDefault: formData.isDefault
        })
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save account");
      }
      await fetchAccounts();
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }
  const inputClasses = "w-full px-4 py-2.5 bg-theme-secondary border border-theme rounded-xl text-theme-primary placeholder-theme-muted focus:outline-none focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500";
  if (loading) {
    return /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center py-12", children: /* @__PURE__ */ jsx("div", { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-accent-500" }) });
  }
  return /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
    accounts.length === 0 && !showForm ? /* @__PURE__ */ jsxs("div", { className: "text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700", children: [
      /* @__PURE__ */ jsx("div", { className: "w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-4", children: /* @__PURE__ */ jsx(Building2, { className: "h-8 w-8 text-gray-400" }) }),
      /* @__PURE__ */ jsx("h3", { className: "text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2", children: "No Bank Accounts Yet" }),
      /* @__PURE__ */ jsx("p", { className: "text-gray-500 dark:text-gray-400 mb-4 max-w-sm mx-auto", children: "Add your bank accounts to track which account each bill comes from and see transfer amounts per account." }),
      /* @__PURE__ */ jsx(Button, { onClick: () => setShowForm(true), leftIcon: /* @__PURE__ */ jsx(Plus, { className: "h-4 w-4" }), children: "Add Bank Account" })
    ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: accounts.map((account) => /* @__PURE__ */ jsx(
        BankAccountCard,
        {
          id: account.id,
          name: account.name,
          bank: account.bank,
          lastFour: account.lastFour,
          isDefault: account.isDefault,
          onEdit: handleEdit,
          onDelete: handleDelete,
          onSetDefault: handleSetDefault
        },
        account.id
      )) }),
      !showForm && /* @__PURE__ */ jsx(
        Button,
        {
          variant: "secondary",
          onClick: () => setShowForm(true),
          leftIcon: /* @__PURE__ */ jsx(Plus, { className: "h-4 w-4" }),
          children: "Add Bank Account"
        }
      )
    ] }),
    showForm && /* @__PURE__ */ jsxs("div", { className: "bg-white dark:bg-[#1c2128] rounded-xl border border-gray-200 dark:border-[#30363d] p-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-6", children: [
        /* @__PURE__ */ jsx("h3", { className: "text-lg font-semibold text-gray-900 dark:text-gray-100", children: editingId ? "Edit Bank Account" : "Add Bank Account" }),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: resetForm,
            className: "p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors",
            children: /* @__PURE__ */ jsx(X, { className: "h-5 w-5 text-gray-500" })
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, className: "space-y-5", children: [
        error && /* @__PURE__ */ jsx("div", { className: "p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm", children: error }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-5", children: [
          /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsx("label", { htmlFor: "name", className: "block text-sm font-medium text-theme-secondary", children: "Account Name *" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "text",
                id: "name",
                required: true,
                value: formData.name,
                onChange: (e) => setFormData({ ...formData, name: e.target.value }),
                placeholder: "e.g., Primary Checking",
                className: inputClasses
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsx("label", { htmlFor: "bank", className: "block text-sm font-medium text-theme-secondary", children: "Bank *" }),
            /* @__PURE__ */ jsx(
              "select",
              {
                id: "bank",
                required: true,
                value: formData.bank,
                onChange: (e) => setFormData({ ...formData, bank: e.target.value }),
                className: inputClasses,
                children: BANK_OPTIONS.map((opt) => /* @__PURE__ */ jsx("option", { value: opt.value, children: opt.label }, opt.value))
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsx("label", { htmlFor: "lastFour", className: "block text-sm font-medium text-theme-secondary", children: "Last 4 Digits (Optional)" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "text",
                id: "lastFour",
                maxLength: 4,
                pattern: "[0-9]*",
                value: formData.lastFour,
                onChange: (e) => setFormData({ ...formData, lastFour: e.target.value.replace(/\D/g, "") }),
                placeholder: "1234",
                className: inputClasses
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 pt-8", children: [
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "checkbox",
                id: "isDefault",
                checked: formData.isDefault,
                onChange: (e) => setFormData({ ...formData, isDefault: e.target.checked }),
                className: "h-4 w-4 rounded border-gray-300 text-accent-600 focus:ring-accent-500"
              }
            ),
            /* @__PURE__ */ jsx("label", { htmlFor: "isDefault", className: "text-sm font-medium text-theme-secondary", children: "Set as default account" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex gap-3 pt-2", children: [
          /* @__PURE__ */ jsx(Button, { type: "submit", disabled: submitting, children: submitting ? "Saving..." : editingId ? "Update Account" : "Add Account" }),
          /* @__PURE__ */ jsx(Button, { type: "button", variant: "secondary", onClick: resetForm, children: "Cancel" })
        ] })
      ] })
    ] })
  ] });
}

const $$Astro = createAstro();
const $$Accounts = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Accounts;
  const session = await getSession(Astro2.request);
  if (!session?.user?.id) {
    return Astro2.redirect("/login");
  }
  return renderTemplate`${renderComponent($$result, "DashboardLayout", $$DashboardLayout, { "title": "Bank Accounts", "currentPath": "/dashboard/settings", "user": session.user, "showExploreSidebar": false }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="space-y-6 lg:space-y-8 animate-fade-in"> <header class="flex items-center gap-4"> <a href="/dashboard/settings" class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"> ${renderComponent($$result2, "ArrowLeft", ArrowLeft, { "className": "h-5 w-5 text-gray-500" })} </a> <div> <h1 class="text-2xl lg:text-3xl font-bold text-theme-primary tracking-tight flex items-center gap-3"> <div class="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center"> ${renderComponent($$result2, "Building2", Building2, { "className": "h-5 w-5 text-blue-600 dark:text-blue-400" })} </div>
Bank Accounts
</h1> <p class="text-theme-secondary mt-1 ml-13">
Manage your bank accounts to track bill payments by account
</p> </div> </header> <section class="bg-theme-elevated border border-theme rounded-2xl p-6"> ${renderComponent($$result2, "BankAccountsManager", BankAccountsManager, { "client:load": true, "client:component-hydration": "load", "client:component-path": "/Users/chris/projects/dev/openfinance/src/components/settings/bank-accounts-manager", "client:component-export": "BankAccountsManager" })} </section> <section class="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-100 dark:border-blue-800 rounded-2xl p-6"> <h3 class="font-semibold text-gray-900 dark:text-gray-100 mb-2">How it works</h3> <ul class="space-y-2 text-sm text-gray-600 dark:text-gray-400"> <li class="flex items-start gap-2"> <span class="text-blue-500 mt-0.5">•</span>
Add bank accounts you use to pay bills
</li> <li class="flex items-start gap-2"> <span class="text-blue-500 mt-0.5">•</span>
Assign a bank account when creating or editing bills
</li> <li class="flex items-start gap-2"> <span class="text-blue-500 mt-0.5">•</span>
View pay period allocations grouped by bank account
</li> <li class="flex items-start gap-2"> <span class="text-blue-500 mt-0.5">•</span>
See exactly how much to transfer to each account on payday
</li> </ul> </section> </div> ` })}`;
}, "/Users/chris/projects/dev/openfinance/src/pages/dashboard/settings/accounts.astro", void 0);

const $$file = "/Users/chris/projects/dev/openfinance/src/pages/dashboard/settings/accounts.astro";
const $$url = "/dashboard/settings/accounts";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Accounts,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
//# sourceMappingURL=accounts.astro.mjs.map
