/**
 * patch-pages.js — Runs before `npm run build` on Vercel.
 * Fixes applied at build time:
 *   1. Calendar safety valve (utils.ts)
 *   2. Space image corrections (spaces.ts)
 *   3. Remove Admin Login from landing page (page.tsx)
 *   4. Booking page rewrite — bank transfer, equipment photos, scrollable calendar
 *   5. Admin bookings — payment_pending status
 *   6. Admin settings — proper CSS toggle switches
 */

const fs   = require("fs");
const path = require("path");
const root = path.join(__dirname, "..");

function write(rel, content) {
  const target = path.join(root, rel);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, content.trimStart(), "utf8");
  console.log(`✓ wrote ${rel}`);
}

function patch(rel, replacements) {
  const target = path.join(root, rel);
  let content = fs.readFileSync(target, "utf8");
  for (const [from, to] of replacements) {
    content = content.split(from).join(to);
  }
  fs.writeFileSync(target, content, "utf8");
  console.log(`✓ patched ${rel}`);
}

// ─── 1. Fix calendar safety valve in lib/utils.ts ────────────────────────────
patch("lib/utils.ts", [
  ["if (count > 20) break;", "if (count > 60) break;"],
  ["up to 4 days ahead",     "up to maxAdvanceDays weekdays ahead"],
]);

// ─── 2. Fix space image mapping in lib/data/spaces.ts ────────────────────────
// Verified by viewing each photo directly:
//   image4  = circuit board mural + lab tables  → fits AI & Robotics Lab perfectly
//   image7  = large industrial 3D printers      → fits Maker Space better than image4
//   image21 = co-working area (same sunset mural as image16) → WRONG for AI Robotics
//
// IMPORTANT: fix Maker Space FIRST so image4 is free for AI Robotics Lab
patch("lib/data/spaces.ts", [
  ['imageUrl: "/spaces/image4.jpeg"',  'imageUrl: "/spaces/image7.jpeg"'],   // Maker Space → clear 3D printers shot
  ['imageUrl: "/spaces/image21.jpeg"', 'imageUrl: "/spaces/image4.jpeg"'],   // AI Robotics Lab → circuit board mural
]);

