"use client";

import { useState } from "react";
import { useRouter, notFound } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import { Card } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { getSpaceBySlug } from "@/lib/data/spaces";
import { TIER_LABELS, BOOKING_RULES } from "@/lib/data/tiers";
import { getBookableDates, formatDate, formatTime, formatCurrency, generateBMSCode } from "@/lib/utils";
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
} from "lucide-react";
import type { UserTier } from "@/types";

// Mock current user
const currentUserTier: UserTier = "regular_student";
const weeklyBookingsUsed = 2;
const weeklyLimit = 3;

type BookingStep = "details" | "confirm" | "success";

export default function BookSpacePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const space = getSpaceBySlug(params.id);
  if (!space) notFound();

  const [step, setStep] = useState<BookingStep>("details");
  const [loading, setLoading] = useState(false);
  const [bmsCode, setBmsCode] = useState("");

  const dates = getBookableDates();
  const isGroupOnly = space.bookingType === "group";
  const isAtLimit = weeklyBookingsUsed >= weeklyLimit && currentUserTier === "regular_student";
  const needsExtraPayment = isAtLimit;

  // Form state
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedStartTime, setSelectedStartTime] = useState<string>("");
  const [duration, setDuration] = useState<number>(isGroupOnly ? 2 : 1);
  const [justification, setJustification] = useState("");
  const [groupMembers, setGroupMembers] = useState<string[]>(["", "", ""]);
  const [paymentAccepted, setPaymentAccepted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const timeSlots = Array.from({ length: 7 }, (_, i) => {
    const h = 10 + i;
    return `${String(h).padStart(2, "0")}:00`;
  }).filter((t) => {
    if (!selectedStartTime) return true;
    return true; // filter based on duration
  });

  const endTime = selectedStartTime
    ? `${String(parseInt(selectedStartTime) + duration).padStart(2, "0")}:00`
    : "";

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!selectedDate) newErrors.date = "Please select a date.";
    if (!selectedStartTime) newErrors.time = "Please select a start time.";
    if (space.requiresJustification && justification.trim().length < 50) {
      newErrors.justification = "Please provide a longer justification (min. 2 sentences).";
    }
    if (isGroupOnly || space.bookingType === "both") {
      const validMembers = groupMembers.filter((m) => m.trim() !== "");
      if (isGroupOnly && validMembers.length < (space.minGroupSize! - 1)) {
        newErrors.members = `You need at least ${space.minGroupSize! - 1} other members.`;
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    setLoading(true);

    // TODO: Replace with POST /api/bookings with booking data
    await new Promise((r) => setTimeout(r, 1200));
    setBmsCode(generateBMSCode());
    setStep("success");
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar
        user={{
          name: "Tolu Adeyemi",
          tier: currentUserTier,
          tierLabel: TIER_LABELS[currentUserTier],
        }}
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

            {/* Limit warning */}
            {isAtLimit && (
              <Card className="bg-amber-50 border-amber-200">
                <div className="flex items-start gap-3">
                  <AlertCircle size={18} className="text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-amber-800 text-sm">Weekly limit reached</p>
                    <p className="text-amber-700 text-sm mt-1">
                      You&apos;ve used all 3 of your individual bookings this week. You can either:
                    </p>
                    <ul className="mt-2 space-y-1 text-sm text-amber-700">
                      <li className="flex items-center gap-2">
                        <CheckCircle size={13} className="text-amber-500" />
                        Pay an additional {formatCurrency(BOOKING_RULES.extraBookingFee)} at reception
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle size={13} className="text-amber-500" />
                        <Link href="/spaces" className="underline">
                          Join or form a group booking instead
                        </Link>
                      </li>
                    </ul>
                  </div>
                </div>
              </Card>
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
                          onClick={() =>
                            setGroupMembers(groupMembers.filter((_, i) => i !== idx))
                          }
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
                <h2 className="font-semibold text-gray-800 mb-1">
                  Why do you need this space?
                </h2>
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
                <p className="text-xs text-gray-400 mt-1.5 text-right">
                  {justification.length} chars
                </p>
                {errors.justification && (
                  <p className="text-xs text-red-500 mt-1">{errors.justification}</p>
                )}
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
                    <strong>{formatCurrency(BOOKING_RULES.extraBookingFee)}</strong> at the
                    front desk on arrival for this additional booking.
                  </span>
                </label>
              </Card>
            )}

            <Button
              className="w-full"
              size="lg"
              onClick={() => {
                if (validateForm()) setStep("confirm");
              }}
              disabled={needsExtraPayment && !paymentAccepted}
            >
              Review Booking
            </Button>
          </div>
        )}

        {/* ── STEP: CONFIRM ──────────────────────────────────────────── */}
        {step === "confirm" && (
          <Card>
            <h1 className="text-xl font-bold text-gray-900 mb-5">Confirm Your Booking</h1>

            <div className="space-y-4 mb-6">
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <span className="text-sm text-gray-500">Space</span>
                <span className="text-sm font-semibold text-gray-900">{space.name}</span>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <span className="text-sm text-gray-500">Date</span>
                <span className="text-sm font-semibold text-gray-900">
                  {selectedDate ? formatDate(selectedDate) : "-"}
                </span>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <span className="text-sm text-gray-500">Time</span>
                <span className="text-sm font-semibold text-gray-900">
                  {selectedStartTime ? `${formatTime(selectedStartTime)} – ${formatTime(endTime)}` : "-"}
                </span>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <span className="text-sm text-gray-500">Duration</span>
                <span className="text-sm font-semibold text-gray-900">{duration} hour{duration > 1 ? "s" : ""}</span>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <span className="text-sm text-gray-500">Approval</span>
                <Badge
                  variant={space.approvalType === "auto" ? "success" : "warning"}
                >
                  {space.approvalType === "auto" ? "Instant" : "Manual review"}
                </Badge>
              </div>
              {needsExtraPayment && (
                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <span className="text-sm text-gray-500">Additional fee</span>
                  <span className="text-sm font-semibold text-amber-700">
                    {formatCurrency(BOOKING_RULES.extraBookingFee)} at reception
                  </span>
                </div>
              )}
            </div>

            {/* No-show policy notice */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-5">
              <div className="flex items-start gap-2">
                <Info size={15} className="text-amber-500 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-700">
                  <strong>No-show policy:</strong> Please check in within{" "}
                  <strong>{BOOKING_RULES.noShowGracePeriod} minutes</strong> of your slot start
                  time. If you don&apos;t check in within this window, your booking will be
                  automatically released and flagged on your profile.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setStep("details")}
              >
                Edit
              </Button>
              <Button
                className="flex-1"
                loading={loading}
                onClick={handleSubmit}
              >
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
              {space.approvalType === "auto" ? "Booking Confirmed!" : "Request Submitted!"}
            </h2>
            <p className="text-gray-500 text-sm mb-5">
              {space.approvalType === "auto"
                ? "Your booking is confirmed. A confirmation email with your QR code and booking code has been sent to your email."
                : "Your booking request is in the admin approval queue. You'll receive an email with your QR code once approved."}
            </p>

            <div className="bg-brand-50 border border-brand-100 rounded-2xl px-6 py-5 mb-6">
              <p className="text-xs text-gray-500 mb-1">Your booking code</p>
              <p className="font-mono text-2xl font-bold text-brand-700 tracking-widest">
                {bmsCode}
              </p>
              <p className="text-xs text-gray-400 mt-2">
                Present this code or your QR code to the receptionist at check-in.
              </p>
            </div>

            <div className="flex gap-3">
              <Link href="/dashboard" className="flex-1">
                <Button variant="outline" className="w-full">
                  Go to Dashboard
                </Button>
              </Link>
              <Link href="/bookings" className="flex-1">
                <Button className="w-full">
                  View My Bookings
                </Button>
              </Link>
            </div>
          </Card>
        )}
      </main>
    </div>
  );
}
