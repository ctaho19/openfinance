"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

export function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/login" })}
      className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-theme-secondary hover:bg-theme-tertiary hover:text-theme-primary transition-all duration-200"
    >
      <LogOut className="h-5 w-5" />
      Sign out
    </button>
  );
}
