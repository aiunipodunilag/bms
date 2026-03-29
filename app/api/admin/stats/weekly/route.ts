import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * GET /api/admin/stats/weekly
 * Returns booking counts per day for the current week (Mon–Sun).
 */
export async function GET() {
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

  // Build Mon–Sun date range for current week
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0=Sun, 1=Mon, …
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((dayOfWeek + 6) % 7));
  monday.setHours(0, 0, 0, 0);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);

  const weekStart = monday.toISOString().split("T")[0];
  const weekEnd = sunday.toISOString().split("T")[0];

  const { data: bookings, error } = await adminDb
    .from("bookings")
    .select("date, status")
    .gte("date", weekStart)
    .lte("date", weekEnd)
    .not("status", "eq", "cancelled");

  if (error) {
    return NextResponse.json({ error: "Failed to fetch weekly stats" }, { status: 500 });
  }

  const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const dayData: Record<string, { bookings: number; noShows: number }> = {};
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    dayData[d.toISOString().split("T")[0]] = { bookings: 0, noShows: 0 };
  }

  for (const b of bookings ?? []) {
    if (!dayData[b.date]) continue;
    if (b.status === "no_show") {
      dayData[b.date].noShows++;
    } else {
      dayData[b.date].bookings++;
    }
  }

  const result = Object.entries(dayData).map(([date, counts], i) => ({
    day: DAYS[i],
    date,
    ...counts,
  }));

  return NextResponse.json({ weekly: result });
}
