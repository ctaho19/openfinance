"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BankCard, BANK_OPTIONS } from "@/components/banks/bank-badge";
import { Plus, Trash2 } from "lucide-react";

interface BankAccount {
  id: string;
  name: string;
  bank: string;
  lastFour: string | null;
  isDefault: boolean;
}

export function BankAccountsSection() {
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    bank: "NAVY_FEDERAL",
    lastFour: "",
    isDefault: false,
  });

  useEffect(() => {
    fetchAccounts();
  }, []);

  async function fetchAccounts() {
    const res = await fetch("/api/bank-accounts");
    if (res.ok) {
      const data = await res.json();
      setAccounts(data);
    }
    setLoading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    const res = await fetch("/api/bank-accounts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    if (res.ok) {
      setFormData({ name: "", bank: "NAVY_FEDERAL", lastFour: "", isDefault: false });
      setShowForm(false);
      fetchAccounts();
    }
    setSaving(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this bank account?")) return;

    const res = await fetch(`/api/bank-accounts/${id}`, { method: "DELETE" });
    if (res.ok) {
      setAccounts(accounts.filter((a) => a.id !== id));
    }
  }

  async function handleSetDefault(id: string) {
    const res = await fetch(`/api/bank-accounts/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isDefault: true }),
    });
    if (res.ok) {
      fetchAccounts();
    }
  }

  const inputClasses =
    "w-full px-3 py-2 bg-theme-tertiary border border-theme rounded-lg text-theme-primary placeholder-theme-muted focus:outline-none focus:ring-2 focus:ring-accent";

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Bank Accounts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse text-theme-muted">Loading...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Bank Accounts</CardTitle>
        <Button size="sm" onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4 mr-1" />
          Add
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {showForm && (
          <form onSubmit={handleSubmit} className="p-4 bg-theme-tertiary rounded-lg space-y-4">
            <div>
              <label className="block text-sm font-medium text-theme-secondary mb-1">
                Account Name
              </label>
              <input
                type="text"
                required
                placeholder="e.g., Primary Checking"
                className={inputClasses}
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-theme-secondary mb-1">
                Bank
              </label>
              <select
                className={inputClasses}
                value={formData.bank}
                onChange={(e) => setFormData({ ...formData, bank: e.target.value })}
              >
                {BANK_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.icon} {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-theme-secondary mb-1">
                Last 4 Digits (optional)
              </label>
              <input
                type="text"
                maxLength={4}
                placeholder="1234"
                className={inputClasses}
                value={formData.lastFour}
                onChange={(e) =>
                  setFormData({ ...formData, lastFour: e.target.value.replace(/\D/g, "") })
                }
              />
            </div>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.isDefault}
                onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                className="rounded border-theme bg-theme-tertiary"
              />
              <span className="text-sm text-theme-secondary">Set as default</span>
            </label>

            <div className="flex gap-2">
              <Button type="submit" disabled={saving}>
                {saving ? "Saving..." : "Add Account"}
              </Button>
              <Button type="button" variant="secondary" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
            </div>
          </form>
        )}

        {accounts.length === 0 && !showForm ? (
          <p className="text-theme-muted text-sm">
            No bank accounts added yet. Add your bank accounts to track which account pays each
            bill.
          </p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {accounts.map((account) => (
              <div key={account.id} className="relative group">
                <BankCard
                  bank={account.bank}
                  name={account.name}
                  lastFour={account.lastFour}
                  isDefault={account.isDefault}
                  onClick={() => !account.isDefault && handleSetDefault(account.id)}
                />
                <button
                  onClick={() => handleDelete(account.id)}
                  className="absolute top-2 left-2 p-1.5 rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
