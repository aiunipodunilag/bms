import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * GET /api/admin/users
 * Lists all user profiles with optional filters.
 * Query: ?status=pending  ?tier=regular_student  ?search=name_or_email
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

  if (!adminAccount || adminAccount.status !== "active") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const statusFilter = searchParams.get("status");
  const tierFilter = searchParams.get("tier");
  const search = searchParams.get("search");

  // Fetch profiles
  let query = adminDb
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  if (statusFilter) query = query.eq("status", statusFilter);
  if (tierFilter) query = query.eq("tier", tierFilter);
  if (search) query = query.ilike("full_name", `%${search}%`);

  const { data: profiles, error } = await query;
  if (error) {
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }

  if (!profiles || profiles.length === 0) {
    return NextResponse.json({ users: [] });
  }

  // Fetch auth users to get emails for profiles that don't have it yet
  const { data: { users: authUsers } } = await adminDb.auth.admin.listUsers({ perPage: 1000 });
  const emailMap: Record<string, string> = {};
  for (const au of authUsers ?? []) {
    if (au.email) emailMap[au.id] = au.email;
  }

  // Fetch booking counts per user in one query
  const userIds = profiles.map((p) => p.id);
  const { data: bookingCounts } = await adminDb
    .from("bookings")
    .select("user_id")
    .in("user_id", userIds);

  const countMap: Record<string, number> = {};
  for (const b of bookingCounts ?? []) {
    countMap[b.user_id] = (countMap[b.user_id] ?? 0) + 1;
  }

  const users = profiles.map((p) => ({
    ...p,
    email: p.email ?? emailMap[p.id] ?? "",
    total_bookings: countMap[p.id] ?? 0,
  }));

  return NextResponse.json({ users });
}
