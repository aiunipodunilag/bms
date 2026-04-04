"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import { Card } from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { TIER_LABELS, TIER_COLORS } from "@/lib/data/tiers";
import {
  ChevronLeft,
  User,
  Mail,
  Phone,
  BookOpen,
  ShieldCheck,
  AlertCircle,
  X,
  TrendingUp,
  CheckCircle,
  Trash2,
} from "lucide-react";
import type { UserTier } from "@/types";

interface Profile {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  tier: UserTier;
  status: string;
  class: string;
  matric_number: string | null;
  total_bookings: number;
  completed_bookings: number;
  no_show_count: number;
  created_at: string;
}

const UPGRADEABLE_TIERS = [
  { value: "lecturer_staff",       label: "Lecturer / Staff" },
  { value: "product_developer",    label: "Product Developer" },
  { value: "startup_team",         label: "Startup Team" },
  { value: "volunteer_space_lead", label: "Volunteer / Space Lead" },
];

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  // Tier upgrade
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [upgradeTier, setUpgradeTier] = useState("");
  const [upgradeReason, setUpgradeReason] = useState("");
  const [upgradeSubmitting, setUpgradeSubmitting] = useState(false);
  const [upgradeSuccess, setUpgradeSuccess] = useState(false);
  const [upgradeError, setUpgradeError] = useState("");
  const [existingUpgrade, setExistingUpgrade] = useState<{ status: string; requested_tier: string } | null>(null);

  // Delete account
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/users/me").then((r) => r.json()),
      fetch("/api/tier-upgrade").then((r) => r.json()).catch(() => ({ requests: [] })),
    ]).then(([meData, upgradeData]) => {
      if (meData.profile) setProfile(meData.profile);
      const pending = (upgradeData.requests ?? []).find(
        (r: { status: string }) => r.status === "pending" || r.status === "approved"
      );
      if (pending) setExistingUpgrade(pending);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleUpgradeSubmit = async () => {
    if (!upgradeTier || upgradeReason.trim().length < 50) {
      setUpgradeError("Please select a tier and provide at least 50 characters for your reason.");
      return;
    }
    setUpgradeSubmitting(true);
    setUpgradeError("");
    try {
      const res = await fetch("/api/tier-upgrade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestedTier: upgradeTier, reason: upgradeReason }),
      });
      const data = await res.json();
      if (!res.ok) {
        setUpgradeError(data.error ?? "Failed to submit request");
      } else {
        setUpgradeSuccess(true);
        setExistingUpgrade({ status: "pending", requested_tier: upgradeTier });
        setTimeout(() => { setUpgradeOpen(false); setUpgradeSuccess(false); }, 2000);
      }
    } catch {
      setUpgradeError("An error occurred. Please try again.");
    }
    setUpgradeSubmitting(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-400 text-sm">Loading profile…</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-400 text-sm">Could not load profile.</p>
      </div>
    );
  }

  const joinedAt = new Date(profile.created_at).toLocaleDateString("en-GB", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar
        user={{
          name: profile.full_name,
          tier: profile.tier,
          tierLabel: TIER_LABELS[profile.tier],
        }}
      />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-6 transition-colors"
        >
          <ChevronLeft size={15} /> Back to Dashboard
        </Link>

        <h1 className="text-2xl font-bold text-gray-900 mb-6">My Profile</h1>

        <div className="space-y-5">
          {/* Avatar + tier */}
          <Card className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-brand-100 flex items-center justify-center shrink-0">
              <span className="text-brand-700 text-2xl font-bold">
                {profile.full_name?.charAt(0) ?? "?"}
              </span>
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-bold text-gray-900">{profile.full_name}</h2>
              <p className="text-sm text-gray-500">{profile.email}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${TIER_COLORS[profile.tier]}`}>
                  {TIER_LABELS[profile.tier]}
                </span>
                <Badge
                  variant={profile.status === "verified" || profile.status === "active" ? "success" : "warning"}
                  size="sm"
                >
                  {profile.status === "verified" || profile.status === "active" ? (
                    <span className="flex items-center gap-1"><ShieldCheck size={11} /> Verified</span>
                  ) : "Pending"}
                </Badge>
              </div>
            </div>
          </Card>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "Total Bookings",  value: profile.total_bookings ?? 0 },
              { label: "Completed",       value: profile.completed_bookings ?? 0 },
              { label: "No-shows",        value: profile.no_show_count ?? 0 },
            ].map((s) => (
              <Card key={s.label} className="text-center">
                <p className="text-2xl font-bold text-gray-900">{s.value}</p>
                <p className="text-xs text-gray-400 mt-1">{s.label}</p>
              </Card>
            ))}
          </div>

          {/* Personal info — read-only */}
          <Card>
            <h2 className="font-semibold text-gray-900 mb-5">Personal Information</h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <User size={16} className="text-gray-400 mt-1 shrink-0" />
                <div>
                  <p className="text-xs text-gray-400 font-medium mb-0.5">Full Name</p>
                  <p className="text-sm font-medium text-gray-800">{profile.full_name}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail size={16} className="text-gray-400 mt-1 shrink-0" />
                <div>
                  <p className="text-xs text-gray-400 font-medium mb-0.5">Email Address</p>
                  <p className="text-sm font-medium text-gray-800">{profile.email}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone size={16} className="text-gray-400 mt-1 shrink-0" />
                <div>
                  <p className="text-xs text-gray-400 font-medium mb-0.5">Phone Number</p>
                  <p className="text-sm font-medium text-gray-800">{profile.phone ?? "—"}</p>
                </div>
              </div>

              {profile.matric_number && (
                <div className="flex items-start gap-3">
                  <BookOpen size={16} className="text-gray-400 mt-1 shrink-0" />
                  <div>
                    <p className="text-xs text-gray-400 font-medium mb-0.5">Matric Number</p>
                    <p className="text-sm font-medium text-gray-800">{profile.matric_number}</p>
                  </div>
                </div>
              )}

              <p className="text-xs text-gray-400 pt-2 border-t border-gray-100">
                To update your details, please contact an admin at AI-UNIPOD.
              </p>
            </div>
          </Card>

          {/* Account info */}
          <Card>
            <h2 className="font-semibold text-gray-900 mb-4">Account Details</h2>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <span className="text-gray-500">Account type</span>
                <span className="font-medium text-gray-800 capitalize">{profile.class ?? "—"}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <span className="text-gray-500">Tier</span>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${TIER_COLORS[profile.tier]}`}>
                  {TIER_LABELS[profile.tier]}
                </span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <span className="text-gray-500">Member since</span>
                <span className="font-medium text-gray-800">{joinedAt}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-gray-500">Status</span>
                <Badge
                  variant={profile.status === "verified" || profile.status === "active" ? "success" : "warning"}
                  size="sm"
                >
                  {profile.status === "verified" || profile.status === "active" ? "Verified" : "Pending"}
                </Badge>
              </div>
            </div>
          </Card>

          {/* Tier upgrade */}
          <Card>
            <div className="flex items-start justify-between gap-3 mb-4">
              <div className="flex items-center gap-2">
                <TrendingUp size={16} className="text-brand-500" />
                <h2 className="font-semibold text-gray-900">Tier Upgrade</h2>
              </div>
              {existingUpgrade?.status === "pending" ? (
                <span className="text-xs bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-1 rounded-full font-medium">
                  Request Pending
                </span>
              ) : existingUpgrade?.status === "approved" ? (
                <span className="text-xs bg-green-50 text-green-700 border border-green-200 px-2.5 py-1 rounded-full font-medium flex items-center gap-1">
                  <CheckCircle size={11} /> Approved
                </span>
              ) : null}
            </div>

            {existingUpgrade ? (
              <p className="text-sm text-gray-500">
                {existingUpgrade.status === "pending"
                  ? `Your request to upgrade to ${existingUpgrade.requested_tier.replace(/_/g, " ")} is under admin review.`
                  : `Your tier was upgraded to ${existingUpgrade.requested_tier.replace(/_/g, " ")}.`}
              </p>
            ) : (
              <>
                <p className="text-sm text-gray-500 mb-4">
                  Apply to upgrade your tier to access more spaces and features.
                  Upgrades are reviewed by an admin within 1–2 business days.
                </p>
                {!upgradeOpen ? (
                  <Button variant="outline" size="sm" onClick={() => setUpgradeOpen(true)}>
                    <TrendingUp size={14} /> Apply for Upgrade
                  </Button>
                ) : (
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-medium text-gray-500 block mb-1.5">Requested Tier</label>
                      <select
                        value={upgradeTier}
                        onChange={(e) => setUpgradeTier(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl border border-gray-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                      >
                        <option value="">Select a tier…</option>
                        {UPGRADEABLE_TIERS.filter((t) => t.value !== profile.tier).map((t) => (
                          <option key={t.value} value={t.value}>{t.label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 block mb-1.5">
                        Reason / Justification{" "}
                        <span className="text-gray-400">({upgradeReason.length}/50 min)</span>
                      </label>
                      <textarea
                        rows={4}
                        placeholder="Explain why you need this tier upgrade — your role, projects, and how you'll use the hub…"
                        value={upgradeReason}
                        onChange={(e) => setUpgradeReason(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
                      />
                    </div>
                    {upgradeError && (
                      <p className="text-xs text-red-600 flex items-center gap-1">
                        <AlertCircle size={12} /> {upgradeError}
                      </p>
                    )}
                    {upgradeSuccess && (
                      <p className="text-xs text-green-600 flex items-center gap-1">
                        <CheckCircle size={12} /> Request submitted! Admin will review shortly.
                      </p>
                    )}
                    <div className="flex gap-2">
                      <Button size="sm" loading={upgradeSubmitting} onClick={handleUpgradeSubmit}>
                        Submit Request
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => { setUpgradeOpen(false); setUpgradeError(""); }}>
                        <X size={14} />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </Card>

          {/* Danger zone */}
          <Card className="border-red-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-gray-900 text-sm mb-0.5 flex items-center gap-1.5">
                  <Trash2 size={14} className="text-red-400" /> Delete Account
                </p>
                <p className="text-xs text-gray-400">
                  Permanently delete your account and all booking data. This cannot be undone.
                </p>
              </div>
              {!deleteConfirm ? (
                <Button variant="danger" size="sm" onClick={() => setDeleteConfirm(true)}>Delete</Button>
              ) : (
                <div className="flex flex-col items-end gap-2">
                  <p className="text-xs text-red-600 font-medium">Are you sure?</p>
                  <div className="flex gap-2">
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={async () => {
                        await fetch("/api/users/me", { method: "DELETE" }).catch(() => {});
                        window.location.href = "/auth/signout";
                      }}
                    >
                      Yes, delete
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setDeleteConfirm(false)}>Cancel</Button>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
