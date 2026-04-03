"use client";

import { useState, useEffect } from "react";
import AdminSidebar from "@/components/layout/AdminSidebar";
import { Card } from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import {
  ScanLine,
  CheckCircle,
  User,
  Clock,
  Calendar,
  Users,
  RotateCcw,
  Cpu,
  Copy,
  RefreshCw,
  Building2,
  AlertCircle,
} from "lucide-react";

interface BookingResult {
  id: string;
  bms_code: string;
  space_name: string;
  date: string;
  start_time: string;
  end_time: string;
  duration: number;
  type: string;
  status: string;
  equipment_requested: { type: string; label: string }[] | null;
  group_members: { name: string; matric_number: string }[] | null;
  profiles: { full_name: string; tier: string } | null;
}

interface EquipmentCode {
  code: string;
  equipment_label: string;
  space_name: string;
}

interface RecentCheckin {
  id: string;
  bms_code: string;
  space_name: string;
  checked_in_at: string;
  profiles: { full_name: string } | null;
}

type CheckinStep = "input" | "found" | "checkedin";

export default function AdminCheckinPage() {
  const [code, setCode]                     = useState("");
  const [step, setStep]                     = useState<CheckinStep>("input");
  const [booking, setBooking]               = useState<BookingResult | null>(null);
  const [errorMsg, setErrorMsg]             = useState("");
  const [loading, setLoading]               = useState(false);
  const [equipmentCodes, setEquipmentCodes] = useState<EquipmentCode[]>([]);
  const [copiedIndex, setCopiedIndex]       = useState<number | null>(null);
  const [recentCheckins, setRecentCheckins] = useState<RecentCheckin[]>([]);

  // Load recent check-ins
  useEffect(() => {
    fetch("/api/admin/bookings?status=checked_in")
      .then((r) => r.json())
      .then(({ bookings }) => setRecentCheckins((bookings ?? []).slice(0, 5)))
      .catch(() => {});
  }, []);

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) return;
    setLoading(true);

    const res = await fetch(`/api/admin/bookings?code=${encodeURIComponent(trimmed)}`);
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setErrorMsg(data.error ?? "No booking found for this code.");
      return;
    }

    if (data.booking.status === "checked_in") {
      setErrorMsg("This booking has already been checked in.");
      return;
    }

    setBooking(data.booking);
    setStep("found");
  };

  const handleConfirmCheckin = async () => {
    if (!booking) return;
    setLoading(true);

    const checkinRes = await fetch("/api/admin/checkin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bmsCode: booking.bms_code }),
    });
    const checkinData = await checkinRes.json();

    if (!checkinRes.ok) {
      setErrorMsg(checkinData.error ?? "Check-in failed.");
      setLoading(false);
      setStep("input");
      return;
    }

    // Generate equipment codes if needed
    let codes: EquipmentCode[] = [];
    if (booking.equipment_requested && booking.equipment_requested.length > 0) {
      const eqRes = await fetch("/api/admin/equipment-codes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId: booking.id }),
      });
      const eqData = await eqRes.json();
      if (!eqRes.ok) {
        // Check-in succeeded but equipment codes failed — warn but don't block
        setErrorMsg(`Check-in recorded, but equipment code generation failed: ${eqData.error ?? "Unknown error"}. Please try again or contact support.`);
      }
      codes = eqData.codes ?? [];
    }

    setEquipmentCodes(codes);
    setLoading(false);
    setStep("checkedin");

    // Refresh recent check-ins
    fetch("/api/admin/bookings?status=checked_in")
      .then((r) => r.json())
      .then(({ bookings }) => setRecentCheckins((bookings ?? []).slice(0, 5)))
      .catch(() => {});
  };

  const copyCode = (idx: number, val: string) => {
    navigator.clipboard.writeText(val).catch(() => {});
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 1500);
  };

  const reset = () => {
    setCode("");
    setStep("input");
    setBooking(null);
    setErrorMsg("");
    setEquipmentCodes([]);
  };

  return (
    <div className="flex min-h-screen bg-[#F8F9FB]">
      <AdminSidebar />

      <div className="flex-1 overflow-auto">
        <main className="max-w-5xl mx-auto px-6 py-8 space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Check-in Desk</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Confirm arrivals, generate equipment access codes for space leads.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">

              {/* Step 1 — Input code */}
              {step === "input" && (
                <Card>
                  <h2 className="font-semibold text-gray-900 flex items-center gap-2 mb-4">
                    <ScanLine size={16} className="text-brand-500" /> Enter Booking Code
                  </h2>
                  <form onSubmit={handleLookup} className="space-y-3">
                    <div>
                      <label className="text-xs text-gray-500 font-medium mb-1.5 block">
                        BMS code from user's confirmation screen or email
                      </label>
                      <input
                        type="text"
                        value={code}
                        onChange={(e) => setCode(e.target.value.toUpperCase())}
                        placeholder="BMS-2025-XXXXX"
                        autoFocus
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 text-base font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-brand-500"
                      />
                    </div>
                    {errorMsg && (
                      <div className="flex items-start gap-2 bg-red-50 border border-red-100 rounded-xl px-3 py-2.5">
                        <AlertCircle size={14} className="text-red-500 shrink-0 mt-0.5" />
                        <p className="text-xs text-red-600">{errorMsg}</p>
                      </div>
                    )}
                    <Button type="submit" loading={loading} className="w-full" size="lg">
                      <ScanLine size={15} /> Look Up Booking
                    </Button>
                  </form>
                </Card>
              )}

              {/* Step 2 — Booking found */}
              {step === "found" && booking && (
                <Card>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                      <CheckCircle size={16} className="text-green-500" /> Booking Found
                    </h2>
                    <button onClick={reset} className="text-gray-400 hover:text-gray-600">
                      <RotateCcw size={14} />
                    </button>
                  </div>

                  <div className="bg-gray-50 rounded-2xl p-4 space-y-3 mb-4">
                    <div className="flex items-center justify-between">
                      <p className="font-mono text-sm font-bold text-brand-700">{booking.bms_code}</p>
                      <Badge variant="success">Confirmed</Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center gap-2 text-gray-600">
                        <User size={13} className="text-gray-400" />
                        {booking.profiles?.full_name ?? "—"}
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Building2 size={13} className="text-gray-400" />
                        {booking.space_name}
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar size={13} className="text-gray-400" />
                        {booking.date}
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Clock size={13} className="text-gray-400" />
                        {booking.start_time}–{booking.end_time} ({booking.duration}h)
                      </div>
                    </div>
                    {booking.type === "group" && booking.group_members && booking.group_members.length > 0 && (
                      <div>
                        <p className="text-xs text-gray-500 font-medium mb-1.5 flex items-center gap-1">
                          <Users size={11} /> Group members
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {booking.group_members.map((m, i) => (
                            <span key={i} className="text-xs bg-white border border-gray-200 px-2.5 py-1 rounded-full text-gray-600">
                              {m.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {booking.equipment_requested && booking.equipment_requested.length > 0 && (
                    <div className="mb-4">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                        <Cpu size={11} /> Equipment requested — codes generated on confirm
                      </p>
                      <div className="space-y-2">
                        {booking.equipment_requested.map((eq, i) => (
                          <div key={i} className="flex items-center justify-between bg-orange-50 border border-orange-100 rounded-xl px-3 py-2.5">
                            <p className="text-sm font-medium text-gray-800">{eq.label}</p>
                            <Badge variant="warning" size="sm">Pending code</Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <Button onClick={handleConfirmCheckin} className="w-full" size="lg" loading={loading}>
                    <CheckCircle size={15} /> Confirm Check-in
                    {booking.equipment_requested && booking.equipment_requested.length > 0
                      ? ` & Generate ${booking.equipment_requested.length} Equipment Code${booking.equipment_requested.length > 1 ? "s" : ""}`
                      : ""}
                  </Button>
                </Card>
              )}

              {/* Step 3 — Checked in + equipment codes */}
              {step === "checkedin" && booking && (
                <Card>
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                      <CheckCircle size={22} className="text-green-600" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">Checked in successfully</p>
                      <p className="text-sm text-gray-500">
                        {booking.profiles?.full_name} · {booking.space_name} · {booking.start_time}–{booking.end_time}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 bg-blue-50 border border-blue-100 rounded-xl px-3 py-2.5 mb-4">
                    <Clock size={13} className="text-blue-500 shrink-0 mt-0.5" />
                    <p className="text-xs text-blue-700">
                      Booking code <span className="font-mono font-bold">{booking.bms_code}</span> is now active and will expire at <strong>{booking.end_time}</strong>.
                    </p>
                  </div>

                  {equipmentCodes.length > 0 ? (
                    <div>
                      <p className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                        <Cpu size={14} className="text-brand-500" /> Equipment Access Codes — hand these to the user
                      </p>
                      <div className="space-y-3">
                        {equipmentCodes.map((eq, i) => (
                          <div key={i} className="border border-gray-200 rounded-2xl p-4">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <p className="font-mono text-2xl font-bold text-brand-700 tracking-widest">{eq.code}</p>
                                <p className="text-xs text-gray-400 mt-0.5">One-time use</p>
                              </div>
                              <button
                                onClick={() => copyCode(i, eq.code)}
                                className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-brand-600 bg-[#F8F9FB] hover:bg-brand-50 px-3 py-1.5 rounded-lg transition-colors shrink-0"
                              >
                                {copiedIndex === i
                                  ? <><CheckCircle size={12} className="text-green-500" /> Copied</>
                                  : <><Copy size={12} /> Copy</>
                                }
                              </button>
                            </div>
                            <div className="flex items-center gap-4 text-xs text-gray-500 flex-wrap">
                              <span className="flex items-center gap-1"><Cpu size={11} /> {eq.equipment_label}</span>
                              <span className="flex items-center gap-1"><Building2 size={11} /> {eq.space_name}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 text-center py-2">No equipment was requested for this booking.</p>
                  )}

                  <div className="mt-5">
                    <Button variant="outline" onClick={reset} className="w-full">
                      <RotateCcw size={13} /> Check in another user
                    </Button>
                  </div>
                </Card>
              )}
            </div>

            {/* Recent check-ins */}
            <div>
              <Card>
                <h3 className="font-semibold text-gray-900 text-sm flex items-center gap-2 mb-3">
                  <RefreshCw size={13} className="text-brand-500" /> Recent Check-ins
                </h3>
                {recentCheckins.length === 0 ? (
                  <p className="text-xs text-gray-400 text-center py-4">No check-ins yet today.</p>
                ) : (
                  <div className="space-y-3">
                    {recentCheckins.map((c) => (
                      <div key={c.id} className="flex items-start gap-2">
                        <CheckCircle size={14} className="text-green-500 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-gray-800">{c.profiles?.full_name ?? "—"}</p>
                          <p className="text-xs text-gray-400">{c.space_name}</p>
                          <p className="text-xs text-gray-400 font-mono">{c.bms_code}</p>
                          {c.checked_in_at && (
                            <p className="text-xs text-gray-300">
                              {new Date(c.checked_in_at).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
