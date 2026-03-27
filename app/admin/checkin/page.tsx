"use client";

import { useState } from "react";
import AdminSidebar from "@/components/layout/AdminSidebar";
import { Card } from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { formatDate, formatTime } from "@/lib/utils";
import {
  QrCode,
  CheckCircle,
  XCircle,
  Search,
  Users,
  Clock,
  AlertCircle,
  Building2,
} from "lucide-react";

type CheckInResult = {
  success: boolean;
  booking?: {
    bmsCode: string;
    user: string;
    tier: string;
    space: string;
    date: string;
    startTime: string;
    endTime: string;
    type: "individual" | "group";
    groupMembers?: string[];
    paymentRequired?: boolean;
    paymentAmount?: number;
  };
  error?: string;
};

const mockLookup = (code: string): CheckInResult => {
  if (code === "BMS-2025-T4K9P") {
    return {
      success: true,
      booking: {
        bmsCode: code,
        user: "Tolu Adeyemi",
        tier: "Regular Student",
        space: "Co-working Space",
        date: "2025-07-17",
        startTime: "10:00",
        endTime: "12:00",
        type: "individual",
      },
    };
  }
  if (code === "BMS-2025-Z9M2R") {
    return {
      success: true,
      booking: {
        bmsCode: code,
        user: "Zara Mohammed",
        tier: "Regular Student",
        space: "AI & Robotics Lab",
        date: "2025-07-17",
        startTime: "13:00",
        endTime: "16:00",
        type: "individual",
      },
    };
  }
  if (code === "BMS-2025-GRP01") {
    return {
      success: true,
      booking: {
        bmsCode: code,
        user: "Amaka Obi (Lead)",
        tier: "Product Developer",
        space: "Pitch Garage",
        date: "2025-07-17",
        startTime: "14:00",
        endTime: "16:00",
        type: "group",
        groupMembers: ["Seun Fadeyi", "Chidi Eze", "Bimpe Abiodun"],
      },
    };
  }
  return { success: false, error: "Booking code not found or already checked in." };
};

