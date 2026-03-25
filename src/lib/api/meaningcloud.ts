import { SentimentResult } from "@/lib/types";

const BASE_URL = "https://api.meaningcloud.com/sentiment-2.1";

function normalizePolarity(
  scoreTag: string
): "P" | "NEU" | "N" | null {
  if (scoreTag === "P" || scoreTag === "P+") return "P";
  if (scoreTag === "N" || scoreTag === "N+") return "N";
  if (scoreTag === "NEU" || scoreTag === "NONE") return "NEU";
  return null;
}

export async function scoreSentiment(
  text: string
): Promise<SentimentResult> {
  const apiKey = process.env.MEANINGCLOUD_API_KEY;
  if (!apiKey) {
    throw new Error("MEANINGCLOUD_API_KEY is not configured");
  }

  const body = new URLSearchParams({
    key: apiKey,
    lang: "en",
    txt: text.slice(0, 1500),
  });

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);

  try {
    const res = await fetch(BASE_URL, {
      method: "POST",
      body,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      signal: controller.signal,
    });

    if (!res.ok) {
      const errorBody = await res.text().catch(() => "");
      throw new Error(`MeaningCloud API error ${res.status}: ${errorBody}`);
    }

    const data = await res.json();

    return {
      polarity: normalizePolarity(data.score_tag || ""),
      confidence: parseInt(data.confidence || "0", 10),
      subjectivity: data.subjectivity || "UNKNOWN",
      irony: data.irony || "UNKNOWN",
    };
  } finally {
    clearTimeout(timeout);
  }
}
