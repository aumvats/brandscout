"use client";

import { useState, FormEvent } from "react";
import { Button } from "@/components/ui/Button";

interface AddBrandModalProps {
  onAdd: (name: string) => Promise<void>;
  onClose: () => void;
  planLimit: number;
  currentCount: number;
}

export function AddBrandModal({
  onAdd,
  onClose,
  planLimit,
  currentCount,
}: AddBrandModalProps) {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const atLimit = currentCount >= planLimit;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;

    setLoading(true);
    setError(null);

    try {
      await onAdd(trimmed);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to add brand. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-text-primary/40 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      <div className="relative bg-surface rounded-lg shadow-lg w-full max-w-md p-6 animate-scale-in">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-text-secondary hover:text-text-primary"
          aria-label="Close"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M5 5l10 10M15 5l-10 10" />
          </svg>
        </button>

        <h2 className="text-xl font-semibold text-text-primary mb-1">
          Add Brand
        </h2>
        <p className="text-sm text-text-secondary mb-4">
          Track a brand or competitor across global news sources.
        </p>

        {atLimit ? (
          <div className="text-center py-6">
            <p className="text-sm text-text-secondary mb-3">
              You&apos;re tracking {currentCount}/{planLimit} brands.
              {planLimit === 1
                ? " Upgrade to Intel to track competitors."
                : " Remove a brand in Settings to add a new one."}
            </p>
            {planLimit === 1 && (
              <Button variant="primary">Upgrade to Intel — $14/mo</Button>
            )}
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter brand or company name"
              className="w-full h-11 px-4 border border-border rounded-md text-[15px] text-text-primary placeholder:text-text-secondary focus:outline-none focus:border-primary focus:ring-[3px] focus:ring-primary/15 transition-all duration-fast mb-3"
              disabled={loading}
              autoFocus
            />

            {error && (
              <p className="text-sm text-error mb-3">{error}</p>
            )}

            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="secondary"
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={loading || !name.trim()}
              >
                {loading ? "Adding..." : "Add Brand"}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
