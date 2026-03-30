import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendCheckinConfirmed } from "@/lib/email";

/**
 * POST /api/admin/checkin
 * Confirms check-in for a booking by BMS code.
 * Only receptionists and admins can use this.
 * Body: { bmsCode: string }
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
    .select("role, status")
    .eq("id", user.id)
    .single();

  if (
    !adminAccount ||
    adminAccount.status !== "active" ||
    !["admin", "super_admin", "receptionist"].includes(adminAccount.role)
  ) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { bmsCode } = await request.json();
    if (!bmsCode) {
      return NextResponse.json({ error: "BMS code is required" }, { status: 400 });
    }

    const adminClient = createAdminClient();

    // Look up the booking
    const { data: booking, error: fetchErr } = await adminClient
      .from("bookings")
      .select("*, profiles:user_id(full_name, email, tier)")
      .eq("bms_code", bmsCode.trim().toUpperCase())
      .single();

    if (fetchErr || !booking) {
      return NextResponse.json({ error: "Booking not found for this code" }, { status: 404 });
    }

    if (booking.status !== "confirmed") {
      if (booking.status === "checked_in") {
        return NextResponse.json(
          { error: "This booking has already been checked in.", booking },
          { status: 400 }
        );
      }
      if (booking.status === "cancelled" || booking.status === "rejected") {
        return NextResponse.json(
          { error: `This booking is ${booking.status} and cannot be checked in.`, booking },
          { status: 400 }
        );
      }
      return NextResponse.json(
        { error: `Booking status is "${booking.status}". Only confirmed bookings can be checked in.`, booking },
        { status: 400 }
      );
    }

    // Validate check-in is within grace period
    const bookingDateTime = new Date(`${booking.date}T${booking.start_time}`);
    const now = new Date();
    const minutesDiff = (now.getTime() - bookingDateTime.getTime()) / 60000;
    const GRACE_PERIOD = 20;

    if (minutesDiff < -30) {
      return NextResponse.json(
        { error: "It is too early to check in. Please come back closer to your booking time.", booking },
        { status: 400 }
      );
    }

    if (minutesDiff > GRACE_PERIOD) {
      // Mark as no-show and increment counter
      await adminClient
        .from("bookings")
        .update({ status: "no_show" })
        .eq("id", booking.id);

      await adminClient
        .from("profiles")
        .update({ no_show_count: (booking.profiles?.no_show_count ?? 0) + 1 })
        .eq("id", booking.user_id);

      return NextResponse.json(
        {
          error: `Check-in window expired. This booking has been marked as a no-show (${Math.round(minutesDiff)} minutes late).`,
          booking: { ...booking, status: "no_show" },
        },
        { status: 400 }
      );
    }

    // Calculate session expiry
    const [endH, endM] = booking.end_time.split(":").map(Number);
    const sessionExpiresAt = new Date(`${booking.date}T${String(endH).padStart(2, "0")}:${String(endM).padStart(2, "0")}:00`);
    const checkedInAt = new Date().toISOString();

    const { data: updated, error: updateErr } = await adminClient
      .from("bookings")
      .update({
        status: "checked_in",
        checked_in_at: checkedInAt,
        session_expires_at: sessionExpiresAt.toISOString(),
      })
      .eq("id", booking.id)
      .select()
      .single();

    if (updateErr) {
      return NextResponse.json({ error: "Failed to check in booking" }, { status: 500 });
    }

    // Send check-in confirmation email
    const { data: { user: booker } } = await adminClient.auth.admin.getUserById(booking.user_id);
    const bookerEmail = booker?.email ?? booking.profiles?.email;
    if (bookerEmail) {
      sendCheckinConfirmed({
        to: bookerEmail,
        name: booking.profiles?.full_name ?? "there",
        bmsCode: booking.bms_code,
        spaceName: booking.space_name,
        startTime: booking.start_time,
        endTime: booking.end_time,
      }).catch((e) => console.error("[email] checkin confirmed:", e));
    }

    return NextResponse.json({ booking: updated, message: "Check-in successful" });
  } catch (err) {
    console.error("[admin/checkin POST] unexpected:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
