"use client";

import { useState } from "react";
import { ArticleWithSentiment } from "@/lib/types";
import { ArticleCard } from "@/components/features/ArticleCard";

interface ArticleFeedProps {
  articles: ArticleWithSentiment[];
  defaultSentimentFilter?: "all" | "P" | "NEU" | "N";
  defaultDateRange?: "7d" | "14d" | "30d";
  showFilters?: boolean;
}

export function ArticleFeed({
  articles,
  defaultSentimentFilter = "all",
  defaultDateRange = "7d",
  showFilters = true,
}: ArticleFeedProps) {
  const [sentimentFilter, setSentimentFilter] = useState(defaultSentimentFilter);
  const [dateRange, setDateRange] = useState(defaultDateRange);

  const now = new Date();
  const rangeDays = dateRange === "7d" ? 7 : dateRange === "14d" ? 14 : 30;

  const filtered = articles.filter((article) => {
    if (
      sentimentFilter !== "all" &&
      article.sentiment?.polarity !== sentimentFilter
    ) {
      return false;
    }

    const publishedAt = new Date(article.publishedAt);
    const daysAgo =
      (now.getTime() - publishedAt.getTime()) / (1000 * 60 * 60 * 24);
    return daysAgo <= rangeDays;
  });

  const sentimentOptions: { label: string; value: "all" | "P" | "NEU" | "N" }[] = [
    { label: "All", value: "all" },
    { label: "Positive", value: "P" },
    { label: "Neutral", value: "NEU" },
    { label: "Negative", value: "N" },
  ];

  const dateOptions: { label: string; value: "7d" | "14d" | "30d" }[] = [
    { label: "7 days", value: "7d" },
    { label: "14 days", value: "14d" },
    { label: "30 days", value: "30d" },
  ];

  return (
    <div>
      {showFilters && (
        <div className="flex flex-wrap gap-4 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-text-secondary uppercase tracking-wider">
              Sentiment
            </span>
            <div className="flex gap-1">
              {sentimentOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setSentimentFilter(opt.value)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all duration-fast active:scale-[0.98] ${
                    sentimentFilter === opt.value
                      ? "bg-primary text-white"
                      : "bg-bg text-text-secondary hover:bg-border"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-text-secondary uppercase tracking-wider">
              Range
            </span>
            <div className="flex gap-1">
              {dateOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setDateRange(opt.value)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all duration-fast active:scale-[0.98] ${
                    dateRange === opt.value
                      ? "bg-primary text-white"
                      : "bg-bg text-text-secondary hover:bg-border"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="text-center py-12 text-text-secondary">
          <svg
            className="mx-auto mb-3 w-12 h-12 text-border"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
            />
          </svg>
          <p className="text-sm font-medium">No articles match your filters</p>
          <p className="text-xs mt-1">Try adjusting the sentiment or date range filters</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((article) => (
            <ArticleCard
              key={article.url}
              article={article}
              isNew={article.isNew}
              highlighted={article.sentiment?.polarity === "N"}
            />
          ))}
        </div>
      )}
    </div>
  );
}
