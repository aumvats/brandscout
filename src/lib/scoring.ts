/**
 * Compute a Press Score (0–100) from article sentiment data.
 * Maps P→1, NEU→0, N→-1, weights by confidence, normalizes to 0–100.
 */
export function computePressScore(
  articles: { polarity: string | null; confidence: number }[]
): number {
  if (articles.length === 0) return 50;

  const polarityMap: Record<string, number> = {
    P: 1,
    NEU: 0,
    N: -1,
  };

  let weightedSum = 0;
  let totalWeight = 0;

  for (const article of articles) {
    const numericPolarity = polarityMap[article.polarity || ""] ?? 0;
    const weight = Math.max(article.confidence, 1);
    weightedSum += numericPolarity * weight;
    totalWeight += weight;
  }

  if (totalWeight === 0) return 50;

  const weightedAvg = weightedSum / totalWeight;
  const score = Math.round(((weightedAvg + 1) / 2) * 100);
  return Math.max(0, Math.min(100, score));
}

/**
 * Compute sparkline data from articles sorted by date.
 * Returns array of daily average sentiment scores.
 */
export function computeSparklineData(
  articles: { polarity: string | null; publishedAt: string }[],
  days: number = 7
): number[] {
  const now = new Date();
  const dailyScores: number[][] = Array.from({ length: days }, () => []);

  const polarityMap: Record<string, number> = {
    P: 1,
    NEU: 0,
    N: -1,
  };

  for (const article of articles) {
    const date = new Date(article.publishedAt);
    const daysAgo = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (daysAgo >= 0 && daysAgo < days) {
      const score = polarityMap[article.polarity || ""] ?? 0;
      dailyScores[days - 1 - daysAgo].push(score);
    }
  }

  return dailyScores.map((scores) =>
    scores.length > 0
      ? scores.reduce((a, b) => a + b, 0) / scores.length
      : 0
  );
}
