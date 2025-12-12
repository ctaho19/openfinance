import { LogOut } from "lucide-react";

export function SignOutButton() {
  const handleSignOut = async () => {
    try {
      const csrfRes = await fetch("/api/auth/csrf");
      const { csrfToken } = await csrfRes.json();
      await fetch("/api/auth/signout", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ csrfToken }),
      });
    } catch {
      // Proceed to redirect even if signout fails
    }
    window.location.href = "/login";
  };

  return (
    <button
      onClick={handleSignOut}
      className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-theme-secondary hover:bg-theme-tertiary hover:text-theme-primary transition-all duration-200"
    >
      <LogOut className="h-5 w-5" />
      Sign out
    </button>
  );
}
