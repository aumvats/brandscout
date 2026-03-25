"use client";

import { useEffect, useState, useCallback, use } from "react";
import dynamic from "next/dynamic";
import { ArticleWithSentiment } from "@/lib/types";
import { PressScoreBadge } from "@/components/ui/PressScoreBadge";
import { ArticleFeed } from "@/components/features/ArticleFeed";
import { computePressScore } from "@/lib/scoring";

const TrendChart = dynamic(
  () => import("@/components/features/TrendChart").then((mod) => mod.TrendChart),
  {
    loading: () => (
      <div className="w-full h-60 bg-surface border border-border rounded-md animate-pulse" />
    ),
  }
);

export default function BrandDetailPage({
  params,
}: {
  params: Promise<{ brandId: string }>;
}) {
  const { brandId } = use(params);
  const [articles, setArticles] = useState<ArticleWithSentiment[]>([]);
  const [brandName, setBrandName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [range, setRange] = useState<"7d" | "30d">("7d");

  const fetchArticles = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `/api/articles?brandId=${brandId}&range=${range}`
      );
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to load articles");
      }
      const data = await res.json();
      setArticles(data.articles || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [brandId, range]);

  useEffect(() => {
    // Get brand name from brands API
    fetch("/api/brands")
      .then((res) => res.json())
      .then((data) => {
        const brand = (data.brands || []).find(
          (b: { id: string }) => b.id === brandId
        );
        if (brand) setBrandName(brand.name);
      })
      .catch(() => {});
  }, [brandId]);

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  const sentimentData = articles
    .filter((a) => a.sentiment)
    .map((a) => ({
      polarity: a.sentiment!.polarity,
      confidence: a.sentiment!.confidence,
    }));

  const pressScore = computePressScore(sentimentData);

  // Build trend chart data
  const trendData: { date: string; score: number }[] = [];
  const days = range === "7d" ? 7 : 30;

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });

    const dayArticles = articles.filter((a) => {
      const pubDate = new Date(a.publishedAt);
      return (
        pubDate.toDateString() === date.toDateString() && a.sentiment
      );
    });

    const polarityMap: Record<string, number> = { P: 1, NEU: 0, N: -1 };
    const avg =
      dayArticles.length > 0
        ? dayArticles.reduce(
            (sum, a) =>
              sum + (polarityMap[a.sentiment!.polarity || ""] ?? 0),
            0
          ) / dayArticles.length
        : 0;

    trendData.push({ date: dateStr, score: avg });
  }

  // Compute trend description
  const recentScores = trendData.slice(-3).map((d) => d.score);
  const earlierScores = trendData.slice(0, 3).map((d) => d.score);
  const avgRecent =
    recentScores.length > 0
      ? recentScores.reduce((a, b) => a + b, 0) / recentScores.length
      : 0;
  const avgEarlier =
    earlierScores.length > 0
      ? earlierScores.reduce((a, b) => a + b, 0) / earlierScores.length
      : 0;
  const trendDelta = Math.round((avgRecent - avgEarlier) * 100);
  const trendDesc =
    Math.abs(trendDelta) < 5
      ? "Stable this week"
      : trendDelta > 0
      ? `Trending up +${trendDelta}% this week`
      : `Trending down ${trendDelta}% this week`;

  if (loading) {
    return (
      <div className="min-h-screen bg-bg">
        <nav className="flex items-center justify-between px-6 h-16 max-w-6xl mx-auto">
          <div className="h-5 bg-border rounded w-40 animate-pulse" />
          <div className="h-4 bg-border rounded w-32 animate-pulse" />
        </nav>
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="animate-pulse space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-border" />
              <div className="space-y-2">
                <div className="h-6 bg-border rounded w-48" />
                <div className="h-4 bg-border rounded w-32" />
              </div>
            </div>
            <div className="h-60 bg-surface border border-border rounded-md" />
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 bg-surface border border-border rounded-md" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 h-16 max-w-6xl mx-auto">
        <div className="flex items-center gap-2 min-w-0">
          <a
            href="/dashboard"
            className="text-xl font-bold text-text-primary tracking-tight hover:opacity-80 transition-opacity duration-fast flex-shrink-0"
          >
            BrandScout
          </a>
          <span className="text-border flex-shrink-0">/</span>
          <span className="text-sm font-medium text-text-secondary truncate">
            {brandName || "Brand"}
          </span>
        </div>
        <a
          href="/dashboard"
          className="text-sm text-primary hover:text-primary-hover font-medium transition-colors duration-fast flex-shrink-0"
        >
          <span className="hidden sm:inline">&larr; Back to Dashboard</span>
          <span className="sm:hidden">&larr; Back</span>
        </a>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {error && (
          <div className="text-center py-12">
            <p className="text-error font-medium mb-2">{error}</p>
            <button
              onClick={fetchArticles}
              className="text-sm text-primary hover:text-primary-hover font-medium transition-colors duration-fast"
            >
              Retry
            </button>
          </div>
        )}

        {!error && (
          <>
            {/* Header */}
            <div className="flex items-center gap-4 mb-6 animate-fade-in-up">
              <PressScoreBadge score={pressScore} size="lg" />
              <div>
                <h1 className="text-[22px] font-semibold tracking-[-0.01em] text-text-primary">
                  {brandName || "Brand Detail"}
                </h1>
                <p className="text-sm text-text-secondary">{trendDesc}</p>
              </div>
            </div>

            {/* Range toggle */}
            <div className="flex gap-2 mb-4 animate-fade-in-up stagger-1">
              {(["7d", "30d"] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setRange(r)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all duration-fast active:scale-[0.98] ${
                    range === r
                      ? "bg-primary text-white"
                      : "bg-surface text-text-secondary border border-border hover:bg-bg hover:border-primary/20"
                  }`}
                >
                  {r === "7d" ? "7 days" : "30 days"}
                </button>
              ))}
            </div>

            {/* Trend Chart */}
            <div className="mb-8 animate-fade-in-up stagger-2">
              <TrendChart data={trendData} />
            </div>

            {/* Article Feed */}
            <div className="animate-fade-in-up stagger-3">
              <ArticleFeed
                articles={articles}
                defaultDateRange={range === "7d" ? "7d" : "30d"}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
