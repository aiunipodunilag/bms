"use client";

import { useState } from "react";
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

// ── Mock booking data ─────────────────────────────────────────────────────────

interface MockBooking {
  bmsCode: string;
  userName: string;
  userTier: string;
  spaceName: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: number;
  type: "individual" | "group";
  status: "confirmed" | "checked_in";
  equipmentRequested: { label: string; spaceId: string; spaceName: string; spaceLeadName: string }[];
  groupMembers?: { name: string; matricNumber: string }[];
}

interface EquipmentCodeResult {
  code: string;
  equipmentLabel: string;
  spaceName: string;
  spaceLeadName: string;
}

const MOCK_BOOKINGS: Record<string, MockBooking> = {
  "BMS-2025-A7X3K": {
    bmsCode: "BMS-2025-A7X3K",
    userName: "Adeola Fashola",
    userTier: "Product Developer",
    spaceName: "Maker Space",
    date: new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" }),
    startTime: "10:00",
    endTime: "12:00",
    duration: 2,
    type: "individual",
    status: "confirmed",
    equipmentRequested: [
      { label: "3D Printer (Medium)", spaceId: "maker-space", spaceName: "Maker Space", spaceLeadName: "Amaka Eze" },
      { label: "Laser Cutter",        spaceId: "maker-space", spaceName: "Maker Space", spaceLeadName: "Amaka Eze" },
    ],
  },
  "BMS-2025-B3R1W": {
    bmsCode: "BMS-2025-B3R1W",
    userName: "Chukwuemeka Obi",
    userTier: "Startup Team",
    spaceName: "AI & Robotics Lab",
    date: new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" }),
    startTime: "11:00",
    endTime: "13:00",
    duration: 2,
    type: "group",
    status: "confirmed",
    equipmentRequested: [
      { label: "Robotics Kit",    spaceId: "ai-robotics-lab", spaceName: "AI & Robotics Lab", spaceLeadName: "Segun Balogun" },
      { label: "GPU Workstation", spaceId: "ai-robotics-lab", spaceName: "AI & Robotics Lab", spaceLeadName: "Segun Balogun" },
    ],
    groupMembers: [
      { name: "Tolu Adeyemi",  matricNumber: "190404012" },
      { name: "Bola Ogundimu", matricNumber: "200302045" },
      { name: "Femi Owolabi",  matricNumber: "210102078" },
    ],
  },
  "BMS-2025-C9N5D": {
    bmsCode: "BMS-2025-C9N5D",
    userName: "Ngozi Mbeki",
    userTier: "Lecturer/Staff",
    spaceName: "Board Room (Main)",
    date: new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" }),
    startTime: "14:00",
    endTime: "16:00",
    duration: 2,
    type: "group",
    status: "confirmed",
    equipmentRequested: [],
    groupMembers: [
      { name: "Dr. Emeka Eze",    matricNumber: "" },
      { name: "Prof. Bayo Lawal", matricNumber: "" },
    ],
  },
};

function generateEQCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let result = "";
  for (let i = 0; i < 5; i++) result += chars[Math.floor(Math.random() * chars.length)];
  return `EQ-${new Date().getFullYear()}-${result}`;
}

type CheckinStep = "input" | "found" | "checkedin";

