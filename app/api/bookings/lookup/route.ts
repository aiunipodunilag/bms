import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * GET /api/bookings/lookup?code=BMS-2025-XXXXX
 * Looks up a booking by BMS code.
 * Used by the receptionist check-in interface.
 * Requires admin auth.
 */
export async function GET(request: NextRequest) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  const adminDb = createAdminClient();

  // Verify admin access
  const { data: adminAccount } = await adminDb
    .from("admin_accounts")
    .select("role, status")
    .eq("id", user.id)
    .single();

  if (!adminAccount || adminAccount.status !== "active") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const code = new URL(request.url).searchParams.get("code");
  if (!code) {
    return NextResponse.json({ error: "BMS code is required" }, { status: 400 });
  }

  const { data: booking, error } = await adminDb
    .from("bookings")
    .select("*, profiles:user_id(full_name, email, tier, matric_number)")
    .eq("bms_code", code.trim().toUpperCase())
    .single();

  if (error || !booking) {
    return NextResponse.json({ error: "Booking not found for this code" }, { status: 404 });
  }

  return NextResponse.json({ booking });
}
