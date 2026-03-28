import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * PATCH /api/admin/bookings/[id]
 * Approves or rejects a booking.
 * Body: { action: "approve" | "reject", adminNote?: string }
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  const { data: adminAccount } = await supabase
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

  try {
    const { action, adminNote } = await request.json();

    if (!["approve", "reject"].includes(action)) {
      return NextResponse.json(
        { error: 'action must be "approve" or "reject"' },
        { status: 400 }
      );
    }

    const newStatus = action === "approve" ? "confirmed" : "rejected";
    const adminClient = createAdminClient();

    const { data: booking, error: fetchErr } = await adminClient
      .from("bookings")
      .select("*")
      .eq("id", params.id)
      .single();

    if (fetchErr || !booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    const { data: updated, error: updateErr } = await adminClient
      .from("bookings")
      .update({ status: newStatus, admin_note: adminNote ?? null })
      .eq("id", params.id)
      .select()
      .single();

    if (updateErr) {
      return NextResponse.json({ error: "Failed to update booking" }, { status: 500 });
    }

    // Notify the user
    await adminClient.from("notifications").insert({
      user_id: booking.user_id,
      type: action === "approve" ? "booking_confirmed" : "booking_rejected",
      title: action === "approve" ? "Booking Approved" : "Booking Rejected",
      message:
        action === "approve"
          ? `Your booking for ${booking.space_name} on ${booking.date} at ${booking.start_time} has been approved. Code: ${booking.bms_code}`
          : `Your booking for ${booking.space_name} on ${booking.date} was not approved.${
              adminNote ? ` Reason: ${adminNote}` : ""
            }`,
    });

    return NextResponse.json({ booking: updated });
  } catch (err) {
    console.error("[admin/bookings PATCH] unexpected:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
