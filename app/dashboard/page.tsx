import { redirect } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import { Card } from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { TIER_LABELS, TIER_COLORS, BOOKING_RULES, TIER_RULES } from "@/lib/data/tiers";
import { formatDate, formatTime, formatCurrency } from "@/lib/utils";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  CalendarDays,
  Clock,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Zap,
  BookOpen,
  Building2,
  XCircle,
} from "lucide-react";
import type { UserTier } from "@/types";

const statusConfig: Record<string, { label: string; variant: "success" | "danger" | "neutral" | "warning" | "info" }> = {
  confirmed:  { label: "Confirmed",       variant: "info" },
  checked_in: { label: "Checked In",      variant: "success" },
  completed:  { label: "Completed",       variant: "success" },
  cancelled:  { label: "Cancelled",       variant: "neutral" },
  no_show:    { label: "No Show",         variant: "danger" },
  pending:    { label: "Pending Approval",variant: "warning" },
  rejected:   { label: "Rejected",        variant: "danger" },
};

export default async function DashboardPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  // Use service-role client to bypass RLS for all DB queries
  const adminDb = createAdminClient();

  // Fetch profile
  const { data: profile } = await adminDb
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  // No profile row — user created an auth account but signup didn't finish.
  if (!profile) redirect("/auth/signout");

  const tier = profile.tier as UserTier;
  const tierRules = TIER_RULES[tier];

  // Check if weekly counters need reset (Monday midnight)
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - ((weekStart.getDay() + 6) % 7)); // Monday
  weekStart.setHours(0, 0, 0, 0);
  const weekStartStr = weekStart.toISOString();

  const today = new Date().toISOString().split("T")[0];

  // Fetch active booking (confirmed or pending, today or future)
  const { data: activeBookings } = await adminDb
    .from("bookings")
    .select("*")
    .eq("user_id", user.id)
    .in("status", ["pending", "confirmed", "checked_in"])
    .gte("date", today)
    .order("date", { ascending: true })
    .order("start_time", { ascending: true })
    .limit(1);

  const activeBooking = activeBookings?.[0] ?? null;

  // Fetch recent past bookings
  const { data: pastBookings } = await adminDb
    .from("bookings")
    .select("*")
    .eq("user_id", user.id)
    .not("status", "in", '("pending","confirmed","checked_in")')
    .order("date", { ascending: false })
    .order("start_time", { ascending: false })
    .limit(3);

  const weeklyLimit =
    tierRules.weeklyIndividualLimit === "unlimited"
      ? null
      : (tierRules.weeklyIndividualLimit as number);
  const remainingBookings = weeklyLimit !== null ? weeklyLimit - profile.weekly_bookings_used : null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar
        user={{
          name: profile.full_name,
          tier,
          tierLabel: TIER_LABELS[tier],
        }}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {profile.status === "rejected" && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-2xl px-5 py-4 flex items-start gap-3">
            <XCircle size={18} className="text-red-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-red-800 text-sm">Account verification rejected</p>
              <p className="text-red-700 text-sm mt-0.5">
                Your account verification was not approved. Please contact the admin at AI-UNIPOD for assistance.
              </p>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome back, {profile.full_name.split(" ")[0]}
            </h1>
            <p className="text-gray-500 text-sm mt-0.5">Your booking dashboard — AI-UNIPOD UNILAG</p>
          </div>
          {profile.status !== "rejected" && (
            <Link href="/spaces">
              <Button size="md">
                Book a Space <ArrowRight size={16} />
              </Button>
            </Link>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <p className="text-xs text-gray-500 mb-2 font-medium">Your Tier</p>
            <span className={`inline-flex items-center px-3 py-1.5 rounded-xl text-sm font-semibold ${TIER_COLORS[tier]}`}>
              {TIER_LABELS[tier]}
            </span>
            <p className="text-xs text-gray-400 mt-2">
              {profile.class === "internal" ? "UNILAG member" : "External user"}
            </p>
          </Card>

          <Card>
            <p className="text-xs text-gray-500 mb-2 font-medium">This Week</p>
            <p className="text-2xl font-bold text-gray-900">
              {profile.weekly_bookings_used}
              {weeklyLimit !== null && (
                <span className="text-base font-normal text-gray-400">/{weeklyLimit}</span>
              )}
            </p>
            <p className="text-xs text-gray-400 mt-1">individual bookings used</p>
            {remainingBookings === 0 && (
              <p className="text-xs text-amber-600 font-medium mt-1.5 flex items-center gap-1">
                <AlertCircle size={11} /> Limit reached — pay ₦2,000 or join a group
              </p>
            )}
          </Card>

          <Card>
            <p className="text-xs text-gray-500 mb-2 font-medium">No-shows</p>
            <p className="text-2xl font-bold text-gray-900">{profile.no_show_count}</p>
            <p className="text-xs text-gray-400 mt-1">
              {profile.no_show_count === 0 ? "Perfect record" : "Reviewed manually by admin"}
            </p>
          </Card>

          <Link href="/dashboard/profile">
            <Card className="hover:border-brand-200 hover:shadow-md transition-all cursor-pointer group">
              <p className="text-xs text-gray-500 mb-2 font-medium">Account Status</p>
              <div className="flex items-center gap-1.5">
                {profile.status === "verified" || profile.status === "active" ? (
                  <>
                    <CheckCircle size={16} className="text-green-500" />
                    <span className="text-sm font-semibold text-green-700">Verified</span>
                  </>
                ) : profile.status === "pending" ? (
                  <>
                    <AlertCircle size={16} className="text-amber-500" />
                    <span className="text-sm font-semibold text-amber-700">Pending</span>
                  </>
                ) : (
                  <>
                    <XCircle size={16} className="text-red-500" />
                    <span className="text-sm font-semibold text-red-700">Rejected</span>
                  </>
                )}
              </div>
              <p className="text-xs text-brand-500 mt-1 group-hover:underline font-medium">
                View My Profile →
              </p>
            </Card>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Active booking */}
            <Card>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                  <Zap size={16} className="text-brand-500" /> Active Booking
                </h2>
                {activeBooking && (
                  <Badge variant={statusConfig[activeBooking.status].variant}>
                    {statusConfig[activeBooking.status].label}
                  </Badge>
                )}
              </div>

              {activeBooking ? (
                <div className="bg-brand-50 rounded-2xl p-5 border border-brand-100">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-gray-900 text-lg">{activeBooking.space_name}</p>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                        <span className="flex items-center gap-1.5">
                          <CalendarDays size={14} />
                          {formatDate(activeBooking.date)}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Clock size={14} />
                          {formatTime(activeBooking.start_time)} – {formatTime(activeBooking.end_time)}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500 mb-1">Booking code</p>
                      <p className="font-mono font-bold text-brand-700 text-sm">
                        {activeBooking.bms_code}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-brand-200 flex items-center justify-between">
                    <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                      <AlertCircle size={12} />
                      Check in within {BOOKING_RULES.noShowGracePeriod} mins of start time
                    </p>
                    <Link href="/bookings">
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
                  {profile.status !== "rejected" && (
                    <Link href="/spaces">
                      <Button variant="secondary" size="sm" className="mt-3">
                        Book a Space
                      </Button>
                    </Link>
                  )}
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

              {(pastBookings ?? []).length > 0 ? (
                <div className="space-y-2">
                  {(pastBookings ?? []).map((b) => {
                    const s = statusConfig[b.status] ?? statusConfig.pending;
                    return (
                      <div
                        key={b.id}
                        className="flex items-center justify-between py-3 px-4 rounded-xl hover:bg-gray-50 transition-colors"
                      >
                        <div>
                          <p className="text-sm font-medium text-gray-900">{b.space_name}</p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {formatDate(b.date)} · {formatTime(b.start_time)}–{formatTime(b.end_time)}
                          </p>
                        </div>
                        <Badge variant={s.variant} size="sm">{s.label}</Badge>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-gray-400 text-center py-6">No past bookings yet.</p>
              )}
            </Card>
          </div>

          {/* Right column */}
          <div className="space-y-6">
            <Card>
              <h2 className="font-semibold text-gray-900 mb-4">Quick Actions</h2>
              <div className="space-y-2">
                {[
                  { href: "/spaces",           label: "Browse All Spaces",    icon: Building2 },
                  { href: "/resource-request", label: "Request a Resource",   icon: Zap },
                  { href: "/bookings",          label: "My Bookings",          icon: CalendarDays },
                  { href: "/dashboard/profile", label: "My Profile & Settings",icon: CheckCircle },
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

            <Card className="bg-brand-50 border-brand-100">
              <h2 className="font-semibold text-gray-900 mb-3 text-sm">Your Booking Rules</h2>
              <ul className="space-y-2 text-xs text-gray-600">
                <li className="flex items-start gap-2">
                  <CheckCircle size={13} className="text-green-500 mt-0.5 shrink-0" />
                  <span>
                    {weeklyLimit !== null
                      ? `${weeklyLimit} individual bookings/week (resets Monday)`
                      : "Unlimited individual bookings/week"}
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle size={13} className="text-green-500 mt-0.5 shrink-0" />
                  <span>
                    {tierRules.maxSlotHours === "flexible"
                      ? "Flexible booking duration"
                      : `Max ${tierRules.maxSlotHours} hours per slot`}
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <AlertCircle size={13} className="text-amber-500 mt-0.5 shrink-0" />
                  <span>Check in within {BOOKING_RULES.noShowGracePeriod} mins or slot is released</span>
                </li>
                {tier === "regular_student" && (
                  <li className="flex items-start gap-2">
                    <AlertCircle size={13} className="text-amber-500 mt-0.5 shrink-0" />
                    <span>4th booking requires {formatCurrency(BOOKING_RULES.extraBookingFee)} payment</span>
                  </li>
                )}
              </ul>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
