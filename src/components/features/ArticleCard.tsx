import { ArticleWithSentiment } from "@/lib/types";
import { SentimentBadge } from "@/components/ui/SentimentBadge";
import { formatDistanceToNow } from "date-fns";

interface ArticleCardProps {
  article: ArticleWithSentiment;
  isNew?: boolean;
  highlighted?: boolean;
}

export function ArticleCard({
  article,
  isNew = false,
  highlighted = false,
}: ArticleCardProps) {
  const relativeDate = formatDistanceToNow(new Date(article.publishedAt), {
    addSuffix: true,
  });

  const snippet = article.description
    ? article.description.slice(0, 120) +
      (article.description.length > 120 ? "..." : "")
    : "";

  return (
    <div
      className={`bg-surface border border-border rounded-md p-4 hover:shadow-sm hover:border-primary/20 transition-all duration-fast relative ${
        highlighted ? "border-l-4 border-l-accent" : ""
      }`}
    >
      {isNew && (
        <span className="absolute top-3 right-3 bg-primary/10 text-primary text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full">
          NEW
        </span>
      )}

      <div className="flex items-center gap-2 text-xs text-text-secondary mb-1.5">
        <span className="font-medium">{article.sourceName}</span>
        <span>·</span>
        <span>{relativeDate}</span>
      </div>

      <a
        href={article.url}
        target="_blank"
        rel="noopener noreferrer"
        className="block text-[15px] font-semibold text-text-primary hover:text-primary transition-colors duration-fast leading-snug mb-2"
      >
        {article.title}
      </a>

      {snippet && (
        <p className="text-sm text-text-secondary leading-relaxed mb-3">
          {snippet}
        </p>
      )}

      <div className="flex items-center gap-3">
        <SentimentBadge
          polarity={article.sentiment?.polarity ?? null}
          confidence={article.sentiment?.confidence}
        />
        {article.sentiment?.confidence !== undefined && (
          <span className="text-xs text-text-secondary">
            {article.sentiment.confidence}% confidence
          </span>
        )}
      </div>
    </div>
  );
}
