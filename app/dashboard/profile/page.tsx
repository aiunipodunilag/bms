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
  Edit2,
  Save,
  X,
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

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ fullName: "", phone: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/users/me")
      .then((r) => r.json())
      .then(({ profile: p }) => {
        if (p) {
          setProfile(p);
          setForm({ fullName: p.full_name ?? "", phone: p.phone ?? "" });
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/users/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName: form.fullName, phone: form.phone }),
      });
      const { profile: updated } = await res.json();
      if (updated) {
        setProfile(updated);
        setForm({ fullName: updated.full_name ?? "", phone: updated.phone ?? "" });
      }
    } catch {
      // silent
    }
    setSaving(false);
    setEditing(false);
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
                <span
                  className={`text-xs font-medium px-2.5 py-1 rounded-full ${TIER_COLORS[profile.tier]}`}
                >
                  {TIER_LABELS[profile.tier]}
                </span>
                <Badge
                  variant={profile.status === "verified" || profile.status === "active" ? "success" : "warning"}
                  size="sm"
                >
                  {profile.status === "verified" || profile.status === "active" ? (
                    <span className="flex items-center gap-1">
                      <ShieldCheck size={11} /> Verified
                    </span>
                  ) : (
                    "Pending"
                  )}
                </Badge>
              </div>
            </div>
          </Card>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "Total Bookings", value: profile.total_bookings ?? 0 },
              { label: "Completed", value: profile.completed_bookings ?? 0 },
              { label: "No-shows", value: profile.no_show_count ?? 0 },
            ].map((s) => (
              <Card key={s.label} className="text-center">
                <p className="text-2xl font-bold text-gray-900">{s.value}</p>
                <p className="text-xs text-gray-400 mt-1">{s.label}</p>
              </Card>
            ))}
          </div>

          {/* Personal info */}
          <Card>
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-semibold text-gray-900">Personal Information</h2>
              {!editing ? (
                <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
                  <Edit2 size={14} /> Edit
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button size="sm" loading={saving} onClick={handleSave}>
                    <Save size={14} /> Save
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setEditing(false)}>
                    <X size={14} />
                  </Button>
                </div>
              )}
            </div>

            <div className="space-y-4">
              {/* Full name */}
              <div className="flex items-start gap-3">
                <User size={16} className="text-gray-400 mt-2.5 shrink-0" />
                <div className="flex-1">
                  <p className="text-xs text-gray-400 font-medium mb-1">Full Name</p>
                  {editing ? (
                    <input
                      type="text"
                      value={form.fullName}
                      onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  ) : (
                    <p className="text-sm font-medium text-gray-800">{profile.full_name}</p>
                  )}
                </div>
              </div>

              {/* Email — not editable */}
              <div className="flex items-start gap-3">
                <Mail size={16} className="text-gray-400 mt-1 shrink-0" />
                <div>
                  <p className="text-xs text-gray-400 font-medium mb-1">Email Address</p>
                  <p className="text-sm font-medium text-gray-800">{profile.email}</p>
                  <p className="text-xs text-gray-400 mt-0.5">Cannot be changed after signup</p>
                </div>
              </div>

              {/* Phone */}
              <div className="flex items-start gap-3">
                <Phone size={16} className="text-gray-400 mt-2.5 shrink-0" />
                <div className="flex-1">
                  <p className="text-xs text-gray-400 font-medium mb-1">Phone Number</p>
                  {editing ? (
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  ) : (
                    <p className="text-sm font-medium text-gray-800">{profile.phone ?? "—"}</p>
                  )}
                </div>
              </div>

              {/* Matric number — not editable */}
              {profile.matric_number && (
                <div className="flex items-start gap-3">
                  <BookOpen size={16} className="text-gray-400 mt-1 shrink-0" />
                  <div>
                    <p className="text-xs text-gray-400 font-medium mb-1">Matric Number</p>
                    <p className="text-sm font-medium text-gray-800">{profile.matric_number}</p>
                  </div>
                </div>
              )}
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
                <span
                  className={`text-xs font-medium px-2.5 py-1 rounded-full ${TIER_COLORS[profile.tier]}`}
                >
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

          {/* Tier upgrade info */}
          <Card className="bg-brand-50 border-brand-100">
            <div className="flex items-start gap-3">
              <AlertCircle size={16} className="text-brand-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-brand-800 text-sm mb-1">Want to upgrade your tier?</p>
                <p className="text-brand-700 text-xs leading-relaxed">
                  Tier upgrades (Product Developer, Startup Team) are applied for through the
                  dashboard. Volunteer and Space Lead roles are appointed by admin. Contact the
                  pod team to learn more.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
