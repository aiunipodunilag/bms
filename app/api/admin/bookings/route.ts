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

  const { searchParams } = new URL(request.url);
  const statusFilter = searchParams.get("status");
  const dateFilter = searchParams.get("date");
  const spaceFilter = searchParams.get("spaceId");

  let query = adminDb
    .from("bookings")
    .select("*, profiles:user_id(full_name, email, tier, matric_number)")
    .order("date", { ascending: false })
    .order("start_time", { ascending: true });

  if (statusFilter) query = query.eq("status", statusFilter);
  if (dateFilter) query = query.eq("date", dateFilter);
  if (spaceFilter) query = query.eq("space_id", spaceFilter);

  const { data, error } = await query;
  if (error) {
    return NextResponse.json({ error: "Failed to fetch bookings" }, { status: 500 });
  }

  return NextResponse.json({ bookings: data });
}
