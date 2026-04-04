import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendBroadcastEmail } from "@/lib/email";

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

  const adminDb = createAdminClient();
  const { data: adminAccount } = await adminDb
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
    const { subject, message, target, channel } = await request.json();
    // channel: "in_app" | "email" | "both" (default "both")
    const sendInApp = channel !== "email";
    const sendEmail  = channel !== "in_app";

    if (!subject || !message) {
      return NextResponse.json({ error: "Subject and message are required" }, { status: 400 });
    }

    // Store the broadcast record
    await adminDb.from("broadcast_messages").insert({
      admin_id: user.id,
      admin_name: adminAccount.full_name,
      subject,
      message,
      target: target ?? "all",
    });

    // Fetch target users — include both "active" and "verified" statuses
    // (users created after the verification removal have status="active")
    let userQuery = adminDb
      .from("profiles")
      .select("id, full_name, email")
      .in("status", ["active", "verified"]);

    if (target === "internal") {
      userQuery = userQuery.eq("class", "internal");
    } else if (target === "external") {
      userQuery = userQuery.eq("class", "external");
    } else if (target && target !== "all") {
      userQuery = userQuery.eq("tier", target);
    }

    const { data: targetUsers } = await userQuery;
    if (!targetUsers || targetUsers.length === 0) {
      return NextResponse.json({ success: true, sent: 0 });
    }

    // Insert in-app notifications (skip if channel is email-only)
    if (sendInApp) {
      const notifications = targetUsers.map((u) => ({
        user_id: u.id,
        type: "admin_broadcast",
        title: subject,
        message,
      }));
      const BATCH_SIZE = 500;
      for (let i = 0; i < notifications.length; i += BATCH_SIZE) {
        await adminDb.from("notifications").insert(notifications.slice(i, i + BATCH_SIZE));
      }
    }

    // Send emails (skip if channel is in-app only)
    if (sendEmail) {
      // Backfill missing emails from auth
      const missingEmailUsers = targetUsers.filter((u) => !u.email);
      if (missingEmailUsers.length > 0) {
        const { data: { users: authUsers } } = await adminDb.auth.admin.listUsers({ perPage: 1000 });
        const authEmailMap: Record<string, string> = {};
        for (const au of authUsers ?? []) {
          if (au.email) authEmailMap[au.id] = au.email;
        }
        for (const u of missingEmailUsers) {
          (u as any).email = authEmailMap[u.id] ?? null;
        }
      }

      const adminName = adminAccount.full_name ?? "AI-UNIPOD Admin";
      const emailPromises = targetUsers
        .filter((u) => u.email)
        .map((u) =>
          sendBroadcastEmail({
            to: u.email!,
            name: u.full_name ?? "there",
            subject,
            message,
            adminName,
          }).catch((e) => console.error("[broadcast email]", u.id, e))
        );
      await Promise.allSettled(emailPromises);
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

  const adminDb = createAdminClient();
  const { data: adminAccount } = await adminDb
    .from("admin_accounts")
    .select("role, status")
    .eq("id", user.id)
    .single();

  if (!adminAccount || adminAccount.status !== "active") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { data } = await adminDb
    .from("broadcast_messages")
    .select("*")
    .order("sent_at", { ascending: false })
    .limit(20);

  return NextResponse.json({ broadcasts: data ?? [] });
}
