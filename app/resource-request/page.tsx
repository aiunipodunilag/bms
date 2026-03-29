"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import { Card } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { TIER_LABELS, TIER_RULES } from "@/lib/data/tiers";
import {
  ChevronLeft,
  Cpu,
  Printer,
  Headset,
  Wrench,
  CheckCircle,
  ArrowRight,
  Info,
  Clock,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { UserTier, ResourceType } from "@/types";

interface UserProfile {
  full_name: string;
  tier: UserTier;
  status: string;
}

const RESOURCE_OPTIONS: { value: ResourceType; label: string; space: string; icon: typeof Cpu }[] = [
  { value: "gpu_workstation",     label: "GPU Workstation",       space: "AI & Robotics Lab",  icon: Cpu },
  { value: "robotics_kit",        label: "Robotics Kit",          space: "AI & Robotics Lab",  icon: Wrench },
  { value: "pcb_printer",         label: "PCB Printer",           space: "AI & Robotics Lab",  icon: Printer },
  { value: "soldering_station",   label: "Soldering Station",     space: "AI & Robotics Lab",  icon: Wrench },
  { value: "3d_printer_medium",   label: "3D Printer (Medium)",   space: "Maker Space",        icon: Printer },
  { value: "3d_printer_large",    label: "3D Printer (Large)",    space: "Maker Space",        icon: Printer },
  { value: "3d_printer_resin",    label: "3D Printer (Resin)",    space: "Maker Space",        icon: Printer },
  { value: "laser_cutter",        label: "Laser Cutter",          space: "Maker Space",        icon: Wrench },
  { value: "vinyl_cutter",        label: "Vinyl Cutter",          space: "Maker Space",        icon: Wrench },
  { value: "vacuum_former",       label: "Vacuum Former",         space: "Maker Space",        icon: Wrench },
  { value: "3d_scanner",          label: "3D Scanner",            space: "Maker Space",        icon: Cpu },
  { value: "vr_headset",          label: "VR Headset",            space: "VR Lab",             icon: Headset },
  { value: "motion_tracker",      label: "Motion Tracker",        space: "VR Lab",             icon: Headset },
];

const TIME_WINDOWS = [
  "10:00 AM – 11:00 AM", "11:00 AM – 12:00 PM", "12:00 PM – 1:00 PM",
  "1:00 PM – 2:00 PM", "2:00 PM – 3:00 PM", "3:00 PM – 4:00 PM", "4:00 PM – 5:00 PM",
];

const PREMIUM_TIERS = Object.entries(TIER_RULES)
  .filter(([, rules]) => rules.canAccessPremiumResources)
  .map(([tier]) => tier);

type Step = "form" | "success";

export default function ResourceRequestPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [step, setStep] = useState<Step>("form");
  const [loading, setLoading] = useState(false);
  const [bmsCode, setBmsCode] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState("");

  const [form, setForm] = useState({
    resourceType: "" as ResourceType | "",
    preferredDate: "",
    preferredTimeWindow: "",
    estimatedDuration: "",
    justification: "",
  });

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.push("/auth/login"); return; }
      fetch("/api/users/me").then((r) => r.json()).then((d) => {
        setProfile(d.profile ?? null);
        setAuthLoading(false);
      });
    });
  }, [router]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.resourceType) e.resourceType = "Please select a resource.";
    if (!form.preferredDate) e.preferredDate = "Please select a date.";
    if (!form.preferredTimeWindow) e.preferredTimeWindow = "Please select a time window.";
    if (!form.estimatedDuration) e.estimatedDuration = "Please enter estimated duration.";
    if (form.justification.trim().length < 80)
      e.justification = "Please provide a more detailed justification (minimum 2 sentences).";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setApiError("");
    setLoading(true);

    const res = await fetch("/api/resource-requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        resourceType: form.resourceType,
        preferredDate: form.preferredDate,
        preferredTimeWindow: form.preferredTimeWindow,
        estimatedDuration: form.estimatedDuration,
        justification: form.justification,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      setApiError(data.error ?? "Failed to submit request. Please try again.");
      setLoading(false);
      return;
    }

    setBmsCode(data.request.bms_code);
    setStep("success");
    setLoading(false);
  };

  const selectedResource = RESOURCE_OPTIONS.find((r) => r.value === form.resourceType);
  const hasAccess = profile ? PREMIUM_TIERS.includes(profile.tier) : false;

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
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

      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-6 transition-colors"
        >
          <ChevronLeft size={15} /> Back to Dashboard
        </Link>

        {step === "form" && (
          <div className="space-y-5">
            <Card>
              <h1 className="text-xl font-bold text-gray-900 mb-1">Request a Resource</h1>
              <p className="text-sm text-gray-500">
                Premium equipment requires a separate request and admin approval. All requests
                go into the approval queue — you&apos;ll be notified by email.
              </p>
            </Card>

            {/* Access restriction notice */}
            {profile && !hasAccess && (
              <Card className="bg-red-50 border-red-200">
                <div className="flex items-start gap-3">
                  <AlertCircle size={16} className="text-red-500 shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700">
                    Your current tier (<strong>{TIER_LABELS[profile.tier]}</strong>) does not have access to
                    premium resources. Resources are available to Product Developers, Volunteers, Startup
                    Teams, Lecturers, and Partners.
                  </p>
                </div>
              </Card>
            )}

            {profile && hasAccess && (
              <Card className="bg-brand-50 border-brand-100">
                <div className="flex items-start gap-3">
                  <Info size={16} className="text-brand-500 shrink-0 mt-0.5" />
                  <p className="text-sm text-brand-700">
                    Resources are available to Product Developers, Volunteers, Startup Teams,
                    Lecturers, and Partners. Regular Students do not have access to premium resources.
                  </p>
                </div>
              </Card>
            )}

            {apiError && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl flex items-start gap-2">
                <AlertCircle size={14} className="shrink-0 mt-0.5" /> {apiError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Resource type */}
              <Card>
                <h2 className="font-semibold text-gray-800 mb-3">Select Resource</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {RESOURCE_OPTIONS.map(({ value, label, space, icon: Icon }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setForm({ ...form, resourceType: value })}
                      disabled={!hasAccess}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border text-left transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
                        form.resourceType === value
                          ? "border-brand-500 bg-brand-50 text-brand-700"
                          : "border-gray-200 hover:border-brand-300 text-gray-700"
                      }`}
                    >
                      <Icon size={15} className="shrink-0" />
                      <div>
                        <p className="text-sm font-medium">{label}</p>
                        <p className="text-xs text-gray-400">{space}</p>
                      </div>
                    </button>
                  ))}
                </div>
                {errors.resourceType && (
                  <p className="text-xs text-red-500 mt-2">{errors.resourceType}</p>
                )}
              </Card>

              {/* Date + time */}
              <Card>
                <h2 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <Clock size={16} className="text-brand-500" /> Preferred Date & Time
                </h2>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gray-500 font-medium mb-1.5 block">Preferred date</label>
                    <input
                      type="date"
                      value={form.preferredDate}
                      onChange={(e) => setForm({ ...form, preferredDate: e.target.value })}
                      min={new Date().toISOString().split("T")[0]}
                      disabled={!hasAccess}
                      className="w-full px-3 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 disabled:opacity-40"
                    />
                    {errors.preferredDate && (
                      <p className="text-xs text-red-500 mt-1">{errors.preferredDate}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 font-medium mb-1.5 block">Time window</label>
                    <select
                      value={form.preferredTimeWindow}
                      onChange={(e) => setForm({ ...form, preferredTimeWindow: e.target.value })}
                      disabled={!hasAccess}
                      className="w-full px-3 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 disabled:opacity-40"
                    >
                      <option value="">Select</option>
                      {TIME_WINDOWS.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                    {errors.preferredTimeWindow && (
                      <p className="text-xs text-red-500 mt-1">{errors.preferredTimeWindow}</p>
                    )}
                  </div>
                </div>
                <div className="mt-3">
                  <label className="text-xs text-gray-500 font-medium mb-1.5 block">Estimated duration</label>
                  <select
                    value={form.estimatedDuration}
                    onChange={(e) => setForm({ ...form, estimatedDuration: e.target.value })}
                    disabled={!hasAccess}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 disabled:opacity-40"
                  >
                    <option value="">Select duration</option>
                    <option value="30 minutes">30 minutes</option>
                    <option value="1 hour">1 hour</option>
                    <option value="2 hours">2 hours</option>
                    <option value="3 hours">3 hours</option>
                    <option value="Half day (4 hours)">Half day (4 hours)</option>
                  </select>
                  {errors.estimatedDuration && (
                    <p className="text-xs text-red-500 mt-1">{errors.estimatedDuration}</p>
                  )}
                </div>
              </Card>

              {/* Justification */}
              <Card>
                <h2 className="font-semibold text-gray-800 mb-1">Why do you need this resource?</h2>
                <p className="text-xs text-gray-400 mb-3">
                  Required — minimum 2–4 sentences. Describe your project, what you&apos;re building, and
                  how this resource supports your work.
                </p>
                <textarea
                  rows={5}
                  placeholder="e.g. I am working on a computer vision prototype for my final year project..."
                  value={form.justification}
                  onChange={(e) => setForm({ ...form, justification: e.target.value })}
                  disabled={!hasAccess}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none disabled:opacity-40"
                />
                <p className="text-xs text-gray-400 mt-1 text-right">{form.justification.length} chars</p>
                {errors.justification && (
                  <p className="text-xs text-red-500 mt-1">{errors.justification}</p>
                )}
              </Card>

              <Button type="submit" className="w-full" size="lg" loading={loading} disabled={!hasAccess}>
                Submit Request <ArrowRight size={16} />
              </Button>
            </form>
          </div>
        )}

        {step === "success" && (
          <Card className="text-center py-8">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-5">
              <CheckCircle size={32} className="text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Request Submitted</h2>
            <p className="text-gray-500 text-sm mb-2">
              Your request for{" "}
              <strong>{RESOURCE_OPTIONS.find((r) => r.value === form.resourceType)?.label}</strong>{" "}
              is in the admin approval queue. You will receive an email once reviewed.
            </p>

            {selectedResource && (
              <div className="bg-gray-50 rounded-xl px-5 py-4 my-5 text-left text-sm space-y-2">
                {[
                  ["Resource", selectedResource.label],
                  ["Location", selectedResource.space],
                  ["Preferred date", form.preferredDate],
                  ["Time window", form.preferredTimeWindow],
                  ["Reference", bmsCode],
                ].map(([key, value]) => (
                  <div key={key} className="flex justify-between">
                    <span className="text-gray-500">{key}</span>
                    <span className={`font-medium ${key === "Reference" ? "font-mono text-brand-700" : ""}`}>
                      {value}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-3">
              <Link href="/dashboard" className="flex-1">
                <Button variant="outline" className="w-full">Dashboard</Button>
              </Link>
              <Button
                className="flex-1"
                onClick={() => {
                  setStep("form");
                  setForm({ resourceType: "", preferredDate: "", preferredTimeWindow: "", estimatedDuration: "", justification: "" });
                  setBmsCode("");
                  setApiError("");
                }}
              >
                New Request
              </Button>
            </div>
          </Card>
        )}
      </main>
    </div>
  );
}
