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
    <div className="flex items-center gap-1 p-1 rounded-lg bg-theme-tertiary">
      {modes.map(({ value, icon: Icon, label }) => (
        <button
          key={value}
          onClick={() => setMode(value)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
            mode === value
              ? "bg-accent-600 text-white"
              : "text-theme-secondary hover:text-theme-primary"
          }`}
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
      className="p-2 rounded-lg text-theme-secondary hover:bg-theme-tertiary hover:text-theme-primary transition-colors"
      title={`Theme: ${mode}`}
    >
      <Icon className="h-5 w-5" />
    </button>
  );
}
