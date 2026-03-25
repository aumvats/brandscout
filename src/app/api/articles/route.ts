import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const brandId = searchParams.get("brandId");
    const sentiment = searchParams.get("sentiment");
    const range = searchParams.get("range") || "7d";

    if (!brandId) {
      return NextResponse.json(
        { error: "brandId is required" },
        { status: 400 }
      );
    }

    // Get brand to verify ownership and get name
    const { data: brand } = await supabase
      .from("brands")
      .select("name")
      .eq("id", brandId)
      .eq("user_id", user.id)
      .single();

    if (!brand) {
      return NextResponse.json({ error: "Brand not found" }, { status: 404 });
    }

    const daysMap: Record<string, number> = { "7d": 7, "14d": 14, "30d": 30 };
    const days = daysMap[range] || 7;
    const since = new Date();
    since.setDate(since.getDate() - days);

    const query = supabase
      .from("articles")
      .select("*, sentiments(polarity, confidence, subjectivity, irony)")
      .eq("brand_name", brand.name)
      .gte("published_at", since.toISOString())
      .order("published_at", { ascending: false });

    const { data: articles, error } = await query;
    if (error) throw error;

    let enriched = (articles || []).map((a) => {
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
              subjectivity: (s.subjectivity as string) || "",
              irony: (s.irony as string) || "",
            }
          : null,
      };
    });

    if (sentiment && sentiment !== "all") {
      enriched = enriched.filter(
        (a) => a.sentiment?.polarity === sentiment
      );
    }

    return NextResponse.json({ articles: enriched });
  } catch (err) {
    console.error("Articles GET error:", err);
    return NextResponse.json(
      { error: "Failed to load articles" },
      { status: 500 }
    );
  }
}
