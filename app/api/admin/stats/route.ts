import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * GET /api/admin/stats
 * Returns dashboard statistics for the admin overview.
 */
export async function GET() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  // Use service-role client to bypass RLS for admin lookup
  const adminDb = createAdminClient();
  const { data: adminAccount } = await adminDb
    .from("admin_accounts")
    .select("role, status")
    .eq("id", user.id)
    .single();

  if (!adminAccount || adminAccount.status !== "active" || !["admin", "super_admin"].includes(adminAccount.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const today = new Date().toISOString().split("T")[0];
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1); // Monday
  const weekStartStr = weekStart.toISOString().split("T")[0];
  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
    .toISOString()
    .split("T")[0];

  const [
    { count: totalUsers },
    { count: pendingVerifications },
    { count: activeBookingsToday },
    { count: totalBookingsThisWeek },
    { count: noShowsThisWeek },
    { count: pendingApprovals },
    { data: revenueData },
  ] = await Promise.all([
    adminDb.from("profiles").select("*", { count: "exact", head: true }),
    adminDb
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending"),
    adminDb
      .from("bookings")
      .select("*", { count: "exact", head: true })
      .eq("date", today)
      .in("status", ["confirmed", "checked_in"]),
    adminDb
      .from("bookings")
      .select("*", { count: "exact", head: true })
      .gte("date", weekStartStr),
    adminDb
      .from("bookings")
      .select("*", { count: "exact", head: true })
      .gte("date", weekStartStr)
      .eq("status", "no_show"),
    adminDb
      .from("bookings")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending"),
    adminDb
      .from("bookings")
      .select("payment_amount")
      .gte("date", monthStart)
      .eq("payment_status", "paid"),
  ]);

  const revenueThisMonth = (revenueData ?? []).reduce(
    (sum, b) => sum + (b.payment_amount ?? 0),
    0
  );

  return NextResponse.json({
    stats: {
      totalUsers: totalUsers ?? 0,
      pendingVerifications: pendingVerifications ?? 0,
      activeBookingsToday: activeBookingsToday ?? 0,
      totalBookingsThisWeek: totalBookingsThisWeek ?? 0,
      noShowsThisWeek: noShowsThisWeek ?? 0,
      pendingApprovals: pendingApprovals ?? 0,
      revenueThisMonth,
    },
  });
}
