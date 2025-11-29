"use client";

import { Check } from "lucide-react";
import { useTheme } from "@/lib/theme-context";

type AccentColor = "emerald" | "blue" | "purple" | "orange" | "pink";

const accentColors: { value: AccentColor; label: string; color: string }[] = [
  { value: "emerald", label: "Emerald", color: "#10b981" },
  { value: "blue", label: "Blue", color: "#3b82f6" },
  { value: "purple", label: "Purple", color: "#a855f7" },
  { value: "orange", label: "Orange", color: "#f97316" },
  { value: "pink", label: "Pink", color: "#ec4899" },
];

export function AccentPicker() {
  const { accentColor, setAccentColor } = useTheme();

  return (
    <div className="flex flex-wrap gap-3">
      {accentColors.map(({ value, label, color }) => (
        <button
          key={value}
          onClick={() => setAccentColor(value)}
          className="group relative"
          title={label}
        >
          <div
            className={`w-10 h-10 rounded-full transition-transform hover:scale-110 ${
              accentColor === value ? "ring-2 ring-offset-2 ring-offset-[var(--bg-primary)]" : ""
            }`}
            style={{
              backgroundColor: color,
              ["--tw-ring-color" as string]: accentColor === value ? color : undefined,
            }}
          >
            {accentColor === value && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Check className="h-5 w-5 text-white" />
              </div>
            )}
          </div>
          <span className="sr-only">{label}</span>
        </button>
      ))}
    </div>
  );
}
