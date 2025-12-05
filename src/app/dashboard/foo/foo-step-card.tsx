"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { FOOStep, FOOStatus } from "@prisma/client";
import {
  CheckCircle2,
  Circle,
  Clock,
  ChevronDown,
  ChevronUp,
  Loader2,
} from "lucide-react";
import { useRouter } from "next/navigation";

interface FOOStepCardProps {
  step: FOOStep;
  number: number;
  name: string;
  description: string;
  explanation: string;
  hasAmount: boolean;
  status: FOOStatus;
  targetAmount?: number;
  currentAmount?: number;
  notes?: string;
  isCurrentStep: boolean;
  completedAt?: Date;
}

export function FOOStepCard({
  step,
  number,
  name,
  description,
  explanation,
  hasAmount,
  status,
  targetAmount,
  currentAmount,
  notes,
  isCurrentStep,
  completedAt,
}: FOOStepCardProps) {
  const router = useRouter();
  const [isExpanded, setIsExpanded] = useState(isCurrentStep);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [formStatus, setFormStatus] = useState<FOOStatus>(status);
  const [formTarget, setFormTarget] = useState(targetAmount?.toString() || "");
  const [formCurrent, setFormCurrent] = useState(currentAmount?.toString() || "");
  const [formNotes, setFormNotes] = useState(notes || "");

  const progress =
    hasAmount && targetAmount && targetAmount > 0
      ? Math.min(100, ((currentAmount || 0) / targetAmount) * 100)
      : null;

  async function handleSave() {
    setIsSaving(true);
    try {
      const response = await fetch("/api/foo", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          step,
          status: formStatus,
          targetAmount: formTarget ? parseFloat(formTarget) : null,
          currentAmount: formCurrent ? parseFloat(formCurrent) : null,
          notes: formNotes || null,
        }),
      });

      if (response.ok) {
        setIsEditing(false);
        router.refresh();
      }
    } finally {
      setIsSaving(false);
    }
  }

  function getStatusIcon() {
    switch (status) {
      case "COMPLETED":
        return <CheckCircle2 className="h-6 w-6 text-accent-500" />;
      case "IN_PROGRESS":
        return <Clock className="h-6 w-6 text-yellow-500" />;
      default:
        return <Circle className="h-6 w-6 text-gray-600" />;
    }
  }

  function getStatusBadge() {
    switch (status) {
      case "COMPLETED":
        return <Badge variant="success">Completed</Badge>;
      case "IN_PROGRESS":
        return <Badge variant="warning">In Progress</Badge>;
      default:
        return <Badge variant="default">Not Started</Badge>;
    }
  }

  return (
    <Card
      className={`transition-all ${
        isCurrentStep
          ? "ring-2 ring-accent-500/50 bg-theme-secondary"
          : status === "COMPLETED"
            ? "bg-theme-secondary opacity-80"
            : ""
      }`}
    >
      <CardHeader
        className="cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-theme-tertiary text-theme-primary font-bold">
              {status === "COMPLETED" ? (
                <CheckCircle2 className="h-6 w-6 text-accent-500" />
              ) : (
                number
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-lg">{name}</CardTitle>
                {isCurrentStep && (
                  <Badge variant="info" className="text-xs">
                    Current Step
                  </Badge>
                )}
              </div>
              <p className="text-sm text-theme-secondary mt-0.5">{description}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {getStatusBadge()}
            {isExpanded ? (
              <ChevronUp className="h-5 w-5 text-theme-secondary" />
            ) : (
              <ChevronDown className="h-5 w-5 text-theme-secondary" />
            )}
          </div>
        </div>

        {hasAmount && progress !== null && status !== "NOT_STARTED" && (
          <div className="mt-4 ml-14">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-theme-secondary">
                ${(currentAmount || 0).toLocaleString()} of $
                {(targetAmount || 0).toLocaleString()}
              </span>
              <span className="text-accent-400">{progress.toFixed(0)}%</span>
            </div>
            <div className="h-2 bg-theme-tertiary rounded-full overflow-hidden">
              <div
                className="h-full bg-accent-500 rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
      </CardHeader>

      {isExpanded && (
        <CardContent className="border-t border-theme">
          <div className="space-y-4">
            <div className="bg-theme-tertiary rounded-lg p-4">
              <p className="text-sm text-theme-secondary leading-relaxed">
                {explanation}
              </p>
            </div>

            {completedAt && status === "COMPLETED" && (
              <p className="text-sm text-theme-muted">
                Completed on{" "}
                {new Date(completedAt).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            )}

            {notes && !isEditing && (
              <div className="bg-theme-tertiary rounded-lg p-3">
                <p className="text-xs text-theme-muted mb-1">Notes</p>
                <p className="text-sm text-theme-secondary">{notes}</p>
              </div>
            )}

            {isEditing ? (
              <div className="space-y-4 pt-2">
                <div>
                  <label className="block text-sm font-medium text-theme-secondary mb-2">
                    Status
                  </label>
                  <div className="flex gap-2">
                    {(["NOT_STARTED", "IN_PROGRESS", "COMPLETED"] as FOOStatus[]).map(
                      (s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setFormStatus(s)}
                          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                            formStatus === s
                              ? s === "COMPLETED"
                                ? "bg-accent-600 text-white"
                                : s === "IN_PROGRESS"
                                  ? "bg-yellow-600 text-white"
                                  : "bg-gray-600 text-white"
                              : "bg-theme-tertiary text-theme-secondary hover:opacity-80"
                          }`}
                        >
                          {s.replace("_", " ")}
                        </button>
                      )
                    )}
                  </div>
                </div>

                {hasAmount && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-theme-secondary mb-2">
                        Target Amount
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-theme-muted">
                          $
                        </span>
                        <input
                          type="number"
                          value={formTarget}
                          onChange={(e) => setFormTarget(e.target.value)}
                          placeholder="0.00"
                          className="w-full bg-theme-tertiary border border-theme rounded-lg pl-7 pr-3 py-2 text-theme-primary placeholder-theme-muted focus:outline-none focus:ring-2 focus:ring-accent-500"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-theme-secondary mb-2">
                        Current Amount
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-theme-muted">
                          $
                        </span>
                        <input
                          type="number"
                          value={formCurrent}
                          onChange={(e) => setFormCurrent(e.target.value)}
                          placeholder="0.00"
                          className="w-full bg-theme-tertiary border border-theme rounded-lg pl-7 pr-3 py-2 text-theme-primary placeholder-theme-muted focus:outline-none focus:ring-2 focus:ring-accent-500"
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-theme-secondary mb-2">
                    Notes
                  </label>
                  <textarea
                    value={formNotes}
                    onChange={(e) => setFormNotes(e.target.value)}
                    placeholder="Add any notes about your progress..."
                    rows={2}
                    className="w-full bg-theme-tertiary border border-theme rounded-lg px-3 py-2 text-theme-primary placeholder-theme-muted focus:outline-none focus:ring-2 focus:ring-accent-500 resize-none"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <Button onClick={handleSave} disabled={isSaving}>
                    {isSaving ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Save Changes"
                    )}
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setIsEditing(false);
                      setFormStatus(status);
                      setFormTarget(targetAmount?.toString() || "");
                      setFormCurrent(currentAmount?.toString() || "");
                      setFormNotes(notes || "");
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                variant="secondary"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsEditing(true);
                }}
              >
                Update Progress
              </Button>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
}
