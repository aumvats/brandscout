import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { fetchArticles } from "@/lib/api/gnews";
import { scoreSentiment } from "@/lib/api/meaningcloud";
import { detectSentimentShift } from "@/lib/alerts";

export async function GET(request: NextRequest) {
  // Verify cron secret
  // QA: fixed auth bypass — previously skipped auth when CRON_SECRET was unset
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServiceClient();

  try {
    // Get all distinct brand names
    const { data: brands, error: brandsError } = await supabase
      .from("brands")
      .select("name")
      .order("name");

    if (brandsError) throw brandsError;

    const uniqueBrandNames = Array.from(new Set((brands || []).map((b) => b.name)));

    const results: { brand: string; articles: number; alerts: number }[] = [];

    for (const brandName of uniqueBrandNames) {
      let newArticleCount = 0;
      let alertCount = 0;

      try {
        // Fetch articles from GNews
        const articles = await fetchArticles(brandName, 10);

        for (const article of articles) {
          // Upsert article
          const { error: artError } = await supabase
            .from("articles")
            .upsert(
              {
                brand_name: brandName,
                url: article.url,
                title: article.title,
                description: article.description,
                source_name: article.source.name,
                published_at: article.publishedAt,
                thumbnail_url: article.image,
              },
              { onConflict: "url" }
            );

          if (artError) {
            console.error(`Article upsert error for ${article.url}:`, artError);
            continue;
          }

          // Check if sentiment already scored
          const { data: existing } = await supabase
            .from("sentiments")
            .select("id")
            .eq("article_url", article.url)
            .single();

          if (!existing) {
            try {
              const text = `${article.title}. ${(article.description || "").slice(0, 500)}`;
              const sentiment = await scoreSentiment(text);
              await supabase.from("sentiments").upsert(
                {
                  article_url: article.url,
                  polarity: sentiment.polarity,
                  confidence: sentiment.confidence,
                  subjectivity: sentiment.subjectivity,
                  irony: sentiment.irony,
                },
                { onConflict: "article_url" }
              );
              newArticleCount++;
            } catch (err) {
              console.error(`Sentiment failed for ${article.url}:`, err);
            }
          }
        }

        // Check for sentiment shifts
        const since = new Date();
        since.setDate(since.getDate() - 14);

        const { data: recentArticles } = await supabase
          .from("articles")
          .select("published_at, sentiments(polarity, confidence)")
          .eq("brand_name", brandName)
          .gte("published_at", since.toISOString());

        const articlesForShift = (recentArticles || [])
          .filter((a) => {
            const s = a.sentiments as unknown;
            return s && !Array.isArray(s) ? true : Array.isArray(s) && (s as Record<string, unknown>[]).length > 0;
          })
          .map((a) => {
            const s = Array.isArray(a.sentiments)
              ? (a.sentiments as Record<string, unknown>[])[0]
              : (a.sentiments as Record<string, unknown>);
            return {
              polarity: s.polarity as string | null,
              confidence: s.confidence as number,
              publishedAt: a.published_at,
            };
          });

        const shiftResult = detectSentimentShift(brandName, articlesForShift);

        if (shiftResult) {
          // Get all users tracking this brand
          const { data: usersTracking } = await supabase
            .from("brands")
            .select("user_id")
            .eq("name", brandName);

          const userIds = Array.from(new Set((usersTracking || []).map((b) => b.user_id)));

          for (const userId of userIds) {
            await supabase.from("alerts").insert({
              user_id: userId,
              brand_name: brandName,
              alert_type: "sentiment_shift",
              delta_pct: shiftResult.deltaPct,
            });
            alertCount++;
          }
        }
      } catch (err) {
        console.error(`Cron error for brand "${brandName}":`, err);
      }

      results.push({
        brand: brandName,
        articles: newArticleCount,
        alerts: alertCount,
      });
    }

    return NextResponse.json({
      success: true,
      processed: results,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error("Cron handler error:", err);
    return NextResponse.json(
      { error: "Cron job failed" },
      { status: 500 }
    );
  }
}