// ─── 3. Landing page — full clean light rewrite ──────────────────────────────
write("app/page.tsx", `
import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/layout/Navbar";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { getPublicSpaces } from "@/lib/data/spaces";
import {
  ArrowRight, Cpu, Users, Calendar, ShieldCheck,
  Zap, Radio, MapPin, Clock, ChevronRight, CheckCircle,
} from "lucide-react";

const spaces = getPublicSpaces();

const stats = [
  { value: "12",   label: "Bookable Spaces",  sub: "Labs, studios & more" },
  { value: "9hrs", label: "Daily Access",      sub: "10 AM – 7 PM weekdays" },
  { value: "BMS",  label: "Smart Check-in",   sub: "Unique booking codes" },
  { value: "500+", label: "Members Served",   sub: "UNILAG community" },
];

const features = [
  { icon: Calendar,    title: "Smart Booking",         desc: "Book up to 14 days ahead. Real-time availability with tier-based access control and instant booking codes." },
  { icon: ShieldCheck, title: "Verified Access",        desc: "UNILAG ID verification for students and staff. External users verified via OTP — every booking is tied to a real identity." },
  { icon: Zap,         title: "Instant BMS Codes",      desc: "Get a unique code with every confirmed booking. Show it at reception. 20-minute no-show grace period." },
  { icon: Cpu,         title: "Equipment Access",        desc: "Request GPU workstations, 3D printers, VR headsets and robotics kits through a managed approval flow." },
  { icon: Users,       title: "Group Bookings",          desc: "Lead group sessions with a shared booking code. Add members by matric number — one reference for everyone." },
  { icon: Radio,       title: "Admin Broadcasts",        desc: "Admins push real-time announcements to all users — policy changes, maintenance, or special events." },
];

const categoryBadge: Record<string, "info" | "default" | "warning" | "success" | "neutral"> = {
  lab: "default", collaboration: "info", event: "warning", work: "success", meeting: "neutral",
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* ── HERO ────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-white border-b border-gray-100">
        {/* Subtle violet gradient behind content */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(124,58,237,0.08) 0%, transparent 70%)" }} />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: text */}
            <div>
              <div className="inline-flex items-center gap-2 bg-violet-50 text-violet-700 text-xs font-medium px-3 py-1.5 rounded-full border border-violet-200 mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                UNILAG AI Innovation Hub · Now Open
              </div>

              <h1 className="text-5xl sm:text-6xl font-display font-black leading-[1.05] text-gray-900 mb-6">
                Book Your<br />
                <span className="text-violet-600">AI Workspace.</span>
              </h1>

              <p className="text-lg text-gray-500 leading-relaxed mb-8 max-w-lg">
                Africa&apos;s most advanced student innovation hub. Reserve labs, studios, and
                collaboration spaces at UNILAG&apos;s AI-UNIPOD — in seconds.
              </p>

              <div className="flex flex-wrap gap-3">
                <Link href="/auth/signup">
                  <Button size="lg">Get Access <ArrowRight size={16} /></Button>
                </Link>
                <Link href="/spaces">
                  <Button variant="outline" size="lg">Explore Spaces <ChevronRight size={16} /></Button>
                </Link>
              </div>

              {/* Quick trust signals */}
              <div className="flex flex-wrap gap-4 mt-8">
                {["Free for UNILAG members", "Instant booking codes", "14-day advance booking"].map((t) => (
                  <span key={t} className="flex items-center gap-1.5 text-sm text-gray-500">
                    <CheckCircle size={14} className="text-emerald-500 shrink-0" /> {t}
                  </span>
                ))}
              </div>
            </div>

            {/* Right: hub photo */}
            <div className="relative hidden lg:block">
              <div className="relative rounded-2xl overflow-hidden shadow-xl border border-gray-100">
                <Image
                  src="/spaces/image14.jpeg"
                  alt="AI-UNIPOD workspace"
                  width={640}
                  height={480}
                  className="object-cover w-full"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              </div>
              {/* Floating badge */}
              <div className="absolute -bottom-4 -left-4 bg-white rounded-xl shadow-lg border border-gray-100 px-4 py-3">
                <p className="text-xs text-gray-500 font-medium">Currently Open</p>
                <p className="text-sm font-bold text-gray-900">12 spaces available</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS ───────────────────────────────────────────────────────── */}
      <section className="py-14 border-b border-gray-100 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-4xl font-display font-black text-violet-600 mb-1">{s.value}</p>
                <p className="text-sm font-semibold text-gray-800">{s.label}</p>
                <p className="text-xs text-gray-400 mt-0.5">{s.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SPACES ──────────────────────────────────────────────────────── */}
      <section id="spaces" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10">
            <Badge variant="default" className="mb-3">12 Spaces Available</Badge>
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-gray-900 mb-3">
              Explore the Hub
            </h2>
            <p className="text-gray-500 max-w-xl">
              From AI labs and maker spaces to pitch arenas — every corner built for builders.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {spaces.slice(0, 9).map((space) => (
              <Link key={space.id} href={\`/spaces/\${space.slug}\`} className="group block">
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
                  {space.imageUrl && (
                    <div className="relative h-44 overflow-hidden">
                      <Image src={space.imageUrl} alt={space.name} fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                      <div className="absolute top-3 left-3">
                        <Badge variant={categoryBadge[space.category]} size="sm" className="capitalize">
                          {space.category}
                        </Badge>
                      </div>
                      {space.availability === "available" && (
                        <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          <span className="text-[10px] text-gray-700 font-medium">Open</span>
                        </div>
                      )}
                    </div>
                  )}
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-violet-600 transition-colors">
                      {space.name}
                    </h3>
                    <p className="text-xs text-gray-500 mb-3 line-clamp-2">{space.description}</p>
                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <span className="flex items-center gap-1"><Users size={11} /> {space.capacity} people</span>
                      <span className="flex items-center gap-1"><Clock size={11} /> 10AM–7PM</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link href="/spaces">
              <Button variant="outline" size="lg">View All Spaces <ArrowRight size={16} /></Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── FEATURES ────────────────────────────────────────────────────── */}
      <section id="about" className="py-20 bg-gray-50 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10">
            <Badge variant="info" className="mb-3">How it works</Badge>
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-gray-900 mb-3">
              Built for Builders.
            </h2>
            <p className="text-gray-500 max-w-xl">
              Every feature designed around how AI-UNIPOD actually operates.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-10 h-10 rounded-xl bg-violet-50 border border-violet-100 flex items-center justify-center mb-4">
                  <Icon size={18} className="text-violet-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────────────────── */}
      <section className="py-20">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <div className="bg-violet-600 rounded-3xl p-12 text-white">
            <Badge className="mb-6 bg-white/20 text-white border-white/30">UNILAG Students & Staff</Badge>
            <h2 className="font-display text-4xl font-bold mb-4">
              Ready to build something great?
            </h2>
            <p className="text-violet-100 mb-8 max-w-md mx-auto">
              Sign up with your UNILAG email and start booking AI-UNIPOD spaces today. Free for registered members.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link href="/auth/signup">
                <Button size="lg" className="bg-white text-violet-700 hover:bg-violet-50 shadow-sm">
                  Create Account <ArrowRight size={16} />
                </Button>
              </Link>
              <Link href="/auth/login">
                <Button size="lg" className="bg-white/10 text-white border border-white/30 hover:bg-white/20">
                  Already a member? Sign in
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────────────────── */}
      <footer className="border-t border-gray-100 py-10 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <span className="font-display font-black text-sm text-violet-600 tracking-widest">AI-UNIPOD</span>
            <p className="text-gray-400 text-xs mt-0.5">University of Lagos Innovation Hub</p>
          </div>
          <p className="text-gray-400 text-xs">© {new Date().getFullYear()} AI-UNIPOD UNILAG. All rights reserved.</p>
          <div className="flex items-center gap-4 text-xs text-gray-400">
            <Link href="/auth/login" className="hover:text-gray-700 transition-colors">Sign In</Link>
            <Link href="/auth/signup" className="hover:text-gray-700 transition-colors">Get Access</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
`);

