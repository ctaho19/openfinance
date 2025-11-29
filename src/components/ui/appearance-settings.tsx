"use client";

import { ThemeToggle } from "./theme-toggle";
import { AccentPicker } from "./accent-picker";

export function AppearanceSettings() {
  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-theme-secondary mb-3">
          Theme Mode
        </label>
        <ThemeToggle />
      </div>

      <div>
        <label className="block text-sm font-medium text-theme-secondary mb-3">
          Accent Color
        </label>
        <AccentPicker />
      </div>
    </div>
  );
}
