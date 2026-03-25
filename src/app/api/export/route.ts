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

    // Check paid tier
    const { data: userData } = await supabase
      .from("users")
      .select("plan")
      .eq("id", user.id)
      .single();

    if (userData?.plan !== "intel") {
      return NextResponse.json(
        { error: "CSV export is available on the Intel plan." },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const brandId = searchParams.get("brandId");

    if (!brandId) {
      return NextResponse.json(
        { error: "brandId is required" },
        { status: 400 }
      );
    }

    // Get brand
    const { data: brand } = await supabase
      .from("brands")
      .select("name")
      .eq("id", brandId)
      .eq("user_id", user.id)
      .single();

    if (!brand) {
      return NextResponse.json({ error: "Brand not found" }, { status: 404 });
    }

    const since = new Date();
    since.setDate(since.getDate() - 30);

    const { data: articles, error } = await supabase
      .from("articles")
      .select("*, sentiments(polarity, confidence)")
      .eq("brand_name", brand.name)
      .gte("published_at", since.toISOString())
      .order("published_at", { ascending: false });

    if (error) throw error;

    const headers = "title,url,source,published_at,sentiment,confidence";
    const rows = (articles || []).map((a) => {
      const s = a.sentiments as Record<string, unknown> | null;
      const polarity = (s?.polarity as string) || "pending";
      const confidence = s?.confidence ?? "";
      return [
        `"${(a.title || "").replace(/"/g, '""')}"`,
        a.url,
        `"${(a.source_name || "").replace(/"/g, '""')}"`,
        a.published_at,
        polarity,
        confidence,
      ].join(",");
    });

    const csv = [headers, ...rows].join("\n");

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="${brand.name}-articles.csv"`,
      },
    });
  } catch (err) {
    console.error("Export error:", err);
    return NextResponse.json(
      { error: "Failed to export" },
      { status: 500 }
    );
  }
}
