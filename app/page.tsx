import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/layout/Navbar";
import Button from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import PhotoStrip from "@/components/ui/PhotoStrip";
import { getPublicSpaces } from "@/lib/data/spaces";
import {
  ArrowRight, Cpu, Printer, Users, Calendar,
  ShieldCheck, ChevronRight, Clock, Zap, Radio, Layers,
} from "lucide-react";

const spaces = getPublicSpaces();

const stats = [
  { label: "Bookable Spaces",  value: "12",      sub: "Labs + Studios" },
  { label: "Daily Hours",      value: "9hrs",     sub: "10 AM – 7 PM" },
  { label: "Access System",    value: "Codes",    sub: "Instant check-in" },
  { label: "Members Served",   value: "500+",     sub: "& growing" },
];

const features = [
  {
    icon: Calendar,
    title: "Smart Booking Engine",
    description: "Book up to 14 days ahead. Real-time availability, tier-based access control, and instant booking codes.",
  },
  {
    icon: ShieldCheck,
    title: "Verified Access",
    description: "UNILAG ID verification for students and staff. External users verified via email confirmation — every booking tied to a real identity.",
  },
  {
    icon: Zap,
    title: "Instant Check-in Codes",
    description: "Receive a unique BMS code with every confirmed booking. Show it at reception in seconds. No-show grace period of 20 minutes.",
  },
  {
    icon: Cpu,
    title: "Equipment Access",
    description: "Request premium equipment — GPU workstations, 3D printers, VR headsets, robotics kits — through a managed approval flow.",
  },
  {
    icon: Users,
    title: "Group Sessions",
    description: "Lead collaborative sessions with group booking codes. Add members by matric number, get one shared booking reference.",
  },
  {
    icon: Radio,
    title: "Admin Broadcast",
    description: "Admins can push real-time announcements to all users — policy changes, scheduled maintenance, or special events.",
  },
];

const categoryColors: Record<string, string> = {
  lab:           "from-violet-600/20 to-violet-500/5 border-violet-500/20",
  collaboration: "from-cyan-600/20 to-cyan-500/5 border-cyan-500/20",
  event:         "from-amber-600/20 to-amber-500/5 border-amber-500/20",
  work:          "from-emerald-600/20 to-emerald-500/5 border-emerald-500/20",
  meeting:       "from-blue-600/20 to-blue-500/5 border-blue-500/20",
};

const categoryBadge: Record<string, "info" | "default" | "warning" | "success" | "neutral"> = {
  lab:           "default",
  collaboration: "info",
  event:         "warning",
  work:          "success",
  meeting:       "neutral",
};

