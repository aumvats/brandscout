"use client";

import { useEffect } from "react";

interface ToastProps {
  message: string;
  type: "success" | "error";
  onClose: () => void;
}

export function Toast({ message, type, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bg = type === "success" ? "bg-success" : "bg-error";

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-slide-in-bottom">
      <div
        className={`${bg} text-white px-4 py-3 rounded-md shadow-lg flex items-center gap-3 text-sm font-medium`}
      >
        <span>{message}</span>
        <button
          onClick={onClose}
          className="text-white/70 hover:text-white"
          aria-label="Close"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M3 3l8 8M11 3l-8 8" />
          </svg>
        </button>
      </div>
    </div>
  );
}
