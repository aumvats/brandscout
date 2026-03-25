import { GNewsArticle } from "@/lib/types";

const BASE_URL = "https://gnews.io/api/v4";

export async function fetchArticles(
  query: string,
  max: number = 10
): Promise<GNewsArticle[]> {
  const apiKey = process.env.GNEWS_API_KEY;
  if (!apiKey) {
    throw new Error("GNEWS_API_KEY is not configured");
  }

  const url = `${BASE_URL}/search?q=${encodeURIComponent(query)}&lang=en&max=${max}&apikey=${apiKey}`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);

  try {
    const res = await fetch(url, { signal: controller.signal });

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      throw new Error(`GNews API error ${res.status}: ${body}`);
    }

    const data = await res.json();
    return data.articles || [];
  } finally {
    clearTimeout(timeout);
  }
}
