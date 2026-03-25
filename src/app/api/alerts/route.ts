import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: alerts, error } = await supabase
      .from("alerts")
      .select("*")
      .eq("user_id", user.id)
      .is("dismissed_at", null)
      .order("created_at", { ascending: false });

    if (error) throw error;

    const mapped = (alerts || []).map((a) => ({
      id: a.id,
      userId: a.user_id,
      brandName: a.brand_name,
      alertType: a.alert_type,
      deltaPct: a.delta_pct,
      createdAt: a.created_at,
      dismissedAt: a.dismissed_at,
    }));

    return NextResponse.json({ alerts: mapped });
  } catch (err) {
    console.error("Alerts GET error:", err);
    return NextResponse.json(
      { error: "Failed to load alerts" },
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

    const { alertId } = await request.json();

    if (!alertId) {
      return NextResponse.json(
        { error: "alertId is required" },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from("alerts")
      .update({ dismissed_at: new Date().toISOString() })
      .eq("id", alertId)
      .eq("user_id", user.id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Alerts POST error:", err);
    return NextResponse.json(
      { error: "Failed to dismiss alert" },
      { status: 500 }
    );
  }
}
