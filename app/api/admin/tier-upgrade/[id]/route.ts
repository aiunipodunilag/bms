import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * PATCH /api/admin/tier-upgrade/[id]
 * Approves or rejects a tier upgrade request.
 * Body: { action: "approve" | "reject", adminNote?: string }
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  const adminDb = createAdminClient();
  const { data: adminAccount } = await adminDb
    .from("admin_accounts")
    .select("role, status")
    .eq("id", user.id)
    .single();

  if (!adminAccount || adminAccount.status !== "active" || !["admin", "super_admin"].includes(adminAccount.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { action, adminNote } = await request.json();
    if (!["approve", "reject"].includes(action)) {
      return NextResponse.json({ error: "action must be 'approve' or 'reject'" }, { status: 400 });
    }

    // Get the upgrade request
    const { data: upgradeReq, error: fetchErr } = await adminDb
      .from("tier_upgrade_requests")
      .select("*")
      .eq("id", params.id)
      .single();

    if (fetchErr || !upgradeReq) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    if (upgradeReq.status !== "pending") {
      return NextResponse.json({ error: "This request has already been processed" }, { status: 400 });
    }

    // Update the request
    const { error: updateErr } = await adminDb
      .from("tier_upgrade_requests")
      .update({
        status: action === "approve" ? "approved" : "rejected",
        admin_note: adminNote ?? null,
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", params.id);

    if (updateErr) {
      return NextResponse.json({ error: "Failed to update request" }, { status: 500 });
    }

    if (action === "approve") {
      // Update user's tier
      await adminDb
        .from("profiles")
        .update({ tier: upgradeReq.requested_tier })
        .eq("id", upgradeReq.user_id);

      // Notify user
      adminDb.from("notifications").insert({
        user_id: upgradeReq.user_id,
        type: "tier_upgrade_approved",
        title: "Tier Upgrade Approved!",
        message: `Your account has been upgraded to ${upgradeReq.requested_tier.replace(/_/g, " ")}.`,
      }).then(() => {});
    } else {
      adminDb.from("notifications").insert({
        user_id: upgradeReq.user_id,
        type: "tier_upgrade_rejected",
        title: "Tier Upgrade Request",
        message: adminNote
          ? `Your tier upgrade request was not approved: ${adminNote}`
          : "Your tier upgrade request was not approved at this time.",
      }).then(() => {});
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[admin/tier-upgrade PATCH]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
