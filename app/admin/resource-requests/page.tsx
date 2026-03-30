"use client";

import { useState, useEffect, useCallback } from "react";
import AdminSidebar from "@/components/layout/AdminSidebar";
import { Card } from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { TIER_LABELS } from "@/lib/data/tiers";
import { formatDate } from "@/lib/utils";
import {
  Search,
  CheckCircle,
  XCircle,
  Clock,
  ChevronDown,
  ChevronUp,
  Loader2,
  Package,
} from "lucide-react";
import type { UserTier } from "@/types";

interface ResourceRequest {
  id: string;
  bms_code: string;
  resource_type: string;
  preferred_date: string;
  preferred_time_window: string;
  estimated_duration: string;
  justification: string;
  status: "pending" | "approved" | "rejected";
  created_at: string;
  user_id: string;
  profiles: {
    full_name: string;
    email: string;
    tier: UserTier;
    matric_number: string | null;
  } | null;
}

const STATUS_CONFIG: Record<string, { label: string; variant: "success" | "danger" | "neutral" | "warning" | "info" }> = {
  pending:  { label: "Pending",  variant: "warning" },
  approved: { label: "Approved", variant: "success" },
  rejected: { label: "Rejected", variant: "danger" },
};

type StatusFilter = "all" | "pending" | "approved" | "rejected";

export default function AdminResourceRequestsPage() {
  const [requests, setRequests] = useState<ResourceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [rejectNotes, setRejectNotes] = useState<Record<string, string>>({});

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (statusFilter !== "all") params.set("status", statusFilter);
    const res = await fetch(`/api/admin/resource-requests?${params}`);
    const { requests: data } = await res.json();
    setRequests(data ?? []);
    setLoading(false);
  }, [statusFilter]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleAction = async (id: string, action: "approve" | "reject") => {
    setActionLoading(id + action);
    const notes = rejectNotes[id] ?? "";
    await fetch(`/api/admin/resource-requests/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, notes: notes || undefined }),
    });
    setActionLoading(null);
    fetchRequests();
  };

  const filtered = requests.filter((r) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      r.profiles?.full_name?.toLowerCase().includes(q) ||
      r.profiles?.email?.toLowerCase().includes(q) ||
      r.resource_type.toLowerCase().includes(q) ||
      r.bms_code.toLowerCase().includes(q)
    );
  });

  return (
    <div className="flex min-h-screen bg-[#F8F9FB]">
      <AdminSidebar />

      <div className="flex-1 overflow-auto">
        <main className="max-w-6xl mx-auto px-6 py-8 space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Resource Requests</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Premium equipment requests from users — review and approve or reject.
            </p>
          </div>

          {/* Filters */}
          <Card>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by user, resource, or BMS code…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                {(["all", "pending", "approved", "rejected"] as StatusFilter[]).map((s) => (
                  <button
                    key={s}
                    onClick={() => setStatusFilter(s)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      statusFilter === s
                        ? "bg-brand-600 text-white"
                        : "bg-[#F8F9FB] text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </Card>

          {/* List */}
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
            </div>
          ) : filtered.length === 0 ? (
            <Card className="text-center py-12">
              <Package size={40} className="mx-auto mb-3 text-gray-300" />
              <p className="text-gray-500 font-medium">No resource requests found</p>
            </Card>
          ) : (
            <div className="space-y-3">
              {filtered.map((r) => {
                const s = STATUS_CONFIG[r.status];
                const isExpanded = expandedId === r.id;
                const isApproving = actionLoading === r.id + "approve";
                const isRejecting = actionLoading === r.id + "reject";

                return (
                  <Card key={r.id} className="hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="font-semibold text-gray-900 capitalize">
                            {r.resource_type.replace(/_/g, " ")}
                          </span>
                          <Badge variant={s.variant} size="sm">{s.label}</Badge>
                        </div>

                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500 mb-1">
                          <span className="font-medium text-gray-700">
                            {r.profiles?.full_name ?? "Unknown User"}
                          </span>
                          <span>{r.profiles?.email ?? ""}</span>
                          {r.profiles?.tier && (
                            <span className="text-xs text-gray-400">
                              {TIER_LABELS[r.profiles.tier as UserTier] ?? r.profiles.tier}
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap gap-x-4 text-xs text-gray-400">
                          <span className="flex items-center gap-1">
                            <Clock size={11} />
                            {formatDate(r.preferred_date)} · {r.preferred_time_window}
                          </span>
                          <span>{r.estimated_duration}</span>
                          <span className="font-mono">{r.bms_code}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {r.status === "pending" && (
                          <>
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => handleAction(r.id, "approve")}
                              loading={isApproving}
                            >
                              <CheckCircle size={13} /> Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="danger"
                              onClick={() => handleAction(r.id, "reject")}
                              loading={isRejecting}
                            >
                              <XCircle size={13} /> Reject
                            </Button>
                          </>
                        )}
                        <button
                          onClick={() => setExpandedId(isExpanded ? null : r.id)}
                          className="p-1.5 text-gray-400 hover:text-gray-700 transition-colors"
                        >
                          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </button>
                      </div>
                    </div>

                    {/* Expanded details */}
                    {isExpanded && (
                      <div className="mt-4 pt-4 border-t border-gray-100 space-y-3">
                        <div>
                          <p className="text-xs font-medium text-gray-500 mb-1">Justification</p>
                          <p className="text-sm text-gray-700 bg-gray-50 rounded-xl p-3">
                            {r.justification}
                          </p>
                        </div>

                        {r.status === "pending" && (
                          <div>
                            <label className="text-xs font-medium text-gray-500 mb-1 block">
                              Rejection reason (optional)
                            </label>
                            <textarea
                              rows={2}
                              placeholder="Add a note for the user explaining why (optional)..."
                              value={rejectNotes[r.id] ?? ""}
                              onChange={(e) =>
                                setRejectNotes((prev) => ({ ...prev, [r.id]: e.target.value }))
                              }
                              className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
                            />
                          </div>
                        )}

                        <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
                          <div>
                            <span className="font-medium">Submitted:</span>{" "}
                            {new Date(r.created_at).toLocaleString("en-NG", {
                              dateStyle: "medium",
                              timeStyle: "short",
                            })}
                          </div>
                          {r.profiles?.matric_number && (
                            <div>
                              <span className="font-medium">Matric:</span> {r.profiles.matric_number}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