// ─── 4. Booking page — bank transfer + equipment photos + scrollable calendar ─
write("app/spaces/[id]/book/page.tsx", `
"use client";

import { useState } from "react";
import { redirect } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { getSpaceBySlug, SPACE_EQUIPMENT_MAP } from "@/lib/data/spaces";
import { TIER_LABELS, BOOKING_RULES } from "@/lib/data/tiers";
import { getBookableDates, formatDate, formatTime, formatCurrency, generateBMSCode } from "@/lib/utils";
import {
  ChevronLeft, Users, CheckCircle, Calendar, Clock, Info,
  Plus, X, Cpu, Banknote, Copy, Check,
} from "lucide-react";
import type { UserTier, EquipmentType } from "@/types";

// Equipment photos — actual UNIPOD photos showing each piece of equipment
const EQUIPMENT_PHOTOS: Partial<Record<EquipmentType, string>> = {
  "3d_printer_medium": "/spaces/image6.jpeg",
  "3d_printer_large":  "/spaces/image7.jpeg",
  "3d_printer_resin":  "/spaces/image8.jpeg",
  "laser_cutter":      "/spaces/image5.jpeg",
  "gpu_workstation":   "/spaces/image4.jpeg",
};

// Mock current user — replace with Supabase auth session
const currentUserTier: UserTier = "regular_student";
const weeklyBookingsUsed = 2;
const weeklyLimit = 3;

type BookingStep = "details" | "confirm" | "success";

export default function BookSpacePage({ params }: { params: { id: string } }) {
  const space = getSpaceBySlug(params.id);
  if (!space) redirect("/spaces");

  const [step, setStep]       = useState<BookingStep>("details");
  const [loading, setLoading] = useState(false);
  const [bmsCode, setBmsCode] = useState("");
  const [copied, setCopied]   = useState(false);

  const dates       = getBookableDates();
  const isGroupOnly = space.bookingType === "group";
  const needsFee    = weeklyBookingsUsed >= weeklyLimit && currentUserTier === "regular_student";

  const [selectedDate,      setSelectedDate]      = useState<string>("");
  const [selectedStartTime, setSelectedStartTime] = useState<string>("");
  const [duration,          setDuration]          = useState<number>(isGroupOnly ? 2 : 1);
  const [justification,     setJustification]     = useState("");
  const [groupMembers,      setGroupMembers]      = useState<string[]>(["", "", ""]);
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>([]);
  const [errors,            setErrors]            = useState<Record<string, string>>({});

  const timeSlots = Array.from({ length: 7 }, (_, i) => {
    const h = 10 + i;
    return \`\${String(h).padStart(2, "0")}:00\`;
  });

  const endTime = selectedStartTime
    ? \`\${String(parseInt(selectedStartTime) + duration).padStart(2, "0")}:00\`
    : "";

  const toggleEquipment = (type: string) => {
    setSelectedEquipment((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const validateForm = () => {
    const e: Record<string, string> = {};
    if (!selectedDate)      e.date = "Please select a date.";
    if (!selectedStartTime) e.time = "Please select a start time.";
    if (space.requiresJustification && !justification.trim())
      e.justification = "Please explain how you will use this space.";
    if (isGroupOnly && groupMembers.filter(Boolean).length < 2)
      e.group = "Please add at least 2 group members.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleBook = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1400));
    setBmsCode(generateBMSCode());
    setStep("success");
    setLoading(false);
  };

  const copyCode = () => {
    navigator.clipboard.writeText(bmsCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const inputCls = "w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-violet-400 focus:ring-1 focus:ring-violet-300 transition-colors";
  const steps = ["details", "confirm", "success"] as const;

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar user={{ name: "Tolu Adeyemi", tier: currentUserTier, tierLabel: TIER_LABELS[currentUserTier] }} />

      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        {/* Back */}
        <Link href={\`/spaces/\${space.slug}\`} className="inline-flex items-center gap-2 text-gray-400 hover:text-gray-700 text-sm mb-6 transition-colors">
          <ChevronLeft size={16} /> Back to {space.name}
        </Link>

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-8">
          {steps.map((s, i) => (
            <div key={s} className="flex items-center gap-2 flex-1">
              <div className={\`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all \${
                step === s
                  ? "bg-gradient-to-br from-violet-600 to-cyan-500 text-white"
                  : i < steps.indexOf(step)
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                  : "bg-gray-100 text-gray-400 border border-gray-200"
              }\`}>
                {i < steps.indexOf(step) ? <CheckCircle size={14} /> : i + 1}
              </div>
              {i < 2 && <div className={\`h-px flex-1 \${i < steps.indexOf(step) ? "bg-violet-500/50" : "bg-white/[0.08]"}\`} />}
            </div>
          ))}
        </div>

        {/* ── STEP: DETAILS ────────────────────────────────────────────────── */}
        {step === "details" && (
          <div className="space-y-5">
            {/* Space info */}
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h1 className="font-display font-bold text-xl text-gray-900">{space.name}</h1>
                  <p className="text-gray-600 text-sm mt-1">{space.description}</p>
                </div>
                <Badge variant={space.approvalType === "auto" ? "success" : "warning"} size="sm">
                  {space.approvalType === "auto" ? "Instant" : "Manual review"}
                </Badge>
              </div>
            </div>

            {isGroupOnly && (
              <div className="bg-cyan-50 rounded-2xl p-4 border border-cyan-200">
                <p className="text-sm text-cyan-300 flex items-center gap-2">
                  <Info size={14} /> This space requires a group booking (min {space.minGroupSize ?? 2} members).
                </p>
              </div>
            )}

            {/* Date selection — horizontal scrollable strip */}
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
              <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Calendar size={16} className="text-violet-600" /> Select Date
              </h2>
              <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-none">
                {dates.map((date) => {
                  const iso = date.toISOString().split("T")[0];
                  const sel = selectedDate === iso;
                  return (
                    <button key={iso} onClick={() => setSelectedDate(iso)}
                      className={\`flex-none flex flex-col items-center justify-center w-[64px] h-[80px] rounded-xl border transition-all \${
                        sel
                          ? "bg-gradient-to-b from-violet-600 to-violet-800 text-white border-violet-500"
                          : "bg-white text-gray-600 border-gray-200 hover:border-violet-400 hover:text-gray-900"
                      }\`}>
                      <p className="text-[10px] text-gray-500">{date.toLocaleDateString("en-NG", { weekday: "short" })}</p>
                      <p className="font-bold text-xl leading-tight">{date.toLocaleDateString("en-NG", { day: "numeric" })}</p>
                      <p className="text-[10px] text-gray-500">{date.toLocaleDateString("en-NG", { month: "short" })}</p>
                    </button>
                  );
                })}
              </div>
              {errors.date && <p className="text-xs text-red-400 mt-2">{errors.date}</p>}
            </div>

            {/* Time & duration */}
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
              <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Clock size={16} className="text-violet-600" /> Start Time & Duration
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-500 mb-2 block">Start time</label>
                  <div className="flex flex-wrap gap-1.5">
                    {timeSlots.map((t) => (
                      <button key={t} onClick={() => setSelectedStartTime(t)}
                        className={\`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all \${
                          selectedStartTime === t
                            ? "bg-violet-600/80 text-white border-violet-500"
                            : "bg-white text-gray-600 border-gray-200 hover:border-violet-400"
                        }\`}>
                        {formatTime(t)}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-2 block">Duration (hours)</label>
                  <div className="flex items-center gap-3">
                    <button onClick={() => setDuration(Math.max(1, duration - 1))}
                      className="w-8 h-8 bg-white rounded-xl flex items-center justify-center text-gray-500 hover:text-gray-900 border border-gray-200 hover:border-violet-400 transition-colors">
                      <X size={14} />
                    </button>
                    <span className="font-display text-2xl font-bold text-violet-600 w-8 text-center">{duration}</span>
                    <button onClick={() => setDuration(Math.min(space.maxHoursPerDay ?? 4, duration + 1))}
                      className="w-8 h-8 bg-white rounded-xl flex items-center justify-center text-gray-500 hover:text-gray-900 border border-gray-200 hover:border-violet-400 transition-colors">
                      <Plus size={14} />
                    </button>
                  </div>
                  {selectedStartTime && (
                    <p className="text-xs text-gray-500 mt-2">{formatTime(selectedStartTime)} – {formatTime(endTime)}</p>
                  )}
                </div>
              </div>
              {errors.time && <p className="text-xs text-red-400 mt-3">{errors.time}</p>}
            </div>

            {/* Equipment selection with photos */}
            {SPACE_EQUIPMENT_MAP[space.id] && (
              <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                <h2 className="font-semibold text-gray-900 mb-1 flex items-center gap-2">
                  <Cpu size={16} className="text-violet-600" /> Equipment Access
                </h2>
                <p className="text-xs text-gray-500 mb-4">Select equipment you need — access codes are issued at check-in.</p>
                <div className="grid grid-cols-2 gap-3">
                  {SPACE_EQUIPMENT_MAP[space.id].map((eq) => {
                    const isSelected = selectedEquipment.includes(eq.type);
                    const photo = EQUIPMENT_PHOTOS[eq.type as EquipmentType];
                    return (
                      <button key={eq.type} onClick={() => toggleEquipment(eq.type)}
                        className={\`relative rounded-xl overflow-hidden text-left transition-all ring-1 \${
                          isSelected ? "ring-violet-500" : "ring-white/[0.07] hover:ring-violet-500/40"
                        }\`}>
                        {photo ? (
                          <div className="relative h-28">
                            <img src={photo} alt={eq.label} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
                            {isSelected && (
                              <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-violet-500 flex items-center justify-center">
                                <CheckCircle size={11} className="text-white" />
                              </div>
                            )}
                            <p className="absolute bottom-2 left-3 text-[11px] font-semibold text-white leading-tight">{eq.label}</p>
                          </div>
                        ) : (
                          <div className={\`p-4 glass flex flex-col gap-2 min-h-[80px] border \${isSelected ? "border-violet-500/30 bg-violet-500/10" : "border-white/[0.07]"}\`}>
                            <Cpu size={18} className={isSelected ? "text-violet-400" : "text-gray-500"} />
                            <p className="text-xs font-medium text-gray-700 leading-tight">{eq.label}</p>
                            {isSelected && <CheckCircle size={12} className="text-violet-400" />}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
                {selectedEquipment.length > 0 && (
                  <p className="text-xs text-violet-600 mt-3 flex items-center gap-1">
                    <CheckCircle size={11} /> {selectedEquipment.length} item{selectedEquipment.length > 1 ? "s" : ""} selected — EQ codes issued at check-in
                  </p>
                )}
              </div>
            )}

            {/* Group members */}
            {(isGroupOnly || space.bookingType === "both") && (
              <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                <h2 className="font-semibold text-gray-900 mb-1 flex items-center gap-2">
                  <Users size={16} className="text-violet-600" /> Group Members
                </h2>
                <p className="text-xs text-gray-500 mb-4">Enter matric numbers or emails of your group members.</p>
                <div className="space-y-2">
                  {groupMembers.map((m, idx) => (
                    <input key={idx} value={m}
                      placeholder={\`Member \${idx + 1} — matric or email\`}
                      onChange={(e) => {
                        const updated = [...groupMembers];
                        updated[idx] = e.target.value;
                        setGroupMembers(updated);
                      }}
                      className={inputCls}
                    />
                  ))}
                </div>
                <button onClick={() => setGroupMembers([...groupMembers, ""])}
                  className="mt-3 flex items-center gap-1.5 text-xs text-violet-400 hover:text-violet-300 transition-colors">
                  <Plus size={13} /> Add member
                </button>
                {errors.group && <p className="text-xs text-red-400 mt-2">{errors.group}</p>}
              </div>
            )}

            {/* Justification */}
            {space.requiresJustification && (
              <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                <h2 className="font-semibold text-gray-900 mb-1">Purpose of Booking</h2>
                <p className="text-xs text-gray-500 mb-3">Briefly explain how you plan to use this space.</p>
                <textarea value={justification} onChange={(e) => setJustification(e.target.value)}
                  rows={3} placeholder="e.g. Final year project — training a computer vision model on the GPU workstation"
                  className={inputCls + " resize-none"} />
                {errors.justification && <p className="text-xs text-red-400 mt-2">{errors.justification}</p>}
              </div>
            )}

            {/* Bank transfer notice — only shown when a fee applies */}
            {needsFee && (
              <div className="bg-white rounded-2xl p-5 border border-amber-200 shadow-sm">
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/20 flex items-center justify-center shrink-0">
                    <Banknote size={17} className="text-amber-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-amber-300 text-sm">Additional Fee Required</p>
                    <p className="text-gray-500 text-xs mt-0.5 leading-relaxed">
                      This is your 4th booking this week. A fee of{" "}
                      <span className="text-amber-600 font-semibold">{formatCurrency(BOOKING_RULES.extraBookingFee)}</span>{" "}
                      applies. Transfer to the account below before arriving — show your receipt at reception.
                    </p>
                  </div>
                </div>
                <div className="bg-amber-50 rounded-xl p-4 space-y-2.5 border border-amber-100">
                  {[
                    ["Bank",           "First Bank Nigeria"],
                    ["Account Name",   "AI-UNIPOD UNILAG"],
                    ["Account Number", "0123456789"],
                  ].map(([label, value]) => (
                    <div key={label} className="flex justify-between items-center text-sm">
                      <span className="text-gray-500">{label}</span>
                      <span className={\`text-gray-800 font-semibold \${label === "Account Number" ? "font-mono tracking-wider" : ""}\`}>{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Button className="w-full" size="lg" onClick={() => { if (validateForm()) setStep("confirm"); }}>
              Review Booking <ChevronLeft size={16} className="rotate-180" />
            </Button>
          </div>
        )}

        {/* ── STEP: CONFIRM ────────────────────────────────────────────────── */}
        {step === "confirm" && (
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <h1 className="font-display font-bold text-xl text-gray-900 mb-6">Confirm Booking</h1>

            <div className="divide-y divide-gray-100 mb-6">
              {[
                ["Space",    space.name],
                ["Date",     selectedDate ? formatDate(selectedDate) : "-"],
                ["Time",     selectedStartTime ? \`\${formatTime(selectedStartTime)} – \${formatTime(endTime)}\` : "-"],
                ["Duration", \`\${duration} hour\${duration > 1 ? "s" : ""}\`],
                ["Type",     isGroupOnly ? "Group" : "Individual"],
              ].map(([label, value]) => (
                <div key={label as string} className="flex items-center justify-between py-3">
                  <span className="text-sm text-gray-500">{label}</span>
                  <span className="text-sm font-semibold text-gray-900">{value}</span>
                </div>
              ))}
              <div className="flex items-center justify-between py-3">
                <span className="text-sm text-gray-500">Approval</span>
                <Badge variant={space.approvalType === "auto" ? "success" : "warning"} size="sm">
                  {space.approvalType === "auto" ? "Instant" : "Manual review"}
                </Badge>
              </div>
              {selectedEquipment.length > 0 && (
                <div className="py-3 flex items-start justify-between">
                  <span className="text-sm text-gray-500">Equipment</span>
                  <div className="flex flex-col gap-1 text-right">
                    {selectedEquipment.map((type) => {
                      const eq = SPACE_EQUIPMENT_MAP[space.id]?.find((e) => e.type === type);
                      return <span key={type} className="text-xs text-gray-700">{eq?.label}</span>;
                    })}
                  </div>
                </div>
              )}
              {needsFee && (
                <div className="flex items-center justify-between py-3">
                  <span className="text-sm text-gray-500">Additional fee</span>
                  <span className="text-sm font-semibold text-amber-600">{formatCurrency(BOOKING_RULES.extraBookingFee)} — pay on arrival</span>
                </div>
              )}
            </div>

            <div className="bg-amber-50 rounded-xl p-4 mb-6 border border-amber-100">
              <p className="text-xs text-gray-600 flex items-start gap-2">
                <Info size={13} className="text-amber-400 shrink-0 mt-0.5" />
                <span>
                  <strong className="text-gray-800">No-show policy:</strong> Check in within{" "}
                  <strong className="text-gray-800">{BOOKING_RULES.noShowGracePeriod} minutes</strong> of your slot start time.
                  Late arrivals release the booking and add a flag to your profile.
                </span>
              </p>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setStep("details")}>Edit</Button>
              <Button className="flex-1" loading={loading} onClick={handleBook}>Confirm Booking</Button>
            </div>
          </div>
        )}

        {/* ── STEP: SUCCESS ────────────────────────────────────────────────── */}
        {step === "success" && (
          <div className="text-center space-y-6">
            <div className="flex items-center justify-center">
              <div className="relative w-20 h-20">
                <div className="absolute inset-0 rounded-full bg-emerald-500/20 animate-ping opacity-40" />
                <div className="relative w-20 h-20 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
                  <CheckCircle size={36} className="text-emerald-400" />
                </div>
              </div>
            </div>

            <div>
              <h2 className="font-display text-2xl font-bold text-gray-900">Booking Confirmed</h2>
              <p className="text-gray-500 mt-2 text-sm">
                {space.approvalType === "auto"
                  ? "Your booking is confirmed. Show the code below at reception."
                  : "Request submitted. You will be notified once an admin approves it."}
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-violet-200 shadow-sm mx-auto max-w-xs">
              <p className="text-xs text-gray-400 uppercase tracking-widest mb-3">Your Booking Code</p>
              <p className="font-display text-3xl font-black text-violet-600 tracking-widest mb-4">{bmsCode}</p>
              <button onClick={copyCode}
                className="flex items-center gap-2 mx-auto text-sm text-gray-500 hover:text-gray-800 transition-colors bg-gray-50 px-4 py-2 rounded-xl border border-gray-200 hover:bg-gray-100">
                {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                {copied ? "Copied!" : "Copy code"}
              </button>
            </div>

            {needsFee && (
              <div className="bg-white rounded-2xl p-5 border border-amber-200 shadow-sm text-left">
                <p className="text-sm font-semibold text-amber-300 mb-3 flex items-center gap-2">
                  <Banknote size={15} /> Remember to transfer before arriving
                </p>
                <div className="space-y-2">
                  {[["Bank","First Bank Nigeria"],["Account","AI-UNIPOD UNILAG"],["Number","0123456789"]].map(([l,v]) => (
                    <div key={l} className="flex justify-between text-xs">
                      <span className="text-gray-500">{l}</span>
                      <span className="text-gray-700 font-medium font-mono">{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-col gap-3">
              <Link href="/bookings"><Button className="w-full">View My Bookings</Button></Link>
              <Link href="/spaces"><Button variant="outline" className="w-full">Book Another Space</Button></Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
`);

