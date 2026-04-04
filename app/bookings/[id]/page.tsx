"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import { Card } from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { TIER_LABELS } from "@/lib/data/tiers";
import { formatDate, formatTime } from "@/lib/utils";
import {
  CalendarDays, Clock, Building2, ChevronLeft,
  ShieldCheck, CheckCircle, XCircle, AlertCircle,
  User, Hash, Loader2,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { UserTier } from "@/types";

interface Booking {
  id: string;
  bms_code: string;
  space_name: string;
  space_id: string;
  date: string;
  start_time: string;
  end_time: string;
  duration: number;
  status: string;
  type: string;
  group_members?: { name: string; matric_number: string }[] | null;
  equipment_requested?: { type: string; label: string }[] | null;
  justification?: string | null;
  admin_note?: string | null;
  payment_required?: boolean;
  payment_amount?: number | null;
  created_at: string;
}

const statusConfig: Record<string, { label: string; variant: "success" | "danger" | "neutral" | "warning" | "info"; icon: typeof CheckCircle }> = {
  confirmed:       { label: "Confirmed",        variant: "info",    icon: ShieldCheck },
  checked_in:      { label: "Checked In",        variant: "success", icon: CheckCircle },
  completed:       { label: "Completed",         variant: "success", icon: CheckCircle },
  cancelled:       { label: "Cancelled",         variant: "neutral", icon: XCircle },
  no_show:         { label: "No Show",           variant: "danger",  icon: XCircle },
  pending:         { label: "Pending Approval",  variant: "warning", icon: AlertCircle },
  rejected:        { label: "Rejected",          variant: "danger",  icon: XCircle },
  payment_pending: { label: "Awaiting Payment",  variant: "warning", icon: AlertCircle },
};

export default function BookingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [tier, setTier] = useState<UserTier>("regular_student");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.push("/auth/login"); return; }

      Promise.all([
        fetch(`/api/bookings/${id}`).then((r) => r.json()),
        fetch("/api/users/me").then((r) => r.json()),
      ]).then(([bookingData, meData]) => {
        if (!bookingData.booking) {
          setError(bookingData.error ?? "Booking not found.");
        } else {
          setBooking(bookingData.booking);
        }
        if (meData.profile?.tier) setTier(meData.profile.tier as UserTier);
        setLoading(false);
      }).catch(() => {
        setError("Failed to load booking.");
        setLoading(false);
      });
    });
  }, [id, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center py-32">
          <Loader2 size={28} className="animate-spin text-violet-600" />
        </div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-2xl mx-auto px-4 py-16 text-center">
          <AlertCircle size={40} className="text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">{error || "Booking not found."}</p>
          <Link href="/bookings" className="mt-4 inline-block">
            <Button variant="outline" size="sm"><ChevronLeft size={14} /> Back to Bookings</Button>
          </Link>
        </div>
      </div>
    );
  }

  const sc = statusConfig[booking.status] ?? { label: booking.status, variant: "neutral" as const, icon: AlertCircle };
  const StatusIcon = sc.icon;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-8 space-y-5">

        {/* Back */}
        <Link href="/bookings" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800">
          <ChevronLeft size={16} /> All Bookings
        </Link>

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{booking.space_name}</h1>
            <p className="text-sm text-gray-500 mt-0.5">{booking.type === "group" ? "Group booking" : "Individual booking"}</p>
          </div>
          <Badge variant={sc.variant}>
            <StatusIcon size={12} className="mr-1" />
            {sc.label}
          </Badge>
        </div>

        {/* BMS Code */}
        <Card>
          <p className="text-xs text-gray-500 font-medium mb-1">Booking Code</p>
          <p className="text-2xl font-mono font-bold tracking-widest text-violet-600">{booking.bms_code}</p>
          <p className="text-xs text-gray-400 mt-1">Show this to the receptionist at check-in.</p>
        </Card>

        {/* Details */}
        <Card>
          <h2 className="font-semibold text-gray-900 mb-4">Booking Details</h2>
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <CalendarDays size={15} className="text-gray-400 shrink-0" />
              <span className="text-gray-600 w-24 shrink-0">Date</span>
              <span className="font-medium text-gray-900">{formatDate(booking.date)}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Clock size={15} className="text-gray-400 shrink-0" />
              <span className="text-gray-600 w-24 shrink-0">Time</span>
              <span className="font-medium text-gray-900">
                {formatTime(booking.start_time)} – {formatTime(booking.end_time)}
                <span className="text-gray-400 ml-2">({booking.duration}h)</span>
              </span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Building2 size={15} className="text-gray-400 shrink-0" />
              <span className="text-gray-600 w-24 shrink-0">Space</span>
              <span className="font-medium text-gray-900">{booking.space_name}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <User size={15} className="text-gray-400 shrink-0" />
              <span className="text-gray-600 w-24 shrink-0">Your tier</span>
              <span className="font-medium text-gray-900">{TIER_LABELS[tier] ?? tier}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Hash size={15} className="text-gray-400 shrink-0" />
              <span className="text-gray-600 w-24 shrink-0">Booking ID</span>
              <span className="font-mono text-xs text-gray-500">{booking.id}</span>
            </div>
          </div>
        </Card>

        {/* Group members */}
        {booking.type === "group" && booking.group_members && booking.group_members.length > 0 && (
          <Card>
            <h2 className="font-semibold text-gray-900 mb-3">Group Members ({booking.group_members.length})</h2>
            <div className="space-y-2">
              {booking.group_members.map((m, i) => (
                <div key={i} className="flex items-center justify-between py-1.5 border-b border-gray-50 last:border-0">
                  <span className="text-sm text-gray-800">{m.name}</span>
                  <span className="text-xs text-gray-400 font-mono">{m.matric_number}</span>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Equipment */}
        {booking.equipment_requested && booking.equipment_requested.length > 0 && (
          <Card>
            <h2 className="font-semibold text-gray-900 mb-3">Requested Equipment</h2>
            <div className="flex flex-wrap gap-2">
              {booking.equipment_requested.map((eq, i) => (
                <Badge key={i} variant="info">{eq.label}</Badge>
              ))}
            </div>
          </Card>
        )}

        {/* Admin note */}
        {booking.admin_note && (
          <Card>
            <h2 className="font-semibold text-gray-900 mb-2">Admin Note</h2>
            <p className="text-sm text-gray-600">{booking.admin_note}</p>
          </Card>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-1">
          <Link href="/bookings">
            <Button variant="outline"><ChevronLeft size={14} /> Back</Button>
          </Link>
          {["confirmed", "pending"].includes(booking.status) && (
            <Link href={`/spaces/${booking.space_id}/book`}>
              <Button variant="outline">Book Again</Button>
            </Link>
          )}
        </div>

      </main>
    </div>
  );
}
