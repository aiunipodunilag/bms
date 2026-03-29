import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * GET /api/admin/spaces/overrides
 * Returns all space overrides (status, description, capacity) saved by admins.
 */
export async function GET() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  const adminDb = createAdminClient();
  const { data: adminAccount } = await adminDb
    .from("admin_accounts")
    .select("role, status")
    .eq("id", user.id)
    .single();

  if (!adminAccount || adminAccount.status !== "active") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { data, error } = await adminDb
    .from("space_overrides")
    .select("*");

  if (error) {
    // Table may not exist — return empty array so the UI still works with defaults
    return NextResponse.json({ overrides: [] });
  }

  return NextResponse.json({ overrides: data ?? [] });
}
