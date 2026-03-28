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
  QrCode,
  ArrowRight,
  X,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import type { UserTier } from "@/types";

const statusConfig: Record<string, { label: string; variant: "success" | "danger" | "neutral" | "warning" | "info" }> = {
  confirmed:  { label: "Confirmed",        variant: "info" },
  checked_in: { label: "Checked In",       variant: "success" },
  completed:  { label: "Completed",        variant: "success" },
  cancelled:  { label: "Cancelled",        variant: "neutral" },
  no_show:    { label: "No Show",          variant: "danger" },
  pending:    { label: "Pending Approval", variant: "warning" },
  rejected:   { label: "Rejected",        variant: "danger" },
};

interface Booking {
  id: string;
  bms_code: string;
  space_name: string;
  date: string;
  start_time: string;
  end_time: string;
  status: string;
  type: string;
}

interface UserProfile {
  full_name: string;
  tier: UserTier;
}

export default function BookingsPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [qrBooking, setQrBooking] = useState<Booking | null>(null);
  const [error, setError] = useState("");

  const fetchData = useCallback(async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/auth/login"); return; }

    const [profileRes, bookingsRes] = await Promise.all([
      fetch("/api/users/me"),
      fetch("/api/bookings"),
    ]);

    if (profileRes.ok) {
      const d = await profileRes.json();
      setProfile(d.profile);
    }

    if (bookingsRes.ok) {
      const d = await bookingsRes.json();
      setBookings(d.bookings ?? []);
    }
    setLoading(false);
  }, [router]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCancel = async (bookingId: string) => {
    if (!confirm("Are you sure you want to cancel this booking?")) return;
    setCancellingId(bookingId);
    setError("");

    const res = await fetch(`/api/bookings/${bookingId}/cancel`, { method: "POST" });
    const data = await res.json();

    if (!res.ok) {
      setError(data.error ?? "Failed to cancel booking.");
    } else {
      setBookings((prev) =>
        prev.map((b) => (b.id === bookingId ? { ...b, status: "cancelled" } : b))
      );
    }
    setCancellingId(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar user={null} />
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar
        user={
          profile
            ? { name: profile.full_name, tier: profile.tier, tierLabel: TIER_LABELS[profile.tier] }
            : null
        }
      />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Bookings</h1>
            <p className="text-sm text-gray-500 mt-0.5">{bookings.length} bookings total</p>
          </div>
          <Link href="/spaces">
            <Button size="sm">
              Book a Space <ArrowRight size={14} />
            </Button>
          </Link>
        </div>

        {error && (
          <div className="mb-4 flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
            <AlertCircle size={14} /> {error}
          </div>
        )}

        {bookings.length === 0 ? (
          <Card className="text-center py-12">
            <Building2 size={40} className="mx-auto mb-3 text-gray-300" />
            <p className="text-gray-500 font-medium">No bookings yet</p>
            <p className="text-sm text-gray-400 mt-1 mb-4">Browse available spaces to make your first booking.</p>
            <Link href="/spaces">
              <Button size="sm">Browse Spaces</Button>
            </Link>
          </Card>
        ) : (
          <div className="space-y-3">
            {bookings.map((b) => {
              const s = statusConfig[b.status] ?? statusConfig.pending;
              const isCancelling = cancellingId === b.id;
              return (
                <Card key={b.id} className="hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="font-semibold text-gray-900">{b.space_name}</h3>
                        <Badge variant={s.variant} size="sm">{s.label}</Badge>
                        {b.type === "group" && (
                          <Badge variant="neutral" size="sm">Group</Badge>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 mb-2">
                        <span className="flex items-center gap-1.5">
                          <CalendarDays size={13} />
                          {formatDate(b.date)}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Clock size={13} />
                          {formatTime(b.start_time)} – {formatTime(b.end_time)}
                        </span>
                      </div>

                      <p className="text-xs font-mono text-gray-400">{b.bms_code}</p>
                    </div>

                    <div className="flex gap-2 ml-4 shrink-0">
                      {(b.status === "confirmed" || b.status === "pending") && (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => setQrBooking(b)}
                        >
                          <QrCode size={14} /> QR Code
                        </Button>
                      )}
                      {(b.status === "confirmed" || b.status === "pending") && (
                        <Button
                          variant="danger"
                          size="sm"
                          loading={isCancelling}
                          onClick={() => handleCancel(b.id)}
                        >
                          Cancel
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </main>

      {/* QR Code Modal */}
      {qrBooking && (
        <div
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4"
          onClick={() => setQrBooking(null)}
        >
          <div
            className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-bold text-gray-900 text-lg">Booking QR Code</h2>
              <button
                onClick={() => setQrBooking(null)}
                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex justify-center mb-5">
              <div className="bg-white border-2 border-gray-200 rounded-2xl p-4">
                <QRCodeSVG
                  value={qrBooking.bms_code}
                  size={180}
                  level="M"
                  includeMargin={false}
                />
              </div>
            </div>

            <div className="text-center mb-4">
              <p className="text-xs text-gray-500 mb-1">Booking code</p>
              <p className="font-mono font-bold text-brand-700 text-xl tracking-widest">
                {qrBooking.bms_code}
              </p>
            </div>

            <div className="bg-gray-50 rounded-xl px-4 py-3 space-y-1.5 text-sm mb-4">
              <div className="flex justify-between">
                <span className="text-gray-500">Space</span>
                <span className="font-medium">{qrBooking.space_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Date</span>
                <span className="font-medium">{formatDate(qrBooking.date)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Time</span>
                <span className="font-medium">
                  {formatTime(qrBooking.start_time)} – {formatTime(qrBooking.end_time)}
                </span>
              </div>
            </div>

            <p className="text-xs text-center text-gray-400">
              Show this code to the receptionist at check-in.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
