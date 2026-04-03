import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * GET /api/tier-upgrade
 * Returns the current user's tier upgrade requests.
 */
export async function GET() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  const adminDb = createAdminClient();
  const { data, error } = await adminDb
    .from("tier_upgrade_requests")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(5);

  if (error) {
    // Table might not exist yet — return empty
    return NextResponse.json({ requests: [] });
  }

  return NextResponse.json({ requests: data ?? [] });
}

/**
 * POST /api/tier-upgrade
 * Submits a tier upgrade request.
 * Body: { requestedTier, reason }
 */
export async function POST(request: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  try {
    const { requestedTier, reason } = await request.json();
    if (!requestedTier || !reason) {
      return NextResponse.json({ error: "Requested tier and reason are required" }, { status: 400 });
    }
    if (reason.trim().length < 50) {
      return NextResponse.json({ error: "Please provide at least 50 characters for your reason" }, { status: 400 });
    }

    const adminDb = createAdminClient();

    // Get current profile
    const { data: profile } = await adminDb
      .from("profiles")
      .select("tier, full_name, email")
      .eq("id", user.id)
      .single();

    if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 });

    if (profile.tier === requestedTier) {
      return NextResponse.json({ error: "You already have this tier" }, { status: 400 });
    }

    // Check for existing pending request
    const { data: existing } = await adminDb
      .from("tier_upgrade_requests")
      .select("id, status")
      .eq("user_id", user.id)
      .eq("status", "pending")
      .single();

    if (existing) {
      return NextResponse.json({ error: "You already have a pending upgrade request" }, { status: 409 });
    }

    const { data, error: insertErr } = await adminDb
      .from("tier_upgrade_requests")
      .insert({
        user_id: user.id,
        current_tier: profile.tier,
        requested_tier: requestedTier,
        reason: reason.trim(),
        status: "pending",
      })
      .select()
      .single();

    if (insertErr) {
      console.error("[tier-upgrade POST]", insertErr);
      const msg =
        insertErr.code === "42P01"
          ? "Tier upgrade table not set up yet. Please ask your admin to run the database migration in supabase/migrations/001_tier_upgrade_requests.sql."
          : "Failed to submit request. Please try again.";
      return NextResponse.json({ error: msg }, { status: 500 });
    }

    // In-app notification (fire and forget)
    adminDb.from("notifications").insert({
      user_id: user.id,
      type: "booking_pending",
      title: "Tier Upgrade Request Submitted",
      message: `Your request to upgrade to ${requestedTier.replace(/_/g, " ")} is under review.`,
    }).then(() => {});

    return NextResponse.json({ request: data }, { status: 201 });
  } catch (err) {
    console.error("[tier-upgrade POST] unexpected:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
