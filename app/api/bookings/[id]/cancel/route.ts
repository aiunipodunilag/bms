import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * POST /api/bookings/[id]/cancel
 * Cancels a booking. Only the booking owner can cancel.
 * Bookings that are already checked-in, completed, or cancelled cannot be cancelled.
 */
export async function POST(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  const adminClient = createAdminClient();

  // Verify ownership
  const { data: booking, error: fetchErr } = await adminClient
    .from("bookings")
    .select("*")
    .eq("id", params.id)
    .eq("user_id", user.id)
    .single();

  if (fetchErr || !booking) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }

  if (!["pending", "confirmed"].includes(booking.status)) {
    return NextResponse.json(
      { error: "This booking cannot be cancelled in its current state." },
      { status: 400 }
    );
  }

  const { error: updateErr } = await adminClient
    .from("bookings")
    .update({ status: "cancelled" })
    .eq("id", params.id);

  if (updateErr) {
    console.error("[cancel booking]", updateErr);
    return NextResponse.json({ error: "Failed to cancel booking" }, { status: 500 });
  }

  // Decrement weekly counter
  if (booking.type === "individual") {
    const { data: profile } = await adminClient
      .from("profiles")
      .select("weekly_bookings_used")
      .eq("id", user.id)
      .single();

    if (profile && profile.weekly_bookings_used > 0) {
      await adminClient
        .from("profiles")
        .update({ weekly_bookings_used: profile.weekly_bookings_used - 1 })
        .eq("id", user.id);
    }
  } else if (booking.type === "group") {
    const { data: profile } = await adminClient
      .from("profiles")
      .select("weekly_group_bookings_led")
      .eq("id", user.id)
      .single();

    if (profile && profile.weekly_group_bookings_led > 0) {
      await adminClient
        .from("profiles")
        .update({ weekly_group_bookings_led: profile.weekly_group_bookings_led - 1 })
        .eq("id", user.id);
    }
  }

  // Send cancellation notification
  await adminClient.from("notifications").insert({
    user_id: user.id,
    type: "booking_cancelled",
    title: "Booking Cancelled",
    message: `Your booking for ${booking.space_name} on ${booking.date} has been cancelled.`,
  });

  return NextResponse.json({ success: true });
}
