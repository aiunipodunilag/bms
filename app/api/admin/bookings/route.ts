import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * GET /api/admin/bookings
 * Lists all bookings with optional filters.
 * Query: ?status=pending  ?date=2025-07-18  ?spaceId=maker-space
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
  const dateFilter = searchParams.get("date");
  const dateGteFilter = searchParams.get("date_gte");
  const spaceFilter = searchParams.get("spaceId");
  const codeFilter = searchParams.get("code");

  // Support lookup by BMS code (for check-in desk — receptionists allowed)
  // Full listing is restricted to admin/super_admin only
  if (!codeFilter && !["admin", "super_admin"].includes(adminAccount.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (codeFilter) {
    const { data: booking, error } = await adminDb
      .from("bookings")
      .select("*, profiles:user_id(full_name, email, tier, matric_number, phone)")
      .eq("bms_code", codeFilter.trim().toUpperCase())
      .single();

    if (error || !booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }
    return NextResponse.json({ booking });
  }

  let query = adminDb
    .from("bookings")
    .select("*, profiles:user_id(full_name, email, tier, matric_number)")
    .order("date", { ascending: false })
    .order("start_time", { ascending: true });

  if (statusFilter) query = query.eq("status", statusFilter);
  if (dateFilter) query = query.eq("date", dateFilter);
  if (dateGteFilter) query = query.gte("date", dateGteFilter);
  if (spaceFilter) query = query.eq("space_id", spaceFilter);

  const { data: bookings, error } = await query;
  if (error) {
    return NextResponse.json({ error: "Failed to fetch bookings" }, { status: 500 });
  }

  if (!bookings || bookings.length === 0) {
    return NextResponse.json({ bookings: [] });
  }

  // Fill in missing emails from auth for older profiles
  const missingEmailUserIds = bookings
    .filter((b) => b.profiles && !b.profiles.email)
    .map((b) => b.user_id);

  let authEmailMap: Record<string, string> = {};
  if (missingEmailUserIds.length > 0) {
    const { data: { users: authUsers } } = await adminDb.auth.admin.listUsers({ perPage: 1000 });
    for (const au of authUsers ?? []) {
      if (au.email) authEmailMap[au.id] = au.email;
    }
  }

  const enriched = bookings.map((b) => ({
    ...b,
    profiles: b.profiles
      ? { ...b.profiles, email: b.profiles.email ?? authEmailMap[b.user_id] ?? "" }
      : null,
  }));

  return NextResponse.json({ bookings: enriched });
}
