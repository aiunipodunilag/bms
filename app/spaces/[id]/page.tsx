import Link from "next/link";
import { notFound } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import { Card } from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { getSpaceBySlug } from "@/lib/data/spaces";
import { TIER_LABELS } from "@/lib/data/tiers";
import { Users, Clock, CheckCircle, Info, ArrowRight, ChevronLeft } from "lucide-react";
import type { UserTier } from "@/types";

// Mock current user tier
const currentUserTier: UserTier = "regular_student";

export default function SpaceDetailPage({ params }: { params: { id: string } }) {
  const space = getSpaceBySlug(params.id);
  if (!space) notFound();

  const canBook =
    space.whoCanBook.includes(currentUserTier) ||
    (currentUserTier === "external" && space.externalAllowed);

  const approvalNote =
    space.approvalType === "auto"
      ? "Booking is confirmed automatically."
      : space.approvalType === "manual"
      ? "Booking requires admin approval. You'll be notified by email."
      : "This space is admin-scheduled only.";

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar
        user={{
          name: "Tolu Adeyemi",
          tier: currentUserTier,
          tierLabel: TIER_LABELS[currentUserTier],
        }}
      />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back */}
        <Link
          href="/spaces"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-6 transition-colors"
        >
          <ChevronLeft size={15} /> All Spaces
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ── MAIN INFO ──────────────────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-5">
            {/* Hero card */}
            <Card padding="none" className="overflow-hidden">
              {/* Placeholder image */}
              <div className="w-full h-48 bg-gradient-to-br from-brand-100 to-brand-200 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-brand-400 text-sm font-medium">📷 Space Photo</p>
                  <p className="text-brand-300 text-xs mt-1">Uploaded via Admin Dashboard</p>
                </div>
              </div>

              <div className="p-6">
                <div className="flex flex-wrap items-start gap-2 mb-3">
                  <Badge variant="default" className="capitalize">{space.category}</Badge>
                  {space.externalAllowed && (
                    <Badge variant="success">External-friendly</Badge>
                  )}
                  <Badge
                    variant={
                      space.availability === "available"
                        ? "success"
                        : space.availability === "full"
                        ? "danger"
                        : "warning"
                    }
                  >
                    {space.availability === "available"
                      ? "Available"
                      : space.availability === "full"
                      ? "Currently Full"
                      : "Admin Scheduled"}
                  </Badge>
                </div>

                <h1 className="text-2xl font-bold text-gray-900 mb-2">{space.name}</h1>
                <p className="text-gray-600 leading-relaxed">{space.description}</p>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-5 pt-5 border-t border-gray-100">
                  <div>
                    <p className="text-xs text-gray-400 font-medium mb-1">Capacity</p>
                    <p className="text-sm font-semibold text-gray-800 flex items-center gap-1.5">
                      <Users size={14} className="text-gray-400" />
                      {space.capacity} seats
                    </p>
                    {space.capacityNote && (
                      <p className="text-xs text-gray-400 mt-0.5">{space.capacityNote}</p>
                    )}
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-medium mb-1">Booking Type</p>
                    <p className="text-sm font-semibold text-gray-800 capitalize">
                      {space.bookingType === "both"
                        ? "Individual + Group"
                        : space.bookingType.replace("_", " ")}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-medium mb-1">Approval</p>
                    <p
                      className={`text-sm font-semibold capitalize ${
                        space.approvalType === "auto"
                          ? "text-green-600"
                          : "text-amber-600"
                      }`}
                    >
                      {space.approvalType === "auto"
                        ? "Auto"
                        : space.approvalType === "manual"
                        ? "Manual"
                        : "Admin Only"}
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Equipment */}
            <Card>
              <h2 className="font-semibold text-gray-900 mb-3">Equipment & Setup</h2>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {space.equipment.map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckCircle size={14} className="text-green-500 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </Card>

            {/* Booking rules for this space */}
            <Card className="bg-amber-50 border-amber-100">
              <div className="flex items-start gap-3">
                <Info size={16} className="text-amber-500 mt-0.5 shrink-0" />
                <div>
                  <h2 className="font-semibold text-amber-800 mb-2">Booking Rules for This Space</h2>
                  <ul className="space-y-1.5 text-sm text-amber-700">
                    <li>{approvalNote}</li>
                    {space.minGroupSize && (
                      <li>Minimum group size: {space.minGroupSize} people.</li>
                    )}
                    {space.requiresJustification && (
                      <li>
                        You must provide a reason for booking (2–4 sentences minimum).
                      </li>
                    )}
                    {space.bookingType === "group" && (
                      <li>Group sessions: 2–3 hours fixed window.</li>
                    )}
                    {space.externalAllowed && (
                      <li>
                        External users welcome. Payment required at front desk.
                      </li>
                    )}
                    {!space.externalAllowed && (
                      <li>Internal UNILAG users only.</li>
                    )}
                  </ul>
                </div>
              </div>
            </Card>
          </div>

          {/* ── BOOKING SIDEBAR ──────────────────────────────────────── */}
          <div className="space-y-5">
            <Card>
              <h2 className="font-semibold text-gray-900 mb-4">Book This Space</h2>

              {canBook ? (
                <>
                  <div className="space-y-2 mb-5">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock size={14} className="text-gray-400" />
                      Mon–Fri · 10:00AM – 5:00PM
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <CheckCircle size={14} className="text-green-500" />
                      {space.approvalType === "auto"
                        ? "Instant confirmation"
                        : "Admin reviews within 24h"}
                    </div>
                    {space.bookingType === "group" && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Users size={14} className="text-gray-400" />
                        Group only (min. {space.minGroupSize})
                      </div>
                    )}
                  </div>

                  <Link href={`/spaces/${space.slug}/book`}>
                    <Button className="w-full" size="lg">
                      Continue to Booking <ArrowRight size={16} />
                    </Button>
                  </Link>
                </>
              ) : (
                <div className="text-center py-4">
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
                    <Info size={18} className="text-gray-400" />
                  </div>
                  <p className="text-sm font-medium text-gray-700 mb-1">Access Restricted</p>
                  <p className="text-xs text-gray-500">
                    Your current tier ({TIER_LABELS[currentUserTier]}) doesn&apos;t have access
                    to this space. Contact admin to upgrade your tier.
                  </p>
                </div>
              )}
            </Card>

            {/* Who can book */}
            <Card>
              <h2 className="font-semibold text-gray-900 mb-3">Who Can Book</h2>
              {space.whoCanBook.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {space.whoCanBook.map((tier) => (
                    <Badge
                      key={tier}
                      variant={tier === currentUserTier ? "default" : "neutral"}
                      size="sm"
                    >
                      {TIER_LABELS[tier]}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400">Admin-managed only</p>
              )}
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
