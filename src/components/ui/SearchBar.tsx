"use client";

import { useState, FormEvent } from "react";

interface SearchBarProps {
  placeholder?: string;
  onSearch: (query: string) => void;
  loading?: boolean;
}

export function SearchBar({
  placeholder = "Enter a brand or company name...",
  onSearch,
  loading = false,
}: SearchBarProps) {
  const [query, setQuery] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = query.trim();
    if (trimmed) {
      onSearch(trimmed);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full max-w-[560px]" role="search">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        aria-label="Brand or company name"
        className="flex-1 h-12 px-4 rounded-l-md border border-border bg-surface text-text-primary text-[15px] placeholder:text-text-secondary focus:outline-none focus:border-primary focus:ring-[3px] focus:ring-primary/15 transition-all duration-fast"
        disabled={loading}
      />
      <button
        type="submit"
        disabled={loading || !query.trim()}
        className="h-12 px-6 bg-primary text-white font-medium text-[15px] rounded-r-md hover:bg-primary-hover active:scale-[0.98] transition-all duration-fast focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <span className="inline-flex items-center gap-2">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            Searching...
          </span>
        ) : (
          "Search"
        )}
      </button>
    </form>
  );
}
