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

    const adminClient = createAdminClient();

    // Determine initial status
    // External users are active immediately (phone OTP verified)
    // Internal users start as pending (need admin document verification)
    const status = userClass === "external" ? "active" : "pending";

    const { data, error } = await adminClient
      .from("profiles")
      .insert({
        id: userId,
        full_name: fullName,
        phone: phone ?? null,
        class: userClass,
        tier: tier ?? (userClass === "external" ? "external" : "regular_student"),
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
