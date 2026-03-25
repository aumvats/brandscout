import Link from "next/link";
import { BrandWithData } from "@/lib/types";
import { PressScoreBadge } from "@/components/ui/PressScoreBadge";
import { Sparkline } from "@/components/features/Sparkline";

interface BrandCardProps {
  brand: BrandWithData;
}

export function BrandCard({ brand }: BrandCardProps) {
  const topArticles = brand.articles.slice(0, 3);

  return (
    <div className="bg-surface border border-border rounded-md p-5 hover:shadow-md hover:border-primary/20 transition-all duration-normal">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <PressScoreBadge score={brand.pressScore} />
          <div>
            <h3 className="text-lg font-semibold text-text-primary">
              {brand.name}
            </h3>
            <p className="text-xs text-text-secondary">Press Score</p>
          </div>
        </div>
        <Sparkline data={brand.sparklineData} />
      </div>

      {topArticles.length > 0 && (
        <ul className="space-y-2 mb-4">
          {topArticles.map((article) => (
            <li
              key={article.url}
              className="flex items-start gap-2 text-sm text-text-secondary"
            >
              <span
                className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${
                  article.sentiment?.polarity === "P"
                    ? "bg-sentiment-pos"
                    : article.sentiment?.polarity === "N"
                    ? "bg-sentiment-neg"
                    : "bg-sentiment-neu"
                }`}
              />
              <span className="line-clamp-1">{article.title}</span>
            </li>
          ))}
        </ul>
      )}

      <Link
        href={`/dashboard/${brand.id}`}
        className="text-sm font-medium text-primary hover:text-primary-hover transition-colors duration-fast"
      >
        View details →
      </Link>
    </div>
  );
}
