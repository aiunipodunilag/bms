/**
 * fix-css.js — Runs before `npm run build` on Vercel.
 * Writes:
 *   1. tailwind.config.ts  — brand = deep blue, clean tokens
 *   2. app/globals.css     — light theme, Space Grotesk + Orbitron
 *   3. Navbar.tsx          — blue, mobile hamburger, Equipment link, sign-out routing
 *   4. Card.tsx            — clean white card with hover option
 *   5. Button.tsx          — blue primary
 *   6. Badge.tsx           — blue default
 *   7. AdminSidebar.tsx    — mobile hamburger drawer, sign-out → /admin/login
 */

const fs   = require("fs");
const path = require("path");
const root = path.join(__dirname, "..");

function write(rel, content) {
  const target = path.join(root, rel);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, content, "utf8");
  console.log(`✓ ${rel}`);
}

// ─── 1. tailwind.config.ts — brand = deep blue ───────────────────────────────
write("tailwind.config.ts", `import type { Config } from "tailwindcss";
import plugin from "tailwindcss/plugin";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  "#eff6ff",
          100: "#dbeafe",
          200: "#bfdbfe",
          300: "#93c5fd",
          400: "#60a5fa",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
          800: "#1e40af",
          900: "#1e3a8a",
          950: "#172554",
        },
      },
      fontFamily: {
        sans:    ["Space Grotesk", "system-ui", "sans-serif"],
        display: ["Orbitron", "monospace"],
      },
      animation: {
        "scroll-x": "scroll-x 40s linear infinite",
      },
      keyframes: {
        "scroll-x": {
          "0%":   { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
    },
  },
  plugins: [
    plugin(function ({ addUtilities }) {
      addUtilities({
        ".scrollbar-none": {
          "-ms-overflow-style": "none",
          "scrollbar-width":    "none",
        },
        ".scrollbar-none::-webkit-scrollbar": {
          display: "none",
        },
        ".font-display": {
          "font-family": '"Orbitron", monospace',
        },
      });
    }),
  ],
};

export default config;
`);

// ─── 2. globals.css — light theme ────────────────────────────────────────────
write("app/globals.css", `@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@700;900&family=Space+Grotesk:wght@300;400;500;600;700&display=swap');
@tailwind base;
@tailwind components;
@tailwind utilities;

html { scroll-behavior: smooth; }
*, *::before, *::after { box-sizing: border-box; }

body {
  background-color: #f8fafc;
  color: #0f172a;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  font-family: 'Space Grotesk', system-ui, sans-serif;
}

h1, h2, h3, h4, h5, h6 {
  font-family: 'Space Grotesk', system-ui, sans-serif;
  font-weight: 700;
  line-height: 1.2;
}

.font-display { font-family: 'Orbitron', monospace; }

/* Scrollbar */
::-webkit-scrollbar              { width: 4px; height: 4px; }
::-webkit-scrollbar-track        { background: transparent; }
::-webkit-scrollbar-thumb        { background: rgba(37,99,235,0.35); border-radius: 99px; }
.scrollbar-none                  { scrollbar-width: none; }
.scrollbar-none::-webkit-scrollbar { display: none; }

/* Scroll animation */
@keyframes scroll-x {
  0%   { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}
.animate-scroll-x { animation: scroll-x 40s linear infinite; }
`);

