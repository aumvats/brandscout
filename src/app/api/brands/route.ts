import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { fetchArticles } from "@/lib/api/gnews";
import { scoreSentiment } from "@/lib/api/meaningcloud";
import { computePressScore, computeSparklineData } from "@/lib/scoring";

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: brands, error: brandsError } = await supabase
      .from("brands")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true });

    if (brandsError) throw brandsError;

    const brandsWithData = await Promise.all(
      (brands || []).map(async (brand) => {
        const { data: articles } = await supabase
          .from("articles")
          .select("*, sentiments(polarity, confidence)")
          .eq("brand_name", brand.name)
          .order("published_at", { ascending: false })
          .limit(30);

        const enrichedArticles = (articles || []).map((a) => {
          const s = a.sentiments as Record<string, unknown> | null;
          return {
            id: a.id as string,
            url: a.url as string,
            title: a.title as string,
            description: a.description as string | null,
            sourceName: a.source_name as string,
            sourceCountry: a.source_country as string | null,
            publishedAt: a.published_at as string,
            thumbnailUrl: a.thumbnail_url as string | null,
            sentiment: s
              ? {
                  polarity: s.polarity as string | null,
                  confidence: s.confidence as number,
                  subjectivity: "",
                  irony: "",
                }
              : null,
          };
        });

        const sentimentData = enrichedArticles
          .filter((a) => a.sentiment)
          .map((a) => ({
            polarity: a.sentiment!.polarity,
            confidence: a.sentiment!.confidence,
          }));

        const sparklineInput = enrichedArticles
          .filter((a) => a.sentiment)
          .map((a) => ({
            polarity: a.sentiment!.polarity,
            publishedAt: a.publishedAt,
          }));

        return {
          id: brand.id,
          userId: brand.user_id,
          name: brand.name,
          searchQuery: brand.search_query,
          createdAt: brand.created_at,
          pressScore: computePressScore(sentimentData),
          articles: enrichedArticles,
          sparklineData: computeSparklineData(sparklineInput),
        };
      })
    );

    return NextResponse.json({ brands: brandsWithData });
  } catch (err) {
    console.error("Brands GET error:", err);
    return NextResponse.json(
      { error: "Failed to load brands" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name } = await request.json();
    if (!name?.trim()) {
      return NextResponse.json(
        { error: "Brand name is required" },
        { status: 400 }
      );
    }

    // Check plan limits
    const { data: userData } = await supabase
      .from("users")
      .select("plan")
      .eq("id", user.id)
      .single();

    const plan = userData?.plan || "scout";
    const limit = plan === "intel" ? 3 : 1;

    const { count } = await supabase
      .from("brands")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id);

    if ((count || 0) >= limit) {
      return NextResponse.json(
        { error: `Brand limit reached (${limit}). Upgrade to add more.` },
        { status: 403 }
      );
    }

    // Validate brand has articles
    const articles = await fetchArticles(name.trim(), 1);
    if (articles.length === 0) {
      return NextResponse.json(
        { error: "No news articles found for this brand. Try the official company name." },
        { status: 404 }
      );
    }

    // Insert brand
    const { data: brand, error: insertError } = await supabase
      .from("brands")
      .insert({
        user_id: user.id,
        name: name.trim(),
        search_query: name.trim(),
      })
      .select()
      .single();

    if (insertError) throw insertError;

    // Fetch, store, and score articles before returning
    const serviceClient = createServiceClient();
    const fullArticles = await fetchArticles(name.trim(), 10);

    for (const article of fullArticles) {
      const { error: artError } = await serviceClient
        .from("articles")
        .upsert(
          {
            brand_name: name.trim(),
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
        console.error("Article insert error:", artError);
        continue;
      }

      // Score sentiment
      try {
        const text = `${article.title}. ${(article.description || "").slice(0, 500)}`;
        const sentiment = await scoreSentiment(text);
        await serviceClient.from("sentiments").upsert(
          {
            article_url: article.url,
            polarity: sentiment.polarity,
            confidence: sentiment.confidence,
            subjectivity: sentiment.subjectivity,
            irony: sentiment.irony,
          },
          { onConflict: "article_url" }
        );
      } catch (err) {
        console.error(`Sentiment scoring failed for ${article.url}:`, err);
      }
    }

    return NextResponse.json({ brand });
  } catch (err) {
    console.error("Brands POST error:", err);
    return NextResponse.json(
      { error: "Failed to add brand" },
      { status: 500 }
    );
  }
}
