interface SentimentBadgeProps {
  polarity: "P" | "NEU" | "N" | null;
  confidence?: number;
}

const config = {
  P: { label: "Positive", color: "text-sentiment-pos", bg: "bg-sentiment-pos/10" },
  NEU: { label: "Neutral", color: "text-sentiment-neu", bg: "bg-sentiment-neu/10" },
  N: { label: "Negative", color: "text-sentiment-neg", bg: "bg-sentiment-neg/10" },
} as const;

export function SentimentBadge({ polarity, confidence }: SentimentBadgeProps) {
  if (!polarity) {
    return (
      <span className="inline-flex items-center rounded-full px-3 py-1.5 text-xs font-medium bg-bg text-text-secondary">
        Pending
      </span>
    );
  }

  const { label, color, bg } = config[polarity];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium ${bg} ${color}`}
    >
      {label}
      {confidence !== undefined && (
        <span className="opacity-70">{confidence}%</span>
      )}
    </span>
  );
}
