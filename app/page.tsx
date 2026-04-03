import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/layout/Navbar";
import Button from "@/components/ui/Button";
import { getPublicSpaces } from "@/lib/data/spaces";
import {
  ArrowRight, Calendar, ShieldCheck, Zap, Cpu,
  Users, Radio, Clock, MapPin, CheckCircle, ChevronRight,
} from "lucide-react";

const spaces = getPublicSpaces();

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#F8F9FB]">
      <Navbar />

      {/* ─────────────────────────────────────────────────────────────────────────
          HERO — full-bleed workspace photo with brand overlay
      ───────────────────────────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex flex-col justify-center overflow-hidden">
        {/* Background photo */}
        <div className="absolute inset-0">
          <Image
            src="/spaces/image14.jpeg"
            alt="AI-UNIPOD workspace"
            fill
            className="object-cover"
            priority
          />
          {/* Brand-colored overlay for legibility on light-mode page */}
          <div className="absolute inset-0" style={{
            background: [
              "linear-gradient(135deg, rgba(91,76,245,0.82) 0%, rgba(91,76,245,0.60) 60%, rgba(6,182,212,0.55) 100%)",
            ].join(","),
          }} />
          {/* Bottom fade into the light page */}
          <div className="absolute bottom-0 inset-x-0 h-48" style={{
            background: "linear-gradient(to top, #F8F9FB 0%, transparent 100%)",
          }} />
        </div>

        {/* Subtle grid overlay */}
        <div className="absolute inset-0 grid-bg opacity-20 pointer-events-none" />

        {/* Glow orbs */}
        <div className="absolute top-1/3 left-1/4 w-[500px] h-[500px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(255,255,255,0.10) 0%, transparent 65%)" }} />
        <div className="absolute bottom-1/3 right-1/4 w-96 h-96 rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(6,182,212,0.12) 0%, transparent 65%)" }} />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 w-full">
          <div className="max-w-2xl">
            {/* Status pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-8"
              style={{ background: "rgba(255,255,255,0.18)", border: "1px solid rgba(255,255,255,0.35)" }}>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />
              <span className="text-xs font-medium text-white tracking-wide">
                UNILAG AI Innovation Hub · Live Now
              </span>
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-display font-bold leading-[1.03] mb-6">
              <span className="text-white">Book Your</span>
              <br />
              <span className="text-white drop-shadow-lg">AI Workspace.</span>
            </h1>

            <p className="text-lg sm:text-xl text-white/80 leading-relaxed mb-10 max-w-lg">
              Africa&apos;s most advanced student innovation hub. Reserve labs,
              studios, and collaboration spaces at UNILAG&apos;s AI‑UNIPOD — in seconds.
            </p>

            <div className="flex flex-wrap gap-3 mb-12">
              <Link href="/auth/signup">
                <Button size="lg" className="animate-pulse-glow">
                  Get Access <ArrowRight size={16} />
                </Button>
              </Link>
              <Link href="/spaces">
                <Button variant="outline" size="lg" className="bg-white/10 border-white/40 text-white hover:bg-white/20">
                  Explore Spaces <ChevronRight size={16} />
                </Button>
              </Link>
            </div>

            {/* Trust signals */}
            <div className="flex flex-wrap gap-5 text-sm text-white/75">
              {[
                "Free for UNILAG members",
                "Instant booking codes",
                "14-day advance booking",
              ].map((t) => (
                <span key={t} className="flex items-center gap-1.5">
                  <CheckCircle size={13} className="text-emerald-300 shrink-0" />
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Floating space count badge — bottom right */}
        <div className="absolute bottom-10 right-6 sm:right-10 hidden sm:flex items-center gap-3 px-4 py-3 rounded-2xl"
          style={{ background: "rgba(255,255,255,0.18)", border: "1px solid rgba(255,255,255,0.30)", backdropFilter: "blur(12px)" }}>
          <div className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse" />
          <div>
            <p className="text-xs text-white font-semibold">12 spaces available</p>
            <p className="text-[10px] text-white/60">Mon–Fri · 10AM–7PM</p>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────────────
          STATS BAR
      ───────────────────────────────────────────────────────────────────────── */}
      <section className="relative py-12 border-y border-gray-100 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-0 md:divide-x md:divide-gray-100">
            {[
              { value: "12",   label: "Bookable Spaces",  sub: "Labs, studios & more" },
              { value: "9hrs", label: "Daily Access",      sub: "10 AM – 7 PM weekdays" },
              { value: "BMS",  label: "Smart Check-in",   sub: "Unique booking codes" },
              { value: "500+", label: "Members Served",   sub: "UNILAG community" },
            ].map((s) => (
              <div key={s.label} className="text-center px-4">
                <p className="text-3xl sm:text-4xl font-display font-bold gradient-text mb-1">{s.value}</p>
                <p className="text-sm font-semibold text-gray-800">{s.label}</p>
                <p className="text-xs text-gray-400 mt-0.5">{s.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────────────
          BENTO GRID — Features
      ───────────────────────────────────────────────────────────────────────── */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <p className="text-xs font-semibold text-brand-500 uppercase tracking-widest mb-3">
              Platform Features
            </p>
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-gray-900 mb-3">
              Built for Builders.
            </h2>
            <p className="text-gray-500 max-w-lg">
              Every feature in BMS is designed around how UNILAG innovators actually work — fast, secure, and mobile-first.
            </p>
          </div>

          {/* Bento grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 auto-rows-[minmax(180px,auto)] gap-4">

            {/* ① Smart Booking — spans 2 cols, 2 rows on lg */}
            <div className="lg:col-span-2 lg:row-span-2 relative rounded-3xl overflow-hidden p-8 flex flex-col justify-between group bg-white"
              style={{ border: "1px solid rgba(91,76,245,0.15)", boxShadow: "0 4px 20px rgba(91,76,245,0.08)" }}>
              <div className="absolute inset-0 grid-bg opacity-30 pointer-events-none" />
              <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full pointer-events-none"
                style={{ background: "radial-gradient(circle, rgba(91,76,245,0.08) 0%, transparent 70%)" }} />
              <div className="relative">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-6"
                  style={{ background: "linear-gradient(135deg, rgba(91,76,245,0.15) 0%, rgba(91,76,245,0.08) 100%)", border: "1px solid rgba(91,76,245,0.20)" }}>
                  <Calendar size={22} className="text-brand-500" />
                </div>
                <h3 className="text-2xl font-display font-bold text-gray-900 mb-3">Smart Booking Engine</h3>
                <p className="text-gray-500 leading-relaxed max-w-sm">
                  Book up to 14 days ahead with real-time availability. Tier-based access control ensures
                  only the right people can book the right spaces — automatically.
                </p>
              </div>
              <div className="relative mt-6 flex items-center gap-3">
                <Link href="/spaces">
                  <Button variant="outline" size="sm">
                    Browse Spaces <ArrowRight size={13} />
                  </Button>
                </Link>
                <span className="text-xs text-gray-400">12 spaces · Mon–Fri</span>
              </div>
            </div>

            {/* ② Verified Access */}
            <div className="relative rounded-3xl p-6 flex flex-col justify-between bg-white"
              style={{ border: "1px solid rgba(0,0,0,0.07)", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
              <div>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: "rgba(16,185,129,0.10)", border: "1px solid rgba(16,185,129,0.18)" }}>
                  <ShieldCheck size={18} className="text-emerald-500" />
                </div>
                <h3 className="font-display font-semibold text-gray-900 mb-2">Verified Access</h3>
                <p className="text-xs text-gray-500 leading-relaxed">
                  UNILAG ID verification for students and staff. Every booking tied to a real identity.
                </p>
              </div>
              <div className="mt-4 flex items-center gap-2 text-xs text-emerald-600 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Identity-locked bookings
              </div>
            </div>

            {/* ③ Instant Codes */}
            <div className="relative rounded-3xl p-6 flex flex-col justify-between bg-white"
              style={{ border: "1px solid rgba(0,0,0,0.07)", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
              <div>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: "rgba(250,204,21,0.10)", border: "1px solid rgba(250,204,21,0.20)" }}>
                  <Zap size={18} className="text-yellow-500" />
                </div>
                <h3 className="font-display font-semibold text-gray-900 mb-2">Instant BMS Codes</h3>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Receive a unique code instantly on every confirmed booking. Show it at reception — no app needed.
                </p>
              </div>
              <div className="mt-4 font-mono text-xs text-brand-500 tracking-widest">
                BMS-2025-X4F7K
              </div>
            </div>

            {/* ④ Equipment Access */}
            <div className="relative rounded-3xl p-6 flex flex-col justify-between bg-white"
              style={{ border: "1px solid rgba(0,0,0,0.07)", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
              <div>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: "rgba(6,182,212,0.10)", border: "1px solid rgba(6,182,212,0.18)" }}>
                  <Cpu size={18} className="text-cyan-500" />
                </div>
                <h3 className="font-display font-semibold text-gray-900 mb-2">Equipment Access</h3>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Request GPU workstations, 3D printers, VR headsets, and robotics kits via managed approval.
                </p>
              </div>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {["GPU", "3D Print", "VR", "Robotics"].map((t) => (
                  <span key={t} className="text-[10px] px-2 py-0.5 rounded-full"
                    style={{ background: "rgba(6,182,212,0.08)", border: "1px solid rgba(6,182,212,0.15)", color: "#0891b2" }}>
                    {t}
                  </span>
                ))}
              </div>
            </div>

            {/* ⑤ Group Sessions */}
            <div className="relative rounded-3xl p-6 flex flex-col justify-between bg-white"
              style={{ border: "1px solid rgba(0,0,0,0.07)", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
              <div>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: "rgba(168,85,247,0.10)", border: "1px solid rgba(168,85,247,0.18)" }}>
                  <Users size={18} className="text-purple-500" />
                </div>
                <h3 className="font-display font-semibold text-gray-900 mb-2">Group Sessions</h3>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Lead group bookings with a shared code. Add members by matric number — one reference for all.
                </p>
              </div>
              <div className="mt-4 text-xs text-gray-400">Up to 20 members per session</div>
            </div>

            {/* ⑥ Admin Broadcast — spans 2 cols on lg */}
            <div className="lg:col-span-2 relative rounded-3xl p-6 flex flex-col sm:flex-row items-start sm:items-center gap-6 bg-white"
              style={{ border: "1px solid rgba(0,0,0,0.07)", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
              <div className="w-10 h-10 rounded-xl shrink-0 flex items-center justify-center"
                style={{ background: "rgba(239,68,68,0.10)", border: "1px solid rgba(239,68,68,0.18)" }}>
                <Radio size={18} className="text-red-500" />
              </div>
              <div className="flex-1">
                <h3 className="font-display font-semibold text-gray-900 mb-1">Admin Broadcast</h3>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Admins push real-time announcements to all users — policy changes, scheduled maintenance, or special events. Delivered via email and in-app notifications.
                </p>
              </div>
              <div className="shrink-0">
                <span className="text-[10px] px-2.5 py-1 rounded-full font-medium"
                  style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.15)", color: "#dc2626" }}>
                  Live
                </span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────────────
          SPACES GRID
      ───────────────────────────────────────────────────────────────────────── */}
      <section id="spaces" className="py-24 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-10 gap-4">
            <div>
              <p className="text-xs font-semibold text-brand-500 uppercase tracking-widest mb-3">
                Available Now
              </p>
              <h2 className="text-3xl sm:text-4xl font-display font-bold text-gray-900">
                Explore the Hub
              </h2>
            </div>
            <Link href="/spaces" className="hidden sm:flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 transition-colors shrink-0">
              View all <ChevronRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {spaces.slice(0, 9).map((space) => (
              <Link key={space.id} href={`/spaces/${space.slug}`} className="group block">
                <div className="rounded-2xl overflow-hidden transition-all duration-300 group-hover:-translate-y-1 bg-white"
                  style={{ border: "1px solid rgba(0,0,0,0.07)", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
                  {space.imageUrl && (
                    <div className="relative h-44 overflow-hidden">
                      <Image
                        src={space.imageUrl}
                        alt={space.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.45) 0%, transparent 60%)" }} />
                      <div className="absolute top-3 right-3">
                        <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-medium"
                          style={{ background: "rgba(255,255,255,0.92)", border: "1px solid rgba(0,0,0,0.08)", backdropFilter: "blur(8px)", color: space.availability === "available" ? "#059669" : "#d97706" }}>
                          <span className={`w-1.5 h-1.5 rounded-full ${space.availability === "available" ? "bg-emerald-500" : "bg-amber-400"} animate-pulse`} />
                          {space.availability === "available" ? "Open" : "Limited"}
                        </span>
                      </div>
                    </div>
                  )}
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 text-sm mb-1.5 group-hover:text-brand-600 transition-colors">
                      {space.name}
                    </h3>
                    <p className="text-xs text-gray-500 line-clamp-2 mb-3 leading-relaxed">
                      {space.description}
                    </p>
                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <span className="flex items-center gap-1">
                        <Users size={11} className="text-brand-400" />
                        {space.capacity} seats
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={11} className="text-cyan-400" />
                        {space.approvalType === "auto" ? "Instant" : space.approvalType === "manual" ? "Needs approval" : "Admin only"}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-10 text-center sm:hidden">
            <Link href="/spaces">
              <Button variant="outline" size="lg">
                View All Spaces <ArrowRight size={16} />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────────────
          CTA
      ───────────────────────────────────────────────────────────────────────── */}
      <section className="py-24 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-3xl overflow-hidden p-10 sm:p-16 text-center bg-white"
            style={{ background: "linear-gradient(135deg, rgba(91,76,245,0.06) 0%, rgba(6,182,212,0.04) 100%)", border: "1px solid rgba(91,76,245,0.12)", boxShadow: "0 8px 40px rgba(91,76,245,0.08)" }}>
            <div className="absolute inset-0 grid-bg opacity-20 pointer-events-none" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-48 pointer-events-none"
              style={{ background: "radial-gradient(ellipse at top, rgba(91,76,245,0.10) 0%, transparent 70%)" }} />
            <div className="relative">
              <p className="text-xs font-semibold text-brand-500 uppercase tracking-widest mb-4">
                UNILAG Students &amp; Staff
              </p>
              <h2 className="text-4xl sm:text-5xl font-display font-bold text-gray-900 mb-4">
                Ready to Build<br />
                <span className="gradient-text">Something Great?</span>
              </h2>
              <p className="text-gray-500 mb-8 max-w-md mx-auto leading-relaxed">
                Sign up with your UNILAG email and start booking AI‑UNIPOD spaces today.
                Free for all registered members.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <Link href="/auth/signup">
                  <Button size="lg" className="animate-pulse-glow">
                    Create Account <ArrowRight size={16} />
                  </Button>
                </Link>
                <Link href="/auth/login">
                  <Button variant="outline" size="lg">Already a member? Sign in</Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────────────
          FOOTER
      ───────────────────────────────────────────────────────────────────────── */}
      <footer className="py-10 border-t border-gray-100 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="relative w-7 h-7 flex items-center justify-center">
              <div className="absolute inset-0 rounded-lg"
                style={{ background: "linear-gradient(135deg, #5B4CF5, #06B6D4)" }} />
              <span className="relative text-white font-display font-bold text-xs">U</span>
            </div>
            <span className="font-display font-bold text-xs tracking-widest gradient-text">AI-UNIPOD</span>
          </div>
          <p className="text-xs text-gray-400">
            © {new Date().getFullYear()} AI-UNIPOD UNILAG. Booking Management System.
          </p>
          <div className="flex items-center gap-4 text-xs text-gray-400">
            <Link href="/admin/login" className="hover:text-gray-700 transition-colors">Admin</Link>
            <Link href="/auth/login" className="hover:text-gray-700 transition-colors">Sign In</Link>
            <Link href="/auth/signup" className="hover:text-gray-700 transition-colors">Get Access</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
