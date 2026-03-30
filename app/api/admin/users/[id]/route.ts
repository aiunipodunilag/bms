import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendAccountVerified, sendAccountRejected } from "@/lib/email";

/**
 * PATCH /api/admin/users/[id]
 * Updates a user's status, tier, or other admin-controlled fields.
 * Body: { status?, tier?, adminNote? }
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
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

  try {
    const body = await request.json();
    const { status, tier } = body;

    const updates: Record<string, string> = {};
    if (status) updates.status = status;
    if (tier) updates.tier = tier;

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    }

    const adminClient = createAdminClient();
    const { data, error } = await adminClient
      .from("profiles")
      .update(updates)
      .eq("id", params.id)
      .select()
      .single();

    if (error) {
      console.error("[admin/users PATCH]", error);
      return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
    }

    // Send notification to user
    const notifType =
      status === "verified"
        ? "account_verified"
        : status === "rejected"
        ? "account_rejected"
        : "admin_broadcast";
    const notifTitle =
      status === "verified"
        ? "Account Verified"
        : status === "rejected"
        ? "Account Rejected"
        : "Account Updated";
    const notifMsg =
      status === "verified"
        ? "Your account has been verified. You can now book spaces on AI-UNIPOD BMS."
        : status === "rejected"
        ? "Your account verification was rejected. Please contact support for more information."
        : `Your account has been updated by an admin.`;

    if (status) {
      await adminClient.from("notifications").insert({
        user_id: params.id,
        type: notifType,
        title: notifTitle,
        message: notifMsg,
      });

      // Send email
      const { data: { user: targetUser } } = await adminClient.auth.admin.getUserById(params.id);
      const userEmail = targetUser?.email ?? data.email;
      if (userEmail) {
        const name = data.full_name ?? "there";
        if (status === "verified") {
          sendAccountVerified({ to: userEmail, name, tier: data.tier })
            .catch((e) => console.error("[email] account verified:", e));
        } else if (status === "rejected") {
          sendAccountRejected({ to: userEmail, name })
            .catch((e) => console.error("[email] account rejected:", e));
        }
      }
    }

    return NextResponse.json({ profile: data });
  } catch (err) {
    console.error("[admin/users PATCH] unexpected:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