// ─── 3. Navbar.tsx — mobile hamburger, blue, sign-out routing ─────────────────
write("components/layout/Navbar.tsx", `"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X, LogOut } from "lucide-react";
import type { UserTier } from "@/types";

interface NavUser {
  name: string;
  tier: UserTier;
  tierLabel: string;
}
interface NavbarProps {
  user?: NavUser | null;
}

const NAV_LINKS = [
  { href: "/spaces",           label: "Spaces"       },
  { href: "/bookings",         label: "My Bookings"  },
  { href: "/resource-request", label: "Equipment"    },
  { href: "/dashboard",        label: "Dashboard"    },
];

export default function Navbar({ user }: NavbarProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const active = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14">

          {/* Logo */}
          <Link href="/" className="font-bold text-blue-600 text-sm tracking-wide shrink-0 font-mono">
            AI-UNIPOD <span className="text-gray-300 font-sans">·</span> BMS
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-0.5">
            {NAV_LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={\`px-3 py-1.5 rounded-lg text-sm font-medium transition-all \${
                  active(href)
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }\`}
              >
                {label}
              </Link>
            ))}
          </nav>

          {/* Desktop user */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                <Link
                  href="/dashboard/profile"
                  className="flex items-center gap-2 text-sm text-gray-700 hover:text-gray-900 transition-colors"
                >
                  <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                    <span className="text-blue-700 font-bold text-xs">
                      {user.name.charAt(0)}
                    </span>
                  </div>
                  <span className="font-medium">{user.name.split(" ")[0]}</span>
                </Link>
                <Link
                  href="/auth/login"
                  className="text-xs text-gray-400 hover:text-red-600 flex items-center gap-1 transition-colors"
                >
                  <LogOut size={13} /> Sign out
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="text-sm text-gray-600 hover:text-gray-900 font-medium transition-colors"
                >
                  Sign in
                </Link>
                <Link
                  href="/auth/signup"
                  className="bg-blue-600 text-white text-sm font-medium px-4 py-1.5 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Sign up
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Toggle menu"
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {open && (
        <div className="md:hidden border-t border-gray-100 bg-white shadow-sm">
          <nav className="px-4 py-3 space-y-1">
            {NAV_LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className={\`flex items-center px-3 py-2.5 rounded-xl text-sm font-medium transition-all \${
                  active(href)
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-700 hover:bg-gray-50"
                }\`}
              >
                {label}
              </Link>
            ))}
          </nav>
          <div className="border-t border-gray-100 px-4 py-3">
            {user ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="text-blue-700 font-bold text-xs">{user.name.charAt(0)}</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{user.name}</p>
                    <p className="text-xs text-gray-400">{user.tierLabel}</p>
                  </div>
                </div>
                <Link
                  href="/auth/login"
                  onClick={() => setOpen(false)}
                  className="text-xs text-gray-400 hover:text-red-600 flex items-center gap-1 transition-colors"
                >
                  <LogOut size={13} /> Sign out
                </Link>
              </div>
            ) : (
              <div className="flex gap-3">
                <Link
                  href="/auth/login"
                  onClick={() => setOpen(false)}
                  className="flex-1 text-center text-sm font-medium text-gray-700 border border-gray-300 py-2 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Sign in
                </Link>
                <Link
                  href="/auth/signup"
                  onClick={() => setOpen(false)}
                  className="flex-1 text-center text-sm font-medium text-white bg-blue-600 py-2 rounded-xl hover:bg-blue-700 transition-colors"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
`);

// ─── 4. Card.tsx ──────────────────────────────────────────────────────────────
write("components/ui/Card.tsx", `import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  padding?: "none" | "sm" | "md" | "lg";
  hover?: boolean;
}

const paddingMap = { none: "", sm: "p-4", md: "p-5", lg: "p-6" };

export function Card({ children, className, padding = "md", hover = false }: CardProps) {
  return (
    <div
      className={cn(
        "bg-white rounded-2xl border border-gray-100 shadow-sm",
        paddingMap[padding],
        hover && "hover:shadow-md hover:-translate-y-0.5 transition-all duration-200",
        className
      )}
    >
      {children}
    </div>
  );
}
`);

// ─── 5. Button.tsx — blue primary ────────────────────────────────────────────
write("components/ui/Button.tsx", `import { cn } from "@/lib/utils";
import type { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "xs" | "sm" | "md" | "lg";
  loading?: boolean;
  children: ReactNode;
}

const variants = {
  primary:   "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 shadow-sm active:bg-blue-800",
  secondary: "bg-blue-50 text-blue-700 hover:bg-blue-100 focus:ring-blue-500",
  outline:   "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-blue-500",
  ghost:     "bg-transparent text-gray-600 hover:bg-gray-100 focus:ring-blue-500",
  danger:    "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 shadow-sm",
};

const sizes = {
  xs: "text-xs px-2.5 py-1.5 rounded-lg gap-1",
  sm: "text-xs px-3 py-2 rounded-xl gap-1.5",
  md: "text-sm px-4 py-2.5 rounded-xl gap-2",
  lg: "text-sm px-5 py-3 rounded-xl gap-2 font-semibold",
};

export default function Button({
  variant = "primary",
  size = "md",
  loading = false,
  className,
  disabled,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={cn(
        "inline-flex items-center justify-center font-medium transition-all duration-150",
        "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        variants[variant],
        sizes[size],
        className
      )}
    >
      {loading ? (
        <>
          <svg className="animate-spin h-3.5 w-3.5" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Loading…
        </>
      ) : children}
    </button>
  );
}
`);

// ─── 6. Badge.tsx — blue default ─────────────────────────────────────────────
write("components/ui/Badge.tsx", `import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface BadgeProps {
  children: ReactNode;
  variant?: "default" | "success" | "warning" | "danger" | "info" | "neutral";
  size?: "sm" | "md";
  className?: string;
}

const variants = {
  default: "bg-blue-50 text-blue-700 border border-blue-200",
  success: "bg-green-50 text-green-700 border border-green-200",
  warning: "bg-amber-50 text-amber-700 border border-amber-200",
  danger:  "bg-red-50 text-red-700 border border-red-200",
  info:    "bg-sky-50 text-sky-700 border border-sky-200",
  neutral: "bg-gray-100 text-gray-600 border border-gray-200",
};

const sizes = {
  sm: "text-xs px-2 py-0.5 rounded-md",
  md: "text-xs px-2.5 py-1 rounded-lg",
};

export default function Badge({ children, variant = "default", size = "md", className }: BadgeProps) {
  return (
    <span className={cn("inline-flex items-center gap-1 font-medium", variants[variant], sizes[size], className)}>
      {children}
    </span>
  );
}
`);

