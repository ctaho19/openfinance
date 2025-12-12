import { ThemeToggle } from "./theme-toggle";
import { AccentPicker } from "./accent-picker";
import { ThemeProvider } from "@/lib/theme-context";

export function AppearanceSettings() {
  return (
    <ThemeProvider>
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
    </ThemeProvider>
  );
}
