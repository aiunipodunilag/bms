import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * PATCH /api/admin/resource-requests/[id]
 * Approves or rejects a resource request.
 * Body: { action: "approve" | "reject", notes?: string }
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

  if (!adminAccount || adminAccount.status !== "active") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const { action, notes } = body;

  if (!["approve", "reject"].includes(action)) {
    return NextResponse.json({ error: "action must be 'approve' or 'reject'" }, { status: 400 });
  }

  const newStatus = action === "approve" ? "approved" : "rejected";

  const { data: updated, error } = await adminDb
    .from("resource_requests")
    .update({ status: newStatus, admin_note: notes ?? null })
    .eq("id", params.id)
    .select()
    .single();

  if (error || !updated) {
    console.error("[admin/resource-requests PATCH]", error);
    return NextResponse.json({ error: "Failed to update resource request" }, { status: 500 });
  }

  // Notify the user
  const title = action === "approve" ? "Resource Request Approved" : "Resource Request Rejected";
  const message =
    action === "approve"
      ? `Your request for ${updated.resource_type.replace(/_/g, " ")} on ${updated.preferred_date} has been approved. Please collect your equipment access code at check-in.`
      : `Your request for ${updated.resource_type.replace(/_/g, " ")} on ${updated.preferred_date} was not approved.${notes ? ` Reason: ${notes}` : ""}`;

  await adminDb.from("notifications").insert({
    user_id: updated.user_id,
    type: action === "approve" ? "resource_approved" : "resource_rejected",
    title,
    message,
  });

  return NextResponse.json({ request: updated });
}