export default function CheckInPage() {
  const [code, setCode] = useState("");
  const [result, setResult] = useState<CheckInResult | null>(null);
  const [checkedIn, setCheckedIn] = useState(false);
  const [loading, setLoading] = useState(false);

  const lookup = async () => {
    if (!code.trim()) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600)); // mock delay
    // TODO: Replace with GET /api/checkin/lookup?code={code}
    setResult(mockLookup(code.toUpperCase()));
    setCheckedIn(false);
    setLoading(false);
  };

  const confirmCheckIn = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    // TODO: Replace with POST /api/checkin/confirm with { bmsCode: code }
    setCheckedIn(true);
    setLoading(false);
  };

  const reset = () => {
    setCode("");
    setResult(null);
    setCheckedIn(false);
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar />

      <div className="flex-1 overflow-auto">
        <main className="max-w-2xl mx-auto px-6 py-8 space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Receptionist Check-in</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Scan or manually enter a booking code to check in a user.
            </p>
          </div>

          {/* Code entry */}
          <Card>
            <h2 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <QrCode size={16} className="text-brand-500" />
              Enter Booking Code
            </h2>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. BMS-2025-T4K9P"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === "Enter" && lookup()}
                className="flex-1 px-4 py-3 rounded-xl border border-gray-300 text-sm font-mono font-medium focus:outline-none focus:ring-2 focus:ring-brand-500 uppercase placeholder:normal-case placeholder:font-normal"
              />
              <Button onClick={lookup} loading={loading} disabled={!code.trim()}>
                <Search size={16} /> Lookup
              </Button>
            </div>
            <p className="text-xs text-gray-400 mt-2">
              💡 Tip: You can also scan the QR code — it contains the booking code.
            </p>
          </Card>

          {/* Result */}
          {result && !checkedIn && (
            <Card
              className={`border-2 ${
                result.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"
              }`}
            >
              {result.success && result.booking ? (
                <>
                  <div className="flex items-center gap-2 mb-4">
                    <CheckCircle size={20} className="text-green-600" />
                    <p className="font-semibold text-green-800">Booking Found</p>
                    <Badge variant="success" className="ml-auto">{result.booking.bmsCode}</Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-gray-500 font-medium mb-0.5">User</p>
                      <p className="font-semibold text-gray-900">{result.booking.user}</p>
                      <p className="text-xs text-gray-500">{result.booking.tier}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-medium mb-0.5">Space</p>
                      <p className="font-semibold text-gray-900 flex items-center gap-1">
                        <Building2 size={13} /> {result.booking.space}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-medium mb-0.5">Date</p>
                      <p className="text-sm font-medium text-gray-800 flex items-center gap-1">
                        {formatDate(result.booking.date)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-medium mb-0.5">Time</p>
                      <p className="text-sm font-medium text-gray-800 flex items-center gap-1">
                        <Clock size={13} />
                        {formatTime(result.booking.startTime)} – {formatTime(result.booking.endTime)}
                      </p>
                    </div>
                  </div>

                  {result.booking.type === "group" && result.booking.groupMembers && (
                    <div className="mb-4 p-3 bg-white rounded-xl border border-green-200">
                      <p className="text-xs font-semibold text-gray-700 mb-2 flex items-center gap-1.5">
                        <Users size={13} /> Group Members
                      </p>
                      <ul className="space-y-1">
                        {result.booking.groupMembers.map((m) => (
                          <li key={m} className="text-sm text-gray-600 flex items-center gap-2">
                            <CheckCircle size={12} className="text-green-500" /> {m}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {result.booking.paymentRequired && (
                    <div className="mb-4 p-3 bg-amber-50 rounded-xl border border-amber-200">
                      <p className="text-sm font-semibold text-amber-700 flex items-center gap-1.5">
                        <AlertCircle size={14} />
                        Payment Required: ₦{result.booking.paymentAmount?.toLocaleString()}
                      </p>
                      <p className="text-xs text-amber-600 mt-1">
                        Collect payment before confirming check-in. Log payment below.
                      </p>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <Button className="flex-1" onClick={confirmCheckIn} loading={loading}>
                      <CheckCircle size={16} /> Confirm Check-in
                    </Button>
                    <Button variant="outline" onClick={reset}>
                      Cancel
                    </Button>
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-3">
                  <XCircle size={22} className="text-red-500 shrink-0" />
                  <div>
                    <p className="font-semibold text-red-700">Booking Not Found</p>
                    <p className="text-sm text-red-600 mt-0.5">{result.error}</p>
                  </div>
                  <Button variant="outline" size="sm" className="ml-auto" onClick={reset}>
                    Try Again
                  </Button>
                </div>
              )}
            </Card>
          )}

          {/* Success */}
          {checkedIn && (
            <Card className="border-2 border-brand-200 bg-brand-50 text-center py-8">
              <CheckCircle size={44} className="text-brand-600 mx-auto mb-3" />
              <p className="text-xl font-bold text-brand-900 mb-1">Access Granted!</p>
              <p className="text-brand-700 text-sm mb-2">
                {result?.booking?.user} has been checked in to <strong>{result?.booking?.space}</strong>.
              </p>
              <p className="text-xs text-brand-500 mb-5">
                Check-in time logged: {new Date().toLocaleTimeString("en-NG")}
              </p>
              <Button onClick={reset}>
                Check In Next User
              </Button>
            </Card>
          )}

          {/* Recent check-ins */}
          <Card>
            <h2 className="font-semibold text-gray-800 mb-3">Recent Check-ins Today</h2>
            <div className="space-y-2">
              {[
                { user: "Bimpe Abiodun", space: "Co-working Space", time: "10:03 AM" },
                { user: "Kunle Osei", space: "Design Studio", time: "10:22 AM" },
                { user: "Fatima Yusuf", space: "AI & Robotics Lab", time: "11:05 AM" },
                { user: "David Anya", space: "Collaboration Space", time: "11:30 AM" },
              ].map((c) => (
                <div key={c.user} className="flex items-center justify-between py-2.5 px-3 rounded-xl hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-green-100 flex items-center justify-center">
                      <span className="text-green-700 text-xs font-bold">{c.user[0]}</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">{c.user}</p>
                      <p className="text-xs text-gray-400">{c.space}</p>
                    </div>
                  </div>
                  <span className="text-xs text-gray-400">{c.time}</span>
                </div>
              ))}
            </div>
          </Card>
        </main>
      </div>
    </div>
  );
}
