import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * GET /api/admin/admins
 * Lists all admin accounts. Super admin only.
 */
export async function GET() {
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

  const { data, error } = await adminDb
    .from("admin_accounts")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: "Failed to fetch admins" }, { status: 500 });
  }

  return NextResponse.json({ admins: data });
}

/**
 * POST /api/admin/admins
 * Creates a new admin account. Super admin only.
 * Body: { fullName, email, phone, role, assignedSpaceId?, assignedSpaceName?, tempPassword }
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

  if (!adminAccount || adminAccount.status !== "active" || adminAccount.role !== "super_admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { fullName, email, phone, role, assignedSpaceId, assignedSpaceName, tempPassword } =
      await request.json();

    if (!fullName || !email || !role || !tempPassword) {
      return NextResponse.json(
        { error: "fullName, email, role, and tempPassword are required" },
        { status: 400 }
      );
    }

    // Create the auth user
    const { data: authData, error: authErr } = await adminDb.auth.admin.createUser({
      email,
      password: tempPassword,
      email_confirm: true,
      user_metadata: { full_name: fullName, is_admin: true },
    });

    if (authErr || !authData.user) {
      console.error("[admin/admins POST] auth error:", authErr);
      return NextResponse.json(
        { error: authErr?.message ?? "Failed to create auth user" },
        { status: 400 }
      );
    }

    // Create the admin_accounts record
    const { data: newAdmin, error: insertErr } = await adminDb
      .from("admin_accounts")
      .insert({
        id: authData.user.id,
        full_name: fullName,
        email,
        phone: phone ?? null,
        role,
        assigned_space_id: assignedSpaceId ?? null,
        assigned_space_name: assignedSpaceName ?? null,
        created_by: user.id,
      })
      .select()
      .single();

    if (insertErr) {
      // Rollback auth user creation
      await adminDb.auth.admin.deleteUser(authData.user.id);
      console.error("[admin/admins POST] insert error:", insertErr);
      return NextResponse.json({ error: "Failed to create admin record" }, { status: 500 });
    }

    return NextResponse.json({ admin: newAdmin }, { status: 201 });
  } catch (err) {
    console.error("[admin/admins POST] unexpected:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
