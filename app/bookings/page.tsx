import Navbar from "@/components/layout/Navbar";
import { Card } from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Link from "next/link";
import { TIER_LABELS } from "@/lib/data/tiers";
import { formatDate, formatTime } from "@/lib/utils";
import { CalendarDays, Clock, Building2, QrCode, ArrowRight } from "lucide-react";
import type { UserTier } from "@/types";

const currentUserTier: UserTier = "regular_student";

const mockBookings = [
  { id: "bk-001", bmsCode: "BMS-2025-T4K9P", space: "Co-working Space", date: "2025-07-17", startTime: "10:00", endTime: "12:00", status: "confirmed", type: "individual" },
  { id: "bk-00a", bmsCode: "BMS-2025-A1B2C", space: "Design Studio", date: "2025-07-14", startTime: "13:00", endTime: "15:00", status: "completed", type: "individual" },
  { id: "bk-00b", bmsCode: "BMS-2025-D3E4F", space: "AI & Robotics Lab", date: "2025-07-10", startTime: "10:00", endTime: "13:00", status: "no_show", type: "individual" },
  { id: "bk-00c", bmsCode: "BMS-2025-G5H6I", space: "Pitch Garage", date: "2025-07-07", startTime: "14:00", endTime: "16:00", status: "completed", type: "group" },
  { id: "bk-00d", bmsCode: "BMS-2025-J7K8L", space: "Collaboration Space", date: "2025-07-03", startTime: "11:00", endTime: "13:00", status: "cancelled", type: "group" },
];

const statusConfig: Record<string, { label: string; variant: "success" | "danger" | "neutral" | "warning" | "info" }> = {
  confirmed:  { label: "Confirmed", variant: "info" },
  checked_in: { label: "Checked In", variant: "success" },
  completed:  { label: "Completed", variant: "success" },
  cancelled:  { label: "Cancelled", variant: "neutral" },
  no_show:    { label: "No Show", variant: "danger" },
  pending:    { label: "Pending Approval", variant: "warning" },
  rejected:   { label: "Rejected", variant: "danger" },
};

export default function BookingsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar
        user={{
          name: "Tolu Adeyemi",
          tier: currentUserTier,
          tierLabel: TIER_LABELS[currentUserTier],
        }}
      />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Bookings</h1>
            <p className="text-sm text-gray-500 mt-0.5">{mockBookings.length} bookings total</p>
          </div>
          <Link href="/spaces">
            <Button size="sm">
              Book a Space <ArrowRight size={14} />
            </Button>
          </Link>
        </div>

        <div className="space-y-3">
          {mockBookings.map((b) => {
            const s = statusConfig[b.status];
            return (
              <Card key={b.id} className="hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900">{b.space}</h3>
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
                        {formatTime(b.startTime)} – {formatTime(b.endTime)}
                      </span>
                    </div>

                    <p className="text-xs font-mono text-gray-400">{b.bmsCode}</p>
                  </div>

                  <div className="flex gap-2 ml-4">
                    {b.status === "confirmed" && (
                      <Button variant="secondary" size="sm">
                        <QrCode size={14} /> QR Code
                      </Button>
                    )}
                    {(b.status === "confirmed" || b.status === "pending") && (
                      <Button variant="danger" size="sm">Cancel</Button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </main>
    </div>
  );
}
