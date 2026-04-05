import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * POST /api/admin/equipment-codes/[code]/verify
 * Marks an equipment access code as used.
 * Only the assigned space lead (or admin) can verify.
 * Body: empty (code is in URL)
 */
export async function POST(
  _request: NextRequest,
  { params }: { params: { code: string } }
) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  const adminDb = createAdminClient();
  const { data: adminAccount } = await adminDb
    .from("admin_accounts")
    .select("role, status, assigned_space_id")
    .eq("id", user.id)
    .single();

  if (
    !adminAccount ||
    adminAccount.status !== "active" ||
    !["admin", "super_admin", "space_lead"].includes(adminAccount.role)
  ) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const code = params.code?.trim().toUpperCase();
  if (!code || !/^EQ-\d{4}-[A-Z0-9]{5}$/.test(code)) {
    return NextResponse.json({ error: "Invalid equipment code format" }, { status: 400 });
  }

  const adminClient = createAdminClient();

  const { data: eqCode, error: fetchErr } = await adminClient
    .from("equipment_access_codes")
    .select("*")
    .eq("code", code)
    .single();

  if (fetchErr || !eqCode) {
    return NextResponse.json({ error: "Equipment code not found" }, { status: 404 });
  }

  if (eqCode.status === "used") {
    return NextResponse.json(
      { error: "This code has already been used.", equipmentCode: eqCode },
      { status: 400 }
    );
  }

  if (eqCode.status === "expired") {
    return NextResponse.json(
      { error: "This code has expired.", equipmentCode: eqCode },
      { status: 400 }
    );
  }

  // Space lead can only verify codes for their assigned space
  if (
    adminAccount.role === "space_lead" &&
    adminAccount.assigned_space_id &&
    eqCode.space_id !== adminAccount.assigned_space_id
  ) {
    return NextResponse.json(
      { error: "You are not authorised to verify codes for this space." },
      { status: 403 }
    );
  }

  const { data: updated, error: updateErr } = await adminClient
    .from("equipment_access_codes")
    .update({
      status: "used",
      used_at: new Date().toISOString(),
      used_by_admin_id: user.id,
    })
    .eq("id", eqCode.id)
    .select()
    .single();

  if (updateErr) {
    return NextResponse.json({ error: "Failed to verify code" }, { status: 500 });
  }

  return NextResponse.json({
    equipmentCode: updated,
    message: `Equipment access granted: ${eqCode.equipment_label}`,
  });
}
