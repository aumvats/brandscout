interface ArticleForAlert {
  polarity: string | null;
  confidence: number;
  publishedAt: string;
}

interface AlertResult {
  brandName: string;
  deltaPct: number;
}

/**
 * Detect significant sentiment shifts for a brand.
 * Compares 7-day rolling average to previous 7-day window.
 * Returns alert data if |delta| > 15%.
 */
export function detectSentimentShift(
  brandName: string,
  articles: ArticleForAlert[]
): AlertResult | null {
  const now = new Date();
  const msPerDay = 1000 * 60 * 60 * 24;

  const current: number[] = [];
  const previous: number[] = [];

  const polarityMap: Record<string, number> = {
    P: 1,
    NEU: 0,
    N: -1,
  };

  for (const article of articles) {
    const date = new Date(article.publishedAt);
    const daysAgo = (now.getTime() - date.getTime()) / msPerDay;
    const score = polarityMap[article.polarity || ""] ?? 0;

    if (daysAgo >= 0 && daysAgo < 7) {
      current.push(score);
    } else if (daysAgo >= 7 && daysAgo < 14) {
      previous.push(score);
    }
  }

  if (current.length === 0 || previous.length === 0) return null;

  const avg = (arr: number[]) =>
    arr.reduce((a, b) => a + b, 0) / arr.length;

  const currentAvg = avg(current);
  const previousAvg = avg(previous);
  const denominator = Math.abs(previousAvg) || 1;
  const delta = ((currentAvg - previousAvg) / denominator) * 100;

  if (Math.abs(delta) > 15) {
    return {
      brandName,
      deltaPct: Math.round(delta),
    };
  }

  return null;
}
