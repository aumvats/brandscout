"use client";

import dynamic from "next/dynamic";
import { BrandWithData } from "@/lib/types";
import { PressScoreBadge } from "@/components/ui/PressScoreBadge";
import { ArticleFeed } from "@/components/features/ArticleFeed";

const TrendChart = dynamic(
  () => import("@/components/features/TrendChart").then((mod) => mod.TrendChart),
  {
    loading: () => (
      <div className="w-full h-60 bg-surface border border-border rounded-md animate-pulse" />
    ),
  }
);

interface ComparisonViewProps {
  brands: BrandWithData[];
}

export function ComparisonView({ brands }: ComparisonViewProps) {
  if (brands.length < 2) return null;

  return (
    <div
      className={`grid gap-6 grid-cols-1 ${
        brands.length >= 3 ? "md:grid-cols-3" : "md:grid-cols-2"
      }`}
    >
      {brands.map((brand) => {
        const trendData = brand.sparklineData.map((score, i) => {
          const date = new Date();
          date.setDate(date.getDate() - (brand.sparklineData.length - 1 - i));
          return {
            date: date.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            }),
            score,
          };
        });

        return (
          <div key={brand.id} className="min-w-0">
            <div className="flex items-center gap-3 mb-4">
              <PressScoreBadge score={brand.pressScore} size="sm" />
              <h3 className="font-semibold text-text-primary truncate">
                {brand.name}
              </h3>
            </div>
            <TrendChart data={trendData} />
            <div className="mt-4">
              <ArticleFeed
                articles={brand.articles}
                showFilters={false}
                defaultDateRange="7d"
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