// ─── 7. AdminSidebar.tsx — mobile drawer + hamburger ─────────────────────────
write("components/layout/AdminSidebar.tsx", `"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard, CalendarDays, Users, Settings, Building2,
  CheckCircle, Megaphone, LogOut, Menu, X, Wrench,
} from "lucide-react";

interface NavLink {
  href: string;
  label: string;
  icon: React.ElementType;
  badge?: number;
}

const NAV_LINKS: NavLink[] = [
  { href: "/admin",            label: "Overview",   icon: LayoutDashboard },
  { href: "/admin/bookings",   label: "Bookings",   icon: CalendarDays,  badge: 3 },
  { href: "/admin/users",      label: "Users",      icon: Users },
  { href: "/admin/spaces",     label: "Spaces",     icon: Building2 },
  { href: "/admin/checkin",    label: "Check-in",   icon: CheckCircle },
  { href: "/admin/space-lead", label: "Space Lead", icon: Wrench },
  { href: "/admin/broadcast",  label: "Broadcast",  icon: Megaphone },
  { href: "/admin/settings",   label: "Settings",   icon: Settings },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  const linkCls = (href: string) =>
    \`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all \${
      isActive(href)
        ? "bg-blue-50 text-blue-700"
        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
    }\`;

  const iconCls = (href: string) =>
    isActive(href) ? "text-blue-600" : "text-gray-400";

  // JSX variable (not a component) so it shares outer scope without remounting issues
  const logo = (
    <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
      <div>
        <p className="font-bold text-blue-600 text-sm tracking-wide font-mono">AI-UNIPOD</p>
        <p className="text-xs text-gray-400 tracking-widest uppercase mt-0.5">Admin Portal</p>
      </div>
      <button
        className="lg:hidden p-1 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100"
        onClick={() => setMobileOpen(false)}
        aria-label="Close menu"
      >
        <X size={18} />
      </button>
    </div>
  );

  const nav = (
    <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
      {NAV_LINKS.map(({ href, label, icon: Icon, badge }) => (
        <Link
          key={href}
          href={href}
          onClick={() => setMobileOpen(false)}
          className={linkCls(href)}
        >
          <Icon size={17} className={iconCls(href)} />
          <span className="flex-1">{label}</span>
          {badge && (
            <span className="text-xs font-semibold bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full">
              {badge}
            </span>
          )}
        </Link>
      ))}
    </nav>
  );

  const footer = (
    <div className="p-4 border-t border-gray-100">
      <div className="flex items-center gap-3 mb-3 min-w-0">
        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
          <span className="text-blue-700 font-bold text-xs">A</span>
        </div>
        <div className="min-w-0">
          <p className="text-xs font-semibold text-gray-800 truncate">Admin User</p>
          <p className="text-xs text-gray-400 truncate">admin@unipod.unilag.edu.ng</p>
        </div>
      </div>
      <Link
        href="/admin/login"
        onClick={() => setMobileOpen(false)}
        className="flex items-center gap-2 text-xs text-gray-500 hover:text-red-600 px-2 py-1.5 rounded-lg hover:bg-red-50 transition-colors w-full"
      >
        <LogOut size={13} /> Sign out
      </Link>
    </div>
  );

  return (
    <>
      {/* ── Mobile fixed top bar ── */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white border-b border-gray-200 px-4 h-14 flex items-center justify-between">
        <div>
          <p className="font-bold text-blue-600 text-sm font-mono">AI-UNIPOD</p>
          <p className="text-xs text-gray-400 leading-none">Admin Portal</p>
        </div>
        <button
          onClick={() => setMobileOpen(true)}
          className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors"
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>
      </div>

      {/* ── Mobile backdrop ── */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ── Mobile drawer ── */}
      <div
        className={\`lg:hidden fixed top-0 left-0 z-50 h-full w-64 bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-in-out \${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }\`}
      >
        {logo}{nav}{footer}
      </div>

      {/* ── Desktop sidebar ── */}
      <div className="hidden lg:flex flex-col w-56 shrink-0 bg-white border-r border-gray-200 min-h-screen">
        {logo}{nav}{footer}
      </div>
    </>
  );
}
`);

console.log("\n✅ fix-css.js complete.");
