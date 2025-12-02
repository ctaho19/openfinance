"use client";

import { Sun, Moon, Monitor } from "lucide-react";
import { useTheme } from "@/lib/theme-context";

type Mode = "light" | "dark" | "system";

const modes: { value: Mode; icon: typeof Sun; label: string }[] = [
  { value: "light", icon: Sun, label: "Light" },
  { value: "dark", icon: Moon, label: "Dark" },
  { value: "system", icon: Monitor, label: "System" },
];

export function ThemeToggle() {
  const { mode, setMode } = useTheme();

  return (
    <div className="flex items-center gap-1 p-1 rounded-xl bg-theme-tertiary">
      {modes.map(({ value, icon: Icon, label }) => (
        <button
          key={value}
          onClick={() => setMode(value)}
          className={`
            flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium
            transition-all duration-200
            ${mode === value
              ? "bg-theme-elevated text-theme-primary shadow-sm"
              : "text-theme-secondary hover:text-theme-primary"
            }
          `}
          title={label}
        >
          <Icon className="h-4 w-4" />
          <span className="hidden sm:inline">{label}</span>
        </button>
      ))}
    </div>
  );
}

export function ThemeToggleCompact() {
  const { resolvedMode, mode, setMode } = useTheme();

  const cycleMode = () => {
    const modeOrder: Mode[] = ["light", "dark", "system"];
    const currentIndex = modeOrder.indexOf(mode);
    const nextIndex = (currentIndex + 1) % modeOrder.length;
    setMode(modeOrder[nextIndex]);
  };

  const Icon =
    mode === "system" ? Monitor : resolvedMode === "dark" ? Moon : Sun;

  return (
    <button
      onClick={cycleMode}
      className="p-2.5 rounded-xl text-theme-secondary hover:bg-theme-tertiary hover:text-theme-primary transition-all duration-200"
      title={`Theme: ${mode}`}
      aria-label={`Current theme: ${mode}. Click to change.`}
    >
      <Icon className="h-5 w-5" />
    </button>
  );
}
