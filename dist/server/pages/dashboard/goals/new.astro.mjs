import { e as createComponent, f as createAstro, k as renderComponent, r as renderTemplate } from '../../../chunks/astro/server_Cel7--ii.mjs';
import 'piccolore';
import { $ as $$DashboardLayout } from '../../../chunks/DashboardLayout_CUxWaT_w.mjs';
import { jsxs, jsx } from 'react/jsx-runtime';
import { useState } from 'react';
import { B as Button, C as Card, a as CardHeader, b as CardTitle, c as CardContent } from '../../../chunks/button_D1bppc5j.mjs';
import { ArrowLeft } from 'lucide-react';
import { g as getSession } from '../../../chunks/get-session-astro_CVC6HSBT.mjs';
export { renderers } from '../../../renderers.mjs';

function NewGoalForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    targetAmount: "",
    currentAmount: "",
    deadline: "",
    notes: ""
  });
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          targetAmount: parseFloat(formData.targetAmount),
          currentAmount: formData.currentAmount ? parseFloat(formData.currentAmount) : 0,
          deadline: formData.deadline || null,
          notes: formData.notes || null
        })
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create goal");
      }
      window.location.href = "/dashboard/goals";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };
  const inputClasses = "w-full px-4 py-2 bg-theme-secondary border border-theme rounded-xl text-theme-primary placeholder-theme-muted focus:outline-none focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500";
  return /* @__PURE__ */ jsxs("div", { className: "animate-fade-in space-y-6 lg:space-y-8", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
      /* @__PURE__ */ jsx("a", { href: "/dashboard/goals", children: /* @__PURE__ */ jsx(Button, { variant: "ghost", size: "sm", leftIcon: /* @__PURE__ */ jsx(ArrowLeft, { className: "h-4 w-4" }), children: "Back" }) }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold text-theme-primary", children: "Add New Goal" }),
        /* @__PURE__ */ jsx("p", { className: "text-theme-secondary mt-1", children: "Create a new savings goal to track your progress" })
      ] })
    ] }),
    /* @__PURE__ */ jsxs(Card, { children: [
      /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsx(CardTitle, { children: "Goal Details" }) }),
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
                placeholder: "e.g., Emergency Fund, Vacation",
                className: inputClasses
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsx("label", { htmlFor: "targetAmount", className: "block text-sm font-medium text-theme-secondary", children: "Target Amount *" }),
            /* @__PURE__ */ jsxs("div", { className: "relative", children: [
              /* @__PURE__ */ jsx("span", { className: "absolute left-4 top-1/2 -translate-y-1/2 text-theme-muted", children: "$" }),
              /* @__PURE__ */ jsx(
                "input",
                {
                  type: "number",
                  id: "targetAmount",
                  name: "targetAmount",
                  required: true,
                  min: "0",
                  step: "0.01",
                  inputMode: "decimal",
                  value: formData.targetAmount,
                  onChange: handleChange,
                  placeholder: "0.00",
                  className: `${inputClasses} pl-8`
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsx("label", { htmlFor: "currentAmount", className: "block text-sm font-medium text-theme-secondary", children: "Current Amount" }),
            /* @__PURE__ */ jsxs("div", { className: "relative", children: [
              /* @__PURE__ */ jsx("span", { className: "absolute left-4 top-1/2 -translate-y-1/2 text-theme-muted", children: "$" }),
              /* @__PURE__ */ jsx(
                "input",
                {
                  type: "number",
                  id: "currentAmount",
                  name: "currentAmount",
                  min: "0",
                  step: "0.01",
                  inputMode: "decimal",
                  value: formData.currentAmount,
                  onChange: handleChange,
                  placeholder: "0.00",
                  className: `${inputClasses} pl-8`
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsx("label", { htmlFor: "deadline", className: "block text-sm font-medium text-theme-secondary", children: "Deadline" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "date",
                id: "deadline",
                name: "deadline",
                value: formData.deadline,
                onChange: handleChange,
                className: inputClasses
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsx("label", { htmlFor: "notes", className: "block text-sm font-medium text-theme-secondary", children: "Notes" }),
          /* @__PURE__ */ jsx(
            "textarea",
            {
              id: "notes",
              name: "notes",
              rows: 3,
              value: formData.notes,
              onChange: handleChange,
              placeholder: "Any additional notes about this goal...",
              className: `${inputClasses} resize-none`
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex gap-4 pt-4", children: [
          /* @__PURE__ */ jsx(Button, { type: "submit", disabled: isSubmitting, children: isSubmitting ? "Creating..." : "Create Goal" }),
          /* @__PURE__ */ jsx("a", { href: "/dashboard/goals", children: /* @__PURE__ */ jsx(Button, { type: "button", variant: "secondary", children: "Cancel" }) })
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
  return renderTemplate`${renderComponent($$result, "DashboardLayout", $$DashboardLayout, { "title": "Add Goal", "currentPath": "/dashboard/goals", "user": session.user, "showExploreSidebar": false }, { "default": async ($$result2) => renderTemplate` ${renderComponent($$result2, "NewGoalForm", NewGoalForm, { "client:load": true, "client:component-hydration": "load", "client:component-path": "/Users/chris/projects/dev/openfinance/src/components/forms/new-goal-form", "client:component-export": "default" })} ` })}`;
}, "/Users/chris/projects/dev/openfinance/src/pages/dashboard/goals/new.astro", void 0);

const $$file = "/Users/chris/projects/dev/openfinance/src/pages/dashboard/goals/new.astro";
const $$url = "/dashboard/goals/new";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$New,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
//# sourceMappingURL=new.astro.mjs.map
