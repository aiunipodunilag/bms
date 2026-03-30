"use client";

import { useState, useEffect, useCallback } from "react";
import AdminSidebar from "@/components/layout/AdminSidebar";
import { Card } from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { TIER_LABELS, TIER_COLORS } from "@/lib/data/tiers";
import { Search, UserCheck, UserX, FileText, X, TrendingUp, CheckCircle, XCircle as XCir } from "lucide-react";
import type { UserTier } from "@/types";

interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  tier: UserTier;
  status: string;
  matric_number: string | null;
  document_url: string | null;
  total_bookings: number;
  no_show_count: number;
  created_at: string;
}

interface TierUpgradeRequest {
  id: string;
  user_id: string;
  current_tier: string;
  requested_tier: string;
  reason: string;
  status: string;
  created_at: string;
  profiles?: { full_name: string; email: string };
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [docPreview, setDocPreview] = useState<{ url: string; name: string } | null>(null);
  const [upgradeRequests, setUpgradeRequests] = useState<TierUpgradeRequest[]>([]);
  const [upgradeTab, setUpgradeTab] = useState(false);

  const fetchUpgradeRequests = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/tier-upgrade-requests");
      if (res.ok) {
        const { requests } = await res.json();
        setUpgradeRequests(requests ?? []);
      }
    } catch { /* table may not exist */ }
  }, []);

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

  useEffect(() => { fetchUpgradeRequests(); }, [fetchUpgradeRequests]);

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

  const handleUpgradeAction = async (id: string, action: "approve" | "reject") => {
    setActionLoading(id + action);
    await fetch(`/api/admin/tier-upgrade/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    setActionLoading(null);
    fetchUpgradeRequests();
  };

  return (
    <>
      {/* Main page content */}
      <div className="flex min-h-screen bg-[#F8F9FB]">
        <AdminSidebar />

        <div className="flex-1 overflow-auto">
          <main className="max-w-6xl mx-auto px-6 py-8 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
                <p className="text-sm text-gray-500 mt-0.5">{users.length} users loaded</p>
              </div>
            </div>

            {/* Tab switcher */}
            <div className="flex gap-1 bg-white border border-gray-100 rounded-xl p-1 w-fit">
              <button
                onClick={() => setUpgradeTab(false)}
                className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-colors ${!upgradeTab ? "bg-brand-500 text-white" : "text-gray-500 hover:text-gray-700"}`}
              >
                All Users ({users.length})
              </button>
              <button
                onClick={() => setUpgradeTab(true)}
                className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${upgradeTab ? "bg-brand-500 text-white" : "text-gray-500 hover:text-gray-700"}`}
              >
                <TrendingUp size={12} />
                Tier Upgrades
                {upgradeRequests.filter((r) => r.status === "pending").length > 0 && (
                  <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                    {upgradeRequests.filter((r) => r.status === "pending").length}
                  </span>
                )}
              </button>
            </div>

            {/* Tier upgrade requests tab */}
            {upgradeTab && (
              <Card padding="none">
                {upgradeRequests.length === 0 ? (
                  <div className="text-center py-12 text-gray-400 text-sm">No tier upgrade requests.</div>
                ) : (
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-100">
                        <th className="text-left text-xs font-semibold text-gray-500 px-5 py-3.5">User</th>
                        <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3.5">From → To</th>
                        <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3.5">Reason</th>
                        <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3.5">Status</th>
                        <th className="px-4 py-3.5" />
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {upgradeRequests.map((req) => (
                        <tr key={req.id} className="hover:bg-gray-50">
                          <td className="px-5 py-4 text-sm font-medium text-gray-900">
                            {req.profiles?.full_name ?? req.user_id.slice(0, 8)}
                            {req.profiles?.email && <p className="text-xs text-gray-400">{req.profiles.email}</p>}
                          </td>
                          <td className="px-4 py-4 text-xs text-gray-600">
                            {TIER_LABELS[req.current_tier as UserTier] ?? req.current_tier}
                            <span className="mx-1 text-gray-400">→</span>
                            <span className="font-semibold">{TIER_LABELS[req.requested_tier as UserTier] ?? req.requested_tier}</span>
                          </td>
                          <td className="px-4 py-4 text-xs text-gray-500 max-w-[200px]">
                            <p className="line-clamp-2">{req.reason}</p>
                          </td>
                          <td className="px-4 py-4">
                            <Badge
                              variant={req.status === "approved" ? "success" : req.status === "rejected" ? "danger" : "warning"}
                              size="sm"
                            >
                              {req.status}
                            </Badge>
                          </td>
                          <td className="px-4 py-4">
                            {req.status === "pending" && (
                              <div className="flex items-center gap-1">
                                <Button size="sm" loading={actionLoading === req.id + "approve"} onClick={() => handleUpgradeAction(req.id, "approve")}>
                                  <CheckCircle size={12} /> Approve
                                </Button>
                                <Button size="sm" variant="danger" loading={actionLoading === req.id + "reject"} onClick={() => handleUpgradeAction(req.id, "reject")}>
                                  <XCir size={12} />
                                </Button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </Card>
            )}

            {/* Filters + users table — shown only when not in upgrade tab */}
            {!upgradeTab && (
              <>
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
                                    {user.document_url && (
                                      <button
                                        onClick={() => setDocPreview({ url: user.document_url!, name: user.full_name })}
                                        className="flex items-center gap-1 text-xs text-violet-600 hover:text-violet-800 px-2 py-1 rounded-lg hover:bg-violet-50 transition-colors border border-violet-200"
                                        title="View identity document"
                                      >
                                        <FileText size={12} /> Doc
                                      </button>
                                    )}
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
              </>
            )}
          </main>
        </div>
      </div>

      {/* Document preview modal */}
      {docPreview && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={() => setDocPreview(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div>
                <p className="font-semibold text-gray-900 text-sm">Identity Document</p>
                <p className="text-xs text-gray-400 mt-0.5">{docPreview.name}</p>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={docPreview.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-violet-600 hover:underline px-3 py-1.5 rounded-lg border border-violet-200 hover:bg-violet-50 transition-colors"
                >
                  Open in new tab
                </a>
                <button
                  onClick={() => setDocPreview(null)}
                  className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-[#F8F9FB] rounded-lg transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-auto p-4 bg-gray-50 flex items-center justify-center min-h-64">
              {docPreview.url.includes(".pdf") || docPreview.url.includes("/raw/") ? (
                <iframe
                  src={docPreview.url}
                  className="w-full h-96 rounded-xl border border-gray-200"
                  title="Identity document"
                />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={docPreview.url}
                  alt="Identity document"
                  className="max-w-full max-h-[70vh] rounded-xl object-contain shadow-sm"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
