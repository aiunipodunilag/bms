import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * GET /api/admin/users
 * Lists all user profiles with optional filters.
 * Query: ?status=pending  ?tier=regular_student  ?search=name_or_email
 */
export async function GET(request: NextRequest) {
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

  if (!adminAccount || adminAccount.status !== "active") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const statusFilter = searchParams.get("status");
  const tierFilter = searchParams.get("tier");
  const search = searchParams.get("search");

  let query = supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  if (statusFilter) query = query.eq("status", statusFilter);
  if (tierFilter) query = query.eq("tier", tierFilter);
  if (search) query = query.ilike("full_name", `%${search}%`);

  const { data, error } = await query;
  if (error) {
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }

  return NextResponse.json({ users: data });
}
