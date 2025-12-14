import { useState, useEffect } from "react";
import { BankAccountCard } from "@/components/ui/bank-account-card";
import { Button } from "@/components/ui/button";
import { BANK_OPTIONS } from "@/components/banks/bank-badge";
import { Plus, X, Building2 } from "lucide-react";

interface BankAccount {
  id: string;
  name: string;
  bank: string;
  lastFour: string | null;
  isDefault: boolean;
}

export function BankAccountsManager() {
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    bank: "CHASE",
    lastFour: "",
    isDefault: false,
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchAccounts();
  }, []);

  async function fetchAccounts() {
    try {
      const res = await fetch("/api/bank-accounts");
      if (res.ok) {
        const data = await res.json();
        setAccounts(data);
      }
    } catch {
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setFormData({ name: "", bank: "CHASE", lastFour: "", isDefault: false });
    setEditingId(null);
    setShowForm(false);
    setError("");
  }

  function handleEdit(id: string) {
    const account = accounts.find((a) => a.id === id);
    if (account) {
      setFormData({
        name: account.name,
        bank: account.bank,
        lastFour: account.lastFour || "",
        isDefault: account.isDefault,
      });
      setEditingId(id);
      setShowForm(true);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this bank account?")) return;

    try {
      const res = await fetch(`/api/bank-accounts/${id}`, { method: "DELETE" });
      if (res.ok) {
        setAccounts(accounts.filter((a) => a.id !== id));
      }
    } catch {
      setError("Failed to delete account");
    }
  }

  async function handleSetDefault(id: string) {
    try {
      const res = await fetch(`/api/bank-accounts/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isDefault: true }),
      });
      if (res.ok) {
        setAccounts(
          accounts.map((a) => ({
            ...a,
            isDefault: a.id === id,
          }))
        );
      }
    } catch {
      setError("Failed to set default account");
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const url = editingId ? `/api/bank-accounts/${editingId}` : "/api/bank-accounts";
      const method = editingId ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          bank: formData.bank,
          lastFour: formData.lastFour || null,
          isDefault: formData.isDefault,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save account");
      }

      await fetchAccounts();
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  const inputClasses =
    "w-full px-4 py-2.5 bg-theme-secondary border border-theme rounded-xl text-theme-primary placeholder-theme-muted focus:outline-none focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500";

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {accounts.length === 0 && !showForm ? (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700">
          <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-4">
            <Building2 className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            No Bank Accounts Yet
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4 max-w-sm mx-auto">
            Add your bank accounts to track which account each bill comes from and see transfer amounts per account.
          </p>
          <Button onClick={() => setShowForm(true)} leftIcon={<Plus className="h-4 w-4" />}>
            Add Bank Account
          </Button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {accounts.map((account) => (
              <BankAccountCard
                key={account.id}
                id={account.id}
                name={account.name}
                bank={account.bank}
                lastFour={account.lastFour}
                isDefault={account.isDefault}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onSetDefault={handleSetDefault}
              />
            ))}
          </div>

          {!showForm && (
            <Button
              variant="secondary"
              onClick={() => setShowForm(true)}
              leftIcon={<Plus className="h-4 w-4" />}
            >
              Add Bank Account
            </Button>
          )}
        </>
      )}

      {showForm && (
        <div className="bg-white dark:bg-[#1c2128] rounded-xl border border-gray-200 dark:border-[#30363d] p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {editingId ? "Edit Bank Account" : "Add Bank Account"}
            </h3>
            <button
              onClick={resetForm}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label htmlFor="name" className="block text-sm font-medium text-theme-secondary">
                  Account Name *
                </label>
                <input
                  type="text"
                  id="name"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Primary Checking"
                  className={inputClasses}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="bank" className="block text-sm font-medium text-theme-secondary">
                  Bank *
                </label>
                <select
                  id="bank"
                  required
                  value={formData.bank}
                  onChange={(e) => setFormData({ ...formData, bank: e.target.value })}
                  className={inputClasses}
                >
                  {BANK_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label htmlFor="lastFour" className="block text-sm font-medium text-theme-secondary">
                  Last 4 Digits (Optional)
                </label>
                <input
                  type="text"
                  id="lastFour"
                  maxLength={4}
                  pattern="[0-9]*"
                  value={formData.lastFour}
                  onChange={(e) => setFormData({ ...formData, lastFour: e.target.value.replace(/\D/g, "") })}
                  placeholder="1234"
                  className={inputClasses}
                />
              </div>

              <div className="flex items-center gap-3 pt-8">
                <input
                  type="checkbox"
                  id="isDefault"
                  checked={formData.isDefault}
                  onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                  className="h-4 w-4 rounded border-gray-300 text-accent-600 focus:ring-accent-500"
                />
                <label htmlFor="isDefault" className="text-sm font-medium text-theme-secondary">
                  Set as default account
                </label>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={submitting}>
                {submitting ? "Saving..." : editingId ? "Update Account" : "Add Account"}
              </Button>
              <Button type="button" variant="secondary" onClick={resetForm}>
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
