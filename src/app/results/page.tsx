"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { ArticleWithSentiment } from "@/lib/types";
import { ArticleCard } from "@/components/features/ArticleCard";
import { PressScoreBadge } from "@/components/ui/PressScoreBadge";
import { computePressScore } from "@/lib/scoring";
import { SearchBar } from "@/components/ui/SearchBar";
import { useRouter } from "next/navigation";

function ResultsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get("q") || "";
  const [articles, setArticles] = useState<ArticleWithSentiment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!query) return;

    setLoading(true);
    setError(null);

    fetch("/api/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query }),
    })
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(
            data.error || "Search failed. Please try again."
          );
        }
        return res.json();
      })
      .then((data) => {
        setArticles(data.articles || []);
      })
      .catch((err) => {
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [query]);

  const pressScore = computePressScore(
    articles
      .filter((a) => a.sentiment)
      .map((a) => ({
        polarity: a.sentiment!.polarity,
        confidence: a.sentiment!.confidence,
      }))
  );

  function handleNewSearch(newQuery: string) {
    router.push(`/results?q=${encodeURIComponent(newQuery)}`);
  }

  return (
    <div className="min-h-screen bg-bg">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 h-16 max-w-6xl mx-auto">
        <a
          href="/"
          className="text-xl font-bold text-text-primary tracking-tight hover:opacity-80 transition-opacity duration-fast"
        >
          BrandScout
        </a>
        <div className="flex items-center gap-4">
          <a
            href="/login"
            className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors duration-fast"
          >
            Log in
          </a>
          <a
            href="/signup"
            className="text-sm font-medium text-white bg-primary hover:bg-primary-hover active:scale-[0.98] px-4 py-2 rounded-md transition-all duration-fast"
          >
            Sign up free
          </a>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-8">
        <div className="mb-6">
          <SearchBar
            placeholder="Search another brand..."
            onSearch={handleNewSearch}
            loading={loading}
          />
        </div>

        {query && (
          <h1 className="text-[22px] font-semibold tracking-[-0.01em] text-text-primary mb-6">
            Results for &ldquo;{query}&rdquo;
          </h1>
        )}

        {/* Loading state */}
        {loading && (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="bg-surface border border-border rounded-md p-4 animate-pulse"
              >
                <div className="h-3 bg-border rounded w-24 mb-3" />
                <div className="h-5 bg-border rounded w-3/4 mb-2" />
                <div className="h-3 bg-border rounded w-full mb-1" />
                <div className="h-3 bg-border rounded w-2/3" />
              </div>
            ))}
          </div>
        )}

        {/* Error state */}
        {error && !loading && (
          <div className="text-center py-12">
            <p className="text-error font-medium mb-2">{error}</p>
            <button
              onClick={() => handleNewSearch(query)}
              className="text-sm text-primary hover:text-primary-hover font-medium"
            >
              Try again
            </button>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && articles.length === 0 && query && (
          <div className="text-center py-12">
            <p className="text-text-secondary mb-2">
              No recent news found for &ldquo;{query}&rdquo;.
            </p>
            <p className="text-sm text-text-secondary">
              Try the full company name or check spelling.
            </p>
          </div>
        )}

        {/* Results */}
        {!loading && !error && articles.length > 0 && (
          <>
            <div className="flex items-center gap-4 mb-6 animate-fade-in-up">
              <PressScoreBadge score={pressScore} />
              <div>
                <p className="text-sm font-medium text-text-primary">
                  Press Score
                </p>
                <p className="text-xs text-text-secondary">
                  Based on {articles.length} recent articles
                </p>
              </div>
            </div>

            <div className="space-y-3 mb-8">
              {articles.map((article) => (
                <ArticleCard key={article.url} article={article} />
              ))}
            </div>

            {/* CTA */}
            <div className="bg-surface border border-border rounded-lg p-6 text-center shadow-sm">
              <h3 className="text-[18px] font-semibold tracking-[-0.01em] text-text-primary mb-2">
                Track &ldquo;{query}&rdquo; on your dashboard
              </h3>
              <p className="text-sm text-text-secondary mb-4">
                Create a free account to save your dashboard and add
                competitors.
              </p>
              <a
                href={`/signup?brand=${encodeURIComponent(query)}`}
                className="inline-flex items-center justify-center h-10 px-6 bg-primary text-white font-medium text-sm rounded-md hover:bg-primary-hover active:scale-[0.98] transition-all duration-fast"
              >
                Sign up free
              </a>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function ResultsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-bg flex items-center justify-center">
          <div className="animate-pulse text-text-secondary">Loading...</div>
        </div>
      }
    >
      <ResultsContent />
    </Suspense>
  );
}
