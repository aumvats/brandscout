import { NextRequest, NextResponse } from "next/server";
import { fetchArticles } from "@/lib/api/gnews";
import { scoreSentiment } from "@/lib/api/meaningcloud";
import { ArticleWithSentiment } from "@/lib/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const query = body.query?.trim();

    if (!query) {
      return NextResponse.json(
        { error: "Query is required" },
        { status: 400 }
      );
    }

    const articles = await fetchArticles(query, 10);

    if (articles.length === 0) {
      return NextResponse.json({ articles: [], pressScore: 50 });
    }

    const enriched: ArticleWithSentiment[] = await Promise.all(
      articles.map(async (article) => {
        let sentiment = null;
        try {
          const text = `${article.title}. ${(article.description || "").slice(0, 500)}`;
          sentiment = await scoreSentiment(text);
        } catch (err) {
          console.error(`Sentiment scoring failed for ${article.url}:`, err);
        }

        return {
          url: article.url,
          title: article.title,
          description: article.description,
          sourceName: article.source.name,
          sourceCountry: null,
          publishedAt: article.publishedAt,
          thumbnailUrl: article.image,
          sentiment,
        };
      })
    );

    return NextResponse.json({ articles: enriched });
  } catch (err) {
    console.error("Search API error:", err);
    return NextResponse.json(
      { error: "Search is temporarily unavailable. Please try again in a few minutes." },
      { status: 500 }
    );
  }
}
