import { useState } from "react";
import { Button } from "@/components/ui/button";
import { MoreVertical, Pencil, Trash2, Power } from "lucide-react";

interface Bill {
  id: string;
  name: string;
  isActive: boolean;
}

export function BillActions({ bill }: { bill: Bill }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleToggleActive = async () => {
    await fetch(`/api/bills/${bill.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !bill.isActive }),
    });
    window.location.reload();
    setIsOpen(false);
  };

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete "${bill.name}"?`)) return;

    setIsDeleting(true);
    await fetch(`/api/bills/${bill.id}`, { method: "DELETE" });
    window.location.reload();
    setIsOpen(false);
    setIsDeleting(false);
  };

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="h-8 w-8 p-0"
      >
        <MoreVertical className="h-4 w-4" />
      </Button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-full mt-1 z-20 w-48 rounded-lg bg-theme-secondary border border-theme shadow-lg py-1">
            <a
              href={`/dashboard/bills/${bill.id}/edit`}
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2 w-full px-4 py-2 text-sm text-theme-secondary hover:bg-theme-tertiary hover:text-theme-primary"
            >
              <Pencil className="h-4 w-4" />
              Edit
            </a>
            <button
              onClick={handleToggleActive}
              className="flex items-center gap-2 w-full px-4 py-2 text-sm text-theme-secondary hover:bg-theme-tertiary hover:text-theme-primary"
            >
              <Power className="h-4 w-4" />
              {bill.isActive ? "Deactivate" : "Activate"}
            </button>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-400 hover:bg-theme-tertiary hover:text-red-300"
            >
              <Trash2 className="h-4 w-4" />
              {isDeleting ? "Deleting..." : "Delete"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
