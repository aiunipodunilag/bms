"use client";

import { useState } from "react";
import AdminSidebar from "@/components/layout/AdminSidebar";
import { Card } from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { TIER_LABELS, TIER_COLORS } from "@/lib/data/tiers";
import { Search, Filter, UserCheck, UserX, ChevronDown } from "lucide-react";
import type { UserTier } from "@/types";

const mockUsers = [
  { id: "u-001", name: "Tolu Adeyemi", email: "tolu@student.unilag.edu.ng", tier: "regular_student" as UserTier, status: "verified", matric: "210404032", bookings: 12, noShows: 0, joinedAt: "Jan 2025" },
  { id: "u-002", name: "Amaka Obi", email: "amaka@student.unilag.edu.ng", tier: "product_developer" as UserTier, status: "verified", matric: "200301019", bookings: 34, noShows: 1, joinedAt: "Feb 2025" },
  { id: "u-003", name: "Dr. Bola Ogunwale", email: "b.ogunwale@unilag.edu.ng", tier: "lecturer_staff" as UserTier, status: "verified", matric: "", bookings: 8, noShows: 0, joinedAt: "Mar 2025" },
  { id: "u-004", name: "Seun Fadeyi", email: "seun@startup.com", tier: "startup_team" as UserTier, status: "verified", matric: "210202043", bookings: 22, noShows: 2, joinedAt: "Apr 2025" },
  { id: "u-005", name: "Chidi Eze", email: "c.eze@student.unilag.edu.ng", tier: "regular_student" as UserTier, status: "pending", matric: "220305041", bookings: 0, noShows: 0, joinedAt: "Jul 2025" },
  { id: "u-006", name: "Zara Mohammed", email: "zara.m@gmail.com", tier: "external" as UserTier, status: "verified", matric: "", bookings: 5, noShows: 0, joinedAt: "Jun 2025" },
];

export default function AdminUsersPage() {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const filtered = mockUsers.filter((u) => {
    const matchSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || u.status === filterStatus;
    return matchSearch && matchStatus;
  });

  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar />

      <div className="flex-1 overflow-auto">
        <main className="max-w-6xl mx-auto px-6 py-8 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
              <p className="text-sm text-gray-500 mt-0.5">{mockUsers.length} registered users</p>
            </div>
            <Button size="sm">Export CSV</Button>
          </div>

          {/* Filters */}
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search users..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2.5 rounded-xl border border-gray-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="all">All Status</option>
              <option value="verified">Verified</option>
              <option value="pending">Pending</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          {/* Users table */}
          <Card padding="none">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left text-xs font-semibold text-gray-500 px-5 py-3.5">User</th>
                  <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3.5">Tier</th>
                  <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3.5">Status</th>
                  <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3.5">Bookings</th>
                  <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3.5">No-shows</th>
                  <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3.5">Joined</th>
                  <th className="px-4 py-3.5" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center shrink-0">
                          <span className="text-brand-700 text-xs font-bold">
                            {user.name.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{user.name}</p>
                          <p className="text-xs text-gray-400">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${TIER_COLORS[user.tier]}`}>
                        {TIER_LABELS[user.tier]}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <Badge
                        variant={
                          user.status === "verified"
                            ? "success"
                            : user.status === "pending"
                            ? "warning"
                            : "danger"
                        }
                        size="sm"
                      >
                        {user.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-700">{user.bookings}</td>
                    <td className="px-4 py-4">
                      <span className={`text-sm font-medium ${user.noShows > 0 ? "text-red-600" : "text-gray-400"}`}>
                        {user.noShows}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-400">{user.joinedAt}</td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1">
                        {user.status === "pending" && (
                          <>
                            <Button size="sm" className="text-xs px-2.5 py-1">
                              <UserCheck size={12} /> Verify
                            </Button>
                            <Button size="sm" variant="danger" className="text-xs px-2.5 py-1">
                              <UserX size={12} />
                            </Button>
                          </>
                        )}
                        <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
                          <ChevronDown size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </main>
      </div>
    </div>
  );
}
