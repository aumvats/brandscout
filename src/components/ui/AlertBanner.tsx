"use client";

import { Alert } from "@/lib/types";

interface AlertBannerProps {
  alerts: Alert[];
  onDismiss: (id: string) => void;
}

export function AlertBanner({ alerts, onDismiss }: AlertBannerProps) {
  if (alerts.length === 0) return null;

  return (
    <div className="space-y-2">
      {alerts.map((alert) => (
        <div
          key={alert.id}
          className="flex items-center justify-between px-4 py-3 bg-[#FFF7ED] border-l-4 border-accent rounded-r-md"
        >
          <p className="text-sm text-accent font-medium">
            {alert.brandName}&apos;s press sentiment{" "}
            {alert.deltaPct > 0 ? "increased" : "dropped"}{" "}
            {Math.abs(alert.deltaPct)}% this week
          </p>
          <button
            onClick={() => onDismiss(alert.id)}
            className="text-accent/60 hover:text-accent transition-colors ml-4 flex-shrink-0"
            aria-label="Dismiss alert"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M4 4l8 8M12 4l-8 8" />
            </svg>
          </button>
        </div>
      ))}
    </div>
  );
}