// ─── 5. Admin bookings — add payment_pending status ──────────────────────────
patch("app/admin/bookings/page.tsx", [
  [
    `import {
  Search,
  CalendarDays,
  Clock,
  Building2,
  CheckCircle,
  XCircle,
  MoreHorizontal,
  Filter,
} from "lucide-react";`,
    `import {
  Search, CalendarDays, Clock, Building2,
  CheckCircle, XCircle, MoreHorizontal, Filter, Banknote,
} from "lucide-react";`,
  ],
  [
    `  no_show:   { label: "No Show", variant: "danger" },
  cancelled: { label: "Cancelled", variant: "neutral" },`,
    `  no_show:         { label: "No Show",      variant: "danger"  },
  cancelled:       { label: "Cancelled",    variant: "neutral" },
  payment_pending: { label: "Awaiting Pay", variant: "warning" },`,
  ],
]);

// ─── 6. Admin settings — replace ToggleLeft/ToggleRight icons with proper CSS toggles ──
write("app/admin/settings/page.tsx", `
"use client";

import { useState } from "react";
import AdminSidebar from "@/components/layout/AdminSidebar";
import { Card } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { Clock, CalendarDays, Save, CheckCircle, AlertCircle, DollarSign, ShieldCheck } from "lucide-react";

interface DaySchedule { enabled: boolean; open: string; close: string; }
type WeekSchedule = Record<string, DaySchedule>;

interface BookingSettings {
  maxAdvanceDays: number;
  noShowGracePeriodMinutes: number;
  extraIndividualFeeNGN: number;
  externalCoworkingFeeNGN: number;
  groupMinMembers: number;
  groupMaxHours: number;
  maintenanceMode: boolean;
  requireJustificationForPremium: boolean;
}

const DEFAULT_SCHEDULE: WeekSchedule = {
  Monday:    { enabled: true,  open: "10:00", close: "17:00" },
  Tuesday:   { enabled: true,  open: "10:00", close: "17:00" },
  Wednesday: { enabled: true,  open: "10:00", close: "17:00" },
  Thursday:  { enabled: true,  open: "10:00", close: "17:00" },
  Friday:    { enabled: true,  open: "10:00", close: "17:00" },
  Saturday:  { enabled: false, open: "10:00", close: "15:00" },
  Sunday:    { enabled: false, open: "10:00", close: "15:00" },
};

const DEFAULT_SETTINGS: BookingSettings = {
  maxAdvanceDays: 14,
  noShowGracePeriodMinutes: 20,
  extraIndividualFeeNGN: 2000,
  externalCoworkingFeeNGN: 3000,
  groupMinMembers: 4,
  groupMaxHours: 3,
  maintenanceMode: false,
  requireJustificationForPremium: true,
};

// ── Reusable toggle switch component ─────────────────────────────────────────
function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      role="switch"
      aria-checked={checked}
      className={\`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent
        transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500
        \${checked ? "bg-brand-500" : "bg-gray-200"}\`}
    >
      <span
        className={\`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow
          transition duration-200 ease-in-out \${checked ? "translate-x-5" : "translate-x-0"}\`}
      />
    </button>
  );
}

export default function AdminSettingsPage() {
  const [schedule,       setSchedule]       = useState<WeekSchedule>(DEFAULT_SCHEDULE);
  const [settings,       setSettings]       = useState<BookingSettings>(DEFAULT_SETTINGS);
  const [savingSchedule, setSavingSchedule] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);
  const [scheduleSaved,  setScheduleSaved]  = useState(false);
  const [settingsSaved,  setSettingsSaved]  = useState(false);

  const updateDay = (day: string, field: keyof DaySchedule, value: string | boolean) => {
    setSchedule((prev) => ({ ...prev, [day]: { ...prev[day], [field]: value } }));
    setScheduleSaved(false);
  };

  const handleSaveSchedule = async () => {
    setSavingSchedule(true);
    await new Promise((r) => setTimeout(r, 900));
    setSavingSchedule(false);
    setScheduleSaved(true);
  };

  const handleSaveSettings = async () => {
    setSavingSettings(true);
    await new Promise((r) => setTimeout(r, 900));
    setSavingSettings(false);
    setSettingsSaved(true);
  };

  const inputCls = "w-full px-3 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white";

  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar />

      <div className="flex-1 overflow-auto">
        <main className="max-w-4xl mx-auto px-6 py-8 space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">System Settings</h1>
            <p className="text-sm text-gray-500 mt-0.5">Configure operating hours, booking rules, and system behaviour.</p>
          </div>

          {/* Maintenance mode warning banner */}
          {settings.maintenanceMode && (
            <div className="flex items-start gap-3 bg-red-50 border border-red-100 rounded-2xl px-4 py-3">
              <AlertCircle size={16} className="text-red-500 shrink-0 mt-0.5" />
              <p className="text-sm text-red-700 font-medium">
                Maintenance mode is ON — new bookings are blocked for all users.
              </p>
            </div>
          )}

          {/* Operating hours */}
          <Card>
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                <Clock size={16} className="text-brand-500" /> Operating Hours
              </h2>
              {scheduleSaved && (
                <span className="flex items-center gap-1 text-xs text-green-600 font-medium">
                  <CheckCircle size={13} /> Saved
                </span>
              )}
            </div>

            <div className="space-y-3">
              {Object.entries(schedule).map(([day, config]) => (
                <div key={day} className="flex items-center gap-4">
                  <div className="w-36 flex items-center gap-3">
                    <Toggle
                      checked={config.enabled}
                      onChange={() => updateDay(day, "enabled", !config.enabled)}
                    />
                    <span className={\`text-sm font-medium \${config.enabled ? "text-gray-800" : "text-gray-400"}\`}>
                      {day}
                    </span>
                  </div>

                  {config.enabled ? (
                    <div className="flex items-center gap-2">
                      <input type="time" value={config.open}
                        onChange={(e) => updateDay(day, "open", e.target.value)}
                        className="px-3 py-1.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
                      <span className="text-gray-400 text-sm">to</span>
                      <input type="time" value={config.close}
                        onChange={(e) => updateDay(day, "close", e.target.value)}
                        className="px-3 py-1.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
                    </div>
                  ) : (
                    <span className="text-sm text-gray-400 italic">Closed</span>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-5 pt-4 border-t border-gray-100">
              <Button size="sm" loading={savingSchedule} onClick={handleSaveSchedule}>
                <Save size={13} /> Save Operating Hours
              </Button>
            </div>
          </Card>

          {/* Booking rules */}
          <Card>
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                <CalendarDays size={16} className="text-brand-500" /> Booking Rules
              </h2>
              {settingsSaved && (
                <span className="flex items-center gap-1 text-xs text-green-600 font-medium">
                  <CheckCircle size={13} /> Saved
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="text-xs text-gray-500 font-medium mb-1.5 block">Max advance booking (days)</label>
                <input type="number" min={1} max={30} value={settings.maxAdvanceDays}
                  onChange={(e) => setSettings({ ...settings, maxAdvanceDays: parseInt(e.target.value) || 1 })}
                  className={inputCls} />
                <p className="text-xs text-gray-400 mt-1">Users can book up to this many days ahead.</p>
              </div>
              <div>
                <label className="text-xs text-gray-500 font-medium mb-1.5 block">No-show grace period (minutes)</label>
                <input type="number" min={5} max={60} value={settings.noShowGracePeriodMinutes}
                  onChange={(e) => setSettings({ ...settings, noShowGracePeriodMinutes: parseInt(e.target.value) || 5 })}
                  className={inputCls} />
                <p className="text-xs text-gray-400 mt-1">Time after slot start before marking no-show.</p>
              </div>
              <div>
                <label className="text-xs text-gray-500 font-medium mb-1.5 block">Group min members</label>
                <input type="number" min={2} max={10} value={settings.groupMinMembers}
                  onChange={(e) => setSettings({ ...settings, groupMinMembers: parseInt(e.target.value) || 2 })}
                  className={inputCls} />
              </div>
              <div>
                <label className="text-xs text-gray-500 font-medium mb-1.5 block">Group max duration (hours)</label>
                <input type="number" min={1} max={8} value={settings.groupMaxHours}
                  onChange={(e) => setSettings({ ...settings, groupMaxHours: parseInt(e.target.value) || 1 })}
                  className={inputCls} />
              </div>
            </div>

            {/* Fees */}
            <div className="mt-5 pt-5 border-t border-gray-100">
              <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-4">
                <DollarSign size={14} className="text-brand-500" /> Fee Configuration
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="text-xs text-gray-500 font-medium mb-1.5 block">Regular Student extra fee (₦)</label>
                  <input type="number" min={0} step={500} value={settings.extraIndividualFeeNGN}
                    onChange={(e) => setSettings({ ...settings, extraIndividualFeeNGN: parseInt(e.target.value) || 0 })}
                    className={inputCls} />
                  <p className="text-xs text-gray-400 mt-1">Applied from the 4th individual booking per week.</p>
                </div>
                <div>
                  <label className="text-xs text-gray-500 font-medium mb-1.5 block">External co-working fee (₦)</label>
                  <input type="number" min={0} step={500} value={settings.externalCoworkingFeeNGN}
                    onChange={(e) => setSettings({ ...settings, externalCoworkingFeeNGN: parseInt(e.target.value) || 0 })}
                    className={inputCls} />
                  <p className="text-xs text-gray-400 mt-1">Daily fee for external user co-working access.</p>
                </div>
              </div>
            </div>

            {/* System flags with proper toggle switches */}
            <div className="mt-5 pt-5 border-t border-gray-100 space-y-3">
              <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-4">
                <ShieldCheck size={14} className="text-brand-500" /> System Flags
              </h3>

              <div className="flex items-center justify-between p-4 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition-colors">
                <div>
                  <p className="text-sm font-medium text-gray-800">Maintenance Mode</p>
                  <p className="text-xs text-gray-400 mt-0.5">Block all new bookings site-wide until turned off.</p>
                </div>
                <Toggle
                  checked={settings.maintenanceMode}
                  onChange={() => setSettings({ ...settings, maintenanceMode: !settings.maintenanceMode })}
                />
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition-colors">
                <div>
                  <p className="text-sm font-medium text-gray-800">Require Justification for Premium Spaces</p>
                  <p className="text-xs text-gray-400 mt-0.5">Users must explain their use case for AI Lab, Maker Space, VR Lab, etc.</p>
                </div>
                <Toggle
                  checked={settings.requireJustificationForPremium}
                  onChange={() => setSettings({ ...settings, requireJustificationForPremium: !settings.requireJustificationForPremium })}
                />
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-gray-100">
              <Button size="sm" loading={savingSettings} onClick={handleSaveSettings}>
                <Save size={13} /> Save Booking Settings
              </Button>
            </div>
          </Card>
        </main>
      </div>
    </div>
  );
}
`);

console.log("\n✅ patch-pages.js complete.");
