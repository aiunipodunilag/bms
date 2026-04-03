import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/layout/Navbar";
import Button from "@/components/ui/Button";
import { getPublicSpaces } from "@/lib/data/spaces";
import {
  ArrowRight, Calendar, ShieldCheck, Zap, Cpu,
  Users, Radio, Clock, CheckCircle, ChevronRight,
  Sparkles, QrCode, Building2,
} from "lucide-react";

const spaces = getPublicSpaces();

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* ─────────────────────────────────────────────────────────────────────────
          HERO — split layout, no background image
      ───────────────────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0"
            style={{ background: "radial-gradient(ellipse 80% 60% at 60% -10%, rgba(91,76,245,0.10) 0%, transparent 70%)" }} />
          <div className="absolute inset-0"
            style={{ background: "radial-gradient(ellipse 50% 50% at 100% 60%, rgba(6,182,212,0.07) 0%, transparent 60%)" }} />
        </div>
        {/* Subtle dot grid */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.35]"
          style={{
            backgroundImage: "radial-gradient(circle, rgba(91,76,245,0.18) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }} />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 lg:pt-28 lg:pb-24">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">

            {/* ── Left: Copy ─────────────────────────────────── */}
            <div>
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-7 border"
                style={{ background: "rgba(91,76,245,0.06)", borderColor: "rgba(91,76,245,0.18)" }}>
                <Sparkles size={13} className="text-brand-500" />
                <span className="text-xs font-semibold text-brand-600 tracking-wide">
                  Africa&apos;s #1 Campus AI Hub · UNILAG
                </span>
              </div>

              <h1 className="text-5xl sm:text-6xl font-display font-bold leading-[1.05] text-gray-900 mb-6"
                style={{ letterSpacing: "-0.02em" }}>
                Book AI&nbsp;Spaces.<br />
                <span className="gradient-text">Build the Future.</span>
              </h1>

              <p className="text-lg text-gray-500 leading-relaxed mb-8 max-w-md">
                Reserve labs, studios, and collaboration spaces at UNILAG&apos;s AI‑UNIPOD
                — instantly, from your phone. Free for all registered members.
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap gap-3 mb-10">
                <Link href="/auth/signup">
                  <Button size="lg" className="animate-pulse-glow">
                    Get Free Access <ArrowRight size={16} />
                  </Button>
                </Link>
                <Link href="/spaces">
                  <Button variant="outline" size="lg">
                    View Spaces <ChevronRight size={16} />
                  </Button>
                </Link>
              </div>

              {/* Trust signals */}
              <div className="flex flex-wrap gap-5 text-sm text-gray-500">
                {[
                  "Free for UNILAG members",
                  "Instant booking codes",
                  "14-day advance booking",
                ].map((t) => (
                  <span key={t} className="flex items-center gap-1.5">
                    <CheckCircle size={14} className="text-emerald-500 shrink-0" />
                    {t}
                  </span>
                ))}
              </div>
            </div>

            {/* ── Right: Visual card collage ──────────────────── */}
            <div className="relative hidden lg:block">
              {/* Main card */}
              <div className="relative rounded-3xl overflow-hidden shadow-xl border border-gray-100 bg-white p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Book a Space</p>
                    <p className="text-lg font-display font-bold text-gray-900">AI &amp; Robotics Lab</p>
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-600 border border-emerald-100">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Available
                  </span>
                </div>
                <div className="rounded-2xl overflow-hidden h-40 relative mb-4">
                  <Image src="/spaces/image21.jpeg" alt="AI & Robotics Lab" fill className="object-cover" />
                </div>
                <div className="grid grid-cols-3 gap-3 mb-4">
                  {[
                    { icon: Users, label: "4 seats" },
                    { icon: Clock, label: "Up to 4hrs" },
                    { icon: Zap, label: "Instant code" },
                  ].map(({ icon: Icon, label }) => (
                    <div key={label} className="rounded-xl p-2.5 text-center bg-gray-50 border border-gray-100">
                      <Icon size={14} className="text-brand-500 mx-auto mb-1" />
                      <p className="text-[10px] font-medium text-gray-600">{label}</p>
                    </div>
                  ))}
                </div>
                <div className="rounded-2xl p-3 border border-brand-100 bg-brand-50 flex items-center gap-3">
                  <QrCode size={28} className="text-brand-500 shrink-0" />
                  <div>
                    <p className="text-[10px] text-gray-400 font-medium">Your booking code</p>
                    <p className="font-mono text-sm font-bold text-brand-600 tracking-widest">BMS‑2025‑X4F7K</p>
                  </div>
                </div>
              </div>

              {/* Floating mini cards */}
              <div className="absolute -left-10 top-1/4 w-44 rounded-2xl bg-white border border-gray-100 shadow-lg p-3"
                style={{ boxShadow: "0 8px 32px rgba(0,0,0,0.08)" }}>
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl overflow-hidden shrink-0 relative">
                    <Image src="/spaces/image16.jpeg" alt="Co-working" fill className="object-cover" />
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold text-gray-800">Co-working</p>
                    <p className="text-[10px] text-emerald-500 font-medium">Open now</p>
                  </div>
                </div>
              </div>

              <div className="absolute -right-6 bottom-16 w-48 rounded-2xl bg-white border border-gray-100 p-3"
                style={{ boxShadow: "0 8px 32px rgba(0,0,0,0.08)" }}>
                <div className="flex items-center gap-2 mb-2">
                  <Building2 size={13} className="text-brand-500" />
                  <p className="text-[11px] font-semibold text-gray-700">12 spaces available</p>
                </div>
                <div className="flex gap-1">
                  {["/spaces/image1.jpeg", "/spaces/image4.jpeg", "/spaces/image15.jpeg", "/spaces/image22.jpeg"].map((src, i) => (
                    <div key={i} className="w-9 h-9 rounded-lg overflow-hidden relative border-2 border-white"
                      style={{ marginLeft: i > 0 ? "-8px" : 0 }}>
                      <Image src={src} alt="" fill className="object-cover" />
                    </div>
                  ))}
                  <div className="w-9 h-9 rounded-lg bg-brand-500 flex items-center justify-center border-2 border-white"
                    style={{ marginLeft: "-8px" }}>
                    <span className="text-white text-[10px] font-bold">+8</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────────────
          STATS STRIP
      ───────────────────────────────────────────────────────────────────────── */}
      <section className="border-y border-gray-100 bg-gray-50/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-0 md:divide-x md:divide-gray-200">
            {[
              { value: "12",   label: "Bookable Spaces",  sub: "Labs, studios & more" },
              { value: "9 hrs",label: "Daily Access",      sub: "10 AM – 7 PM weekdays" },
              { value: "500+", label: "Members Served",   sub: "UNILAG community" },
              { value: "< 60s",label: "Booking Time",     sub: "From signup to code" },
            ].map((s) => (
              <div key={s.label} className="text-center md:px-8">
                <p className="text-3xl sm:text-4xl font-display font-bold gradient-text mb-1">{s.value}</p>
                <p className="text-sm font-semibold text-gray-800">{s.label}</p>
                <p className="text-xs text-gray-400 mt-0.5">{s.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────────────
          HOW IT WORKS
      ───────────────────────────────────────────────────────────────────────── */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold text-brand-500 uppercase tracking-widest mb-3">Simple Process</p>
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-gray-900" style={{ letterSpacing: "-0.02em" }}>
              Booked in three steps.
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6 relative">
            {/* Connector line */}
            <div className="hidden md:block absolute top-10 left-[calc(16.66%+1rem)] right-[calc(16.66%+1rem)] h-px"
              style={{ background: "linear-gradient(90deg, rgba(91,76,245,0.2) 0%, rgba(91,76,245,0.5) 50%, rgba(91,76,245,0.2) 100%)" }} />

            {[
              {
                step: "01",
                icon: ShieldCheck,
                color: "bg-emerald-50 text-emerald-500 border-emerald-100",
                title: "Create your account",
                desc: "Sign up with your UNILAG email. Your identity is verified automatically — no paperwork.",
              },
              {
                step: "02",
                icon: Calendar,
                color: "bg-brand-50 text-brand-500 border-brand-100",
                title: "Pick a space & time",
                desc: "Browse all 12 spaces, check live availability, and book up to 14 days in advance.",
              },
              {
                step: "03",
                icon: QrCode,
                color: "bg-cyan-50 text-cyan-500 border-cyan-100",
                title: "Check in with your code",
                desc: "Get a unique BMS code instantly. Show it at reception — that's it, you're in.",
              },
            ].map(({ step, icon: Icon, color, title, desc }) => (
              <div key={step} className="relative bg-white rounded-3xl border border-gray-100 p-7 text-center"
                style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}>
                <div className={`w-14 h-14 rounded-2xl border mx-auto flex items-center justify-center mb-5 ${color}`}>
                  <Icon size={22} />
                </div>
                <span className="inline-block text-xs font-bold text-gray-300 tracking-widest mb-2">{step}</span>
                <h3 className="font-display font-bold text-gray-900 text-lg mb-2">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────────────
          FEATURES BENTO
      ───────────────────────────────────────────────────────────────────────── */}
      <section className="py-24 bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <p className="text-xs font-semibold text-brand-500 uppercase tracking-widest mb-3">Platform Features</p>
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-gray-900 mb-3" style={{ letterSpacing: "-0.02em" }}>
              Built for innovators.
            </h2>
            <p className="text-gray-500 max-w-lg">
              Every feature in BMS is designed around how UNILAG innovators actually work — fast, secure, and mobile‑first.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 auto-rows-[minmax(180px,auto)] gap-4">

            {/* ① Smart Booking — featured */}
            <div className="lg:col-span-2 lg:row-span-2 rounded-3xl overflow-hidden p-8 flex flex-col justify-between bg-white border border-gray-100 relative group"
              style={{ boxShadow: "0 4px 24px rgba(91,76,245,0.07)" }}>
              <div className="absolute top-0 right-0 w-64 h-64 rounded-full pointer-events-none"
                style={{ background: "radial-gradient(circle at top right, rgba(91,76,245,0.07) 0%, transparent 70%)" }} />
              <div className="absolute inset-0 pointer-events-none opacity-40"
                style={{
                  backgroundImage: "radial-gradient(circle, rgba(91,76,245,0.10) 1px, transparent 1px)",
                  backgroundSize: "24px 24px",
                }} />
              <div className="relative">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-6 bg-brand-50 border border-brand-100">
                  <Calendar size={22} className="text-brand-500" />
                </div>
                <h3 className="text-2xl font-display font-bold text-gray-900 mb-3">Smart Booking Engine</h3>
                <p className="text-gray-500 leading-relaxed max-w-sm">
                  Book up to 14 days ahead with real-time availability. Tier-based access ensures
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
            <div className="rounded-3xl p-6 flex flex-col justify-between bg-white border border-gray-100"
              style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
              <div>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 bg-emerald-50 border border-emerald-100">
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
            <div className="rounded-3xl p-6 flex flex-col justify-between bg-white border border-gray-100"
              style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
              <div>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 bg-amber-50 border border-amber-100">
                  <Zap size={18} className="text-amber-500" />
                </div>
                <h3 className="font-display font-semibold text-gray-900 mb-2">Instant BMS Codes</h3>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Receive a unique code on every confirmed booking. Show it at reception — no app needed.
                </p>
              </div>
              <div className="mt-4 font-mono text-xs text-brand-500 tracking-widest bg-brand-50 rounded-lg px-3 py-2 border border-brand-100 inline-block">
                BMS-2025-X4F7K
              </div>
            </div>

            {/* ④ Equipment Access */}
            <div className="rounded-3xl p-6 flex flex-col justify-between bg-white border border-gray-100"
              style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
              <div>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 bg-cyan-50 border border-cyan-100">
                  <Cpu size={18} className="text-cyan-500" />
                </div>
                <h3 className="font-display font-semibold text-gray-900 mb-2">Equipment Access</h3>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Request GPU workstations, 3D printers, VR headsets, and robotics kits via managed approval.
                </p>
              </div>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {["GPU", "3D Print", "VR", "Robotics"].map((t) => (
                  <span key={t} className="text-[10px] px-2 py-1 rounded-full font-medium bg-cyan-50 text-cyan-600 border border-cyan-100">
                    {t}
                  </span>
                ))}
              </div>
            </div>

            {/* ⑤ Group Sessions */}
            <div className="rounded-3xl p-6 flex flex-col justify-between bg-white border border-gray-100"
              style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
              <div>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 bg-purple-50 border border-purple-100">
                  <Users size={18} className="text-purple-500" />
                </div>
                <h3 className="font-display font-semibold text-gray-900 mb-2">Group Sessions</h3>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Lead group bookings with a shared code. Add members by matric number — one reference for all.
                </p>
              </div>
              <div className="mt-4 text-xs text-gray-400">Up to 20 members per session</div>
            </div>

            {/* ⑥ Admin Broadcast */}
            <div className="lg:col-span-2 rounded-3xl p-6 flex flex-col sm:flex-row items-start sm:items-center gap-6 bg-white border border-gray-100"
              style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
              <div className="w-10 h-10 rounded-xl shrink-0 flex items-center justify-center bg-red-50 border border-red-100">
                <Radio size={18} className="text-red-500" />
              </div>
              <div className="flex-1">
                <h3 className="font-display font-semibold text-gray-900 mb-1">Admin Broadcast</h3>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Admins push real-time announcements to all users — policy changes, scheduled maintenance, or special events.
                  Delivered via email and in-app notifications.
                </p>
              </div>
              <span className="shrink-0 text-[10px] px-2.5 py-1 rounded-full font-semibold bg-red-50 text-red-500 border border-red-100">
                Live
              </span>
            </div>

          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────────────
          SPACES SHOWCASE
      ───────────────────────────────────────────────────────────────────────── */}
      <section id="spaces" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-10 gap-4">
            <div>
              <p className="text-xs font-semibold text-brand-500 uppercase tracking-widest mb-3">Available Now</p>
              <h2 className="text-3xl sm:text-4xl font-display font-bold text-gray-900" style={{ letterSpacing: "-0.02em" }}>
                Explore the Hub
              </h2>
            </div>
            <Link href="/spaces" className="hidden sm:flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 transition-colors shrink-0">
              View all <ChevronRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {spaces.slice(0, 6).map((space) => (
              <Link key={space.id} href={`/spaces/${space.slug}`} className="group block">
                <div className="rounded-2xl overflow-hidden transition-all duration-300 group-hover:-translate-y-1 bg-white border border-gray-100"
                  style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
                  {space.imageUrl && (
                    <div className="relative h-44 overflow-hidden bg-gray-100">
                      <Image
                        src={space.imageUrl}
                        alt={space.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-3 right-3">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold"
                          style={{
                            background: "rgba(255,255,255,0.92)",
                            backdropFilter: "blur(8px)",
                            border: "1px solid rgba(0,0,0,0.07)",
                            color: space.availability === "available" ? "#059669" : "#d97706",
                          }}>
                          <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${space.availability === "available" ? "bg-emerald-500" : "bg-amber-400"}`} />
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
                    <div className="flex items-center justify-between text-xs text-gray-400 pt-3 border-t border-gray-50">
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

          <div className="mt-10 text-center">
            <Link href="/spaces">
              <Button variant="outline" size="lg">
                View All 12 Spaces <ArrowRight size={16} />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────────────
          CTA BANNER
      ───────────────────────────────────────────────────────────────────────── */}
      <section className="py-24 bg-gray-50/60">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-3xl overflow-hidden text-center px-8 py-16 sm:py-20"
            style={{
              background: "linear-gradient(135deg, #5B4CF5 0%, #4338ca 40%, #06b6d4 100%)",
              boxShadow: "0 20px 60px rgba(91,76,245,0.30), 0 8px 24px rgba(91,76,245,0.15)",
            }}>
            {/* Dot grid overlay */}
            <div className="absolute inset-0 pointer-events-none opacity-20"
              style={{
                backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.4) 1px, transparent 1px)",
                backgroundSize: "24px 24px",
              }} />
            {/* Glow top */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-32 pointer-events-none"
              style={{ background: "radial-gradient(ellipse at top, rgba(255,255,255,0.15) 0%, transparent 70%)" }} />

            <div className="relative">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-6"
                style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.25)" }}>
                <Sparkles size={12} className="text-white" />
                <span className="text-xs font-semibold text-white tracking-wide">UNILAG Students &amp; Staff</span>
              </div>

              <h2 className="text-4xl sm:text-5xl font-display font-bold text-white mb-4" style={{ letterSpacing: "-0.02em" }}>
                Ready to Build<br />Something Great?
              </h2>
              <p className="text-white/75 mb-8 max-w-md mx-auto leading-relaxed">
                Sign up with your UNILAG email and start booking AI‑UNIPOD spaces today.
                Completely free for all registered members.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <Link href="/auth/signup">
                  <button className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-base bg-white text-brand-600 hover:bg-gray-50 transition-all hover:-translate-y-0.5 shadow-lg"
                    style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.15)" }}>
                    Create Free Account <ArrowRight size={16} />
                  </button>
                </Link>
                <Link href="/auth/login">
                  <button className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-base text-white transition-all hover:-translate-y-0.5"
                    style={{ border: "1px solid rgba(255,255,255,0.35)", background: "rgba(255,255,255,0.10)" }}>
                    Sign In
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────────────
          FOOTER
      ───────────────────────────────────────────────────────────────────────── */}
      <footer className="border-t border-gray-100 bg-white py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: "linear-gradient(135deg, #5B4CF5, #06B6D4)" }}>
              <span className="text-white font-display font-bold text-xs">U</span>
            </div>
            <div>
              <span className="font-display font-bold text-sm text-gray-900 tracking-tight" style={{ letterSpacing: "-0.02em" }}>
                AI-UNIPOD
              </span>
              <span className="text-[10px] text-gray-400 font-medium tracking-widest uppercase ml-1.5">BMS</span>
            </div>
          </div>
          <p className="text-xs text-gray-400">
            © {new Date().getFullYear()} AI-UNIPOD UNILAG. Booking Management System.
          </p>
          <div className="flex items-center gap-5 text-xs text-gray-400">
            <Link href="/admin/login" className="hover:text-gray-700 transition-colors">Admin</Link>
            <Link href="/auth/login" className="hover:text-gray-700 transition-colors">Sign In</Link>
            <Link href="/auth/signup" className="hover:text-gray-700 transition-colors">Get Access</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
