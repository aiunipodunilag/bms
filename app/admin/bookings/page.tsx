"use client";

import { useState } from "react";
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
  Filter,
} from "lucide-react";

const ALL_BOOKINGS = [
  { id: "bk-101", user: "Amaka Obi", tier: "Product Developer", space: "Maker Space", date: "2025-07-18", startTime: "10:00", endTime: "13:00", type: "individual", status: "pending", justification: "Building a prototype for our hardware startup using 3D printers." },
  { id: "bk-102", user: "Seun Fadeyi", tier: "Startup Team", space: "Board Room (Main)", date: "2025-07-17", startTime: "14:00", endTime: "16:00", type: "group", status: "pending", justification: "Monthly team strategy session for investor deck preparation." },
  { id: "bk-103", user: "Zara Mohammed", tier: "Regular Student", space: "AI & Robotics Lab", date: "2025-07-19", startTime: "13:00", endTime: "16:00", type: "individual", status: "pending", justification: "Final year project — training CNN model on GPU workstation." },
  { id: "bk-104", user: "Tolu Adeyemi", tier: "Regular Student", space: "Co-working Space", date: "2025-07-17", startTime: "10:00", endTime: "12:00", type: "individual", status: "confirmed", justification: "" },
  { id: "bk-105", user: "Kunle Osei", tier: "Product Developer", space: "Design Studio", date: "2025-07-16", startTime: "11:00", endTime: "13:00", type: "individual", status: "confirmed", justification: "" },
  { id: "bk-106", user: "Bimpe Abiodun", tier: "Volunteer", space: "Pitch Garage", date: "2025-07-15", startTime: "14:00", endTime: "16:00", type: "group", status: "completed", justification: "Team pitch practice for upcoming demo day." },
  { id: "bk-107", user: "David Anya", tier: "Regular Student", space: "Collaboration Space", date: "2025-07-14", startTime: "10:00", endTime: "12:00", type: "group", status: "completed", justification: "" },
  { id: "bk-108", user: "Fatima Yusuf", tier: "Startup Team", space: "VR Lab", date: "2025-07-13", startTime: "10:00", endTime: "12:00", type: "individual", status: "rejected", justification: "VR prototype testing for our healthcare simulation project." },
  { id: "bk-109", user: "Chidi Eze", tier: "Regular Student", space: "Co-working Space", date: "2025-07-12", startTime: "13:00", endTime: "15:00", type: "individual", status: "no_show", justification: "" },
];

const STATUS_CONFIG: Record<string, { label: string; variant: "success" | "danger" | "neutral" | "warning" | "info" }> = {
  pending:   { label: "Pending", variant: "warning" },
  confirmed: { label: "Confirmed", variant: "info" },
  completed: { label: "Completed", variant: "success" },
  rejected:  { label: "Rejected", variant: "danger" },
  no_show:   { label: "No Show", variant: "danger" },
  cancelled: { label: "Cancelled", variant: "neutral" },
};

type StatusFilter = "all" | "pending" | "confirmed" | "completed" | "rejected" | "no_show";

export default function AdminBookingsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = ALL_BOOKINGS.filter((b) => {
    const matchSearch =
      b.user.toLowerCase().includes(search.toLowerCase()) ||
      b.space.toLowerCase().includes(search.toLowerCase()) ||
      b.id.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || b.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const pendingCount = ALL_BOOKINGS.filter((b) => b.status === "pending").length;

  return (
    <div className="flex min-h-screen bg-gray-100">
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
                {ALL_BOOKINGS.length} total bookings
              </p>
            </div>
            <Button size="sm" variant="outline">Export CSV</Button>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-48">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by user, space, or booking ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div className="flex gap-1.5">
              {(["all", "pending", "confirmed", "completed", "rejected", "no_show"] as StatusFilter[]).map((s) => (
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
                  const s = STATUS_CONFIG[booking.status];
                  const isExpanded = expandedId === booking.id;
                  return (
                    <>
                      <tr
                        key={booking.id}
                        className={`hover:bg-gray-50 transition-colors ${isExpanded ? "bg-gray-50" : ""}`}
                      >
                        <td className="px-5 py-3.5">
                          <p className="text-sm font-medium text-gray-900">{booking.user}</p>
                          <p className="text-xs text-gray-400">{booking.tier}</p>
                        </td>
                        <td className="px-4 py-3.5">
                          <p className="text-sm text-gray-700 flex items-center gap-1.5">
                            <Building2 size={13} className="text-gray-400" />
                            {booking.space}
                          </p>
                        </td>
                        <td className="px-4 py-3.5">
                          <p className="text-sm text-gray-700 flex items-center gap-1.5">
                            <CalendarDays size={13} className="text-gray-400" />
                            {formatDate(booking.date)}
                          </p>
                          <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                            <Clock size={11} />
                            {formatTime(booking.startTime)} – {formatTime(booking.endTime)}
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
                                <Button size="sm" className="text-xs px-2.5 py-1">
                                  <CheckCircle size={12} /> Approve
                                </Button>
                                <Button size="sm" variant="danger" className="text-xs px-2.5 py-1">
                                  <XCircle size={12} />
                                </Button>
                              </>
                            )}
                            <button
                              onClick={() => setExpandedId(isExpanded ? null : booking.id)}
                              className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                            >
                              <MoreHorizontal size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                      {isExpanded && booking.justification && (
                        <tr key={`${booking.id}-expanded`} className="bg-amber-50">
                          <td colSpan={6} className="px-5 py-3">
                            <p className="text-xs font-semibold text-amber-700 mb-1">Justification</p>
                            <p className="text-sm text-gray-700 italic">
                              &ldquo;{booking.justification}&rdquo;
                            </p>
                            {booking.status === "pending" && (
                              <div className="flex gap-2 mt-3">
                                <Button size="sm">
                                  <CheckCircle size={13} /> Approve Booking
                                </Button>
                                <Button size="sm" variant="danger">
                                  <XCircle size={13} /> Reject with Reason
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

            {filtered.length === 0 && (
              <div className="text-center py-12 text-gray-400">
                <p className="text-sm">No bookings match your filters.</p>
              </div>
            )}
          </Card>
        </main>
      </div>
    </div>
  );
}
