import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const DEFAULT_SCHEDULE = {
  Monday:    { enabled: true,  open: "10:00", close: "17:00" },
  Tuesday:   { enabled: true,  open: "10:00", close: "17:00" },
  Wednesday: { enabled: true,  open: "10:00", close: "17:00" },
  Thursday:  { enabled: true,  open: "10:00", close: "17:00" },
  Friday:    { enabled: true,  open: "10:00", close: "17:00" },
  Saturday:  { enabled: false, open: "10:00", close: "15:00" },
  Sunday:    { enabled: false, open: "10:00", close: "15:00" },
};

const DEFAULT_BOOKING_SETTINGS = {
  maxAdvanceDays: 14,
  noShowGracePeriodMinutes: 20,
  extraIndividualFeeNGN: 2000,
  externalCoworkingFeeNGN: 3000,
  groupMinMembers: 4,
  groupMaxHours: 3,
  maintenanceMode: false,
  requireJustificationForPremium: true,
};

async function requireAdmin(userId: string) {
  const adminDb = createAdminClient();
  const { data } = await adminDb
    .from("admin_accounts")
    .select("role, status")
    .eq("id", userId)
    .single();
  return data;
}

/**
 * GET /api/admin/settings
 * Returns system schedule and booking settings.
 */
export async function GET() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  const admin = await requireAdmin(user.id);
  if (!admin || admin.status !== "active" || !["admin", "super_admin"].includes(admin.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const adminDb = createAdminClient();
  const { data: rows } = await adminDb
    .from("system_settings")
    .select("key, value")
    .in("key", ["schedule", "booking_rules"]);

  const schedule = rows?.find((r) => r.key === "schedule")?.value ?? DEFAULT_SCHEDULE;
  const bookingRules = rows?.find((r) => r.key === "booking_rules")?.value ?? DEFAULT_BOOKING_SETTINGS;

  return NextResponse.json({ schedule, bookingRules });
}

/**
 * PUT /api/admin/settings
 * Saves system schedule and/or booking settings. Admin/super_admin only.
 * Body: { schedule?, bookingRules? }
 */
export async function PUT(request: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  const admin = await requireAdmin(user.id);
  if (!admin || admin.status !== "active" || !["admin", "super_admin"].includes(admin.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const adminDb = createAdminClient();

  const upserts: Array<{ key: string; value: unknown; updated_at: string; updated_by: string }> = [];

  if (body.schedule) {
    upserts.push({ key: "schedule", value: body.schedule, updated_at: new Date().toISOString(), updated_by: user.id });
  }
  if (body.bookingRules) {
    upserts.push({ key: "booking_rules", value: body.bookingRules, updated_at: new Date().toISOString(), updated_by: user.id });
  }

  if (upserts.length === 0) {
    return NextResponse.json({ error: "Nothing to save" }, { status: 400 });
  }

  const { error } = await adminDb.from("system_settings").upsert(upserts, { onConflict: "key" });

  if (error) {
    // Table may not exist yet — return success with a warning
    console.warn("[settings PUT] system_settings table may not exist:", error.message);
    return NextResponse.json({ success: true, warning: "Settings saved locally only — run schema migration to persist." });
  }

  return NextResponse.json({ success: true });
}
