import { jsxs, jsx } from 'react/jsx-runtime';
import { Building2 } from 'lucide-react';

const BANK_CONFIG = {
  NAVY_FEDERAL: {
    name: "Navy Federal",
    bg: "bg-gradient-to-r from-blue-900 to-blue-700",
    text: "text-white",
    initials: "NF"
  },
  PNC: {
    name: "PNC",
    bg: "bg-gradient-to-r from-orange-600 to-orange-500",
    text: "text-white",
    initials: "PNC"
  },
  CAPITAL_ONE: {
    name: "Capital One",
    bg: "bg-gradient-to-r from-red-700 to-red-600",
    text: "text-white",
    initials: "C1"
  },
  TRUIST: {
    name: "Truist",
    bg: "bg-gradient-to-r from-purple-700 to-purple-600",
    text: "text-white",
    initials: "T"
  },
  CHASE: {
    name: "Chase",
    bg: "bg-gradient-to-r from-blue-800 to-blue-600",
    text: "text-white",
    initials: "C"
  },
  BANK_OF_AMERICA: {
    name: "Bank of America",
    bg: "bg-gradient-to-r from-red-800 to-blue-800",
    text: "text-white",
    initials: "BoA"
  },
  WELLS_FARGO: {
    name: "Wells Fargo",
    bg: "bg-gradient-to-r from-red-700 to-yellow-600",
    text: "text-white",
    initials: "WF"
  },
  OTHER: {
    name: "Other",
    bg: "bg-gradient-to-r from-gray-600 to-gray-500",
    text: "text-white",
    initials: ""
  }
};
function BankSelector({
  value,
  onChange,
  banks
}) {
  if (banks.length === 0) {
    return /* @__PURE__ */ jsxs("p", { className: "text-sm text-theme-muted", children: [
      "No bank accounts added.",
      " ",
      /* @__PURE__ */ jsx("a", { href: "/dashboard/settings", className: "text-accent hover:underline", children: "Add one in settings" })
    ] });
  }
  return /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 gap-2", children: banks.map((account) => {
    const config = BANK_CONFIG[account.bank] || BANK_CONFIG.OTHER;
    const isSelected = value === account.id;
    return /* @__PURE__ */ jsx(
      "button",
      {
        type: "button",
        onClick: () => onChange(account.id),
        className: `
              p-3 rounded-lg border-2 text-left transition-all
              ${isSelected ? `${config.bg} ${config.text} border-transparent` : "bg-theme-secondary border-theme hover:border-theme-hover"}
            `,
        children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsx("span", { className: "font-bold", children: config.initials || /* @__PURE__ */ jsx(Building2, { size: 16 }) }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: `text-sm font-medium ${isSelected ? "" : "text-theme-primary"}`, children: account.name }),
            /* @__PURE__ */ jsxs("p", { className: `text-xs ${isSelected ? "opacity-75" : "text-theme-muted"}`, children: [
              config.name,
              " ",
              account.lastFour && `•${account.lastFour}`
            ] })
          ] })
        ] })
      },
      account.id
    );
  }) });
}
const BANK_OPTIONS = Object.entries(BANK_CONFIG).map(([value, config]) => ({
  value,
  label: config.name,
  initials: config.initials
}));

export { BankSelector as B, BANK_OPTIONS as a };
//# sourceMappingURL=bank-badge_CrB3W5ys.mjs.map