export default function AdminCheckinPage() {
  const [code, setCode]                   = useState("");
  const [step, setStep]                   = useState<CheckinStep>("input");
  const [booking, setBooking]             = useState<MockBooking | null>(null);
  const [errorMsg, setErrorMsg]           = useState("");
  const [loading, setLoading]             = useState(false);
  const [equipmentCodes, setEquipmentCodes] = useState<EquipmentCodeResult[]>([]);
  const [copiedIndex, setCopiedIndex]     = useState<number | null>(null);

  const [recentCheckins] = useState([
    { name: "Kemi Adeyemi",     bmsCode: "BMS-2025-P1Q2R", space: "Co-working Space", time: "09:42 AM" },
    { name: "Jide Okafor",      bmsCode: "BMS-2025-M5N6T", space: "Maker Space",      time: "09:58 AM" },
    { name: "Comfort Williams", bmsCode: "BMS-2025-W3X4Y", space: "VR Lab",           time: "10:11 AM" },
  ]);

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) return;
    setLoading(true);
    // TODO: GET /api/admin/bookings/lookup?code=trimmed
    await new Promise((r) => setTimeout(r, 700));
    setLoading(false);
    const found = MOCK_BOOKINGS[trimmed];
    if (!found) {
      setErrorMsg("No confirmed booking found for this code. Check the code and try again.");
      return;
    }
    if (found.status === "checked_in") {
      setErrorMsg("This booking has already been checked in.");
      return;
    }
    setBooking(found);
    setStep("found");
  };

  const handleConfirmCheckin = async () => {
    if (!booking) return;
    setLoading(true);
    // TODO: POST /api/admin/bookings/checkin — marks status=checked_in, sets checkedInAt + sessionExpiresAt
    await new Promise((r) => setTimeout(r, 800));
    const generated: EquipmentCodeResult[] = booking.equipmentRequested.map((eq) => ({
      code: generateEQCode(),
      equipmentLabel: eq.label,
      spaceName: eq.spaceName,
      spaceLeadName: eq.spaceLeadName,
    }));
    setEquipmentCodes(generated);
    setLoading(false);
    setStep("checkedin");
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
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar />

      <div className="flex-1 overflow-auto">
        <main className="max-w-5xl mx-auto px-6 py-8 space-y-6">
          {/* Header */}
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
                  <p className="text-xs text-gray-400 text-center mt-4">
                    Try: BMS-2025-A7X3K (with equipment) · BMS-2025-B3R1W (group) · BMS-2025-C9N5D (no equipment)
                  </p>
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
                      <p className="font-mono text-sm font-bold text-brand-700">{booking.bmsCode}</p>
                      <Badge variant="success">Confirmed</Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center gap-2 text-gray-600"><User size={13} className="text-gray-400" />{booking.userName}</div>
                      <div className="flex items-center gap-2 text-gray-600"><Building2 size={13} className="text-gray-400" />{booking.spaceName}</div>
                      <div className="flex items-center gap-2 text-gray-600"><Calendar size={13} className="text-gray-400" />{booking.date}</div>
                      <div className="flex items-center gap-2 text-gray-600"><Clock size={13} className="text-gray-400" />{booking.startTime}–{booking.endTime} ({booking.duration}h)</div>
                    </div>
                    {booking.type === "group" && booking.groupMembers && (
                      <div>
                        <p className="text-xs text-gray-500 font-medium mb-1.5 flex items-center gap-1"><Users size={11} /> Group members</p>
                        <div className="flex flex-wrap gap-1.5">
                          {booking.groupMembers.map((m) => (
                            <span key={m.name} className="text-xs bg-white border border-gray-200 px-2.5 py-1 rounded-full text-gray-600">{m.name}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Equipment requests preview */}
                  {booking.equipmentRequested.length > 0 && (
                    <div className="mb-4">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                        <Cpu size={11} /> Equipment requested — codes generated on confirm
                      </p>
                      <div className="space-y-2">
                        {booking.equipmentRequested.map((eq, i) => (
                          <div key={i} className="flex items-center justify-between bg-orange-50 border border-orange-100 rounded-xl px-3 py-2.5">
                            <div>
                              <p className="text-sm font-medium text-gray-800">{eq.label}</p>
                              <p className="text-xs text-gray-500">{eq.spaceName} · Lead: {eq.spaceLeadName}</p>
                            </div>
                            <Badge variant="warning" size="sm">Pending code</Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <Button onClick={handleConfirmCheckin} className="w-full" size="lg" loading={loading}>
                    <CheckCircle size={15} /> Confirm Check-in
                    {booking.equipmentRequested.length > 0
                      ? ` & Generate ${booking.equipmentRequested.length} Equipment Code${booking.equipmentRequested.length > 1 ? "s" : ""}`
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
                      <p className="text-sm text-gray-500">{booking.userName} · {booking.spaceName} · {booking.startTime}–{booking.endTime}</p>
                    </div>
                  </div>

                  {/* BMS expiry info */}
                  <div className="flex items-start gap-2 bg-blue-50 border border-blue-100 rounded-xl px-3 py-2.5 mb-4">
                    <Clock size={13} className="text-blue-500 shrink-0 mt-0.5" />
                    <p className="text-xs text-blue-700">
                      Booking code <span className="font-mono font-bold">{booking.bmsCode}</span> is now active and will expire automatically at <strong>{booking.endTime}</strong> when the session ends.
                    </p>
                  </div>

                  {/* Equipment access codes */}
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
                                <p className="text-xs text-gray-400 mt-0.5">One-time use · expires after the space lead verifies it</p>
                              </div>
                              <button
                                onClick={() => copyCode(i, eq.code)}
                                className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-brand-600 bg-gray-100 hover:bg-brand-50 px-3 py-1.5 rounded-lg transition-colors shrink-0"
                              >
                                {copiedIndex === i ? <><CheckCircle size={12} className="text-green-500" /> Copied</> : <><Copy size={12} /> Copy</>}
                              </button>
                            </div>
                            <div className="flex items-center gap-4 text-xs text-gray-500 flex-wrap">
                              <span className="flex items-center gap-1"><Cpu size={11} /> {eq.equipmentLabel}</span>
                              <span className="flex items-center gap-1"><Building2 size={11} /> {eq.spaceName}</span>
                              <span className="flex items-center gap-1"><User size={11} /> Show to: <strong>{eq.spaceLeadName}</strong></span>
                            </div>
                          </div>
                        ))}
                      </div>
                      <p className="text-xs text-gray-400 mt-2">
                        Instruct the user to present each code to the named space lead before using the equipment.
                      </p>
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
                <div className="space-y-3">
                  {recentCheckins.map((c, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <CheckCircle size={14} className="text-green-500 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-800">{c.name}</p>
                        <p className="text-xs text-gray-400">{c.space}</p>
                        <p className="text-xs text-gray-400 font-mono">{c.bmsCode}</p>
                        <p className="text-xs text-gray-300">{c.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
