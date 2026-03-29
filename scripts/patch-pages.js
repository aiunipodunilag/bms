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


console.log("\n✅ patch-pages.js complete.");
