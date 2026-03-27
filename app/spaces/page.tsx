"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/layout/Navbar";
import { Card } from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { getPublicSpaces } from "@/lib/data/spaces";
import { TIER_LABELS } from "@/lib/data/tiers";
import { Users, ChevronRight, Search, Filter } from "lucide-react";
import type { UserTier } from "@/types";

const spaces = getPublicSpaces();

const categories = ["All", "lab", "collaboration", "event", "work", "meeting"];

const categoryColors: Record<string, string> = {
  lab: "bg-purple-50 text-purple-700 border-purple-200",
  collaboration: "bg-blue-50 text-blue-700 border-blue-200",
  event: "bg-orange-50 text-orange-700 border-orange-200",
  work: "bg-green-50 text-green-700 border-green-200",
  meeting: "bg-gray-100 text-gray-700 border-gray-200",
};

const approvalLabels: Record<string, { label: string; color: string }> = {
  auto:       { label: "Auto-approved", color: "text-green-600" },
  manual:     { label: "Manual approval", color: "text-amber-600" },
  admin_only: { label: "Admin-scheduled", color: "text-gray-400" },
};

// Mock current user tier — replace with session data
const currentUserTier: UserTier = "regular_student";

export default function SpacesPage() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [showExternalOnly, setShowExternalOnly] = useState(false);

  const filtered = spaces.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory =
      activeCategory === "All" || s.category === activeCategory;
    const matchesExternal =
      !showExternalOnly || s.externalAllowed;
    return matchesSearch && matchesCategory && matchesExternal;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar
        user={{
          name: "Tolu Adeyemi",
          tier: currentUserTier,
          tierLabel: TIER_LABELS[currentUserTier],
        }}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Spaces Directory</h1>
          <p className="text-gray-500 text-sm">
            {spaces.length} spaces available · Mon–Fri 10:00AM – 5:00PM
          </p>
        </div>

        {/* Search + Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search spaces..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter size={15} className="text-gray-400 hidden sm:block" />
            <div className="flex gap-1.5 flex-wrap">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors capitalize ${
                    activeCategory === cat
                      ? "bg-brand-600 text-white"
                      : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer whitespace-nowrap">
            <input
              type="checkbox"
              checked={showExternalOnly}
              onChange={(e) => setShowExternalOnly(e.target.checked)}
              className="rounded"
            />
            External-friendly only
          </label>
        </div>

        {/* Spaces Grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-lg font-medium">No spaces match your filters</p>
            <p className="text-sm mt-1">Try adjusting your search or category</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((space) => {
              const canBook =
                space.whoCanBook.includes(currentUserTier) ||
                (currentUserTier === "external" && space.externalAllowed);

              return (
                <Link key={space.id} href={`/spaces/${space.slug}`}>
                  <Card hover className="h-full flex flex-col overflow-hidden p-0">
                    {/* Space photo */}
                    {space.imageUrl && (
                      <div className="relative w-full h-36 shrink-0">
                        <Image
                          src={space.imageUrl}
                          alt={space.name}
                          fill
                          className="object-cover"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        />
                      </div>
                    )}
                    <div className="p-4 flex flex-col flex-1">
                    {/* Top row */}
                    <div className="flex items-center justify-between mb-3">
                      <span
                        className={`text-xs font-medium px-2.5 py-1 rounded-full border capitalize ${categoryColors[space.category]}`}
                      >
                        {space.category}
                      </span>
                      <span
                        className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                          space.availability === "available"
                            ? "bg-green-100 text-green-700"
                            : space.availability === "full"
                            ? "bg-red-100 text-red-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {space.availability === "available"
                          ? space.seatsAvailable
                            ? `${space.seatsAvailable} seats free`
                            : "Available"
                          : space.availability === "full"
                          ? "Full"
                          : "Admin Scheduled"}
                      </span>
                    </div>

                    {/* Space name */}
                    <h3 className="font-semibold text-gray-900 mb-1.5">{space.name}</h3>
                    <p className="text-sm text-gray-500 line-clamp-2 mb-3 flex-1">
                      {space.description}
                    </p>

                    {/* Approval type */}
                    <p
                      className={`text-xs font-medium mb-3 ${approvalLabels[space.approvalType].color}`}
                    >
                      {approvalLabels[space.approvalType].label}
                      {space.externalAllowed && (
                        <span className="ml-2 text-gray-400 font-normal">· External OK</span>
                      )}
                    </p>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100 mt-auto">
                      <div className="flex items-center gap-1.5 text-sm text-gray-500">
                        <Users size={14} />
                        <span>{space.capacity} seats</span>
                      </div>

                      {canBook ? (
                        <span className="text-xs text-brand-600 font-medium flex items-center gap-1">
                          Book now <ChevronRight size={12} />
                        </span>
                      ) : (
                        <Badge variant="neutral" size="sm">Access restricted</Badge>
                      )}
                    </div>
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
