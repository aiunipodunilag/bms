import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * GET /api/spaces/availability?spaceId=...&date=YYYY-MM-DD
 * Returns booked time slots for a space on a given date so the
 * booking form can show which slots are already taken.
 */
export async function GET(request: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const spaceId = searchParams.get("spaceId");
  const date = searchParams.get("date");

  if (!spaceId || !date) {
    return NextResponse.json({ error: "spaceId and date are required" }, { status: 400 });
  }

  const adminDb = createAdminClient();

  // Fetch confirmed/pending/checked_in bookings for this space+date
  const { data: bookings, error } = await adminDb
    .from("bookings")
    .select("start_time, end_time, status")
    .eq("space_id", spaceId)
    .eq("date", date)
    .in("status", ["confirmed", "pending", "checked_in"]);

  if (error) {
    console.error("[spaces/availability GET]", error);
    return NextResponse.json({ bookedSlots: [] });
  }

  return NextResponse.json({ bookedSlots: bookings ?? [] });
}
