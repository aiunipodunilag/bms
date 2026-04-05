import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSpaceBySlug } from "@/lib/data/spaces";
import { TIER_RULES, BOOKING_RULES } from "@/lib/data/tiers";
import { generateBMSCode } from "@/lib/utils";
import { sendBookingConfirmation } from "@/lib/email";
import type { UserTier } from "@/types";

/**
 * GET /api/bookings
 * Returns the authenticated user's bookings, ordered newest first.
 * Query: ?status=confirmed,pending  (optional filter)
 */
export async function GET(request: NextRequest) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const statusFilter = searchParams.get("status");

  const adminDb = createAdminClient();

  let query = adminDb
    .from("bookings")
    .select("*")
    .eq("user_id", user.id)
    .order("date", { ascending: false })
    .order("start_time", { ascending: false });

  if (statusFilter) {
    const statuses = statusFilter.split(",");
    query = query.in("status", statuses);
  }

  const { data, error } = await query;
  if (error) {
    console.error("[bookings GET]", error);
    return NextResponse.json({ error: "Failed to fetch bookings" }, { status: 500 });
  }

  return NextResponse.json({ bookings: data });
}

/**
 * POST /api/bookings
 * Creates a new booking with full validation.
 */
export async function POST(request: NextRequest) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  try {
    const body = await request.json();
    const {
      spaceId,
      date,
      startTime,
      endTime,
      duration,
      justification,
      groupMembers,
      equipmentRequested,
      paymentAccepted,
    } = body;

    if (!spaceId || !date || !startTime || !endTime || !duration) {
      return NextResponse.json(
        { error: "Missing required fields: spaceId, date, startTime, endTime, duration" },
        { status: 400 }
      );
    }

    // Validate time ordering
    if (startTime >= endTime) {
      return NextResponse.json(
        { error: "End time must be after start time" },
        { status: 400 }
      );
    }

    // Prevent past-date bookings
    const today = new Date().toISOString().split("T")[0];
    if (date < today) {
      return NextResponse.json(
        { error: "Cannot book for past dates" },
        { status: 400 }
      );
    }

    // Enforce max advance booking window
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + BOOKING_RULES.maxAdvanceDays);
    const maxDateStr = maxDate.toISOString().split("T")[0];
    if (date > maxDateStr) {
      return NextResponse.json(
        { error: `Bookings can only be made up to ${BOOKING_RULES.maxAdvanceDays} days in advance` },
        { status: 400 }
      );
    }

    const adminDb = createAdminClient();

    // Load user profile
    const { data: profile, error: profileErr } = await adminDb
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (profileErr || !profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    if (profile.status !== "verified" && profile.status !== "active") {
      return NextResponse.json(
        {
          error:
            "Your account must be verified before you can book. Please wait for admin approval.",
        },
        { status: 403 }
      );
    }

    // Load space definition
    const space = getSpaceBySlug(spaceId);
    if (!space) {
      return NextResponse.json({ error: "Space not found" }, { status: 404 });
    }

    if (space.approvalType === "admin_only") {
      return NextResponse.json(
        { error: "This space is not available for booking." },
        { status: 403 }
      );
    }

    const tier = profile.tier as UserTier;
    const tierRules = TIER_RULES[tier];

    // ── Weekly individual booking limit (Regular Student) ─────────────────
    const isGroup = groupMembers && groupMembers.length > 0;
    if (!isGroup && tierRules.weeklyIndividualLimit !== "unlimited") {
      const limit = tierRules.weeklyIndividualLimit as number;
      if (profile.weekly_bookings_used >= limit) {
        const needsPayment = tier === "regular_student" && profile.weekly_bookings_used === limit;
        if (needsPayment && !paymentAccepted) {
          return NextResponse.json(
            {
              error: "Weekly limit reached. You must accept the additional fee to continue.",
              requiresPayment: true,
              fee: BOOKING_RULES.extraBookingFee,
            },
            { status: 402 }
          );
        }
      }
    }

    // ── Check for time-slot conflict ──────────────────────────────────────
    const { data: conflicts } = await adminDb
      .from("bookings")
      .select("id")
      .eq("space_id", spaceId)
      .eq("date", date)
      .in("status", ["pending", "confirmed", "checked_in"])
      .lt("start_time", endTime)
      .gt("end_time", startTime);

    if (conflicts && conflicts.length >= space.capacity) {
      return NextResponse.json(
        { error: "This time slot is fully booked. Please choose a different time." },
        { status: 409 }
      );
    }

    // ── Determine approval status ─────────────────────────────────────────
    const autoApproved = space.approvalType === "auto";
    const status = autoApproved ? "confirmed" : "pending";

    // ── Payment flag ───────────────────────────────────────────────────────
    const paymentRequired =
      (tier === "regular_student" &&
        !isGroup &&
        tierRules.weeklyIndividualLimit !== "unlimited" &&
        profile.weekly_bookings_used >= (tierRules.weeklyIndividualLimit as number)) ||
      (tier === "external");
    const paymentAmount = paymentRequired
      ? tier === "external"
        ? BOOKING_RULES.externalCoworkingFee
        : BOOKING_RULES.extraBookingFee
      : undefined;

    const bmsCode = generateBMSCode();

    const { data: booking, error: insertErr } = await adminDb
      .from("bookings")
      .insert({
        bms_code: bmsCode,
        user_id: user.id,
        space_id: spaceId,
        space_name: space.name,
        type: isGroup ? "group" : "individual",
        status,
        date,
        start_time: startTime,
        end_time: endTime,
        duration,
        justification: justification ?? null,
        group_members: groupMembers ?? null,
        equipment_requested: equipmentRequested ?? null,
        payment_required: paymentRequired,
        payment_amount: paymentAmount ?? null,
      })
      .select()
      .single();

    if (insertErr) {
      console.error("[bookings POST] insert error:", insertErr);
      return NextResponse.json({ error: "Failed to create booking" }, { status: 500 });
    }

    // ── Increment weekly counter ───────────────────────────────────────────
    if (!isGroup) {
      await adminDb
        .from("profiles")
        .update({
          weekly_bookings_used: profile.weekly_bookings_used + 1,
        })
        .eq("id", user.id);
    } else {
      await adminDb
        .from("profiles")
        .update({
          weekly_group_bookings_led: profile.weekly_group_bookings_led + 1,
        })
        .eq("id", user.id);
    }

    // ── Send notification ──────────────────────────────────────────────────
    await adminDb.from("notifications").insert({
      user_id: user.id,
      type: autoApproved ? "booking_confirmed" : "booking_pending",
      title: autoApproved ? "Booking Confirmed" : "Booking Submitted",
      message: autoApproved
        ? `Your booking for ${space.name} on ${date} at ${startTime} has been confirmed. Code: ${bmsCode}`
        : `Your booking for ${space.name} on ${date} is pending admin approval. Reference: ${bmsCode}`,
    });

    // ── Send confirmation email ────────────────────────────────────────────
    const userEmail = user.email ?? profile.email;
    if (userEmail) {
      sendBookingConfirmation({
        to: userEmail,
        name: profile.full_name ?? "there",
        bmsCode,
        spaceName: space.name,
        date,
        startTime,
        endTime,
        status: autoApproved ? "confirmed" : "pending",
      }).catch((e) => console.error("[email] booking confirmation:", e));
    }

    return NextResponse.json({ booking }, { status: 201 });
  } catch (err) {
    console.error("[bookings POST] unexpected error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
