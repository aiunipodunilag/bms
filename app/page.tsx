import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/layout/Navbar";
import Button from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import PhotoStrip from "@/components/ui/PhotoStrip";
import { getPublicSpaces } from "@/lib/data/spaces";
import {
  ArrowRight,
  Cpu,
  Printer,
  Users,
  Calendar,
  QrCode,
  ShieldCheck,
  ChevronRight,
  MapPin,
  Clock,
  Zap,
  Radio,
} from "lucide-react";

const spaces = getPublicSpaces();

const stats = [
  { label: "Bookable Spaces", value: "12" },
  { label: "Operating Days", value: "Mon–Fri" },
  { label: "Check-in System", value: "QR Code" },
  { label: "Users Served", value: "500+" },
];

const features = [
  {
    icon: Calendar,
    title: "Smart Booking Engine",
    description:
      "Book individual or group sessions up to 4 days ahead. Real-time availability, tier-based access, and instant confirmation.",
  },
  {
    icon: ShieldCheck,
    title: "Verified Access Control",
    description:
      "UNILAG ID verification for students and staff. External users verified via OTP. Every booking tied to a real identity.",
  },
  {
    icon: QrCode,
    title: "QR Check-in System",
    description:
      "Receive a unique QR code with every confirmed booking. Scan in seconds at reception. No-show grace period of 20 minutes.",
  },
  {
    icon: Cpu,
    title: "Resource Requests",
    description:
      "Request premium equipment — GPU workstations, 3D printers, VR headsets, robotics kits — through a managed approval flow.",
  },
  {
    icon: Users,
    title: "Group Booking",
    description:
      "Lead a team booking with member validation in real time. Minimum 4 people, with automated limit tracking per member.",
  },
  {
    icon: Zap,
    title: "Role-Based Dashboard",
    description:
      "Every user gets a personalised portal showing their tier, booking history, and live occupancy across all spaces.",
  },
];

