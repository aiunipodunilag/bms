"use client";

import { useState, useEffect, useCallback } from "react";
import AdminSidebar from "@/components/layout/AdminSidebar";
import { Card } from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { formatDate, formatTime, formatCurrency } from "@/lib/utils";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import {
  Users, CalendarDays, TrendingUp, AlertCircle, CheckCircle,
  Clock, Building2, ArrowUpRight, MoreHorizontal, Loader2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface Stats {
  totalUsers: number;
  pendingVerifications: number;
  activeBookingsToday: number;
  totalBookingsThisWeek: number;
  noShowsThisWeek: number;
  pendingApprovals: number;
  revenueThisMonth: number;
}

interface PendingBooking {
  id: string;
  bms_code: string;
  space_name: string;
  date: string;
  start_time: string;
  duration: number;
  justification?: string;
  created_at: string;
  profiles?: { full_name: string; tier: string };
}

interface PendingUser {
  id: string;
  full_name: string;
  email: string;
  tier: string;
  matric_number?: string;
  staff_number?: string;
  document_url?: string;
  created_at: string;
}

// Fixed chart data — real analytics would need a separate endpoint with daily aggregation
const weeklyPlaceholder = [
  { day: "Mon", bookings: 0, noShows: 0 },
  { day: "Tue", bookings: 0, noShows: 0 },
  { day: "Wed", bookings: 0, noShows: 0 },
  { day: "Thu", bookings: 0, noShows: 0 },
  { day: "Fri", bookings: 0, noShows: 0 },
];

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [pendingApprovals, setPendingApprovals] = useState<PendingBooking[]>([]);
  const [pendingVerifications, setPendingVerifications] = useState<PendingUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/admin/login"); return; }

    const [statsRes, bookingsRes, usersRes] = await Promise.all([
      fetch("/api/admin/stats"),
      fetch("/api/admin/bookings?status=pending"),
      fetch("/api/admin/users?status=pending"),
    ]);

    if (!statsRes.ok) { router.push("/admin/login"); return; }

    const [statsData, bookingsData, usersData] = await Promise.all([
      statsRes.json(),
      bookingsRes.json(),
      usersRes.json(),
    ]);

    setStats(statsData.stats);
    setPendingApprovals(bookingsData.bookings ?? []);
    setPendingVerifications(usersData.users ?? []);
    setLoading(false);
  }, [router]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleBookingAction = async (bookingId: string, action: "approve" | "reject") => {
    setActionLoading(`${action}-${bookingId}`);
    const res = await fetch(`/api/admin/bookings/${bookingId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    if (res.ok) {
      setPendingApprovals((prev) => prev.filter((b) => b.id !== bookingId));
      setStats((prev) => prev ? { ...prev, pendingApprovals: prev.pendingApprovals - 1 } : prev);
    }
    setActionLoading(null);
  };

  const handleUserAction = async (userId: string, action: "verified" | "rejected") => {
    setActionLoading(`${action}-${userId}`);
    const res = await fetch(`/api/admin/users/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: action }),
    });
    if (res.ok) {
      setPendingVerifications((prev) => prev.filter((u) => u.id !== userId));
      setStats((prev) =>
        prev ? { ...prev, pendingVerifications: prev.pendingVerifications - 1 } : prev
      );
    }
    setActionLoading(null);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-100">
        <AdminSidebar />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
        </div>
      </div>
    );
  }

  const statCards = [
    {
      label: "Total Users",
      value: String(stats?.totalUsers ?? 0),
      change: `${stats?.pendingVerifications ?? 0} pending verification`,
      icon: Users,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "Pending Approvals",
      value: String(stats?.pendingApprovals ?? 0),
      change: "Awaiting review",
      icon: AlertCircle,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
    {
      label: "Bookings Today",
      value: String(stats?.activeBookingsToday ?? 0),
      change: `${stats?.totalBookingsThisWeek ?? 0} this week`,
      icon: CalendarDays,
      color: "text-brand-600",
      bg: "bg-brand-50",
    },
    {
      label: "Revenue This Month",
      value: formatCurrency(stats?.revenueThisMonth ?? 0),
      change: `${stats?.noShowsThisWeek ?? 0} no-shows this week`,
      icon: TrendingUp,
      color: "text-green-600",
      bg: "bg-green-50",
    },
  ];

  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar />

      <div className="flex-1 overflow-auto">
        <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Overview</h1>
              <p className="text-sm text-gray-500 mt-0.5">
                {new Date().toLocaleDateString("en-NG", {
                  weekday: "long", year: "numeric", month: "long", day: "numeric",
                })}
              </p>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
            {statCards.map(({ label, value, change, icon: Icon, color, bg }) => (
              <Card key={label}>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-1">{label}</p>
                    <p className="text-2xl font-bold text-gray-900">{value}</p>
                    <p className="text-xs text-gray-400 mt-1">{change}</p>
                  </div>
                  <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center`}>
                    <Icon size={17} className={color} />
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Chart placeholder row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card padding="lg">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-semibold text-gray-900">Weekly Bookings</h2>
                <Badge variant="neutral" size="sm">This Week</Badge>
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={weeklyPlaceholder} barSize={24}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="day" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid #e5e7eb", fontSize: 12 }} />
                  <Bar dataKey="bookings" fill="#4f5fff" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="noShows" fill="#fca5a5" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
              <p className="text-xs text-center text-gray-400 mt-2">
                Real-time chart data requires a daily aggregation endpoint.
              </p>
            </Card>

            {/* Quick stats */}
            <Card padding="lg">
              <h2 className="font-semibold text-gray-900 mb-4">This Week at a Glance</h2>
              <div className="space-y-4">
                {[
                  { label: "Total Bookings", value: stats?.totalBookingsThisWeek ?? 0, icon: CalendarDays, color: "text-brand-500" },
                  { label: "No-shows", value: stats?.noShowsThisWeek ?? 0, icon: AlertCircle, color: "text-red-500" },
                  { label: "Pending Approvals", value: stats?.pendingApprovals ?? 0, icon: Clock, color: "text-amber-500" },
                  { label: "New Users", value: stats?.totalUsers ?? 0, icon: Users, color: "text-blue-500" },
                ].map(({ label, value, icon: Icon, color }) => (
                  <div key={label} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                    <div className="flex items-center gap-2">
                      <Icon size={15} className={color} />
                      <span className="text-sm text-gray-600">{label}</span>
                    </div>
                    <span className="text-sm font-bold text-gray-900">{value}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Approval Queue + Verifications */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Pending Approvals */}
            <Card>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                  <Clock size={16} className="text-amber-500" />
                  Pending Approvals
                  {pendingApprovals.length > 0 && (
                    <Badge variant="warning">{pendingApprovals.length}</Badge>
                  )}
                </h2>
                <a href="/admin/bookings">
                  <Button variant="ghost" size="sm">View all</Button>
                </a>
              </div>

              {pendingApprovals.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <CheckCircle size={32} className="mx-auto mb-2 text-green-300" />
                  <p className="text-sm">All caught up — no pending approvals</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingApprovals.slice(0, 3).map((item) => (
                    <div
                      key={item.id}
                      className="border border-gray-200 rounded-xl p-4 hover:border-brand-300 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-medium text-sm text-gray-900">
                            {item.profiles?.full_name ?? "Unknown"}
                          </p>
                          <p className="text-xs text-gray-400">
                            {item.profiles?.tier?.replace(/_/g, " ") ?? "-"}
                          </p>
                        </div>
                        <Badge variant="warning" size="sm">Pending</Badge>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-600 mb-2">
                        <span className="flex items-center gap-1">
                          <Building2 size={11} /> {item.space_name}
                        </span>
                        <span className="flex items-center gap-1">
                          <CalendarDays size={11} /> {formatDate(item.date)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock size={11} /> {formatTime(item.start_time)}, {item.duration}h
                        </span>
                      </div>
                      {item.justification && (
                        <p className="text-xs text-gray-500 line-clamp-2 mb-3 italic">
                          &ldquo;{item.justification}&rdquo;
                        </p>
                      )}
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          className="flex-1"
                          loading={actionLoading === `approve-${item.id}`}
                          onClick={() => handleBookingAction(item.id, "approve")}
                        >
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          className="flex-1"
                          loading={actionLoading === `reject-${item.id}`}
                          onClick={() => handleBookingAction(item.id, "reject")}
                        >
                          Reject
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Pending Verifications */}
            <Card>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                  <Users size={16} className="text-blue-500" />
                  Pending Verifications
                  {pendingVerifications.length > 0 && (
                    <Badge variant="info">{pendingVerifications.length}</Badge>
                  )}
                </h2>
                <a href="/admin/users">
                  <Button variant="ghost" size="sm">View all</Button>
                </a>
              </div>

              {pendingVerifications.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <CheckCircle size={32} className="mx-auto mb-2 text-green-300" />
                  <p className="text-sm">No pending account verifications</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingVerifications.slice(0, 3).map((user) => (
                    <div
                      key={user.id}
                      className="border border-gray-200 rounded-xl p-4 hover:border-brand-300 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-1">
                        <div>
                          <p className="font-medium text-sm text-gray-900">{user.full_name}</p>
                          <p className="text-xs text-gray-400">{user.email}</p>
                        </div>
                        <Badge variant="neutral" size="sm">
                          {user.tier?.replace(/_/g, " ")}
                        </Badge>
                      </div>
                      <div className="text-xs text-gray-500 mb-3">
                        {user.matric_number
                          ? `Matric: ${user.matric_number}`
                          : user.staff_number
                          ? `Staff: ${user.staff_number}`
                          : "No ID number"}{" "}
                        · {new Date(user.created_at).toLocaleDateString("en-NG")}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          className="flex-1"
                          loading={actionLoading === `verified-${user.id}`}
                          onClick={() => handleUserAction(user.id, "verified")}
                        >
                          <CheckCircle size={13} /> Verify
                        </Button>
                        {user.document_url && (
                          <a href={user.document_url} target="_blank" rel="noopener noreferrer" className="flex-1">
                            <Button size="sm" variant="outline" className="w-full">
                              View Doc
                            </Button>
                          </a>
                        )}
                        <Button
                          size="sm"
                          variant="danger"
                          className="flex-1"
                          loading={actionLoading === `rejected-${user.id}`}
                          onClick={() => handleUserAction(user.id, "rejected")}
                        >
                          Reject
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
