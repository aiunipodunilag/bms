import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

/**
 * POST /api/auth/signup
 * Creates a profile record after the user has been created in Supabase Auth.
 * The auth.signUp() call is done client-side; this route handles profile creation.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      userId,
      email,
      fullName,
      phone,
      userClass,
      tier,
      matricNumber,
      staffNumber,
      organisation,
      purposeOfVisit,
      documentUrl,
    } = body;

    if (!userId || !fullName || !userClass) {
      return NextResponse.json(
        { error: "Missing required fields: userId, fullName, userClass" },
        { status: 400 }
      );
    }

    // Verify the userId matches the currently authenticated session.
    // This prevents one user from overwriting another user's profile.
    const supabase = createClient();
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser || authUser.id !== userId) {
      return NextResponse.json(
        { error: "Unauthorized: userId does not match authenticated session" },
        { status: 403 }
      );
    }

    // Allowlist tier values — prevent clients from self-assigning privileged tiers.
    // The tier is mostly determined server-side from userClass, but we accept it from
    // the client for the external flow (external users always get "external" tier).
    const SIGNUP_ALLOWED_TIERS = [
      "regular_student",
      "lecturer_staff",
      "product_developer",
      "external",
    ];
    const safeTier =
      tier && SIGNUP_ALLOWED_TIERS.includes(tier)
        ? tier
        : userClass === "external"
        ? "external"
        : "regular_student";

    const adminClient = createAdminClient();

    // All users are active immediately — no admin verification required for account creation.
    // Booking approval (for manual-approval spaces) is handled per-booking, not per-account.
    const status = "active";

    const { data, error } = await adminClient
      .from("profiles")
      .insert({
        id: userId,
        full_name: fullName,
        email: email ?? null,
        phone: phone ?? null,
        class: userClass,
        tier: safeTier,
        status,
        matric_number: matricNumber ?? null,
        staff_number: staffNumber ?? null,
        organisation: organisation ?? null,
        purpose_of_visit: purposeOfVisit ?? null,
        document_url: documentUrl ?? null,
      })
      .select()
      .single();

    if (error) {
      console.error("[signup] profile insert error:", error);
      return NextResponse.json(
        { error: "Failed to create user profile." },
        { status: 500 }
      );
    }

    return NextResponse.json({ profile: data }, { status: 201 });
  } catch (err) {
    console.error("[signup] unexpected error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

