"use client";

import { Search, X } from "lucide-react";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function SearchInput({
  value,
  onChange,
  placeholder = "Search...",
  className = "",
  size = "md",
}: SearchInputProps) {
  const sizes = {
    sm: "h-9 text-sm pl-9 pr-9",
    md: "h-10 text-sm pl-10 pr-10",
    lg: "h-12 text-base pl-12 pr-12",
  };

  const iconSizes = {
    sm: "h-4 w-4 left-2.5",
    md: "h-4 w-4 left-3",
    lg: "h-5 w-5 left-3.5",
  };

  const clearSizes = {
    sm: "right-2.5",
    md: "right-3",
    lg: "right-3.5",
  };

  return (
    <div className={`relative ${className}`}>
      <Search className={`absolute top-1/2 -translate-y-1/2 text-theme-muted ${iconSizes[size]}`} />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`
          w-full rounded-xl
          bg-theme-tertiary border border-theme
          text-theme-primary placeholder:text-theme-muted
          focus:outline-none focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500
          transition-all duration-200
          ${sizes[size]}
        `}
      />
      {value && (
        <button
          onClick={() => onChange("")}
          className={`
            absolute top-1/2 -translate-y-1/2
            text-theme-muted hover:text-theme-primary
            transition-colors duration-200
            p-0.5 rounded-md hover:bg-theme-secondary
            ${clearSizes[size]}
          `}
          aria-label="Clear search"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
