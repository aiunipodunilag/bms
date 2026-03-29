import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { generateBMSCode } from "@/lib/utils";

/**
 * GET /api/resource-requests
 * Returns the current user's resource requests.
 */
export async function GET() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  const adminDb = createAdminClient();
  const { data, error } = await adminDb
    .from("resource_requests")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: "Failed to fetch requests" }, { status: 500 });
  }

  return NextResponse.json({ requests: data });
}

/**
 * POST /api/resource-requests
 * Submits a premium resource request for admin approval.
 */
export async function POST(request: NextRequest) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  try {
    const body = await request.json();
    const { resourceType, preferredDate, preferredTimeWindow, estimatedDuration, justification } =
      body;

    if (!resourceType || !preferredDate || !preferredTimeWindow || !estimatedDuration || !justification) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    if (justification.trim().length < 80) {
      return NextResponse.json(
        { error: "Justification must be at least 80 characters" },
        { status: 400 }
      );
    }

    const adminDb = createAdminClient();

    // Verify user has access to premium resources
    const { data: profile } = await adminDb
      .from("profiles")
      .select("tier, status")
      .eq("id", user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const noAccessTiers = ["regular_student", "external"];
    if (noAccessTiers.includes(profile.tier)) {
      return NextResponse.json(
        { error: "Your tier does not have access to premium resources." },
        { status: 403 }
      );
    }

    const bmsCode = generateBMSCode();

    const { data, error: insertErr } = await adminDb
      .from("resource_requests")
      .insert({
        user_id: user.id,
        resource_type: resourceType,
        preferred_date: preferredDate,
        preferred_time_window: preferredTimeWindow,
        estimated_duration: estimatedDuration,
        justification,
        status: "pending",
        bms_code: bmsCode,
      })
      .select()
      .single();

    if (insertErr) {
      console.error("[resource-requests POST]", insertErr);
      return NextResponse.json({ error: "Failed to submit request" }, { status: 500 });
    }

    // Notification
    await adminDb.from("notifications").insert({
      user_id: user.id,
      type: "resource_approved",
      title: "Resource Request Submitted",
      message: `Your request for ${resourceType.replace(/_/g, " ")} is under review. Reference: ${bmsCode}`,
    });

    return NextResponse.json({ request: data }, { status: 201 });
  } catch (err) {
    console.error("[resource-requests POST] unexpected:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
