"use client";

import { createContext, useContext, useEffect, useState } from "react";

type Mode = "light" | "dark" | "system";
type AccentColor = "emerald" | "blue" | "purple" | "orange" | "pink";

interface ThemeContextType {
  mode: Mode;
  setMode: (mode: Mode) => void;
  accentColor: AccentColor;
  setAccentColor: (color: AccentColor) => void;
  resolvedMode: "light" | "dark";
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

function getSystemTheme(): "light" | "dark" {
  if (typeof window === "undefined") return "dark";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<Mode>("system");
  const [accentColor, setAccentColorState] = useState<AccentColor>("emerald");
  const [resolvedMode, setResolvedMode] = useState<"light" | "dark">("dark");
  const [mounted, setMounted] = useState(false);

  // Load saved preferences on mount
  useEffect(() => {
    const savedMode = localStorage.getItem("theme-mode") as Mode | null;
    const savedAccent = localStorage.getItem(
      "theme-accent"
    ) as AccentColor | null;

    if (savedMode) setModeState(savedMode);
    if (savedAccent) setAccentColorState(savedAccent);
    setMounted(true);
  }, []);

  // Resolve the actual theme based on mode
  useEffect(() => {
    if (!mounted) return;

    const updateResolvedMode = () => {
      const resolved = mode === "system" ? getSystemTheme() : mode;
      setResolvedMode(resolved);

      // Apply to document
      const root = document.documentElement;
      root.classList.remove("light", "dark");
      root.classList.add(resolved);
    };

    updateResolvedMode();

    // Listen for system theme changes
    if (mode === "system") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      const handler = () => updateResolvedMode();
      mediaQuery.addEventListener("change", handler);
      return () => mediaQuery.removeEventListener("change", handler);
    }
  }, [mode, mounted]);

  // Apply accent color class
  useEffect(() => {
    if (!mounted) return;

    const root = document.documentElement;
    root.classList.remove(
      "accent-emerald",
      "accent-blue",
      "accent-purple",
      "accent-orange",
      "accent-pink"
    );
    root.classList.add(`accent-${accentColor}`);
  }, [accentColor, mounted]);

  const setMode = (newMode: Mode) => {
    setModeState(newMode);
    localStorage.setItem("theme-mode", newMode);
  };

  const setAccentColor = (newColor: AccentColor) => {
    setAccentColorState(newColor);
    localStorage.setItem("theme-accent", newColor);
  };

  // Always provide context, but use default values before mounted
  const value: ThemeContextType = {
    mode,
    setMode,
    accentColor,
    setAccentColor,
    resolvedMode,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
