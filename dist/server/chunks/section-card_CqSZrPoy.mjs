import { addDays, startOfDay, addWeeks, isAfter, subWeeks, format } from 'date-fns';
import { jsxs, jsx } from 'react/jsx-runtime';
import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const REFERENCE_PAYCHECK = new Date(2025, 10, 26);
function getPaycheckDateForDate(date) {
  const target = startOfDay(date);
  const reference = startOfDay(REFERENCE_PAYCHECK);
  const diffTime = target.getTime() - reference.getTime();
  const diffDays = Math.floor(diffTime / (1e3 * 60 * 60 * 24));
  const diffWeeks = Math.floor(diffDays / 7);
  const periodsFromReference = Math.floor(diffWeeks / 2);
  const paycheckDate = addWeeks(reference, periodsFromReference * 2);
  if (isAfter(paycheckDate, target)) {
    return subWeeks(paycheckDate, 2);
  }
  return paycheckDate;
}
function getPayPeriodForDate(date) {
  const paycheckDate = getPaycheckDateForDate(date);
  return {
    startDate: paycheckDate,
    endDate: addDays(paycheckDate, 13),
    // 14 days total (day 0-13)
    paycheckDate
  };
}
function getCurrentPayPeriod() {
  return getPayPeriodForDate(/* @__PURE__ */ new Date());
}
function getNextPayPeriod() {
  const current = getCurrentPayPeriod();
  return getPayPeriodForDate(addDays(current.endDate, 1));
}
function formatPayPeriod(payPeriod) {
  return `${format(payPeriod.startDate, "MMM d")} - ${format(payPeriod.endDate, "MMM d, yyyy")}`;
}

function SectionCard({
  title,
  subtitle,
  children,
  defaultOpen = true,
  collapsible = true,
  action
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return /* @__PURE__ */ jsxs("div", { className: "bg-theme-elevated rounded-2xl shadow-theme border border-theme overflow-hidden", children: [
    /* @__PURE__ */ jsxs(
      "div",
      {
        className: `
          flex items-center justify-between px-5 py-4
          ${collapsible ? "cursor-pointer hover:bg-theme-secondary/30 transition-colors" : ""}
        `,
        onClick: collapsible ? () => setIsOpen(!isOpen) : void 0,
        children: [
          /* @__PURE__ */ jsx("div", { className: "flex-1 min-w-0", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
            /* @__PURE__ */ jsx("h3", { className: "font-semibold text-theme-primary", children: title }),
            subtitle && /* @__PURE__ */ jsx("span", { className: "text-xs text-theme-muted bg-theme-secondary px-2 py-0.5 rounded-full", children: subtitle })
          ] }) }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
            action && /* @__PURE__ */ jsx("div", { onClick: (e) => e.stopPropagation(), children: action }),
            collapsible && /* @__PURE__ */ jsx(
              ChevronDown,
              {
                className: `h-5 w-5 text-theme-muted transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`
              }
            )
          ] })
        ]
      }
    ),
    isOpen && /* @__PURE__ */ jsx("div", { className: "px-5 pb-5", children })
  ] });
}

export { SectionCard as S, getNextPayPeriod as a, formatPayPeriod as f, getCurrentPayPeriod as g };
//# sourceMappingURL=section-card_CqSZrPoy.mjs.map
