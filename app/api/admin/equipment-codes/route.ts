import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { SPACE_EQUIPMENT_MAP } from "@/lib/data/spaces";

function generateEquipmentCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 5; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return `EQ-${new Date().getFullYear()}-${code}`;
}

/**
 * POST /api/admin/equipment-codes
 * Generates equipment access codes for a checked-in booking.
 * Called by the receptionist after successful check-in when equipment was requested.
 * Body: { bookingId: string }
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
    const { bookingId } = await request.json();
    if (!bookingId) {
      return NextResponse.json({ error: "bookingId is required" }, { status: 400 });
    }

    const adminClient = createAdminClient();

    const { data: booking, error: fetchErr } = await adminClient
      .from("bookings")
      .select("*, profiles:user_id(full_name)")
      .eq("id", bookingId)
      .single();

    if (fetchErr || !booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    if (booking.status !== "checked_in") {
      return NextResponse.json(
        { error: "Equipment codes can only be generated for checked-in bookings" },
        { status: 400 }
      );
    }

    const equipmentRequested: { type: string; label: string }[] =
      booking.equipment_requested ?? [];

    if (equipmentRequested.length === 0) {
      return NextResponse.json(
        { error: "No equipment was requested for this booking" },
        { status: 400 }
      );
    }

    // Find the space's equipment map to get space info
    const spaceEquipment = SPACE_EQUIPMENT_MAP[booking.space_id];

    const codesInserted = await Promise.all(
      equipmentRequested.map(async (eq) => {
        const code = generateEquipmentCode();
        const { data } = await adminClient
          .from("equipment_access_codes")
          .insert({
            code,
            booking_id: booking.id,
            bms_code: booking.bms_code,
            user_id: booking.user_id,
            user_name: booking.profiles?.full_name ?? "Unknown",
            equipment_type: eq.type,
            equipment_label: eq.label,
            space_id: booking.space_id,
            space_name: booking.space_name,
            status: "active",
          })
          .select()
          .single();
        return data;
      })
    );

    return NextResponse.json({ codes: codesInserted.filter(Boolean) }, { status: 201 });
  } catch (err) {
    console.error("[equipment-codes POST] unexpected:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
