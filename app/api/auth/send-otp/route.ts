import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import crypto from "crypto";

/**
 * POST /api/auth/send-otp
 * Generates a 6-digit OTP for external user phone verification.
 * Stores a hashed version in phone_verifications table.
 * Integrates with Termii (Nigerian SMS gateway) to deliver the OTP.
 */
export async function POST(request: NextRequest) {
  try {
    const { phone } = await request.json();

    if (!phone) {
      return NextResponse.json({ error: "Phone number is required" }, { status: 400 });
    }

    // Normalise phone: ensure +234 prefix
    const normalisedPhone = phone.startsWith("+") ? phone : `+${phone}`;

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Hash OTP using SHA-256 (lightweight — full bcrypt not needed for short-lived OTPs)
    const otpHash = crypto.createHash("sha256").update(otp).digest("hex");
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    const adminClient = createAdminClient();

    // Remove any previous unused verifications for this number
    await adminClient
      .from("phone_verifications")
      .delete()
      .eq("phone", normalisedPhone)
      .eq("verified", false);

    // Store new OTP
    const { error: insertError } = await adminClient
      .from("phone_verifications")
      .insert({
        phone: normalisedPhone,
        otp_hash: otpHash,
        verified: false,
        expires_at: expiresAt.toISOString(),
      });

    if (insertError) {
      console.error("[send-otp] insert error:", insertError);
      return NextResponse.json({ error: "Failed to create verification" }, { status: 500 });
    }

    // ── Send SMS via Termii ───────────────────────────────────────────────────
    // To activate: set TERMII_API_KEY and TERMII_SENDER_ID in .env.local
    if (process.env.TERMII_API_KEY) {
      const termiiRes = await fetch("https://api.ng.termii.com/api/sms/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: normalisedPhone,
          from: process.env.TERMII_SENDER_ID ?? "N-Alert",
          sms: `Your AI-UNIPOD BMS verification code is: ${otp}. Valid for 10 minutes. Do not share this code.`,
          type: "plain",
          channel: "dnd",
          api_key: process.env.TERMII_API_KEY,
        }),
      });

      if (!termiiRes.ok) {
        console.error("[send-otp] Termii error:", await termiiRes.text());
        // Don't fail — OTP is stored, just SMS delivery failed
      }
    } else {
      // Development fallback: log OTP to console
      console.log(`[send-otp] DEV MODE — OTP for ${normalisedPhone}: ${otp}`);
    }

    return NextResponse.json({ success: true, message: "OTP sent" });
  } catch (err) {
    console.error("[send-otp] unexpected error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * POST /api/auth/verify-otp
 * Verifies the OTP entered by the user.
 * Returns { verified: true } on success.
 */
export async function PUT(request: NextRequest) {
  try {
    const { phone, otp } = await request.json();

    if (!phone || !otp) {
      return NextResponse.json({ error: "Phone and OTP are required" }, { status: 400 });
    }

    const normalisedPhone = phone.startsWith("+") ? phone : `+${phone}`;
    const otpHash = crypto.createHash("sha256").update(otp).digest("hex");

    const adminClient = createAdminClient();

    const { data, error } = await adminClient
      .from("phone_verifications")
      .select("*")
      .eq("phone", normalisedPhone)
      .eq("otp_hash", otpHash)
      .eq("verified", false)
      .gte("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: "Invalid or expired OTP. Please request a new code." },
        { status: 400 }
      );
    }

    // Mark as verified
    await adminClient
      .from("phone_verifications")
      .update({ verified: true })
      .eq("id", data.id);

    return NextResponse.json({ verified: true });
  } catch (err) {
    console.error("[verify-otp] unexpected error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
