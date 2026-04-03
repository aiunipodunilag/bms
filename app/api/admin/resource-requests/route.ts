import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * GET /api/admin/resource-requests
 * Lists all resource requests with optional status filter.
 * Query: ?status=pending
 */
export async function GET(request: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  const adminDb = createAdminClient();
  const { data: adminAccount } = await adminDb
    .from("admin_accounts")
    .select("role, status")
    .eq("id", user.id)
    .single();

  if (
    !adminAccount ||
    adminAccount.status !== "active" ||
    !["admin", "super_admin"].includes(adminAccount.role)
  ) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const statusFilter = searchParams.get("status");

  let query = adminDb
    .from("resource_requests")
    .select("*, profiles:user_id(full_name, email, tier, matric_number)")
    .order("created_at", { ascending: false });

  if (statusFilter && statusFilter !== "all") {
    query = query.eq("status", statusFilter);
  }

  const { data: requests, error } = await query;

  if (error) {
    console.error("[admin/resource-requests GET]", error);
    return NextResponse.json({ error: "Failed to fetch resource requests" }, { status: 500 });
  }

  // Backfill missing emails from auth
  const missingEmailUserIds = (requests ?? [])
    .filter((r) => r.profiles && !r.profiles.email)
    .map((r) => r.user_id);

  let authEmailMap: Record<string, string> = {};
  if (missingEmailUserIds.length > 0) {
    const { data: { users: authUsers } } = await adminDb.auth.admin.listUsers({ perPage: 1000 });
    for (const au of authUsers ?? []) {
      if (au.email) authEmailMap[au.id] = au.email;
    }
  }

  const enriched = (requests ?? []).map((r) => ({
    ...r,
    profiles: r.profiles
      ? { ...r.profiles, email: r.profiles.email ?? authEmailMap[r.user_id] ?? "" }
      : null,
  }));

  return NextResponse.json({ requests: enriched });
}