export default function LandingPage() {
  return (
    <div className="min-h-screen" style={{ background: "#09090f" }}>
      <Navbar />

      {/* ── HERO ──────────────────────────────────────────────────────────────── */}
      <section className="relative min-h-[92vh] flex items-center overflow-hidden">
        {/* Background: room photo + dark overlay */}
        <div className="absolute inset-0">
          <Image
            src="/spaces/image14.jpeg"
            alt="AI-UNIPOD workspace"
            fill
            className="object-cover opacity-25"
            priority
          />
          <div className="absolute inset-0" style={{
            background: "linear-gradient(135deg, rgba(9,9,15,0.95) 0%, rgba(9,9,15,0.7) 50%, rgba(9,9,15,0.9) 100%)"
          }} />
        </div>

        {/* Grid overlay */}
        <div className="absolute inset-0 grid-bg opacity-60" />

        {/* Glow orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(124,58,237,0.12) 0%, transparent 70%)" }} />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(6,182,212,0.08) 0%, transparent 70%)" }} />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 w-full">
          <div className="max-w-3xl">
            {/* Tag */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass border border-violet-500/30 mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-medium text-slate-300 tracking-wide">
                UNILAG AI Innovation Hub · Now Open
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-display font-bold leading-[1.05] mb-6">
              <span className="text-slate-100">Book Your</span>
              <br />
              <span className="gradient-text">AI Workspace.</span>
            </h1>

            <p className="text-lg text-slate-400 leading-relaxed mb-10 max-w-xl">
              Africa&apos;s most advanced student innovation hub. Reserve labs, studios, and
              collaboration spaces at UNILAG&apos;s AI-UNIPOD — in seconds.
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <Link href="/auth/signup">
                <Button size="lg" className="animate-pulse-glow">
                  Get Access <ArrowRight size={16} />
                </Button>
              </Link>
              <Link href="/spaces">
                <Button variant="outline" size="lg">
                  Explore Spaces <ChevronRight size={16} />
                </Button>
              </Link>
              <Link href="/admin/login">
                <Button variant="ghost" size="lg" className="text-slate-500 hover:text-slate-300">
                  Admin Login
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom fade */}
        <div className="absolute bottom-0 inset-x-0 h-32 pointer-events-none"
          style={{ background: "linear-gradient(to top, #09090f, transparent)" }} />
      </section>

      {/* ── STATS ─────────────────────────────────────────────────────────────── */}
      <section className="relative py-12 border-y border-white/[0.06]" style={{ background: "rgba(124,58,237,0.03)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center group">
                <p className="text-4xl font-display font-bold gradient-text mb-1">{stat.value}</p>
                <p className="text-sm font-semibold text-slate-200">{stat.label}</p>
                <p className="text-xs text-slate-500 mt-0.5">{stat.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PHOTO STRIP ───────────────────────────────────────────────────────── */}
      <section className="py-8 overflow-hidden border-b border-white/[0.04]">
        <PhotoStrip />
      </section>

      {/* ── SPACES ────────────────────────────────────────────────────────────── */}
      <section id="spaces" className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <Badge variant="default" className="mb-4">12 Spaces Available</Badge>
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-slate-100 mb-3">
              Your Innovation<br />
              <span className="gradient-text">Command Center</span>
            </h2>
            <p className="text-slate-400 max-w-xl">
              From AI labs and maker spaces to pitch arenas — every corner of AI-UNIPOD is purpose-built for builders.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {spaces.map((space) => (
              <Link key={space.id} href={`/spaces/${space.slug}`} className="group block">
                <div className={`relative rounded-2xl overflow-hidden border bg-gradient-to-b ${categoryColors[space.category] ?? "from-white/5 to-transparent border-white/10"} transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-glow`}>
                  {/* Image */}
                  {space.imageUrl && (
                    <div className="relative h-44 overflow-hidden">
                      <Image
                        src={space.imageUrl}
                        alt={space.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500 brightness-75"
                      />
                      <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(9,9,15,0.8) 0%, transparent 60%)" }} />
                      {/* Availability dot */}
                      <div className="absolute top-3 right-3">
                        <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-medium glass border border-white/10 ${space.availability === "available" ? "text-emerald-300" : "text-amber-300"}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${space.availability === "available" ? "bg-emerald-400" : "bg-amber-400"} animate-pulse`} />
                          {space.availability === "available" ? "Open" : "Limited"}
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-semibold text-slate-100 text-sm leading-tight group-hover:gradient-text transition-all">
                        {space.name}
                      </h3>
                      <Badge variant={categoryBadge[space.category]} size="sm" className="shrink-0 capitalize">
                        {space.category}
                      </Badge>
                    </div>

                    <p className="text-xs text-slate-500 leading-relaxed mb-3 line-clamp-2">
                      {space.description}
                    </p>

                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Users size={11} className="text-violet-400" />
                        {space.capacity} capacity
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
                View All Spaces <ArrowRight size={16} />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── FEATURES ──────────────────────────────────────────────────────────── */}
      <section id="about" className="py-24 border-t border-white/[0.04]" style={{ background: "rgba(124,58,237,0.02)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <Badge variant="info" className="mb-4">How it works</Badge>
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-slate-100 mb-3">
              Built for Builders.<br />
              <span className="gradient-text">Powered by AI-UNIPOD.</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map(({ icon: Icon, title, description }) => (
              <Card key={title} className="group hover:shadow-glow transition-all duration-300 border border-white/[0.06]">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600/30 to-cyan-500/20 border border-violet-500/30 flex items-center justify-center mb-4 group-hover:shadow-glow-sm transition-all">
                  <Icon size={18} className="text-violet-300" />
                </div>
                <h3 className="font-display font-semibold text-sm text-slate-100 mb-2 tracking-wide">{title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────────────────── */}
      <section className="py-24 border-t border-white/[0.04]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-3xl overflow-hidden p-12 text-center glass border border-violet-500/20">
            <div className="absolute inset-0 grid-bg opacity-40" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-48 rounded-full pointer-events-none"
              style={{ background: "radial-gradient(circle, rgba(124,58,237,0.2) 0%, transparent 70%)" }} />
            <div className="relative">
              <Badge variant="default" className="mb-6">UNILAG Students & Staff</Badge>
              <h2 className="text-4xl sm:text-5xl font-display font-bold text-slate-100 mb-4">
                Ready to Build<br />
                <span className="gradient-text">Something Great?</span>
              </h2>
              <p className="text-slate-400 mb-8 max-w-md mx-auto">
                Sign up with your UNILAG email and start booking AI-UNIPOD spaces today. Free for registered members.
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

      {/* ── FOOTER ────────────────────────────────────────────────────────────── */}
      <footer className="py-10 border-t border-white/[0.04]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="relative w-7 h-7 flex items-center justify-center">
              <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-violet-600 to-cyan-500" />
              <span className="relative text-white font-display font-bold text-xs">U</span>
            </div>
            <span className="font-display font-bold text-xs tracking-widest gradient-text">AI-UNIPOD</span>
          </div>
          <p className="text-xs text-slate-600">
            © {new Date().getFullYear()} AI-UNIPOD UNILAG. Booking Management System.
          </p>
          <div className="flex items-center gap-4 text-xs text-slate-600">
            <Link href="/admin/login" className="hover:text-slate-400 transition-colors">Admin</Link>
            <Link href="/auth/login" className="hover:text-slate-400 transition-colors">Sign In</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
