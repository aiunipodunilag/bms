import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * GET /api/admin/me
 * Returns the current user's admin role and status.
 * Used by the admin login page to verify admin access after sign-in.
 */
export async function GET() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  const adminDb = createAdminClient();
  const { data: admin, error } = await adminDb
    .from("admin_accounts")
    .select("role, status")
    .eq("id", user.id)
    .single();

  if (error || !admin) {
    return NextResponse.json({ error: "Not an admin account" }, { status: 403 });
  }

  return NextResponse.json({ role: admin.role, status: admin.status });
}
