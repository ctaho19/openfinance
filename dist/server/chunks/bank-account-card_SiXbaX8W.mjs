import { jsxs, jsx } from 'react/jsx-runtime';
import { Building2, Star, MoreVertical, Pencil, Trash2 } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

const BANK_CONFIG = {
  NAVY_FEDERAL: {
    name: "Navy Federal",
    gradient: "from-blue-900 via-blue-800 to-blue-700",
    initials: "NF"
  },
  PNC: {
    name: "PNC",
    gradient: "from-orange-600 via-orange-500 to-orange-400",
    initials: "PNC"
  },
  CAPITAL_ONE: {
    name: "Capital One",
    gradient: "from-red-700 via-red-600 to-red-500",
    initials: "C1"
  },
  TRUIST: {
    name: "Truist",
    gradient: "from-purple-700 via-purple-600 to-purple-500",
    initials: "T"
  },
  CHASE: {
    name: "Chase",
    gradient: "from-blue-800 via-blue-700 to-blue-600",
    initials: "C"
  },
  BANK_OF_AMERICA: {
    name: "Bank of America",
    gradient: "from-red-800 via-red-700 to-blue-700",
    initials: "BoA"
  },
  WELLS_FARGO: {
    name: "Wells Fargo",
    gradient: "from-red-700 via-yellow-600 to-yellow-500",
    initials: "WF"
  },
  OTHER: {
    name: "Other",
    gradient: "from-gray-700 via-gray-600 to-gray-500",
    initials: ""
  }
};
function getBankIcon(bank, size = 24) {
  const config = BANK_CONFIG[bank] || BANK_CONFIG.OTHER;
  if (config.initials) {
    return /* @__PURE__ */ jsx("span", { className: "font-bold text-white tracking-tight", style: { fontSize: size * 0.6 }, children: config.initials });
  }
  return /* @__PURE__ */ jsx(Building2, { size, className: "text-white" });
}
function BankAccountCard({
  id,
  name,
  bank,
  lastFour,
  isDefault,
  onEdit,
  onDelete,
  onSetDefault
}) {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);
  const config = BANK_CONFIG[bank] || BANK_CONFIG.OTHER;
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  return /* @__PURE__ */ jsxs(
    "div",
    {
      className: `
        relative overflow-hidden rounded-2xl p-5
        bg-gradient-to-br ${config.gradient}
        shadow-lg hover:shadow-xl transition-all duration-300
        hover:scale-[1.02] group
        min-h-[140px]
      `,
      children: [
        /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCI+CjxyZWN0IHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgZmlsbD0ibm9uZSIvPgo8Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIxLjUiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4xKSIvPgo8L3N2Zz4=')] opacity-30" }),
        /* @__PURE__ */ jsxs("div", { className: "absolute top-3 right-3 flex items-center gap-2", children: [
          isDefault && /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1 text-xs bg-white/20 backdrop-blur-sm px-2.5 py-1 rounded-full text-white font-medium", children: [
            /* @__PURE__ */ jsx(Star, { className: "h-3 w-3 fill-current" }),
            "Default"
          ] }),
          (onEdit || onDelete || onSetDefault) && /* @__PURE__ */ jsxs("div", { ref: menuRef, className: "relative", children: [
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: () => setShowMenu(!showMenu),
                className: "p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors opacity-0 group-hover:opacity-100",
                children: /* @__PURE__ */ jsx(MoreVertical, { className: "h-4 w-4 text-white" })
              }
            ),
            showMenu && /* @__PURE__ */ jsxs("div", { className: "absolute right-0 top-full mt-1 w-40 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 py-1 z-10", children: [
              onEdit && /* @__PURE__ */ jsxs(
                "button",
                {
                  onClick: () => {
                    onEdit(id);
                    setShowMenu(false);
                  },
                  className: "w-full px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2",
                  children: [
                    /* @__PURE__ */ jsx(Pencil, { className: "h-4 w-4" }),
                    "Edit"
                  ]
                }
              ),
              !isDefault && onSetDefault && /* @__PURE__ */ jsxs(
                "button",
                {
                  onClick: () => {
                    onSetDefault(id);
                    setShowMenu(false);
                  },
                  className: "w-full px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2",
                  children: [
                    /* @__PURE__ */ jsx(Star, { className: "h-4 w-4" }),
                    "Set as Default"
                  ]
                }
              ),
              onDelete && /* @__PURE__ */ jsxs(
                "button",
                {
                  onClick: () => {
                    onDelete(id);
                    setShowMenu(false);
                  },
                  className: "w-full px-3 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2",
                  children: [
                    /* @__PURE__ */ jsx(Trash2, { className: "h-4 w-4" }),
                    "Delete"
                  ]
                }
              )
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "relative flex flex-col justify-between h-full", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 mb-4", children: [
            /* @__PURE__ */ jsx("div", { className: "w-12 h-12 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center", children: getBankIcon(bank, 28) }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "text-white font-semibold text-lg leading-tight", children: name }),
              /* @__PURE__ */ jsx("p", { className: "text-white/70 text-sm", children: config.name })
            ] })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "flex items-center justify-between mt-auto", children: /* @__PURE__ */ jsx("div", { className: "flex items-center gap-3", children: lastFour && /* @__PURE__ */ jsxs("p", { className: "font-mono text-white/90 text-lg tracking-widest", children: [
            "•••• ",
            lastFour
          ] }) }) })
        ] })
      ]
    }
  );
}
function BankAccountAllocationCard({
  name,
  bank,
  lastFour,
  amount,
  bills
}) {
  const config = BANK_CONFIG[bank] || BANK_CONFIG.OTHER;
  return /* @__PURE__ */ jsxs("div", { className: "bg-white dark:bg-[#1c2128] rounded-xl border border-gray-200 dark:border-[#30363d] overflow-hidden", children: [
    /* @__PURE__ */ jsx("div", { className: `p-4 bg-gradient-to-r ${config.gradient}`, children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsx("div", { className: "w-10 h-10 rounded-lg bg-white/10 backdrop-blur-sm flex items-center justify-center", children: getBankIcon(bank, 20) }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("p", { className: "font-semibold text-white", children: name }),
          /* @__PURE__ */ jsxs("p", { className: "text-sm text-white/70", children: [
            config.name,
            " ",
            lastFour && `•••• ${lastFour}`
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "text-right", children: [
        /* @__PURE__ */ jsx("p", { className: "text-xs text-white/70", children: "Transfer Amount" }),
        /* @__PURE__ */ jsxs("p", { className: "text-xl font-bold text-white", children: [
          "$",
          amount.toLocaleString(void 0, { minimumFractionDigits: 2 })
        ] })
      ] })
    ] }) }),
    bills.length > 0 && /* @__PURE__ */ jsx("div", { className: "p-4 divide-y divide-gray-100 dark:divide-gray-800", children: bills.map((bill, idx) => /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between py-2 first:pt-0 last:pb-0", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("p", { className: "font-medium text-gray-900 dark:text-gray-100 text-sm", children: bill.name }),
        bill.dueDate && /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500 dark:text-gray-400", children: bill.dueDate })
      ] }),
      /* @__PURE__ */ jsxs("p", { className: "font-medium text-gray-700 dark:text-gray-300", children: [
        "$",
        bill.amount.toLocaleString(void 0, { minimumFractionDigits: 2 })
      ] })
    ] }, idx)) })
  ] });
}

export { BankAccountAllocationCard as B, BankAccountCard as a };
//# sourceMappingURL=bank-account-card_SiXbaX8W.mjs.map
