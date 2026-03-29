"use client";

import { useState, useEffect, useCallback } from "react";
import AdminSidebar from "@/components/layout/AdminSidebar";
import { Card } from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { TIER_LABELS, TIER_COLORS } from "@/lib/data/tiers";
import { Search, UserCheck, UserX, ChevronDown } from "lucide-react";
import type { UserTier } from "@/types";

interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  tier: UserTier;
  status: string;
  matric_number: string | null;
  total_bookings: number;
  no_show_count: number;
  created_at: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filterStatus !== "all") params.set("status", filterStatus);
    if (search) params.set("search", search);
    const res = await fetch(`/api/admin/users?${params}`);
    const { users: data } = await res.json();
    setUsers(data ?? []);
    setLoading(false);
  }, [filterStatus, search]);

  useEffect(() => {
    const t = setTimeout(fetchUsers, 300);
    return () => clearTimeout(t);
  }, [fetchUsers]);

  const updateUser = async (id: string, status: string) => {
    setActionLoading(id + status);
    await fetch(`/api/admin/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setActionLoading(null);
    fetchUsers();
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar />

      <div className="flex-1 overflow-auto">
        <main className="max-w-6xl mx-auto px-6 py-8 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
              <p className="text-sm text-gray-500 mt-0.5">{users.length} users loaded</p>
            </div>
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
            {loading ? (
              <div className="text-center py-12 text-gray-400 text-sm">Loading users…</div>
            ) : users.length === 0 ? (
              <div className="text-center py-12 text-gray-400 text-sm">No users found.</div>
            ) : (
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
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center shrink-0">
                            <span className="text-brand-700 text-xs font-bold">
                              {user.full_name?.charAt(0) ?? "?"}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{user.full_name}</p>
                            <p className="text-xs text-gray-400">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${TIER_COLORS[user.tier]}`}>
                          {TIER_LABELS[user.tier] ?? user.tier}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <Badge
                          variant={
                            user.status === "verified" || user.status === "active"
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
                      <td className="px-4 py-4 text-sm text-gray-700">{user.total_bookings ?? 0}</td>
                      <td className="px-4 py-4">
                        <span className={`text-sm font-medium ${(user.no_show_count ?? 0) > 0 ? "text-red-600" : "text-gray-400"}`}>
                          {user.no_show_count ?? 0}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-400">
                        {new Date(user.created_at).toLocaleDateString("en-GB", { month: "short", year: "numeric" })}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-1">
                          {user.status === "pending" && (
                            <>
                              <Button
                                size="sm"
                                className="text-xs px-2.5 py-1"
                                loading={actionLoading === user.id + "verified"}
                                onClick={() => updateUser(user.id, "verified")}
                              >
                                <UserCheck size={12} /> Verify
                              </Button>
                              <Button
                                size="sm"
                                variant="danger"
                                className="text-xs px-2.5 py-1"
                                loading={actionLoading === user.id + "rejected"}
                                onClick={() => updateUser(user.id, "rejected")}
                              >
                                <UserX size={12} />
                              </Button>
                            </>
                          )}
                          {(user.status === "verified" || user.status === "active") && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-xs px-2.5 py-1"
                              loading={actionLoading === user.id + "suspended"}
                              onClick={() => updateUser(user.id, "suspended")}
                            >
                              Suspend
                            </Button>
                          )}
                          {user.status === "suspended" && (
                            <Button
                              size="sm"
                              className="text-xs px-2.5 py-1"
                              loading={actionLoading === user.id + "verified"}
                              onClick={() => updateUser(user.id, "verified")}
                            >
                              Reactivate
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Card>
        </main>
      </div>
    </div>
  );
}
