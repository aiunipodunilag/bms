import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import { Card } from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { TIER_LABELS, TIER_COLORS, BOOKING_RULES } from "@/lib/data/tiers";
import { formatDate, formatTime, formatCurrency } from "@/lib/utils";
import {
  CalendarDays,
  Clock,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Zap,
  BookOpen,
  Building2,
} from "lucide-react";
import type { UserTier } from "@/types";

// ─── MOCK DATA — Replace with real data fetching from your API/DB ─────────────
const mockUser = {
  name: "Tolu Adeyemi",
  email: "tolu@student.unilag.edu.ng",
  tier: "regular_student" as UserTier,
  status: "verified",
  matricNumber: "210404032",
  weeklyBookingsUsed: 2,
  weeklyGroupBookingsLed: 1,
  noShowCount: 0,
};

const mockActiveBooking = {
  id: "bk-001",
  bmsCode: "BMS-2025-T4K9P",
  space: { name: "Co-working Space", category: "work" },
  date: "2025-07-17",
  startTime: "10:00",
  endTime: "12:00",
  status: "confirmed",
};

const mockPastBookings = [
  {
    id: "bk-00a",
    bmsCode: "BMS-2025-A1B2C",
    space: { name: "Design Studio" },
    date: "2025-07-14",
    startTime: "13:00",
    endTime: "15:00",
    status: "completed",
  },
  {
    id: "bk-00b",
    bmsCode: "BMS-2025-D3E4F",
    space: { name: "AI & Robotics Lab" },
    date: "2025-07-10",
    startTime: "10:00",
    endTime: "12:00",
    status: "no_show",
  },
  {
    id: "bk-00c",
    bmsCode: "BMS-2025-G5H6I",
    space: { name: "Pitch Garage" },
    date: "2025-07-07",
    startTime: "14:00",
    endTime: "16:00",
    status: "completed",
  },
];

const statusConfig: Record<string, { label: string; variant: "success" | "danger" | "neutral" | "warning" | "info" }> = {
  confirmed:  { label: "Confirmed", variant: "info" },
  checked_in: { label: "Checked In", variant: "success" },
  completed:  { label: "Completed", variant: "success" },
  cancelled:  { label: "Cancelled", variant: "neutral" },
  no_show:    { label: "No Show", variant: "danger" },
  pending:    { label: "Pending Approval", variant: "warning" },
  rejected:   { label: "Rejected", variant: "danger" },
};

