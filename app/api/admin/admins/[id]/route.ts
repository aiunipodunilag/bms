import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * PATCH /api/admin/admins/[id]
 * Updates an admin account (status, role, assigned space). Super admin only.
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

  const adminDb = createAdminClient();
  const { data: adminAccount } = await adminDb
    .from("admin_accounts")
    .select("role, status")
    .eq("id", user.id)
    .single();

  if (!adminAccount || adminAccount.status !== "active" || adminAccount.role !== "super_admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { status, role, assignedSpaceId, assignedSpaceName } = body;

    const updates: Record<string, string | null> = {};
    if (status) updates.status = status;
    if (role) updates.role = role;
    if (assignedSpaceId !== undefined) updates.assigned_space_id = assignedSpaceId;
    if (assignedSpaceName !== undefined) updates.assigned_space_name = assignedSpaceName;

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    }

    const { data, error } = await adminDb
      .from("admin_accounts")
      .update(updates)
      .eq("id", params.id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: "Failed to update admin" }, { status: 500 });
    }

    return NextResponse.json({ admin: data });
  } catch (err) {
    console.error("[admin/admins PATCH] unexpected:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/admins/[id]
 * Deletes (suspends) an admin account. Super admin only.
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  const adminDb2 = createAdminClient();
  const { data: adminAccount } = await adminDb2
    .from("admin_accounts")
    .select("role, status")
    .eq("id", user.id)
    .single();

  if (!adminAccount || adminAccount.status !== "active" || adminAccount.role !== "super_admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Soft delete by suspending, not actually deleting
  const { error } = await adminDb2
    .from("admin_accounts")
    .update({ status: "suspended" })
    .eq("id", params.id);

  if (error) {
    return NextResponse.json({ error: "Failed to suspend admin" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
