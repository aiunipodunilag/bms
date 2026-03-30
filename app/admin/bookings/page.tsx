"use client";

import { useState, useEffect, useCallback } from "react";
import AdminSidebar from "@/components/layout/AdminSidebar";
import { Card } from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { formatDate, formatTime } from "@/lib/utils";
import {
  Search,
  CalendarDays,
  Clock,
  Building2,
  CheckCircle,
  XCircle,
  MoreHorizontal,
} from "lucide-react";

interface Booking {
  id: string;
  bms_code: string;
  space_name: string;
  date: string;
  start_time: string;
  end_time: string;
  type: string;
  status: string;
  justification: string | null;
  profiles: { full_name: string; email: string; tier: string } | null;
}

const STATUS_CONFIG: Record<string, { label: string; variant: "success" | "danger" | "neutral" | "warning" | "info" }> = {
  pending:    { label: "Pending",   variant: "warning" },
  confirmed:  { label: "Confirmed", variant: "info" },
  checked_in: { label: "Checked In", variant: "success" },
  completed:  { label: "Completed", variant: "success" },
  rejected:   { label: "Rejected",  variant: "danger" },
  no_show:    { label: "No Show",   variant: "danger" },
  cancelled:  { label: "Cancelled", variant: "neutral" },
};

type StatusFilter = "all" | "pending" | "confirmed" | "checked_in" | "completed" | "rejected" | "no_show";

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (statusFilter !== "all") params.set("status", statusFilter);
    const res = await fetch(`/api/admin/bookings?${params}`);
    const { bookings: data } = await res.json();
    setBookings(data ?? []);
    setLoading(false);
  }, [statusFilter]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const handleAction = async (id: string, action: "approve" | "reject") => {
    setActionLoading(id + action);
    await fetch(`/api/admin/bookings/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    setActionLoading(null);
    fetchBookings();
  };

  const filtered = bookings.filter((b) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      b.profiles?.full_name?.toLowerCase().includes(q) ||
      b.space_name?.toLowerCase().includes(q) ||
      b.bms_code?.toLowerCase().includes(q)
    );
  });

  const pendingCount = bookings.filter((b) => b.status === "pending").length;

  return (
    <div className="flex min-h-screen bg-[#F8F9FB]">
      <AdminSidebar />

      <div className="flex-1 overflow-auto">
        <main className="max-w-6xl mx-auto px-6 py-8 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Bookings & Approvals</h1>
              <p className="text-sm text-gray-500 mt-0.5">
                {pendingCount > 0 && (
                  <span className="text-amber-600 font-medium">{pendingCount} pending approval · </span>
                )}
                {bookings.length} bookings loaded
              </p>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-48">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by user, space, or BMS code..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div className="flex gap-1.5 flex-wrap">
              {(["all", "pending", "confirmed", "checked_in", "completed", "rejected", "no_show"] as StatusFilter[]).map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-3 py-2 rounded-lg text-xs font-medium capitalize transition-colors ${
                    statusFilter === s
                      ? "bg-brand-600 text-white"
                      : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {s.replace("_", " ")}
                  {s === "pending" && pendingCount > 0 && (
                    <span className="ml-1.5 bg-amber-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                      {pendingCount}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Bookings list */}
          <Card padding="none">
            {loading ? (
              <div className="text-center py-12 text-gray-400 text-sm">Loading bookings…</div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-12 text-gray-400 text-sm">No bookings match your filters.</div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left text-xs font-semibold text-gray-500 px-5 py-3.5">User</th>
                    <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3.5">Space</th>
                    <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3.5">Date & Time</th>
                    <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3.5">Type</th>
                    <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3.5">Status</th>
                    <th className="px-4 py-3.5" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map((booking) => {
                    const s = STATUS_CONFIG[booking.status] ?? { label: booking.status, variant: "neutral" as const };
                    const isExpanded = expandedId === booking.id;
                    return (
                      <>
                        <tr
                          key={booking.id}
                          className={`hover:bg-gray-50 transition-colors ${isExpanded ? "bg-gray-50" : ""}`}
                        >
                          <td className="px-5 py-3.5">
                            <p className="text-sm font-medium text-gray-900">{booking.profiles?.full_name ?? "—"}</p>
                            <p className="text-xs text-gray-400">{booking.profiles?.email ?? ""}</p>
                          </td>
                          <td className="px-4 py-3.5">
                            <p className="text-sm text-gray-700 flex items-center gap-1.5">
                              <Building2 size={13} className="text-gray-400" />
                              {booking.space_name}
                            </p>
                          </td>
                          <td className="px-4 py-3.5">
                            <p className="text-sm text-gray-700 flex items-center gap-1.5">
                              <CalendarDays size={13} className="text-gray-400" />
                              {formatDate(booking.date)}
                            </p>
                            <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                              <Clock size={11} />
                              {formatTime(booking.start_time)} – {formatTime(booking.end_time)}
                            </p>
                          </td>
                          <td className="px-4 py-3.5">
                            <Badge variant="neutral" size="sm" className="capitalize">
                              {booking.type}
                            </Badge>
                          </td>
                          <td className="px-4 py-3.5">
                            <Badge variant={s.variant} size="sm">{s.label}</Badge>
                          </td>
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-1.5">
                              {booking.status === "pending" && (
                                <>
                                  <Button
                                    size="sm"
                                    className="text-xs px-2.5 py-1"
                                    loading={actionLoading === booking.id + "approve"}
                                    onClick={() => handleAction(booking.id, "approve")}
                                  >
                                    <CheckCircle size={12} /> Approve
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="danger"
                                    className="text-xs px-2.5 py-1"
                                    loading={actionLoading === booking.id + "reject"}
                                    onClick={() => handleAction(booking.id, "reject")}
                                  >
                                    <XCircle size={12} />
                                  </Button>
                                </>
                              )}
                              {booking.justification && (
                                <button
                                  onClick={() => setExpandedId(isExpanded ? null : booking.id)}
                                  className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-[#F8F9FB] rounded-lg"
                                >
                                  <MoreHorizontal size={15} />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                        {isExpanded && booking.justification && (
                          <tr key={`${booking.id}-exp`} className="bg-amber-50">
                            <td colSpan={6} className="px-5 py-3">
                              <p className="text-xs font-semibold text-amber-700 mb-1">Justification</p>
                              <p className="text-sm text-gray-700 italic">&ldquo;{booking.justification}&rdquo;</p>
                              {booking.status === "pending" && (
                                <div className="flex gap-2 mt-3">
                                  <Button
                                    size="sm"
                                    loading={actionLoading === booking.id + "approve"}
                                    onClick={() => handleAction(booking.id, "approve")}
                                  >
                                    <CheckCircle size={13} /> Approve Booking
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="danger"
                                    loading={actionLoading === booking.id + "reject"}
                                    onClick={() => handleAction(booking.id, "reject")}
                                  >
                                    <XCircle size={13} /> Reject
                                  </Button>
                                </div>
                              )}
                            </td>
                          </tr>
                        )}
                      </>
                    );
                  })}
                </tbody>
              </table>
            )}
          </Card>
        </main>
      </div>
    </div>
  );
}
