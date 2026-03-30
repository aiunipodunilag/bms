"use client";

import { useState, useEffect, useCallback } from "react";
import Navbar from "@/components/layout/Navbar";
import { Card } from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Link from "next/link";
import { TIER_LABELS } from "@/lib/data/tiers";
import { formatDate, formatTime } from "@/lib/utils";
import {
  CalendarDays,
  Clock,
  Building2,
  Package,
  ArrowRight,
  AlertCircle,
  Loader2,
  X,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import type { UserTier } from "@/types";

const bookingStatusConfig: Record<string, { label: string; variant: "success" | "danger" | "neutral" | "warning" | "info" }> = {
  confirmed:  { label: "Confirmed",        variant: "info" },
  checked_in: { label: "Checked In",       variant: "success" },
  completed:  { label: "Completed",        variant: "success" },
  cancelled:  { label: "Cancelled",        variant: "neutral" },
  no_show:    { label: "No Show",          variant: "danger" },
  pending:    { label: "Pending Approval", variant: "warning" },
  rejected:   { label: "Rejected",        variant: "danger" },
};

const resourceStatusConfig: Record<string, { label: string; variant: "success" | "danger" | "neutral" | "warning" | "info" }> = {
  pending:   { label: "Under Review",  variant: "warning" },
  approved:  { label: "Approved",      variant: "success" },
  rejected:  { label: "Not Approved",  variant: "danger" },
  completed: { label: "Completed",     variant: "success" },
};

interface SpaceBooking {
  kind: "booking";
  id: string;
  bms_code: string;
  space_name: string;
  date: string;
  start_time: string;
  end_time: string;
  status: string;
  type: string;
}

interface ResourceRequest {
  kind: "resource";
  id: string;
  bms_code: string;
  resource_type: string;
  preferred_date: string;
  preferred_time_window: string;
  estimated_duration: string;
  status: string;
  created_at: string;
}

type BookingItem = SpaceBooking | ResourceRequest;

interface UserProfile {
  full_name: string;
  tier: UserTier;
}

export default function BookingsPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [items, setItems] = useState<BookingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [codeModal, setCodeModal] = useState<{ code: string; label: string } | null>(null);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "bookings" | "resources">("all");

  const fetchData = useCallback(async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/auth/login"); return; }

    const [profileRes, bookingsRes, resourcesRes] = await Promise.all([
      fetch("/api/users/me"),
      fetch("/api/bookings"),
      fetch("/api/resource-requests"),
    ]);

    if (profileRes.ok) {
      const d = await profileRes.json();
      setProfile(d.profile);
    }

    const bookings: SpaceBooking[] = [];
    const resources: ResourceRequest[] = [];

    if (bookingsRes.ok) {
      const d = await bookingsRes.json();
      for (const b of d.bookings ?? []) bookings.push({ kind: "booking", ...b });
    }

    if (resourcesRes.ok) {
      const d = await resourcesRes.json();
      for (const r of d.requests ?? []) resources.push({ kind: "resource", ...r });
    }

    // Merge and sort by date descending
    const merged: BookingItem[] = [...bookings, ...resources].sort((a, b) => {
      const da = a.kind === "booking" ? a.date : a.preferred_date;
      const db = b.kind === "booking" ? b.date : b.preferred_date;
      return db.localeCompare(da);
    });
    setItems(merged);
    setLoading(false);
  }, [router]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleCancel = async (bookingId: string) => {
    if (!confirm("Are you sure you want to cancel this booking?")) return;
    setCancellingId(bookingId);
    setError("");
    const res = await fetch(`/api/bookings/${bookingId}/cancel`, { method: "POST" });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Failed to cancel booking.");
    } else {
      setItems((prev) =>
        prev.map((b) => b.id === bookingId && b.kind === "booking" ? { ...b, status: "cancelled" } : b)
      );
    }
    setCancellingId(null);
  };

  const filtered = items.filter((item) => {
    if (activeTab === "bookings") return item.kind === "booking";
    if (activeTab === "resources") return item.kind === "resource";
    return true;
  });

  const bookingCount = items.filter((i) => i.kind === "booking").length;
  const resourceCount = items.filter((i) => i.kind === "resource").length;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F9FB]">
        <Navbar user={null} />
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FB]">
      <Navbar
        user={profile ? { name: profile.full_name, tier: profile.tier, tierLabel: TIER_LABELS[profile.tier] } : null}
      />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Bookings</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {bookingCount} space booking{bookingCount !== 1 ? "s" : ""}
              {resourceCount > 0 ? ` · ${resourceCount} equipment request${resourceCount !== 1 ? "s" : ""}` : ""}
            </p>
          </div>
          <Link href="/spaces">
            <Button size="sm">Book a Space <ArrowRight size={14} /></Button>
          </Link>
        </div>

        {error && (
          <div className="mb-4 flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
            <AlertCircle size={14} /> {error}
          </div>
        )}

        {/* Tabs */}
        {resourceCount > 0 && (
          <div className="flex gap-1 mb-5 bg-white border border-gray-100 rounded-xl p-1 w-fit">
            {(["all", "bookings", "resources"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors capitalize ${
                  activeTab === tab ? "bg-brand-500 text-white" : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab === "all" ? `All (${items.length})` : tab === "bookings" ? `Spaces (${bookingCount})` : `Equipment (${resourceCount})`}
              </button>
            ))}
          </div>
        )}

        {filtered.length === 0 ? (
          <Card className="text-center py-12">
            <Building2 size={40} className="mx-auto mb-3 text-gray-300" />
            <p className="text-gray-500 font-medium">No bookings yet</p>
            <p className="text-sm text-gray-400 mt-1 mb-4">Browse available spaces to make your first booking.</p>
            <Link href="/spaces"><Button size="sm">Browse Spaces</Button></Link>
          </Card>
        ) : (
          <div className="space-y-3">
            {filtered.map((item) => {
              if (item.kind === "booking") {
                const s = bookingStatusConfig[item.status] ?? bookingStatusConfig.pending;
                return (
                  <Card key={item.id} className="hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <h3 className="font-semibold text-gray-900">{item.space_name}</h3>
                          <Badge variant={s.variant} size="sm">{s.label}</Badge>
                          {item.type === "group" && <Badge variant="neutral" size="sm">Group</Badge>}
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 mb-2">
                          <span className="flex items-center gap-1.5"><CalendarDays size={13} />{formatDate(item.date)}</span>
                          <span className="flex items-center gap-1.5"><Clock size={13} />{formatTime(item.start_time)} – {formatTime(item.end_time)}</span>
                        </div>
                        <button
                          onClick={() => setCodeModal({ code: item.bms_code, label: item.space_name })}
                          className="text-xs font-mono text-brand-600 hover:text-brand-800 hover:underline"
                        >
                          {item.bms_code}
                        </button>
                      </div>
                      {(item.status === "confirmed" || item.status === "pending") && (
                        <Button
                          variant="danger"
                          size="sm"
                          loading={cancellingId === item.id}
                          onClick={() => handleCancel(item.id)}
                        >
                          Cancel
                        </Button>
                      )}
                    </div>
                  </Card>
                );
              } else {
                // Resource request
                const s = resourceStatusConfig[item.status] ?? resourceStatusConfig.pending;
                const resourceLabel = item.resource_type.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
                return (
                  <Card key={item.id} className="hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <Package size={14} className="text-brand-400 shrink-0" />
                          <h3 className="font-semibold text-gray-900">{resourceLabel}</h3>
                          <Badge variant={s.variant} size="sm">{s.label}</Badge>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 mb-2">
                          <span className="flex items-center gap-1.5"><CalendarDays size={13} />{formatDate(item.preferred_date)}</span>
                          <span className="flex items-center gap-1.5"><Clock size={13} />{item.preferred_time_window} · {item.estimated_duration}h</span>
                        </div>
                        <button
                          onClick={() => setCodeModal({ code: item.bms_code, label: resourceLabel })}
                          className="text-xs font-mono text-brand-600 hover:text-brand-800 hover:underline"
                        >
                          {item.bms_code}
                        </button>
                      </div>
                    </div>
                  </Card>
                );
              }
            })}
          </div>
        )}
      </main>

      {/* BMS Code Modal */}
      {codeModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4"
          onClick={() => setCodeModal(null)}
        >
          <div
            className="bg-white rounded-3xl p-8 max-w-xs w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-gray-900">Booking Code</h2>
              <button onClick={() => setCodeModal(null)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500">
                <X size={16} />
              </button>
            </div>
            <div className="bg-brand-50 border-2 border-dashed border-brand-200 rounded-2xl p-6 text-center mb-4">
              <p className="text-xs text-brand-500 font-semibold uppercase tracking-widest mb-2">BMS Code</p>
              <p className="font-mono font-black text-3xl text-brand-700 tracking-widest">{codeModal.code}</p>
              <p className="text-xs text-brand-400 mt-2">Show this to the receptionist</p>
            </div>
            <p className="text-xs text-center text-gray-400">{codeModal.label}</p>
          </div>
        </div>
      )}
    </div>
  );
}
