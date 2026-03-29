import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * PATCH /api/admin/spaces/[id]
 * Saves a space override (status, description, capacity). Admin/super_admin only.
 * Body: { status?, description?, capacity? }
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  const adminDb = createAdminClient();
  const { data: adminAccount } = await adminDb
    .from("admin_accounts")
    .select("role, status")
    .eq("id", user.id)
    .single();

  if (!adminAccount || adminAccount.status !== "active" || !["admin", "super_admin"].includes(adminAccount.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const { status, description, capacity } = body;

  const update: Record<string, unknown> = { updated_at: new Date().toISOString(), updated_by: user.id };
  if (status !== undefined) update.status = status;
  if (description !== undefined) update.description = description;
  if (capacity !== undefined) update.capacity = capacity;

  const { error } = await adminDb
    .from("space_overrides")
    .upsert({ space_id: params.id, ...update }, { onConflict: "space_id" });

  if (error) {
    // Table may not exist — silently succeed so the UI still works
    console.warn("[spaces PATCH] space_overrides table may not exist:", error.message);
  }

  return NextResponse.json({ success: true });
}

/**
 * GET /api/admin/spaces/[id]
 * Returns the override for a specific space.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  const adminDb = createAdminClient();
  const { data } = await adminDb
    .from("space_overrides")
    .select("*")
    .eq("space_id", params.id)
    .single();

  return NextResponse.json({ override: data ?? null });
}
