/**
 * patch-pages.js — Runs before `npm run build` on Vercel.
 * Fixes applied at build time:
 *   1. Calendar safety valve (utils.ts)
 *   2. Space image corrections (spaces.ts)
 *   3. Remove Admin Login from landing page (page.tsx)
 *   4. Booking page rewrite — bank transfer, equipment photos, scrollable calendar
 *   5. Admin bookings — payment_pending status
 *   6. Admin settings — proper CSS toggle switches
 *   7. Resource-request page — space photos grouped by lab
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

// ─── 7. Resource-request page — grouped by space with photos ─────────────────
write("app/resource-request/page.tsx", `
"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/layout/Navbar";
import { Card } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { TIER_LABELS } from "@/lib/data/tiers";
import { generateBMSCode } from "@/lib/utils";
import { ChevronLeft, CheckCircle, ArrowRight, Info, Clock } from "lucide-react";
import type { UserTier, ResourceType } from "@/types";

const currentUserTier: UserTier = "product_developer";

// Each space group has a photo + its equipment items
const SPACE_GROUPS = [
  {
    space: "AI & Robotics Lab",
    image: "/spaces/image4.jpeg",
    equipment: [
      { value: "gpu_workstation"   as ResourceType, label: "GPU Workstation",    desc: "NVIDIA-powered station for ML model training" },
      { value: "robotics_kit"      as ResourceType, label: "Robotics Kit",       desc: "Arduino + servo arms + full sensor pack" },
      { value: "pcb_printer"       as ResourceType, label: "PCB Printer",        desc: "Circuit board fabrication printer" },
      { value: "soldering_station" as ResourceType, label: "Soldering Station",  desc: "Professional soldering iron + tools" },
    ],
  },
  {
    space: "Maker Space",
    image: "/spaces/image7.jpeg",
    equipment: [
      { value: "3d_printer_medium" as ResourceType, label: "3D Printer (Medium)", desc: "FDM printer — up to 25 × 25 × 25 cm" },
      { value: "3d_printer_large"  as ResourceType, label: "3D Printer (Large)",  desc: "FDM printer — up to 40 × 40 × 40 cm" },
      { value: "3d_printer_resin"  as ResourceType, label: "3D Printer (Resin)",  desc: "High-detail SLA resin printer" },
      { value: "laser_cutter"      as ResourceType, label: "Laser Cutter",        desc: "60W CO₂ cutter — wood, acrylic, leather" },
      { value: "vinyl_cutter"      as ResourceType, label: "Vinyl Cutter",        desc: "Precision cutting for signage & stickers" },
      { value: "vacuum_former"     as ResourceType, label: "Vacuum Former",       desc: "Thermoforming for plastic moulding" },
      { value: "3d_scanner"        as ResourceType, label: "3D Scanner",          desc: "Handheld photogrammetry scanner" },
    ],
  },
  {
    space: "VR Lab",
    image: "/spaces/image22.jpeg",
    equipment: [
      { value: "vr_headset"     as ResourceType, label: "VR Headset",      desc: "Meta Quest 3 with controllers" },
      { value: "motion_tracker" as ResourceType, label: "Motion Tracker",   desc: "Full-body motion capture system" },
    ],
  },
];

const ALL_RESOURCES = SPACE_GROUPS.flatMap((g) =>
  g.equipment.map((e) => ({ ...e, space: g.space }))
);

const TIME_WINDOWS = [
  "10:00 AM – 11:00 AM",
  "11:00 AM – 12:00 PM",
  "12:00 PM – 1:00 PM",
  "1:00 PM – 2:00 PM",
  "2:00 PM – 3:00 PM",
  "3:00 PM – 4:00 PM",
  "4:00 PM – 5:00 PM",
];

type Step = "form" | "success";

export default function ResourceRequestPage() {
  const [step, setStep] = useState<Step>("form");
  const [loading, setLoading] = useState(false);
  const [bmsCode, setBmsCode] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [form, setForm] = useState({
    resourceType: "" as ResourceType | "",
    preferredDate: "",
    preferredTimeWindow: "",
    estimatedDuration: "",
    justification: "",
  });

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
    setLoading(true);
    // TODO: POST /api/resource-requests with form data
    await new Promise((r) => setTimeout(r, 1200));
    setBmsCode(generateBMSCode());
    setStep("success");
    setLoading(false);
  };

  const selectedResource = ALL_RESOURCES.find((r) => r.value === form.resourceType);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar
        user={{
          name: "Tolu Adeyemi",
          tier: currentUserTier,
          tierLabel: TIER_LABELS[currentUserTier],
        }}
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
                Premium equipment requires a separate request and admin approval. Requests
                go into the approval queue — you&apos;ll be notified by email.
              </p>
            </Card>

            {/* Access note */}
            <Card className="bg-brand-50 border-brand-100">
              <div className="flex items-start gap-3">
                <Info size={16} className="text-brand-500 shrink-0 mt-0.5" />
                <p className="text-sm text-brand-700">
                  Resources are available to Product Developers, Volunteers, Startup Teams,
                  Lecturers, and Partners. Regular Students do not have access to premium resources.
                </p>
              </div>
            </Card>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Resource selection — grouped by space with banner photos */}
              <Card>
                <h2 className="font-semibold text-gray-800 mb-4">Select Resource</h2>
                <div className="space-y-6">
                  {SPACE_GROUPS.map((group) => (
                    <div key={group.space}>
                      {/* Space photo banner */}
                      <div className="relative w-full h-28 rounded-xl overflow-hidden mb-3">
                        <Image
                          src={group.image}
                          alt={group.space}
                          fill
                          className="object-cover"
                          sizes="(max-width: 640px) 100vw, 672px"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent flex items-end p-3">
                          <span className="text-white font-semibold text-sm tracking-wide">
                            {group.space}
                          </span>
                        </div>
                      </div>
                      {/* Equipment items grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {group.equipment.map(({ value, label, desc }) => (
                          <button
                            key={value}
                            type="button"
                            onClick={() => setForm({ ...form, resourceType: value })}
                            className={\`text-left px-3 py-2.5 rounded-xl border transition-all \${
                              form.resourceType === value
                                ? "border-brand-500 bg-brand-50 text-brand-700 shadow-sm"
                                : "border-gray-200 hover:border-brand-300 text-gray-700 bg-white"
                            }\`}
                          >
                            <p className="text-sm font-medium">{label}</p>
                            <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                {errors.resourceType && (
                  <p className="text-xs text-red-500 mt-3">{errors.resourceType}</p>
                )}
              </Card>

              {/* Date + time */}
              <Card>
                <h2 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <Clock size={16} className="text-brand-500" /> Preferred Date & Time
                </h2>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gray-500 font-medium mb-1.5 block">
                      Preferred date
                    </label>
                    <input
                      type="date"
                      value={form.preferredDate}
                      onChange={(e) => setForm({ ...form, preferredDate: e.target.value })}
                      min={new Date().toISOString().split("T")[0]}
                      className="w-full px-3 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                    {errors.preferredDate && (
                      <p className="text-xs text-red-500 mt-1">{errors.preferredDate}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 font-medium mb-1.5 block">
                      Time window
                    </label>
                    <select
                      value={form.preferredTimeWindow}
                      onChange={(e) => setForm({ ...form, preferredTimeWindow: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
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
                  <label className="text-xs text-gray-500 font-medium mb-1.5 block">
                    Estimated duration needed
                  </label>
                  <select
                    value={form.estimatedDuration}
                    onChange={(e) => setForm({ ...form, estimatedDuration: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
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
                <h2 className="font-semibold text-gray-800 mb-1">
                  Why do you need this resource?
                </h2>
                <p className="text-xs text-gray-400 mb-3">
                  Required — minimum 2–4 sentences. Describe your project, what you&apos;re building,
                  and how this resource supports your work.
                </p>
                <textarea
                  rows={5}
                  placeholder="e.g. I am working on a computer vision prototype for my final year project. I need the GPU workstation to train a CNN model on a dataset of 10,000 images. The training will take approximately 3 hours on a standard CPU but only 20 minutes with GPU acceleration..."
                  value={form.justification}
                  onChange={(e) => setForm({ ...form, justification: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
                />
                <p className="text-xs text-gray-400 mt-1 text-right">
                  {form.justification.length} chars
                </p>
                {errors.justification && (
                  <p className="text-xs text-red-500 mt-1">{errors.justification}</p>
                )}
              </Card>

              <Button type="submit" className="w-full" size="lg" loading={loading}>
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
              <strong>
                {ALL_RESOURCES.find((r) => r.value === form.resourceType)?.label}
              </strong>{" "}
              is now in the admin approval queue. You will receive an email notification once
              it&apos;s reviewed — usually within 24 hours.
            </p>

            {selectedResource && (
              <div className="bg-gray-50 rounded-xl px-5 py-4 my-5 text-left text-sm space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-500">Resource</span>
                  <span className="font-medium">{selectedResource.label}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Location</span>
                  <span className="font-medium">{selectedResource.space}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Preferred date</span>
                  <span className="font-medium">{form.preferredDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Time window</span>
                  <span className="font-medium">{form.preferredTimeWindow}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Reference</span>
                  <span className="font-mono font-bold text-brand-700">{bmsCode}</span>
                </div>
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
`);

// ─── 8. Admin login — impressive split layout (photo left, form right) ────────
write("app/admin/login/page.tsx", `
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ShieldCheck, Eye, EyeOff, Lock, Mail, AlertCircle } from "lucide-react";
import Button from "@/components/ui/Button";
import type { AdminRole } from "@/types";

const ROLE_REDIRECTS: Record<AdminRole, string> = {
  super_admin:  "/superadmin",
  admin:        "/admin",
  receptionist: "/admin/checkin",
  space_lead:   "/admin/space-lead",
};

const ROLE_LABELS: Record<AdminRole, string> = {
  super_admin:  "Super Admin",
  admin:        "Admin",
  receptionist: "Receptionist",
  space_lead:   "Space Lead",
};

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw]     = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email || !password) { setError("Please enter your email and password."); return; }
    setLoading(true);
    // TODO: POST /api/admin/auth/login
    await new Promise((r) => setTimeout(r, 900));
    let mockRole: AdminRole = "admin";
    if (email.includes("super"))      mockRole = "super_admin";
    else if (email.includes("recep")) mockRole = "receptionist";
    else if (email.includes("lead"))  mockRole = "space_lead";
    setLoading(false);
    router.push(ROLE_REDIRECTS[mockRole]);
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">

      {/* Left panel — workspace visual */}
      <div className="hidden lg:flex flex-col flex-1 relative bg-blue-900 overflow-hidden">
        <Image src="/spaces/image4.jpeg" alt="AI-UNIPOD workspace" fill className="object-cover opacity-35" priority />
        <div className="relative z-10 flex flex-col h-full p-10">
          <div>
            <p className="font-bold text-white text-lg font-mono tracking-wider">AI-UNIPOD</p>
            <p className="text-blue-300 text-xs tracking-widest uppercase mt-0.5">University of Lagos · BMS</p>
          </div>
          <div className="flex-1 flex flex-col justify-center max-w-sm">
            <h1 className="text-4xl font-bold text-white leading-tight mb-4">
              Innovation Hub<br/>
              <span className="text-blue-300">Admin Portal</span>
            </h1>
            <p className="text-blue-100 text-sm leading-relaxed">
              Manage bookings, verify members, monitor all UNIPOD spaces and broadcast
              announcements — all from one unified dashboard.
            </p>
            <div className="mt-8 grid grid-cols-2 gap-3">
              {[
                { value: "12",   label: "Managed Spaces"   },
                { value: "500+", label: "Active Members"   },
                { value: "9hrs", label: "Daily Operations" },
                { value: "100%", label: "Digital Workflow" },
              ].map(({ value, label }) => (
                <div key={label} className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                  <p className="text-2xl font-bold text-white">{value}</p>
                  <p className="text-blue-200 text-xs mt-0.5">{label}</p>
                </div>
              ))}
            </div>
          </div>
          <p className="text-blue-400 text-xs">All access is logged · Authorised UNIPOD staff only</p>
        </div>
      </div>

      {/* Right panel — login form */}
      <div className="flex-1 lg:max-w-md flex flex-col justify-center px-6 sm:px-10 py-12 bg-white min-h-screen lg:min-h-0">
        {/* Mobile brand */}
        <div className="lg:hidden flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center shrink-0">
            <ShieldCheck size={20} className="text-white" />
          </div>
          <div>
            <p className="font-bold text-blue-600 font-mono text-sm">AI-UNIPOD</p>
            <p className="text-xs text-gray-400">Admin Portal</p>
          </div>
        </div>

        <div className="max-w-sm w-full mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-1">Sign in</h2>
          <p className="text-sm text-gray-500 mb-8">Enter your admin credentials to continue</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Admin email</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email" autoComplete="email"
                  placeholder="admin@unipod.unilag.edu.ng"
                  value={email} onChange={(e) => setEmail(e.target.value)}
                  className="w-full border border-gray-300 text-gray-900 placeholder-gray-400 text-sm rounded-xl pl-9 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Password</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showPw ? "text" : "password"} autoComplete="current-password"
                  placeholder="••••••••"
                  value={password} onChange={(e) => setPassword(e.target.value)}
                  className="w-full border border-gray-300 text-gray-900 placeholder-gray-400 text-sm rounded-xl pl-9 pr-10 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-3 py-2.5">
                <AlertCircle size={14} className="text-red-500 shrink-0" />
                <p className="text-xs text-red-700">{error}</p>
              </div>
            )}

            <Button type="submit" className="w-full" size="lg" loading={loading}>
              <ShieldCheck size={15} /> Sign in to Portal
            </Button>
          </form>

          <div className="mt-8 bg-gray-50 rounded-2xl p-4">
            <p className="text-xs text-gray-500 font-semibold mb-2">Access levels</p>
            <div className="space-y-1.5">
              {(Object.entries(ROLE_LABELS) as [AdminRole, string][]).map(([, label]) => (
                <div key={label} className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0" />
                  <span className="text-xs text-gray-500">{label}</span>
                </div>
              ))}
            </div>
          </div>

          <p className="mt-6 text-center text-xs text-gray-400">
            Member access?{" "}
            <a href="/auth/login" className="text-blue-600 hover:underline font-medium">Sign in here</a>
          </p>
        </div>
      </div>
    </div>
  );
}
`);

// ─── 9. Auth login — remove dark gradient ─────────────────────────────────────
patch("app/auth/login/page.tsx", [
  [
    'className="min-h-screen bg-gradient-to-br from-brand-950 via-brand-900 to-brand-800 flex items-center justify-center px-4"',
    'className="min-h-screen bg-gray-50 flex items-center justify-center px-4"',
  ],
  [
    'className="inline-flex items-center gap-2 text-brand-300 hover:text-white text-sm mb-8 transition-colors"',
    'className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-800 text-sm mb-8 transition-colors"',
  ],
  [
    'className="w-10 h-10 rounded-xl bg-brand-100 flex items-center justify-center mb-4"',
    'className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center mb-4"',
  ],
  [
    '<span className="text-brand-700 font-bold text-lg">U</span>',
    '<span className="text-white font-bold text-sm font-mono">U</span>',
  ],
]);

// ─── 10. Auth signup — remove dark gradient ────────────────────────────────────
patch("app/auth/signup/page.tsx", [
  [
    'className="min-h-screen bg-gradient-to-br from-brand-950 via-brand-900 to-brand-800 flex items-center justify-center px-4 py-12"',
    'className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12"',
  ],
  [
    'className="inline-flex items-center gap-2 text-brand-300 hover:text-white text-sm mb-8 transition-colors"',
    'className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-800 text-sm mb-8 transition-colors"',
  ],
  [
    'className="w-10 h-10 rounded-xl bg-brand-100 flex items-center justify-center mb-4"',
    'className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center mb-4"',
  ],
  [
    '<span className="text-brand-700 font-bold text-lg">U</span>',
    '<span className="text-white font-bold text-sm font-mono">U</span>',
  ],
]);

// ─── 11. Bookings list — rewrite without QR code button ───────────────────────
write("app/bookings/page.tsx", `
import Navbar from "@/components/layout/Navbar";
import { Card } from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Link from "next/link";
import { TIER_LABELS } from "@/lib/data/tiers";
import { formatDate, formatTime } from "@/lib/utils";
import { CalendarDays, Clock, ArrowRight, Plus } from "lucide-react";
import type { UserTier } from "@/types";

const currentUserTier: UserTier = "regular_student";

const mockBookings = [
  { id: "bk-001", bmsCode: "BMS-2025-T4K9P", space: "Co-working Space",    date: "2025-07-17", startTime: "10:00", endTime: "12:00", status: "confirmed",  type: "individual" },
  { id: "bk-00a", bmsCode: "BMS-2025-A1B2C", space: "Design Studio",       date: "2025-07-14", startTime: "13:00", endTime: "15:00", status: "completed",  type: "individual" },
  { id: "bk-00b", bmsCode: "BMS-2025-D3E4F", space: "AI & Robotics Lab",   date: "2025-07-10", startTime: "10:00", endTime: "13:00", status: "no_show",    type: "individual" },
  { id: "bk-00c", bmsCode: "BMS-2025-G5H6I", space: "Pitch Garage",        date: "2025-07-07", startTime: "14:00", endTime: "16:00", status: "completed",  type: "group"      },
  { id: "bk-00d", bmsCode: "BMS-2025-J7K8L", space: "Collaboration Space", date: "2025-07-03", startTime: "11:00", endTime: "13:00", status: "cancelled",  type: "group"      },
];

const statusConfig: Record<string, { label: string; variant: "success" | "danger" | "neutral" | "warning" | "info" }> = {
  confirmed:  { label: "Confirmed",        variant: "info"    },
  checked_in: { label: "Checked In",       variant: "success" },
  completed:  { label: "Completed",        variant: "success" },
  cancelled:  { label: "Cancelled",        variant: "neutral" },
  no_show:    { label: "No Show",          variant: "danger"  },
  pending:    { label: "Pending Approval", variant: "warning" },
  rejected:   { label: "Rejected",         variant: "danger"  },
};

export default function BookingsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={{ name: "Tolu Adeyemi", tier: currentUserTier, tierLabel: TIER_LABELS[currentUserTier] }} />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Bookings</h1>
            <p className="text-sm text-gray-500 mt-0.5">{mockBookings.length} bookings total</p>
          </div>
          <Link href="/spaces">
            <Button size="sm"><Plus size={14} /> New Booking</Button>
          </Link>
        </div>

        <div className="space-y-3">
          {mockBookings.map((b) => {
            const s = statusConfig[b.status];
            return (
              <Card key={b.id} className="hover:shadow-md transition-all">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      <h3 className="font-semibold text-gray-900">{b.space}</h3>
                      <Badge variant={s.variant} size="sm">{s.label}</Badge>
                      {b.type === "group" && <Badge variant="neutral" size="sm">Group</Badge>}
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 mb-2">
                      <span className="flex items-center gap-1.5"><CalendarDays size={13} /> {formatDate(b.date)}</span>
                      <span className="flex items-center gap-1.5"><Clock size={13} /> {formatTime(b.startTime)} – {formatTime(b.endTime)}</span>
                    </div>
                    <p className="text-xs font-mono text-blue-600 bg-blue-50 inline-block px-2 py-0.5 rounded-md">{b.bmsCode}</p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    {b.status === "confirmed" && (
                      <Link href={\`/bookings/\${b.id}\`}>
                        <Button variant="secondary" size="sm">Details <ArrowRight size={13} /></Button>
                      </Link>
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
`);

// ─── 12a. Admin pages — add mobile top-bar offset (pt-14 lg:pt-0) ─────────────
for (const file of [
  "app/admin/page.tsx",
  "app/admin/users/page.tsx",
  "app/admin/spaces/page.tsx",
  "app/admin/checkin/page.tsx",
  "app/admin/broadcast/page.tsx",
  "app/admin/space-lead/page.tsx",
]) {
  patch(file, [
    ['<div className="flex-1 overflow-auto">', '<div className="flex-1 overflow-auto pt-14 lg:pt-0">'],
  ]);
}

// ─── 12b. Dashboard — remove "View QR" reference ──────────────────────────────
patch("app/dashboard/page.tsx", [
  ["View QR <ArrowRight size={14} />", "View Details <ArrowRight size={14} />"],
  ["View QR<",                         "View Details<"],
]);

// ─── 12c. Booking confirmation — remove all QR code text ─────────────────────
patch("app/spaces/[id]/book/page.tsx", [
  ["A confirmation email with your QR code and booking code", "A confirmation email with your booking code"],
  ["You'll receive an email with your QR code once approved.", "You'll receive a confirmation email once approved."],
  ["Present this code or your QR code to the receptionist",   "Present this booking code to the receptionist"],
  ["with your QR code",                                        "with your booking details"],
]);

// ─── 13. Space-lead page — convert dark → light theme ────────────────────────
write("app/admin/space-lead/page.tsx", `
"use client";

import { useState } from "react";
import {
  ShieldCheck,
  ScanLine,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Cpu,
  AlertCircle,
  RotateCcw,
  Building2,
  LogOut,
} from "lucide-react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import type { EquipmentAccessCode } from "@/types";

const MOCK_PENDING_CODES: EquipmentAccessCode[] = [
  {
    id: "eq-001",
    code: "EQ-2025-T4K9P",
    bookingId: "bk-101",
    bmsCode: "BMS-2025-A7X3K",
    userId: "u-201",
    userName: "Adeola Fashola",
    equipmentType: "3d_printer_medium",
    equipmentLabel: "3D Printer (Medium)",
    spaceId: "maker-space",
    spaceName: "Maker Space",
    status: "active",
    generatedAt: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
  },
  {
    id: "eq-002",
    code: "EQ-2025-X8M2Q",
    bookingId: "bk-102",
    bmsCode: "BMS-2025-B3R1W",
    userId: "u-202",
    userName: "Chukwuemeka Obi",
    equipmentType: "laser_cutter",
    equipmentLabel: "Laser Cutter",
    spaceId: "maker-space",
    spaceName: "Maker Space",
    status: "active",
    generatedAt: new Date(Date.now() - 3 * 60 * 1000).toISOString(),
  },
];

const MOCK_VERIFIED: EquipmentAccessCode[] = [
  {
    id: "eq-000",
    code: "EQ-2025-Z2K7V",
    bookingId: "bk-099",
    bmsCode: "BMS-2025-C9N5D",
    userId: "u-199",
    userName: "Precious Okonkwo",
    equipmentType: "vinyl_cutter",
    equipmentLabel: "Vinyl Cutter",
    spaceId: "maker-space",
    spaceName: "Maker Space",
    status: "used",
    generatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    usedAt: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
    usedByAdminId: "a-003",
  },
];

function timeAgo(iso: string) {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60) return \`\${diff}s ago\`;
  if (diff < 3600) return \`\${Math.floor(diff / 60)}m ago\`;
  return \`\${Math.floor(diff / 3600)}h ago\`;
}

type VerifyState = "idle" | "loading" | "success" | "error";

export default function SpaceLeadPage() {
  const [inputCode, setInputCode]         = useState("");
  const [verifyState, setVerifyState]     = useState<VerifyState>("idle");
  const [verifiedItem, setVerifiedItem]   = useState<EquipmentAccessCode | null>(null);
  const [errorMessage, setErrorMessage]   = useState("");
  const [pendingCodes, setPendingCodes]   = useState<EquipmentAccessCode[]>(MOCK_PENDING_CODES);
  const [verifiedCodes, setVerifiedCodes] = useState<EquipmentAccessCode[]>(MOCK_VERIFIED);

  const verifyCode = async (codeToVerify: string) => {
    const code = codeToVerify.trim().toUpperCase();
    if (!code) return;
    setVerifyState("loading");
    setErrorMessage("");
    setVerifiedItem(null);
    // TODO: POST /api/admin/equipment-codes/verify
    await new Promise((r) => setTimeout(r, 900));
    const found = pendingCodes.find((c) => c.code === code);
    if (!found) {
      setVerifyState("error");
      setErrorMessage(
        code.startsWith("EQ-")
          ? "Code not found or already used. It may have expired."
          : "Invalid format. Equipment codes look like EQ-2025-XXXXX."
      );
      return;
    }
    const now = new Date().toISOString();
    const verified: EquipmentAccessCode = { ...found, status: "used", usedAt: now, usedByAdminId: "a-003" };
    setPendingCodes((prev) => prev.filter((c) => c.id !== found.id));
    setVerifiedCodes((prev) => [verified, ...prev]);
    setVerifiedItem(verified);
    setVerifyState("success");
    setInputCode("");
  };

  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); verifyCode(inputCode); };
  const reset = () => { setVerifyState("idle"); setVerifiedItem(null); setErrorMessage(""); setInputCode(""); };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center">
            <Building2 size={16} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900">Space Lead — Maker Space</p>
            <p className="text-xs text-gray-500">Equipment access verification</p>
          </div>
        </div>
        <Link href="/admin/login">
          <Button variant="ghost" size="sm">
            <LogOut size={13} /> Sign out
          </Button>
        </Link>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8 space-y-6">
        <Card className="bg-brand-50 border-brand-100">
          <div className="flex items-start gap-3">
            <ShieldCheck size={15} className="text-brand-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-brand-700 mb-0.5">How equipment verification works</p>
              <p className="text-xs text-brand-600 leading-relaxed">
                When a user checks in at reception and has requested equipment from your space, the receptionist generates a one-time code (EQ-YYYY-XXXXX) and gives it to the user. The user shows you this code — you enter it below to confirm they are authorised to use that equipment. The code expires the moment you verify it.
              </p>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <Card>
              <h2 className="font-semibold text-gray-900 flex items-center gap-2 mb-4">
                <ScanLine size={16} className="text-brand-500" /> Verify Equipment Code
              </h2>

              {verifyState === "success" && verifiedItem ? (
                <div className="text-center py-4">
                  <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-3">
                    <CheckCircle size={28} className="text-green-600" />
                  </div>
                  <p className="text-green-600 font-bold text-lg">{verifiedItem.code}</p>
                  <p className="text-gray-900 font-semibold mt-1">{verifiedItem.userName}</p>
                  <p className="text-sm text-gray-500 mt-0.5">
                    is authorised to use the{" "}
                    <span className="text-brand-600 font-medium">{verifiedItem.equipmentLabel}</span>
                  </p>
                  <Badge variant="success" className="mt-3">Code used — now expired</Badge>
                  <div className="mt-4">
                    <Button variant="outline" size="sm" onClick={reset}>
                      <RotateCcw size={13} /> Verify another code
                    </Button>
                  </div>
                </div>
              ) : verifyState === "error" ? (
                <div className="text-center py-4">
                  <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-3">
                    <XCircle size={28} className="text-red-500" />
                  </div>
                  <p className="text-red-600 font-semibold">Verification failed</p>
                  <p className="text-sm text-gray-500 mt-1">{errorMessage}</p>
                  <div className="mt-4">
                    <Button variant="outline" size="sm" onClick={reset}>
                      <RotateCcw size={13} /> Try again
                    </Button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-3">
                  <div>
                    <label className="text-xs text-gray-500 font-medium mb-1.5 block">
                      Enter equipment access code
                    </label>
                    <input
                      type="text"
                      value={inputCode}
                      onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                      placeholder="EQ-2025-XXXXX"
                      autoFocus
                      className="w-full bg-white border border-gray-300 text-gray-900 text-sm font-mono tracking-widest rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-500 placeholder-gray-400"
                    />
                    <p className="text-xs text-gray-400 mt-1">
                      The user should show you this code from the receptionist.
                    </p>
                  </div>
                  <Button type="submit" className="w-full" loading={verifyState === "loading"}>
                    <ShieldCheck size={14} /> Verify & Confirm Access
                  </Button>
                </form>
              )}
            </Card>

            <Card>
              <h3 className="font-semibold text-gray-800 text-sm flex items-center gap-2 mb-3">
                <Clock size={13} className="text-yellow-500" />
                Pending for this space
                {pendingCodes.length > 0 && (
                  <span className="ml-auto bg-yellow-100 text-yellow-700 text-xs font-bold px-2 py-0.5 rounded-full">
                    {pendingCodes.length}
                  </span>
                )}
              </h3>
              {pendingCodes.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-4">No pending equipment codes.</p>
              ) : (
                <div className="space-y-2">
                  {pendingCodes.map((code) => (
                    <div
                      key={code.id}
                      className="flex items-center justify-between bg-gray-50 border border-gray-100 rounded-xl px-3 py-2.5"
                    >
                      <div>
                        <p className="text-xs font-mono font-bold text-yellow-600">{code.code}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <p className="text-xs text-gray-600">{code.userName}</p>
                          <span className="text-gray-300">·</span>
                          <p className="text-xs text-gray-500">{code.equipmentLabel}</p>
                        </div>
                        <p className="text-xs text-gray-400 mt-0.5">Generated {timeAgo(code.generatedAt)}</p>
                      </div>
                      <Button size="sm" onClick={() => verifyCode(code.code)}>
                        Verify
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>

          <div>
            <Card>
              <h3 className="font-semibold text-gray-800 text-sm flex items-center gap-2 mb-3">
                <CheckCircle size={13} className="text-green-500" /> Verified Today
              </h3>
              {verifiedCodes.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-4">No verifications yet today.</p>
              ) : (
                <div className="space-y-2">
                  {verifiedCodes.map((code) => (
                    <div key={code.id} className="bg-gray-50 border border-gray-100 rounded-xl px-3 py-2.5 space-y-1">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-mono text-gray-500">{code.code}</p>
                        <Badge variant="success" size="sm">Used</Badge>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <User size={11} className="text-gray-400" />
                        <p className="text-xs text-gray-700">{code.userName}</p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Cpu size={11} className="text-gray-400" />
                        <p className="text-xs text-gray-500">{code.equipmentLabel}</p>
                      </div>
                      {code.usedAt && (
                        <p className="text-xs text-gray-400">Verified {timeAgo(code.usedAt)}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
`);

// ─── 14. Superadmin overview — convert dark → light theme ─────────────────────
write("app/superadmin/page.tsx", `
"use client";

import Link from "next/link";
import {
  ShieldCheck,
  Users,
  Building2,
  CalendarCheck,
  UserPlus,
  Settings,
  Megaphone,
  BarChart2,
  TrendingUp,
  AlertTriangle,
  LogOut,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";

const STATS = [
  { label: "Total Admin Accounts", value: "8",   icon: ShieldCheck,  color: "text-brand-600",  bg: "bg-brand-50" },
  { label: "Active Users",         value: "214", icon: Users,        color: "text-green-600",  bg: "bg-green-50" },
  { label: "Bookings This Week",   value: "47",  icon: CalendarCheck,color: "text-blue-600",   bg: "bg-blue-50" },
  { label: "Spaces Online",        value: "10",  icon: Building2,    color: "text-orange-600", bg: "bg-orange-50" },
];

const ADMIN_ACCOUNTS = [
  { id: "a-001", name: "Chioma Adeyemi", email: "chioma@unipod.ng", role: "admin",        space: null,                status: "active",    last: "Today, 9:14 AM" },
  { id: "a-002", name: "Tunde Okafor",   email: "tunde@unipod.ng",  role: "receptionist", space: null,                status: "active",    last: "Today, 8:52 AM" },
  { id: "a-003", name: "Amaka Eze",      email: "amaka@unipod.ng",  role: "space_lead",   space: "Maker Space",       status: "active",    last: "Yesterday" },
  { id: "a-004", name: "Segun Balogun",  email: "segun@unipod.ng",  role: "space_lead",   space: "AI & Robotics Lab", status: "active",    last: "2 days ago" },
  { id: "a-005", name: "Fatima Yusuf",   email: "fatima@unipod.ng", role: "space_lead",   space: "VR Lab",            status: "active",    last: "3 days ago" },
  { id: "a-006", name: "Obinna Nwosu",   email: "obinna@unipod.ng", role: "admin",        space: null,                status: "suspended", last: "1 week ago" },
];

const ROLE_CONFIG: Record<string, { label: string; variant: "success" | "info" | "warning" | "neutral" }> = {
  super_admin:  { label: "Super Admin",  variant: "warning" },
  admin:        { label: "Admin",        variant: "info" },
  receptionist: { label: "Receptionist", variant: "success" },
  space_lead:   { label: "Space Lead",   variant: "neutral" },
};

export default function SuperAdminPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center">
            <ShieldCheck size={16} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900">Super Admin</p>
            <p className="text-xs text-gray-500">UNIPOD BMS Control Panel</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/admin">
            <Button variant="outline" size="sm">
              <BarChart2 size={13} /> Main Admin
            </Button>
          </Link>
          <Link href="/admin/login">
            <Button variant="ghost" size="sm">
              <LogOut size={13} /> Sign out
            </Button>
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8 space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {STATS.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.label}>
                <div className="flex items-center gap-3">
                  <div className={\`w-9 h-9 rounded-xl \${stat.bg} flex items-center justify-center shrink-0\`}>
                    <Icon size={16} className={stat.color} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    <p className="text-xs text-gray-500 leading-tight">{stat.label}</p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                  <Users size={15} className="text-brand-500" /> Admin Accounts
                </h2>
                <Link href="/superadmin/admins">
                  <Button size="sm">
                    <UserPlus size={13} /> Manage Admins
                  </Button>
                </Link>
              </div>
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left text-xs font-medium text-gray-500 pb-2.5">Name</th>
                    <th className="text-left text-xs font-medium text-gray-500 pb-2.5">Role</th>
                    <th className="text-left text-xs font-medium text-gray-500 pb-2.5 hidden sm:table-cell">Space</th>
                    <th className="text-left text-xs font-medium text-gray-500 pb-2.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {ADMIN_ACCOUNTS.map((admin) => {
                    const rc = ROLE_CONFIG[admin.role];
                    return (
                      <tr key={admin.id} className="hover:bg-gray-50 transition-colors">
                        <td className="py-2.5">
                          <p className="text-sm text-gray-900 font-medium">{admin.name}</p>
                          <p className="text-xs text-gray-500">{admin.email}</p>
                        </td>
                        <td className="py-2.5">
                          <Badge variant={rc.variant} size="sm">{rc.label}</Badge>
                        </td>
                        <td className="py-2.5 hidden sm:table-cell">
                          <span className="text-xs text-gray-500">{admin.space ?? "—"}</span>
                        </td>
                        <td className="py-2.5">
                          <Badge variant={admin.status === "active" ? "success" : "danger"} size="sm">
                            {admin.status}
                          </Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </Card>
          </div>

          <div className="space-y-4">
            <Card>
              <h2 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <TrendingUp size={15} className="text-brand-500" /> Quick Actions
              </h2>
              <div className="space-y-1">
                {[
                  { href: "/superadmin/admins", icon: UserPlus,  label: "Add / Manage Admins" },
                  { href: "/admin",             icon: BarChart2, label: "Bookings Dashboard" },
                  { href: "/admin/spaces",      icon: Building2, label: "Space Management" },
                  { href: "/admin/broadcast",   icon: Megaphone, label: "Broadcast Message" },
                  { href: "/admin/settings",    icon: Settings,  label: "System Settings" },
                ].map(({ href, icon: Icon, label }) => (
                  <Link
                    key={href}
                    href={href}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 text-gray-600 hover:text-gray-900 transition-colors text-sm"
                  >
                    <Icon size={14} className="text-gray-400" />
                    {label}
                  </Link>
                ))}
              </div>
            </Card>

            <Card className="bg-yellow-50 border-yellow-100">
              <div className="flex items-start gap-2">
                <AlertTriangle size={14} className="text-yellow-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-yellow-700 mb-1">Super Admin Access</p>
                  <p className="text-xs text-yellow-600 leading-relaxed">
                    You have full system access. Changes made here affect all users and admins immediately.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
`);

// ─── 15. Superadmin admins — convert dark → light theme ───────────────────────
write("app/superadmin/admins/page.tsx", `
"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  UserPlus,
  X,
  Save,
  ChevronLeft,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Building2,
  ChevronDown,
  Eye,
  EyeOff,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import type { AdminAccount, AdminRole } from "@/types";
import { SPACES } from "@/lib/data/spaces";

const ROLE_OPTIONS: { value: AdminRole; label: string; description: string }[] = [
  { value: "admin",        label: "Admin",        description: "Can manage bookings, users, broadcast messages and view all analytics." },
  { value: "receptionist", label: "Receptionist", description: "Front-desk only. Can check users in and generate equipment access codes." },
  { value: "space_lead",   label: "Space Lead",   description: "Oversees a specific space. Verifies equipment access codes from users." },
];

const ROLE_CONFIG: Record<AdminRole, { label: string; variant: "success" | "info" | "warning" | "neutral" }> = {
  super_admin:  { label: "Super Admin",  variant: "warning" },
  admin:        { label: "Admin",        variant: "info" },
  receptionist: { label: "Receptionist", variant: "success" },
  space_lead:   { label: "Space Lead",   variant: "neutral" },
};

const MOCK_ADMINS: AdminAccount[] = [
  { id: "a-001", fullName: "Chioma Adeyemi", email: "chioma@unipod.ng", phone: "08012345678", role: "admin",        status: "active",    createdBy: "super-001", createdAt: "2025-01-10", lastLoginAt: "2025-07-17T09:14:00" },
  { id: "a-002", fullName: "Tunde Okafor",   email: "tunde@unipod.ng",  phone: "08023456789", role: "receptionist", status: "active",    createdBy: "super-001", createdAt: "2025-02-01", lastLoginAt: "2025-07-17T08:52:00" },
  { id: "a-003", fullName: "Amaka Eze",      email: "amaka@unipod.ng",  phone: "08034567890", role: "space_lead",   assignedSpaceId: "maker-space",    assignedSpaceName: "Maker Space",       status: "active",    createdBy: "super-001", createdAt: "2025-02-15", lastLoginAt: "2025-07-16T14:00:00" },
  { id: "a-004", fullName: "Segun Balogun",  email: "segun@unipod.ng",  phone: "08045678901", role: "space_lead",   assignedSpaceId: "ai-robotics-lab", assignedSpaceName: "AI & Robotics Lab", status: "active",    createdBy: "super-001", createdAt: "2025-03-01", lastLoginAt: "2025-07-15T11:30:00" },
  { id: "a-005", fullName: "Fatima Yusuf",   email: "fatima@unipod.ng", phone: "08056789012", role: "space_lead",   assignedSpaceId: "vr-lab",         assignedSpaceName: "VR Lab",            status: "active",    createdBy: "super-001", createdAt: "2025-03-10", lastLoginAt: "2025-07-14T16:45:00" },
  { id: "a-006", fullName: "Obinna Nwosu",   email: "obinna@unipod.ng", phone: "08067890123", role: "admin",        status: "suspended", createdBy: "super-001", createdAt: "2025-01-20", lastLoginAt: "2025-07-10T10:00:00" },
];

const PREMIUM_SPACES = SPACES.filter((s) =>
  ["maker-space", "ai-robotics-lab", "vr-lab", "pitch-garage", "event-space", "boardroom-main"].includes(s.id)
);

export default function SuperAdminAdminsPage() {
  const [admins, setAdmins]     = useState<AdminAccount[]>(MOCK_ADMINS);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving]     = useState(false);
  const [success, setSuccess]   = useState(false);
  const [showPw, setShowPw]     = useState(false);

  const [form, setForm] = useState({
    fullName: "", email: "", phone: "",
    role: "admin" as AdminRole,
    assignedSpaceId: "", tempPassword: "", confirmPassword: "",
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const e: Record<string, string> = {};
    if (!form.fullName.trim())   e.fullName   = "Full name is required.";
    if (!form.email.trim())      e.email      = "Email is required.";
    if (!form.phone.trim())      e.phone      = "Phone is required.";
    if (!form.tempPassword)      e.tempPassword = "Temporary password is required.";
    if (form.tempPassword.length < 8) e.tempPassword = "Password must be at least 8 characters.";
    if (form.tempPassword !== form.confirmPassword) e.confirmPassword = "Passwords do not match.";
    if (form.role === "space_lead" && !form.assignedSpaceId) e.assignedSpaceId = "Select a space for this lead.";
    setFormErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setSaving(true);
    // TODO: POST /api/admin/admins/create
    await new Promise((r) => setTimeout(r, 1000));
    const newAdmin: AdminAccount = {
      id: \`a-\${Date.now()}\`,
      fullName: form.fullName, email: form.email, phone: form.phone,
      role: form.role,
      assignedSpaceId: form.assignedSpaceId || undefined,
      assignedSpaceName: PREMIUM_SPACES.find((s) => s.id === form.assignedSpaceId)?.name,
      status: "active", createdBy: "super-001",
      createdAt: new Date().toISOString().split("T")[0],
    };
    setAdmins((prev) => [newAdmin, ...prev]);
    setSaving(false);
    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      setShowForm(false);
      setForm({ fullName: "", email: "", phone: "", role: "admin", assignedSpaceId: "", tempPassword: "", confirmPassword: "" });
    }, 1800);
  };

  const toggleStatus = (id: string) => {
    setAdmins((prev) => prev.map((a) => a.id === id ? { ...a, status: a.status === "active" ? "suspended" : "active" } : a));
  };
  const removeAdmin = (id: string) => setAdmins((prev) => prev.filter((a) => a.id !== id));

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-4">
        <Link href="/superadmin" className="text-gray-400 hover:text-gray-900 transition-colors">
          <ChevronLeft size={18} />
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center">
            <ShieldCheck size={16} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900">Manage Admin Accounts</p>
            <p className="text-xs text-gray-500">Create and manage all staff access</p>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            {admins.filter((a) => a.status === "active").length} active ·{" "}
            {admins.filter((a) => a.status === "suspended").length} suspended
          </p>
          <Button onClick={() => setShowForm(true)}>
            <UserPlus size={14} /> Add Admin
          </Button>
        </div>

        {showForm && (
          <Card className="border-brand-200">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                <UserPlus size={15} className="text-brand-500" /> New Admin Account
              </h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-700 transition-colors">
                <X size={16} />
              </button>
            </div>

            {success ? (
              <div className="text-center py-6">
                <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-3">
                  <ShieldCheck size={24} className="text-green-600" />
                </div>
                <p className="text-green-700 font-semibold">Admin account created</p>
                <p className="text-gray-500 text-sm mt-1">Login credentials sent to their email.</p>
              </div>
            ) : (
              <form onSubmit={handleCreate} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-gray-500 font-medium mb-1.5 block">Full name</label>
                    <input
                      type="text"
                      value={form.fullName}
                      onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                      placeholder="e.g. Amaka Eze"
                      className="w-full bg-white border border-gray-300 text-gray-900 text-sm rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                    {formErrors.fullName && <p className="text-xs text-red-500 mt-1">{formErrors.fullName}</p>}
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 font-medium mb-1.5 block">Email</label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="amaka@unipod.ng"
                      className="w-full bg-white border border-gray-300 text-gray-900 text-sm rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                    {formErrors.email && <p className="text-xs text-red-500 mt-1">{formErrors.email}</p>}
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 font-medium mb-1.5 block">Phone number</label>
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      placeholder="080XXXXXXXX"
                      className="w-full bg-white border border-gray-300 text-gray-900 text-sm rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                    {formErrors.phone && <p className="text-xs text-red-500 mt-1">{formErrors.phone}</p>}
                  </div>

                  <div>
                    <label className="text-xs text-gray-500 font-medium mb-1.5 block">Role</label>
                    <div className="relative">
                      <select
                        value={form.role}
                        onChange={(e) => setForm({ ...form, role: e.target.value as AdminRole, assignedSpaceId: "" })}
                        className="w-full appearance-none bg-white border border-gray-300 text-gray-900 text-sm rounded-xl px-3 py-2.5 pr-8 focus:outline-none focus:ring-2 focus:ring-brand-500"
                      >
                        {ROLE_OPTIONS.map((r) => (
                          <option key={r.value} value={r.value}>{r.label}</option>
                        ))}
                      </select>
                      <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {ROLE_OPTIONS.find((r) => r.value === form.role)?.description}
                    </p>
                  </div>

                  {form.role === "space_lead" && (
                    <div className="sm:col-span-2">
                      <label className="text-xs text-gray-500 font-medium mb-1.5 flex items-center gap-1.5 block">
                        <Building2 size={11} /> Assigned Space
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {PREMIUM_SPACES.map((space) => (
                          <button
                            key={space.id}
                            type="button"
                            onClick={() => setForm({ ...form, assignedSpaceId: space.id })}
                            className={\`text-left px-3 py-2 rounded-xl border text-xs transition-all \${
                              form.assignedSpaceId === space.id
                                ? "border-brand-500 bg-brand-50 text-brand-700"
                                : "border-gray-200 text-gray-600 hover:border-gray-400"
                            }\`}
                          >
                            {space.name}
                          </button>
                        ))}
                      </div>
                      {formErrors.assignedSpaceId && (
                        <p className="text-xs text-red-500 mt-1">{formErrors.assignedSpaceId}</p>
                      )}
                    </div>
                  )}

                  <div>
                    <label className="text-xs text-gray-500 font-medium mb-1.5 block">Temporary password</label>
                    <div className="relative">
                      <input
                        type={showPw ? "text" : "password"}
                        value={form.tempPassword}
                        onChange={(e) => setForm({ ...form, tempPassword: e.target.value })}
                        placeholder="Min. 8 characters"
                        className="w-full bg-white border border-gray-300 text-gray-900 text-sm rounded-xl px-3 py-2.5 pr-9 focus:outline-none focus:ring-2 focus:ring-brand-500"
                      />
                      <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                        {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                    {formErrors.tempPassword && <p className="text-xs text-red-500 mt-1">{formErrors.tempPassword}</p>}
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 font-medium mb-1.5 block">Confirm password</label>
                    <input
                      type={showPw ? "text" : "password"}
                      value={form.confirmPassword}
                      onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                      placeholder="Repeat password"
                      className="w-full bg-white border border-gray-300 text-gray-900 text-sm rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                    {formErrors.confirmPassword && <p className="text-xs text-red-500 mt-1">{formErrors.confirmPassword}</p>}
                  </div>
                </div>

                <div className="flex gap-3 pt-1">
                  <Button type="submit" loading={saving}>
                    <Save size={13} /> Create Admin Account
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
                </div>
              </form>
            )}
          </Card>
        )}

        <Card padding="none">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left text-xs font-medium text-gray-500 px-5 py-3">Name</th>
                <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Role</th>
                <th className="text-left text-xs font-medium text-gray-500 px-4 py-3 hidden md:table-cell">Space</th>
                <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Status</th>
                <th className="text-left text-xs font-medium text-gray-500 px-4 py-3 hidden sm:table-cell">Last Login</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {admins.map((admin) => {
                const rc = ROLE_CONFIG[admin.role];
                return (
                  <tr key={admin.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3">
                      <p className="text-sm text-gray-900 font-medium">{admin.fullName}</p>
                      <p className="text-xs text-gray-500">{admin.email}</p>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={rc.variant} size="sm">{rc.label}</Badge>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="text-xs text-gray-500">{admin.assignedSpaceName ?? "—"}</span>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={admin.status === "active" ? "success" : "danger"} size="sm">
                        {admin.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span className="text-xs text-gray-500">
                        {admin.lastLoginAt
                          ? new Date(admin.lastLoginAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" })
                          : "Never"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => toggleStatus(admin.id)}
                          className={\`p-1.5 rounded-lg transition-colors \${
                            admin.status === "active"
                              ? "text-green-600 hover:bg-green-50"
                              : "text-gray-400 hover:bg-gray-100"
                          }\`}
                          title={admin.status === "active" ? "Suspend" : "Reactivate"}
                        >
                          {admin.status === "active" ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                        </button>
                        <button
                          onClick={() => removeAdmin(admin.id)}
                          className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                          title="Remove admin"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      </main>
    </div>
  );
}
`);

// ─── 16. Booking detail page — create /bookings/[id] so View Details works ────
write("app/bookings/[id]/page.tsx", `
"use client";

import { useParams } from "next/navigation";
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
  User, Layers, Hash,
} from "lucide-react";
import type { UserTier } from "@/types";

const currentUserTier: UserTier = "regular_student";

// Mock booking store — keyed by id
const MOCK_BOOKINGS: Record<string, {
  id: string; bmsCode: string; space: string; spaceId: string;
  date: string; startTime: string; endTime: string;
  status: string; type: string; members?: string[];
  requestedEquipment?: string;
}> = {
  "bk-001": { id: "bk-001", bmsCode: "BMS-2025-T4K9P", space: "Co-working Space",    spaceId: "coworking",      date: "2025-07-17", startTime: "10:00", endTime: "12:00", status: "confirmed",  type: "individual" },
  "bk-00a": { id: "bk-00a", bmsCode: "BMS-2025-A1B2C", space: "Design Studio",       spaceId: "design-studio",  date: "2025-07-14", startTime: "13:00", endTime: "15:00", status: "completed",  type: "individual" },
  "bk-00b": { id: "bk-00b", bmsCode: "BMS-2025-D3E4F", space: "AI & Robotics Lab",   spaceId: "ai-robotics-lab",date: "2025-07-10", startTime: "10:00", endTime: "13:00", status: "no_show",    type: "individual", requestedEquipment: "GPU Workstation" },
  "bk-00c": { id: "bk-00c", bmsCode: "BMS-2025-G5H6I", space: "Pitch Garage",        spaceId: "pitch-garage",   date: "2025-07-07", startTime: "14:00", endTime: "16:00", status: "completed",  type: "group",      members: ["Adeola Fashola", "Chuka Obi", "Temi Sule"] },
  "bk-00d": { id: "bk-00d", bmsCode: "BMS-2025-J7K8L", space: "Collaboration Space", spaceId: "collaboration",  date: "2025-07-03", startTime: "11:00", endTime: "13:00", status: "cancelled",  type: "group" },
  // Active booking used on dashboard
  "bk-active": { id: "bk-active", bmsCode: "BMS-2025-X9Y0Z", space: "Maker Space",   spaceId: "maker-space",    date: "2025-07-18", startTime: "14:00", endTime: "17:00", status: "confirmed",  type: "individual", requestedEquipment: "3D Printer (Medium)" },
};

const statusConfig: Record<string, { label: string; variant: "success" | "danger" | "neutral" | "warning" | "info"; icon: typeof CheckCircle }> = {
  confirmed:  { label: "Confirmed",        variant: "info",    icon: ShieldCheck },
  checked_in: { label: "Checked In",       variant: "success", icon: CheckCircle },
  completed:  { label: "Completed",        variant: "success", icon: CheckCircle },
  cancelled:  { label: "Cancelled",        variant: "neutral", icon: XCircle },
  no_show:    { label: "No Show",          variant: "danger",  icon: XCircle },
  pending:    { label: "Pending Approval", variant: "warning", icon: AlertCircle },
  rejected:   { label: "Rejected",         variant: "danger",  icon: XCircle },
};

export default function BookingDetailPage() {
  const params   = useParams();
  const bookingId = Array.isArray(params.id) ? params.id[0] : params.id;
  const booking  = MOCK_BOOKINGS[bookingId as string];

  if (!booking) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar user={{ name: "Tolu Adeyemi", tier: currentUserTier, tierLabel: TIER_LABELS[currentUserTier] }} />
        <main className="max-w-2xl mx-auto px-4 py-16 text-center">
          <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
            <XCircle size={28} className="text-red-500" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Booking not found</h1>
          <p className="text-gray-500 text-sm mb-6">This booking ID doesn&apos;t exist or you don&apos;t have access.</p>
          <Link href="/bookings"><Button variant="outline">Back to My Bookings</Button></Link>
        </main>
      </div>
    );
  }

  const s        = statusConfig[booking.status] ?? statusConfig["pending"];
  const StatusIcon = s.icon;
  const canCancel = booking.status === "confirmed" || booking.status === "pending";

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={{ name: "Tolu Adeyemi", tier: currentUserTier, tierLabel: TIER_LABELS[currentUserTier] }} />

      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        {/* Back */}
        <Link href="/bookings" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 mb-6 transition-colors">
          <ChevronLeft size={16} /> Back to My Bookings
        </Link>

        {/* Status header */}
        <div className="flex items-center gap-3 mb-6">
          <div className={\`w-11 h-11 rounded-full flex items-center justify-center \${
            s.variant === "success" ? "bg-green-50" :
            s.variant === "danger"  ? "bg-red-50"   :
            s.variant === "warning" ? "bg-yellow-50":
            s.variant === "info"    ? "bg-blue-50"  : "bg-gray-100"
          }\`}>
            <StatusIcon size={22} className={\`\${
              s.variant === "success" ? "text-green-600" :
              s.variant === "danger"  ? "text-red-500"   :
              s.variant === "warning" ? "text-yellow-600":
              s.variant === "info"    ? "text-blue-600"  : "text-gray-500"
            }\`} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">{booking.space}</h1>
            <Badge variant={s.variant} size="sm">{s.label}</Badge>
          </div>
        </div>

        <div className="space-y-4">
          {/* Date & time */}
          <Card>
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Date & Time</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <CalendarDays size={15} className="text-brand-500" />
                <div>
                  <p className="text-xs text-gray-400">Date</p>
                  <p className="text-sm font-semibold text-gray-900">{formatDate(booking.date)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Clock size={15} className="text-brand-500" />
                <div>
                  <p className="text-xs text-gray-400">Time</p>
                  <p className="text-sm font-semibold text-gray-900">{formatTime(booking.startTime)} – {formatTime(booking.endTime)}</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Space & booking info */}
          <Card>
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Booking Info</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Building2 size={15} className="text-gray-400" />
                <div>
                  <p className="text-xs text-gray-400">Space</p>
                  <p className="text-sm font-medium text-gray-900">{booking.space}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Layers size={15} className="text-gray-400" />
                <div>
                  <p className="text-xs text-gray-400">Session type</p>
                  <p className="text-sm font-medium text-gray-900 capitalize">{booking.type}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Hash size={15} className="text-gray-400" />
                <div>
                  <p className="text-xs text-gray-400">Booking ID</p>
                  <p className="text-xs font-mono text-gray-600">{booking.id}</p>
                </div>
              </div>
            </div>
          </Card>

          {/* BMS code */}
          {(booking.status === "confirmed" || booking.status === "checked_in") && (
            <Card className="bg-blue-50 border-blue-100">
              <p className="text-xs font-semibold text-blue-700 mb-1">Your Check-in Code</p>
              <p className="text-2xl font-mono font-bold text-blue-600 tracking-widest mb-1">{booking.bmsCode}</p>
              <p className="text-xs text-blue-500">Show this code to the receptionist when you arrive.</p>
            </Card>
          )}

          {/* Equipment */}
          {booking.requestedEquipment && (
            <Card>
              <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Requested Equipment</h2>
              <p className="text-sm font-medium text-gray-900">{booking.requestedEquipment}</p>
            </Card>
          )}

          {/* Group members */}
          {booking.type === "group" && booking.members && (
            <Card>
              <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Group Members</h2>
              <div className="space-y-2">
                {booking.members.map((m) => (
                  <div key={m} className="flex items-center gap-2">
                    <User size={13} className="text-gray-400" />
                    <p className="text-sm text-gray-700">{m}</p>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            {canCancel && (
              <Button variant="danger" className="flex-1" onClick={() => alert("Cancel booking — connect to API")}>
                Cancel Booking
              </Button>
            )}
            <Link href="/spaces" className="flex-1">
              <Button variant="outline" className="w-full">Book Another Space</Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
`);

// ─── 17. Landing page — LIGHT theme, no Admin Login, no dark bg, blue accents ──
write("app/page.tsx", `import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/layout/Navbar";
import Button from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import PhotoStrip from "@/components/ui/PhotoStrip";
import { getPublicSpaces } from "@/lib/data/spaces";
import {
  ArrowRight, Cpu, Users, Calendar,
  ShieldCheck, ChevronRight, Clock, Zap, Radio,
  CheckCircle,
} from "lucide-react";

const spaces = getPublicSpaces();

const stats = [
  { label: "Bookable Spaces", value: "12",    sub: "Labs + Studios" },
  { label: "Daily Hours",     value: "9hrs",  sub: "10 AM – 7 PM" },
  { label: "Access System",   value: "Codes", sub: "Instant check-in" },
  { label: "Members Served",  value: "500+",  sub: "& growing" },
];

const features = [
  { icon: Calendar,    title: "Smart Booking Engine",   description: "Book up to 14 days ahead. Real-time availability, tier-based access control, and instant booking codes." },
  { icon: ShieldCheck, title: "Verified Access",        description: "UNILAG ID verification for students and staff. External users verified via OTP — every booking tied to a real identity." },
  { icon: Zap,         title: "Instant Check-in Codes", description: "Receive a unique BMS code with every confirmed booking. Show it at reception in seconds. No-show grace period of 20 minutes." },
  { icon: Cpu,         title: "Equipment Access",       description: "Request premium equipment — GPU workstations, 3D printers, VR headsets, robotics kits — through a managed approval flow." },
  { icon: Users,       title: "Group Sessions",         description: "Lead collaborative sessions with group booking codes. Add members by matric number, get one shared booking reference." },
  { icon: Radio,       title: "Admin Broadcast",        description: "Admins can push real-time announcements to all users — policy changes, scheduled maintenance, or special events." },
];

const categoryBadge: Record<string, "info" | "default" | "warning" | "success" | "neutral"> = {
  lab:           "default",
  collaboration: "info",
  event:         "warning",
  work:          "success",
  meeting:       "neutral",
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* ── HERO ──────────────────────────────────────────────────────────────── */}
      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center py-16 lg:py-24">

            {/* Left: text */}
            <div>
              <p className="text-xs font-semibold text-blue-600 uppercase tracking-widest mb-4">
                AI-UNIPOD · University of Lagos
              </p>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold text-gray-900 leading-[1.1] mb-6">
                Book Your<br />
                <span className="text-blue-600">AI Workspace.</span>
              </h1>
              <p className="text-lg text-gray-500 leading-relaxed mb-8 max-w-lg">
                Africa&apos;s most advanced student innovation hub. Reserve labs, studios, and
                collaboration spaces at UNILAG&apos;s AI-UNIPOD — in seconds.
              </p>

              <div className="flex flex-wrap items-center gap-3 mb-10">
                <Link href="/auth/signup">
                  <Button size="lg">
                    Get Access <ArrowRight size={16} />
                  </Button>
                </Link>
                <Link href="/spaces">
                  <Button variant="outline" size="lg">
                    Explore Spaces <ChevronRight size={16} />
                  </Button>
                </Link>
              </div>

              {/* Trust indicators */}
              <div className="flex flex-wrap items-center gap-6 text-sm text-gray-400">
                <span className="flex items-center gap-1.5">
                  <CheckCircle size={14} className="text-blue-500" />
                  Free for UNILAG members
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle size={14} className="text-blue-500" />
                  Instant booking codes
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle size={14} className="text-blue-500" />
                  12 spaces available
                </span>
              </div>
            </div>

            {/* Right: workspace photo */}
            <div className="relative rounded-3xl overflow-hidden h-80 lg:h-[520px] shadow-xl">
              <Image
                src="/spaces/image14.jpeg"
                alt="AI-UNIPOD workspace"
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS ─────────────────────────────────────────────────────────────── */}
      <section className="bg-blue-600 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-4xl font-display font-bold text-white mb-1">{stat.value}</p>
                <p className="text-sm font-semibold text-blue-100">{stat.label}</p>
                <p className="text-xs text-blue-200 mt-0.5">{stat.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PHOTO STRIP ───────────────────────────────────────────────────────── */}
      <section className="py-8 overflow-hidden border-b border-gray-100 bg-gray-50">
        <PhotoStrip />
      </section>

      {/* ── SPACES ────────────────────────────────────────────────────────────── */}
      <section id="spaces" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10">
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-gray-900 mb-3">
              Spaces to Build In
            </h2>
            <p className="text-gray-500 max-w-xl">
              From AI labs and maker spaces to pitch arenas — every corner of AI-UNIPOD is purpose-built for builders.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {spaces.map((space) => (
              <Link key={space.id} href={\`/spaces/\${space.slug}\`} className="group block">
                <div className="rounded-2xl overflow-hidden border border-gray-200 bg-white shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5">
                  {space.imageUrl && (
                    <div className="relative h-48 overflow-hidden">
                      <Image
                        src={space.imageUrl}
                        alt={space.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-3 right-3">
                        <span className={\`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-medium bg-white/90 border border-gray-200 \${space.availability === "available" ? "text-emerald-700" : "text-amber-700"}\`}>
                          <span className={\`w-1.5 h-1.5 rounded-full \${space.availability === "available" ? "bg-emerald-500" : "bg-amber-400"}\`} />
                          {space.availability === "available" ? "Open" : "Limited"}
                        </span>
                      </div>
                    </div>
                  )}
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <h3 className="font-semibold text-gray-900 text-sm leading-tight">
                        {space.name}
                      </h3>
                    </div>
                    <p className="text-xs text-gray-500 leading-relaxed mb-3 line-clamp-2">
                      {space.description}
                    </p>
                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <span className="flex items-center gap-1">
                        <Users size={11} className="text-blue-500" />
                        {space.capacity} capacity
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={11} />
                        {space.approvalType === "auto" ? "Instant" : space.approvalType === "manual" ? "Needs approval" : "Admin only"}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-10 text-center">
            <Link href="/spaces">
              <Button variant="outline" size="lg">
                View All Spaces <ArrowRight size={16} />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── FEATURES ──────────────────────────────────────────────────────────── */}
      <section id="about" className="py-20 bg-gray-50 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10">
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-gray-900 mb-3">
              Built for Builders.
            </h2>
            <p className="text-gray-500 max-w-xl">
              Every feature in BMS is designed around how UNILAG innovators actually work.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map(({ icon: Icon, title, description }) => (
              <Card key={title} className="bg-white hover:shadow-md transition-shadow duration-300">
                <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center mb-4">
                  <Icon size={18} className="text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 text-sm mb-2">{title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────────────────── */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-display font-bold text-white mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-blue-100 mb-8 text-lg">
            Sign up with your UNILAG email and start booking AI-UNIPOD spaces today. Free for all registered members.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link href="/auth/signup">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50 border-0">
                Create Account <ArrowRight size={16} />
              </Button>
            </Link>
            <Link href="/auth/login">
              <Button size="lg" className="bg-transparent border border-blue-300 text-white hover:bg-blue-700">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ────────────────────────────────────────────────────────────── */}
      <footer className="py-8 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center">
              <span className="text-white font-bold text-xs">U</span>
            </div>
            <span className="font-bold text-sm text-gray-900">AI-UNIPOD BMS</span>
          </div>
          <p className="text-xs text-gray-400">
            © {new Date().getFullYear()} AI-UNIPOD UNILAG. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-xs text-gray-400">
            <Link href="/auth/login" className="hover:text-gray-700 transition-colors">Sign In</Link>
            <Link href="/auth/signup" className="hover:text-gray-700 transition-colors">Sign Up</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
`);

// ─── 17. Resource-request — taller image banners so photos aren't cut off ─────
// The space group photo banners in the resource-request page are h-28 (112px).
// Bump to h-48 (192px) so the lab photos show properly.
patch("app/resource-request/page.tsx", [
  ['"relative w-full h-28 rounded-xl overflow-hidden mb-3"',
   '"relative w-full h-48 rounded-xl overflow-hidden mb-3"'],
]);

console.log("\n✅ patch-pages.js complete.");
