import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * GET /api/users/me
 * Returns the current user's profile, including their auth email.
 */
export async function GET() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  const adminDb = createAdminClient();
  const [profileResult, totalResult, completedResult] = await Promise.all([
    adminDb.from("profiles").select("*").eq("id", user.id).single(),
    adminDb.from("bookings").select("*", { count: "exact", head: true }).eq("user_id", user.id),
    adminDb.from("bookings").select("*", { count: "exact", head: true }).eq("user_id", user.id).in("status", ["completed", "checked_in"]),
  ]);

  if (profileResult.error || !profileResult.data) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  const profile = profileResult.data;
  const totalBookings = totalResult.count ?? profile.total_bookings ?? 0;
  const completedBookings = completedResult.count ?? profile.completed_bookings ?? 0;

  // Always return auth email (reliable even if not yet in profiles table)
  return NextResponse.json({
    profile: {
      ...profile,
      email: profile.email ?? user.email,
      total_bookings: totalBookings,
      completed_bookings: completedBookings,
    },
  });
}

/**
 * PATCH /api/users/me
 * Updates the current user's profile (name, phone).
 */
export async function PATCH(request: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { fullName, phone } = body;

    const updates: Record<string, string> = {};
    if (fullName) updates.full_name = fullName;
    if (phone !== undefined) updates.phone = phone;

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    }

    const adminDb = createAdminClient();
    const { data, error } = await adminDb
      .from("profiles")
      .update(updates)
      .eq("id", user.id)
      .select()
      .single();

    if (error) {
      console.error("[users/me PATCH] error:", error);
      return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
    }

    return NextResponse.json({ profile: { ...data, email: data.email ?? user.email } });
  } catch (err) {
    console.error("[users/me PATCH] unexpected error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * DELETE /api/users/me
 * Soft-deletes (suspends) the current user's account.
 */
export async function DELETE() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  const adminDb = createAdminClient();
  // Soft delete: mark profile as deleted/suspended
  await adminDb.from("profiles").update({ status: "deleted" }).eq("id", user.id);

  // Sign out
  await supabase.auth.signOut();

  return NextResponse.json({ success: true });
}