const categoryColors: Record<string, string> = {
  lab: "bg-purple-50 text-purple-700 border-purple-200",
  collaboration: "bg-blue-50 text-blue-700 border-blue-200",
  event: "bg-orange-50 text-orange-700 border-orange-200",
  work: "bg-green-50 text-green-700 border-green-200",
  meeting: "bg-gray-50 text-gray-700 border-gray-200",
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-brand-950 text-white">
        {/* Background photo with dark overlay */}
        <div className="absolute inset-0">
          <Image
            src="/spaces/image4.jpeg"
            alt="UNIPOD Maker Space"
            fill
            className="object-cover opacity-30"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-brand-950/80 via-brand-900/70 to-brand-800/90" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 sm:pt-28 lg:pt-36 pb-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-700 text-brand-200 text-sm font-medium mb-6">
              <Radio size={13} />
              Now live — University of Lagos · Yaba, Lagos
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight text-balance mb-6">
              Book your space at{" "}
              <span className="text-brand-300">AI-UNIPOD UNILAG</span>
            </h1>

            <p className="text-lg sm:text-xl text-brand-200 mb-8 max-w-2xl leading-relaxed">
              The AI & Advanced Computing Pod at the University of Lagos. Access 12 world-class
              innovation spaces — from the Maker Space to the VR Lab — all managed through one
              seamless booking platform.
            </p>

            <div className="flex flex-wrap gap-3">
              <Link href="/auth/signup">
                <Button size="lg" className="bg-white text-brand-700 hover:bg-brand-50 shadow-lg">
                  Get Started Free <ArrowRight size={18} />
                </Button>
              </Link>
              <Link href="/#spaces">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-brand-600 text-white hover:bg-brand-800 bg-transparent"
                >
                  Explore Spaces
                </Button>
              </Link>
            </div>

            {/* Quick stats */}
            <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-4">
              {stats.map((s) => (
                <div key={s.label} className="bg-white/10 rounded-2xl p-4">
                  <p className="text-2xl font-bold text-white">{s.value}</p>
                  <p className="text-sm text-brand-300 mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Horizontal photo strip */}
          <PhotoStrip />
        </div>
      </section>

      {/* ── OPERATING INFO BANNER ────────────────────────────────────────── */}
      <div className="bg-brand-50 border-y border-brand-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-wrap items-center gap-6 text-sm text-brand-700">
            <div className="flex items-center gap-2">
              <Clock size={15} className="text-brand-500" />
              <span className="font-medium">Operating Hours:</span> Mon–Fri, 10:00AM – 5:00PM
            </div>
            <div className="flex items-center gap-2">
              <MapPin size={15} className="text-brand-500" />
              <span className="font-medium">Location:</span> AI & Advanced Computing Pod, UNILAG, Yaba, Lagos
            </div>
            <div className="flex items-center gap-2">
              <Calendar size={15} className="text-brand-500" />
              <span className="font-medium">Book up to:</span> 4 days in advance
            </div>
          </div>
        </div>
      </div>

      {/* ── SPACES DIRECTORY ─────────────────────────────────────────────── */}
      <section id="spaces" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-brand-600 font-semibold text-sm uppercase tracking-wider mb-2">
                Our Spaces
              </p>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
                10 publicly bookable spaces
              </h2>
              <p className="text-gray-500 mt-2 max-w-xl">
                From advanced fabrication to immersive VR — every space is equipped and
                purpose-built for innovation.
              </p>
            </div>
            <Link href="/spaces" className="hidden sm:block">
              <Button variant="secondary">
                View All Spaces <ChevronRight size={16} />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {spaces.slice(0, 6).map((space) => (
              <Link key={space.id} href={`/spaces/${space.slug}`}>
                <Card hover className="h-full overflow-hidden p-0">
                  {/* Space photo */}
                  {space.imageUrl && (
                    <div className="relative w-full h-40 overflow-hidden">
                      <Image
                        src={space.imageUrl}
                        alt={space.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                      <div className="absolute top-2 right-2">
                        <span
                          className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                            space.availability === "available"
                              ? "bg-green-100 text-green-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {space.availability === "available" ? "Available" : "Admin Scheduled"}
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`text-xs font-medium px-2.5 py-1 rounded-full border capitalize ${
                        categoryColors[space.category]
                      }`}
                    >
                      {space.category}
                    </span>
                  </div>

                  <h3 className="font-semibold text-gray-900 text-base mb-1.5">{space.name}</h3>
                  <p className="text-sm text-gray-500 line-clamp-2 mb-4">{space.description}</p>

                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <div className="flex items-center gap-1.5 text-sm text-gray-500">
                      <Users size={14} />
                      <span>
                        {space.capacity}
                        {space.capacityNote ? ` (${space.capacityNote})` : " seats"}
                      </span>
                    </div>
                    <span className="text-xs text-brand-600 font-medium flex items-center gap-1">
                      View details <ChevronRight size={12} />
                    </span>
                  </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>

          <div className="mt-8 text-center sm:hidden">
            <Link href="/spaces">
              <Button variant="secondary" size="lg">
                View All Spaces <ChevronRight size={16} />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── FEATURES ──────────────────────────────────────────────────────── */}
      <section id="about" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-brand-600 font-semibold text-sm uppercase tracking-wider mb-2">
              Platform Features
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
              Everything you need to access the pod
            </h2>
            <p className="text-gray-500 mt-3 max-w-xl mx-auto">
              Built specifically for UNILAG students, staff, and partner organisations —
              with full support for external users too.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map(({ icon: Icon, title, description }) => (
              <Card key={title} padding="lg">
                <div className="w-10 h-10 rounded-xl bg-brand-100 flex items-center justify-center mb-4">
                  <Icon size={20} className="text-brand-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ───────────────────────────────────────────────────── */}
      <section className="py-20 bg-brand-900 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Ready to book your first session?
          </h2>
          <p className="text-brand-200 text-lg mb-8">
            UNILAG students and staff sign up with their matric or staff number.
            External users can register and get started in minutes.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/auth/signup">
              <Button size="lg" className="bg-white text-brand-700 hover:bg-brand-50">
                Create an Account <ArrowRight size={18} />
              </Button>
            </Link>
            <Link href="/auth/login">
              <Button
                size="lg"
                variant="outline"
                className="border-brand-600 text-white bg-transparent hover:bg-brand-800"
              >
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ────────────────────────────────────────────────────────── */}
      <footer className="bg-gray-950 text-gray-400 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-brand-600 flex items-center justify-center">
              <span className="text-white font-bold text-xs">U</span>
            </div>
            <span className="text-sm font-medium text-gray-300">AI-UNIPOD UNILAG BMS</span>
          </div>
          <p className="text-xs text-gray-600">
            © {new Date().getFullYear()} AI & Advanced Computing Pod · University of Lagos
          </p>
        </div>
      </footer>
    </div>
  );
}
