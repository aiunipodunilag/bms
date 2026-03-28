import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * POST /api/admin/broadcast
 * Sends a broadcast message notification to all matching users.
 * Body: { subject, message, target: "all" | "internal" | "external" | tier }
 */
export async function POST(request: NextRequest) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  const { data: adminAccount } = await supabase
    .from("admin_accounts")
    .select("full_name, role, status")
    .eq("id", user.id)
    .single();

  if (
    !adminAccount ||
    adminAccount.status !== "active" ||
    !["admin", "super_admin"].includes(adminAccount.role)
  ) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { subject, message, target } = await request.json();

    if (!subject || !message) {
      return NextResponse.json({ error: "Subject and message are required" }, { status: 400 });
    }

    const adminClient = createAdminClient();

    // Store the broadcast record
    await adminClient.from("broadcast_messages").insert({
      admin_id: user.id,
      admin_name: adminAccount.full_name,
      subject,
      message,
      target: target ?? "all",
    });

    // Fetch target users
    let userQuery = adminClient.from("profiles").select("id").eq("status", "verified");

    if (target === "internal") {
      userQuery = userQuery.eq("class", "internal");
    } else if (target === "external") {
      userQuery = userQuery.eq("class", "external");
    } else if (target && target !== "all") {
      // target is a tier name
      userQuery = userQuery.eq("tier", target);
    }

    const { data: targetUsers } = await userQuery;
    if (!targetUsers || targetUsers.length === 0) {
      return NextResponse.json({ success: true, sent: 0 });
    }

    // Create notification for each user
    const notifications = targetUsers.map((u) => ({
      user_id: u.id,
      type: "admin_broadcast",
      title: subject,
      message,
    }));

    // Batch insert (Supabase handles up to 1000 rows per insert)
    const BATCH_SIZE = 500;
    for (let i = 0; i < notifications.length; i += BATCH_SIZE) {
      await adminClient
        .from("notifications")
        .insert(notifications.slice(i, i + BATCH_SIZE));
    }

    return NextResponse.json({ success: true, sent: targetUsers.length });
  } catch (err) {
    console.error("[broadcast POST] unexpected:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * GET /api/admin/broadcast
 * Returns recent broadcast messages.
 */
export async function GET() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  const { data: adminAccount } = await supabase
    .from("admin_accounts")
    .select("role, status")
    .eq("id", user.id)
    .single();

  if (!adminAccount || adminAccount.status !== "active") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { data } = await supabase
    .from("broadcast_messages")
    .select("*")
    .order("sent_at", { ascending: false })
    .limit(20);

  return NextResponse.json({ broadcasts: data ?? [] });
}
