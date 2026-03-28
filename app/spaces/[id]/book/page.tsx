"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import { Card } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { getSpaceBySlug, SPACE_EQUIPMENT_MAP } from "@/lib/data/spaces";
import { TIER_LABELS, BOOKING_RULES } from "@/lib/data/tiers";
import { getBookableDates, formatDate, formatTime, formatCurrency } from "@/lib/utils";
import {
  ChevronLeft,
  Users,
  AlertCircle,
  CheckCircle,
  Calendar,
  Clock,
  Info,
  Plus,
  X,
  Cpu,
  Loader2,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { UserTier } from "@/types";

type BookingStep = "details" | "confirm" | "success";

interface UserProfile {
  full_name: string;
  tier: UserTier;
  status: string;
  weekly_bookings_used: number;
}

export default function BookSpacePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const space = getSpaceBySlug(params.id);

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [step, setStep] = useState<BookingStep>("details");
  const [loading, setLoading] = useState(false);
  const [bmsCode, setBmsCode] = useState("");
  const [approvalType, setApprovalType] = useState<"auto" | "manual">("auto");
  const [apiError, setApiError] = useState("");

  useEffect(() => {
    if (!space) { router.push("/spaces"); return; }

    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.push("/auth/login"); return; }

      fetch("/api/users/me").then((r) => r.json()).then((d) => {
        setProfile(d.profile ?? null);
        setAuthLoading(false);
      });
    });
  }, [space, router]);

  const dates = getBookableDates();
  const isGroupOnly = space?.bookingType === "group";

  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedStartTime, setSelectedStartTime] = useState<string>("");
  const [duration, setDuration] = useState<number>(isGroupOnly ? 2 : 1);
  const [justification, setJustification] = useState("");
  const [groupMembers, setGroupMembers] = useState<string[]>(["", "", ""]);
  const [paymentAccepted, setPaymentAccepted] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!space) return null;

  const weeklyLimit = 3;
  const isAtLimit =
    profile?.tier === "regular_student" &&
    (profile?.weekly_bookings_used ?? 0) >= weeklyLimit;
  const needsExtraPayment = isAtLimit;

  const timeSlots = Array.from({ length: 7 }, (_, i) => {
    const h = 10 + i;
    return `${String(h).padStart(2, "0")}:00`;
  });

  const endTime = selectedStartTime
    ? `${String(parseInt(selectedStartTime) + duration).padStart(2, "0")}:00`
    : "";

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!selectedDate) newErrors.date = "Please select a date.";
    if (!selectedStartTime) newErrors.time = "Please select a start time.";
    if (endTime && parseInt(endTime.split(":")[0]) > 17) {
      newErrors.time = "Booking must end by 5:00 PM.";
    }
    if (space.requiresJustification && justification.trim().length < 50) {
      newErrors.justification = "Please provide a longer justification (min. 2 sentences).";
    }
    if (isGroupOnly) {
      const validMembers = groupMembers.filter((m) => m.trim() !== "");
      if (validMembers.length < (space.minGroupSize! - 1)) {
        newErrors.members = `You need at least ${space.minGroupSize! - 1} other members.`;
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    setLoading(true);
    setApiError("");

    const isGroup = isGroupOnly && groupMembers.filter((m) => m.trim()).length > 0;
    const equippedItems = selectedEquipment.map((type) => {
      const eq = SPACE_EQUIPMENT_MAP[space.id]?.find((e) => e.type === type);
      return eq ? { type: eq.type, label: eq.label } : null;
    }).filter(Boolean);

    const res = await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        spaceId: space.id,
        date: selectedDate,
        startTime: selectedStartTime,
        endTime,
        duration,
        justification: justification || null,
        groupMembers: isGroup ? groupMembers.filter((m) => m.trim()) : null,
        equipmentRequested: equippedItems.length > 0 ? equippedItems : null,
        paymentAccepted,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      setApiError(data.error ?? "Failed to create booking. Please try again.");
      setLoading(false);
      return;
    }

    setBmsCode(data.booking.bms_code);
    setApprovalType(space.approvalType === "auto" ? "auto" : "manual");
    setStep("success");
    setLoading(false);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar
        user={
          profile
            ? { name: profile.full_name, tier: profile.tier, tierLabel: TIER_LABELS[profile.tier] }
            : null
        }
      />

      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        <Link
          href={`/spaces/${space.slug}`}
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-6 transition-colors"
        >
          <ChevronLeft size={15} /> Back to {space.name}
        </Link>

        {/* ── STEP: DETAILS ──────────────────────────────────────────── */}
        {step === "details" && (
          <div className="space-y-5">
            <Card>
              <h1 className="text-xl font-bold text-gray-900 mb-1">Book a Slot</h1>
              <p className="text-sm text-gray-500">{space.name}</p>
            </Card>

            {/* Account not verified warning */}
            {profile && profile.status === "pending" && (
              <Card className="bg-amber-50 border-amber-200">
                <div className="flex items-start gap-3">
                  <AlertCircle size={18} className="text-amber-500 shrink-0 mt-0.5" />
                  <p className="text-sm text-amber-700">
                    Your account is pending verification. Please wait for admin approval before booking.
                  </p>
                </div>
              </Card>
            )}

            {/* Weekly limit warning */}
            {isAtLimit && (
              <Card className="bg-amber-50 border-amber-200">
                <div className="flex items-start gap-3">
                  <AlertCircle size={18} className="text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-amber-800 text-sm">Weekly limit reached</p>
                    <p className="text-amber-700 text-sm mt-1">
                      You&apos;ve used all 3 of your individual bookings this week. You can:
                    </p>
                    <ul className="mt-2 space-y-1 text-sm text-amber-700">
                      <li className="flex items-center gap-2">
                        <CheckCircle size={13} className="text-amber-500" />
                        Pay an additional {formatCurrency(BOOKING_RULES.extraBookingFee)} at reception
                      </li>
                    </ul>
                  </div>
                </div>
              </Card>
            )}

            {/* API error */}
            {apiError && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl flex items-start gap-2">
                <AlertCircle size={14} className="shrink-0 mt-0.5" /> {apiError}
              </div>
            )}

            {/* Date selection */}
            <Card>
              <h2 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <Calendar size={16} className="text-brand-500" /> Select Date
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {dates.map((date) => {
                  const iso = date.toISOString().split("T")[0];
                  return (
                    <button
                      key={iso}
                      onClick={() => setSelectedDate(iso)}
                      className={`p-3 rounded-xl border text-sm font-medium transition-all ${
                        selectedDate === iso
                          ? "bg-brand-600 text-white border-brand-600"
                          : "bg-white border-gray-200 text-gray-700 hover:border-brand-300"
                      }`}
                    >
                      <p className="text-xs opacity-70">
                        {date.toLocaleDateString("en-NG", { weekday: "short" })}
                      </p>
                      <p className="font-bold text-base">
                        {date.toLocaleDateString("en-NG", { day: "numeric" })}
                      </p>
                      <p className="text-xs opacity-70">
                        {date.toLocaleDateString("en-NG", { month: "short" })}
                      </p>
                    </button>
                  );
                })}
              </div>
              {errors.date && <p className="text-xs text-red-500 mt-2">{errors.date}</p>}
            </Card>

            {/* Time selection */}
            <Card>
              <h2 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <Clock size={16} className="text-brand-500" /> Select Time & Duration
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-500 font-medium mb-1.5 block">Start time</label>
                  <select
                    value={selectedStartTime}
                    onChange={(e) => setSelectedStartTime(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  >
                    <option value="">Select time</option>
                    {timeSlots.map((t) => (
                      <option key={t} value={t}>
                        {formatTime(t)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-500 font-medium mb-1.5 block">Duration</label>
                  <select
                    value={duration}
                    onChange={(e) => setDuration(Number(e.target.value))}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  >
                    {isGroupOnly ? (
                      <>
                        <option value={2}>2 hours</option>
                        <option value={3}>3 hours</option>
                      </>
                    ) : (
                      <>
                        <option value={1}>1 hour</option>
                        <option value={2}>2 hours</option>
                        <option value={3}>3 hours (max)</option>
                      </>
                    )}
                  </select>
                </div>
              </div>
              {selectedStartTime && endTime && (
                <p className="text-sm text-brand-600 font-medium mt-3">
                  Session: {formatTime(selectedStartTime)} – {formatTime(endTime)}
                </p>
              )}
              {errors.time && <p className="text-xs text-red-500 mt-1">{errors.time}</p>}
            </Card>

            {/* Group members */}
            {isGroupOnly && (
              <Card>
                <h2 className="font-semibold text-gray-800 mb-1 flex items-center gap-2">
                  <Users size={16} className="text-brand-500" /> Group Members
                </h2>
                <p className="text-xs text-gray-400 mb-3">
                  Enter matric numbers or emails of members (min.{" "}
                  {space.minGroupSize! - 1} others required).
                </p>
                <div className="space-y-2">
                  {groupMembers.map((member, idx) => (
                    <div key={idx} className="flex gap-2">
                      <input
                        type="text"
                        placeholder={`Member ${idx + 1} — matric or email`}
                        value={member}
                        onChange={(e) => {
                          const updated = [...groupMembers];
                          updated[idx] = e.target.value;
                          setGroupMembers(updated);
                        }}
                        className="flex-1 px-3 py-2 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                      />
                      {idx >= (space.minGroupSize! - 2) && (
                        <button
                          type="button"
                          onClick={() => setGroupMembers(groupMembers.filter((_, i) => i !== idx))}
                          className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <X size={16} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => setGroupMembers([...groupMembers, ""])}
                  className="mt-2 flex items-center gap-1.5 text-sm text-brand-600 hover:text-brand-700"
                >
                  <Plus size={14} /> Add another member
                </button>
                {errors.members && (
                  <p className="text-xs text-red-500 mt-2">{errors.members}</p>
                )}
              </Card>
            )}

            {/* Justification */}
            {space.requiresJustification && (
              <Card>
                <h2 className="font-semibold text-gray-800 mb-1">Why do you need this space?</h2>
                <p className="text-xs text-gray-400 mb-3">
                  Required — minimum 2–4 sentences. Be specific about your project or purpose.
                </p>
                <textarea
                  rows={4}
                  placeholder="Describe your intended use, project goals, and what you plan to achieve in this session..."
                  value={justification}
                  onChange={(e) => setJustification(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
                />
                <p className="text-xs text-gray-400 mt-1.5 text-right">{justification.length} chars</p>
                {errors.justification && (
                  <p className="text-xs text-red-500 mt-1">{errors.justification}</p>
                )}
              </Card>
            )}

            {/* Equipment selection */}
            {SPACE_EQUIPMENT_MAP[space.id] && (
              <Card>
                <h2 className="font-semibold text-gray-800 mb-1 flex items-center gap-2">
                  <Cpu size={16} className="text-brand-500" /> Equipment Request
                </h2>
                <p className="text-xs text-gray-400 mb-3">
                  Select any equipment you plan to use. A one-time access code will be given at check-in.
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {SPACE_EQUIPMENT_MAP[space.id].map((eq) => {
                    const isSelected = selectedEquipment.includes(eq.type);
                    return (
                      <button
                        key={eq.type}
                        type="button"
                        onClick={() =>
                          setSelectedEquipment((prev) =>
                            isSelected ? prev.filter((t) => t !== eq.type) : [...prev, eq.type]
                          )
                        }
                        className={`text-left px-3 py-2.5 rounded-xl border text-sm transition-all ${
                          isSelected
                            ? "border-brand-500 bg-brand-50 text-brand-700"
                            : "border-gray-200 text-gray-600 hover:border-brand-200"
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          {isSelected && <CheckCircle size={12} className="text-brand-500 shrink-0" />}
                          {eq.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </Card>
            )}

            {/* Extra payment */}
            {needsExtraPayment && (
              <Card className="bg-amber-50 border-amber-200">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={paymentAccepted}
                    onChange={(e) => setPaymentAccepted(e.target.checked)}
                    className="mt-1"
                  />
                  <span className="text-sm text-amber-700">
                    I understand I&apos;ll need to pay{" "}
                    <strong>{formatCurrency(BOOKING_RULES.extraBookingFee)}</strong> at the front desk on arrival.
                  </span>
                </label>
              </Card>
            )}

            <Button
              className="w-full"
              size="lg"
              onClick={() => { if (validateForm()) setStep("confirm"); }}
              disabled={
                (needsExtraPayment && !paymentAccepted) ||
                (profile?.status === "pending")
              }
            >
              Review Booking
            </Button>
          </div>
        )}

        {/* ── STEP: CONFIRM ──────────────────────────────────────────── */}
        {step === "confirm" && (
          <Card>
            <h1 className="text-xl font-bold text-gray-900 mb-5">Confirm Your Booking</h1>

            {apiError && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl flex items-start gap-2">
                <AlertCircle size={14} className="shrink-0 mt-0.5" /> {apiError}
              </div>
            )}

            <div className="space-y-4 mb-6">
              {[
                { label: "Space", value: space.name },
                { label: "Date", value: selectedDate ? formatDate(selectedDate) : "-" },
                { label: "Time", value: selectedStartTime ? `${formatTime(selectedStartTime)} – ${formatTime(endTime)}` : "-" },
                { label: "Duration", value: `${duration} hour${duration > 1 ? "s" : ""}` },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between py-3 border-b border-gray-100">
                  <span className="text-sm text-gray-500">{label}</span>
                  <span className="text-sm font-semibold text-gray-900">{value}</span>
                </div>
              ))}
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <span className="text-sm text-gray-500">Approval</span>
                <Badge variant={space.approvalType === "auto" ? "success" : "warning"}>
                  {space.approvalType === "auto" ? "Instant" : "Manual review"}
                </Badge>
              </div>
              {selectedEquipment.length > 0 && (
                <div className="py-3 border-b border-gray-100">
                  <div className="flex items-start justify-between">
                    <span className="text-sm text-gray-500">Equipment requested</span>
                    <div className="flex flex-col gap-1 text-right">
                      {selectedEquipment.map((type) => {
                        const eq = SPACE_EQUIPMENT_MAP[space.id]?.find((e) => e.type === type);
                        return <span key={type} className="text-xs font-medium text-gray-700">{eq?.label}</span>;
                      })}
                    </div>
                  </div>
                </div>
              )}
              {needsExtraPayment && (
                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <span className="text-sm text-gray-500">Additional fee</span>
                  <span className="text-sm font-semibold text-amber-700">
                    {formatCurrency(BOOKING_RULES.extraBookingFee)} at reception
                  </span>
                </div>
              )}
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-5">
              <div className="flex items-start gap-2">
                <Info size={15} className="text-amber-500 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-700">
                  <strong>No-show policy:</strong> Check in within{" "}
                  <strong>{BOOKING_RULES.noShowGracePeriod} minutes</strong> of your slot start. Failure to do
                  so will release your slot and flag your profile.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => { setApiError(""); setStep("details"); }}>
                Edit
              </Button>
              <Button className="flex-1" loading={loading} onClick={handleSubmit}>
                Confirm Booking
              </Button>
            </div>
          </Card>
        )}

        {/* ── STEP: SUCCESS ──────────────────────────────────────────── */}
        {step === "success" && (
          <Card className="text-center">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-5">
              <CheckCircle size={32} className="text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {approvalType === "auto" ? "Booking Confirmed!" : "Request Submitted!"}
            </h2>
            <p className="text-gray-500 text-sm mb-5">
              {approvalType === "auto"
                ? "Your booking is confirmed. A confirmation email with your QR code has been sent."
                : "Your booking request is in the admin approval queue. You'll be notified by email once approved."}
            </p>

            <div className="bg-brand-50 border border-brand-100 rounded-2xl px-6 py-5 mb-6">
              <p className="text-xs text-gray-500 mb-1">Your booking code</p>
              <p className="font-mono text-2xl font-bold text-brand-700 tracking-widest">{bmsCode}</p>
              <p className="text-xs text-gray-400 mt-2">
                Present this code or your QR code to the receptionist at check-in.
              </p>
            </div>

            <div className="flex gap-3">
              <Link href="/dashboard" className="flex-1">
                <Button variant="outline" className="w-full">Go to Dashboard</Button>
              </Link>
              <Link href="/bookings" className="flex-1">
                <Button className="w-full">View My Bookings</Button>
              </Link>
            </div>
          </Card>
        )}
      </main>
    </div>
  );
}