export default function DashboardPage() {
  const rules = BOOKING_RULES;
  const weeklyLimit = 3; // regular student
  const remainingBookings = weeklyLimit - mockUser.weeklyBookingsUsed;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar
        user={{
          name: mockUser.name,
          tier: mockUser.tier,
          tierLabel: TIER_LABELS[mockUser.tier],
        }}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ── HEADER ───────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome back, {mockUser.name.split(" ")[0]}
            </h1>
            <p className="text-gray-500 text-sm mt-0.5">
              Your booking dashboard — AI-UNIPOD UNILAG
            </p>
          </div>
          <Link href="/spaces">
            <Button size="md">
              Book a Space <ArrowRight size={16} />
            </Button>
          </Link>
        </div>

        {/* ── TOP STATS ────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* Tier badge */}
          <Card>
            <p className="text-xs text-gray-500 mb-2 font-medium">Your Tier</p>
            <span className={`inline-flex items-center px-3 py-1.5 rounded-xl text-sm font-semibold ${TIER_COLORS[mockUser.tier]}`}>
              {TIER_LABELS[mockUser.tier]}
            </span>
            <p className="text-xs text-gray-400 mt-2">
              Auto-assigned · Students start here
            </p>
          </Card>

          {/* Weekly bookings */}
          <Card>
            <p className="text-xs text-gray-500 mb-2 font-medium">This Week</p>
            <p className="text-2xl font-bold text-gray-900">
              {mockUser.weeklyBookingsUsed}
              <span className="text-base font-normal text-gray-400">/{weeklyLimit}</span>
            </p>
            <p className="text-xs text-gray-400 mt-1">individual bookings used</p>
            {remainingBookings === 0 && (
              <p className="text-xs text-amber-600 font-medium mt-1.5 flex items-center gap-1">
                <AlertCircle size={11} /> Limit reached — pay ₦2,000 or join a group
              </p>
            )}
          </Card>

          {/* No-shows */}
          <Card>
            <p className="text-xs text-gray-500 mb-2 font-medium">No-shows</p>
            <p className="text-2xl font-bold text-gray-900">{mockUser.noShowCount}</p>
            <p className="text-xs text-gray-400 mt-1">
              {mockUser.noShowCount === 0 ? "Perfect record" : "Reviewed manually by admin"}
            </p>
          </Card>

          {/* Verification status */}
          <Card>
            <p className="text-xs text-gray-500 mb-2 font-medium">Account Status</p>
            <div className="flex items-center gap-1.5">
              <CheckCircle size={16} className="text-green-500" />
              <span className="text-sm font-semibold text-green-700">Verified</span>
            </div>
            <p className="text-xs text-gray-400 mt-1">UNILAG ID confirmed</p>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ── LEFT COLUMN ────────────────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-6">
            {/* Active booking */}
            <Card>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                  <Zap size={16} className="text-brand-500" /> Active Booking
                </h2>
                {mockActiveBooking && (
                  <Badge variant="info">{statusConfig[mockActiveBooking.status].label}</Badge>
                )}
              </div>

              {mockActiveBooking ? (
                <div className="bg-brand-50 rounded-2xl p-5 border border-brand-100">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-gray-900 text-lg">
                        {mockActiveBooking.space.name}
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                        <span className="flex items-center gap-1.5">
                          <CalendarDays size={14} />
                          {formatDate(mockActiveBooking.date)}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Clock size={14} />
                          {formatTime(mockActiveBooking.startTime)} – {formatTime(mockActiveBooking.endTime)}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500 mb-1">Booking code</p>
                      <p className="font-mono font-bold text-brand-700 text-sm">
                        {mockActiveBooking.bmsCode}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-brand-200 flex items-center justify-between">
                    <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                      <AlertCircle size={12} />
                      Check in within {rules.noShowGracePeriod} mins of start time
                    </p>
                    <Link href={`/bookings/${mockActiveBooking.id}`}>
                      <Button variant="ghost" size="sm">
                        View QR <ArrowRight size={14} />
                      </Button>
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <Building2 size={36} className="mx-auto mb-3 opacity-40" />
                  <p className="text-sm">No active booking</p>
                  <Link href="/spaces">
                    <Button variant="secondary" size="sm" className="mt-3">
                      Book a Space
                    </Button>
                  </Link>
                </div>
              )}
            </Card>

            {/* Past bookings */}
            <Card>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                  <BookOpen size={16} className="text-gray-400" /> Booking History
                </h2>
                <Link href="/bookings">
                  <Button variant="ghost" size="sm">
                    View all <ArrowRight size={14} />
                  </Button>
                </Link>
              </div>

              <div className="space-y-2">
                {mockPastBookings.map((b) => {
                  const s = statusConfig[b.status];
                  return (
                    <div
                      key={b.id}
                      className="flex items-center justify-between py-3 px-4 rounded-xl hover:bg-gray-50 transition-colors"
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-900">{b.space.name}</p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {formatDate(b.date)} · {formatTime(b.startTime)}–{formatTime(b.endTime)}
                        </p>
                      </div>
                      <Badge variant={s.variant} size="sm">{s.label}</Badge>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>

          {/* ── RIGHT COLUMN ───────────────────────────────────────────── */}
          <div className="space-y-6">
            {/* Quick actions */}
            <Card>
              <h2 className="font-semibold text-gray-900 mb-4">Quick Actions</h2>
              <div className="space-y-2">
                {[
                  { href: "/spaces", label: "Browse All Spaces", icon: Building2 },
                  { href: "/resource-request", label: "Request a Resource", icon: Zap },
                  { href: "/bookings", label: "My Bookings", icon: CalendarDays },
                ].map(({ href, label, icon: Icon }) => (
                  <Link key={href} href={href}>
                    <div className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer border border-transparent hover:border-gray-200">
                      <Icon size={16} className="text-brand-500" />
                      <span className="text-sm font-medium text-gray-700">{label}</span>
                      <ArrowRight size={14} className="ml-auto text-gray-400" />
                    </div>
                  </Link>
                ))}
              </div>
            </Card>

            {/* Booking rules reminder */}
            <Card className="bg-brand-50 border-brand-100">
              <h2 className="font-semibold text-gray-900 mb-3 text-sm">Your Booking Rules</h2>
              <ul className="space-y-2 text-xs text-gray-600">
                <li className="flex items-start gap-2">
                  <CheckCircle size={13} className="text-green-500 mt-0.5 shrink-0" />
                  <span>3 individual bookings/week (resets Monday)</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle size={13} className="text-green-500 mt-0.5 shrink-0" />
                  <span>Max 3 hours per individual booking slot</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle size={13} className="text-green-500 mt-0.5 shrink-0" />
                  <span>Max 2 group bookings per week (as lead or member)</span>
                </li>
                <li className="flex items-start gap-2">
                  <AlertCircle size={13} className="text-amber-500 mt-0.5 shrink-0" />
                  <span>Check in within {rules.noShowGracePeriod} mins or slot is released</span>
                </li>
                <li className="flex items-start gap-2">
                  <AlertCircle size={13} className="text-amber-500 mt-0.5 shrink-0" />
                  <span>4th booking requires {formatCurrency(rules.extraBookingFee)} payment</span>
                </li>
              </ul>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
