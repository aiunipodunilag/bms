/**
 * fix-css.js  —  Runs before `npm run build` on Vercel.
 * Rewrites source files to apply the light/clean theme and fix build errors.
 * Files patched: globals.css, Navbar, Card, Button, Badge, AdminSidebar
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

// ─── 1. globals.css ───────────────────────────────────────────────────────────
write("app/globals.css", `
@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@700;800;900&family=Space+Grotesk:wght@400;500;600;700&display=swap');
@tailwind base;
@tailwind components;
@tailwind utilities;

html { scroll-behavior: smooth; }
*, *::before, *::after { box-sizing: border-box; }

body {
  background-color: #f8fafc;
  color: #0f172a;
  -webkit-font-smoothing: antialiased;
  font-family: 'Space Grotesk', system-ui, sans-serif;
}

.font-display { font-family: 'Orbitron', monospace; }

/* ── Scrollbar ── */
::-webkit-scrollbar              { width: 4px; height: 4px; }
::-webkit-scrollbar-track        { background: transparent; }
::-webkit-scrollbar-thumb        { background: rgba(124,58,237,0.4); border-radius: 99px; }

/* ── Scrollbar hide utility ── */
.scrollbar-none { scrollbar-width: none; }
.scrollbar-none::-webkit-scrollbar { display: none; }

/* ── Photo strip animation ── */
@keyframes scroll-x {
  0%   { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}
.animate-scroll-x { animation: scroll-x 40s linear infinite; }
`.trimStart());

// ─── 2. Navbar — light theme ──────────────────────────────────────────────────
write("components/layout/Navbar.tsx", `"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";
import Button from "@/components/ui/Button";
import { Menu, X, Bell, ChevronDown, LogOut, User, Settings } from "lucide-react";

interface NavbarProps {
  user?: { name: string; tier: string; tierLabel: string } | null;
}

export default function Navbar({ user }: NavbarProps) {
  const pathname      = usePathname();
  const [mob, setMob] = useState(false);
  const [prof, setProf] = useState(false);

  const navLinks = user
    ? [
        { href: "/dashboard",        label: "Dashboard" },
        { href: "/spaces",           label: "Spaces" },
        { href: "/bookings",         label: "My Bookings" },
        { href: "/resource-request", label: "Resources" },
      ]
    : [
        { href: "/#spaces", label: "Spaces" },
        { href: "/#about",  label: "About" },
      ];

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-gray-200">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* ── Logo ── */}
          <Link href={user ? "/dashboard" : "/"} className="flex items-center gap-1.5 group">
            <span className="font-display font-black text-base tracking-widest text-violet-600 group-hover:text-violet-700 transition-colors">
              AI-UNIPOD
            </span>
            <span className="text-[10px] text-gray-400 tracking-[0.15em] uppercase hidden sm:inline self-end mb-0.5">
              · BMS
            </span>
          </Link>

          {/* ── Desktop nav ── */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href}
                className={cn(
                  "px-4 py-2 rounded-xl text-sm font-medium transition-colors",
                  pathname === link.href
                    ? "bg-violet-50 text-violet-700"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                )}>
                {link.label}
              </Link>
            ))}
          </div>

          {/* ── Right ── */}
          <div className="flex items-center gap-2">
            {user ? (
              <>
                <button className="relative p-2 rounded-xl text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-colors">
                  <Bell size={18} />
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
                </button>
                <div className="relative">
                  <button onClick={() => setProf(!prof)}
                    className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl hover:bg-gray-50 border border-transparent hover:border-gray-200 transition-all">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-600 to-violet-400 flex items-center justify-center">
                      <span className="text-white text-xs font-bold">{user.name.charAt(0).toUpperCase()}</span>
                    </div>
                    <div className="hidden sm:block text-left">
                      <p className="text-xs font-semibold text-gray-900 leading-tight">{user.name.split(" ")[0]}</p>
                      <p className="text-[10px] text-gray-400 leading-tight">{user.tierLabel}</p>
                    </div>
                    <ChevronDown size={14} className="text-gray-400" />
                  </button>
                  {prof && (
                    <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50">
                      <Link href="/dashboard/profile" onClick={() => setProf(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-50 transition-colors">
                        <User size={14} className="text-violet-500" /> Profile
                      </Link>
                      <Link href="/dashboard/settings" onClick={() => setProf(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-50 transition-colors">
                        <Settings size={14} className="text-violet-500" /> Settings
                      </Link>
                      <div className="my-1 border-t border-gray-100" />
                      <Link href="/auth/logout" onClick={() => setProf(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-500 hover:text-red-600 hover:bg-red-50 transition-colors">
                        <LogOut size={14} /> Sign out
                      </Link>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link href="/auth/login">
                  <Button variant="outline" size="sm">Sign In</Button>
                </Link>
                <Link href="/auth/signup" className="hidden sm:block">
                  <Button size="sm">Get Access</Button>
                </Link>
              </>
            )}
            <button className="md:hidden p-2 rounded-xl text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-colors"
              onClick={() => setMob(!mob)}>
              {mob ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* ── Mobile menu ── */}
        {mob && (
          <div className="md:hidden pb-4 pt-2 border-t border-gray-100 mt-2">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} onClick={() => setMob(false)}
                className={cn(
                  "block px-4 py-2.5 rounded-xl text-sm font-medium transition-colors",
                  pathname === link.href
                    ? "bg-violet-50 text-violet-700"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                )}>
                {link.label}
              </Link>
            ))}
            {!user && (
              <div className="mt-3 px-4">
                <Link href="/auth/signup"><Button className="w-full" size="sm">Get Access</Button></Link>
              </div>
            )}
          </div>
        )}
      </nav>
    </header>
  );
}
`);

// ─── 3. Card — light theme ────────────────────────────────────────────────────
write("components/ui/Card.tsx", `import { cn } from "@/lib/utils";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: "none" | "sm" | "md" | "lg";
  hover?: boolean;
}

export function Card({ children, className, padding = "md", hover = false }: CardProps) {
  const paddings = { none: "", sm: "p-4", md: "p-5", lg: "p-6" };
  return (
    <div className={cn(
      "bg-white rounded-2xl border border-gray-100 shadow-sm",
      paddings[padding],
      hover && "hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 cursor-pointer",
      className
    )}>
      {children}
    </div>
  );
}

export function CardHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("mb-4", className)}>{children}</div>;
}

export function CardTitle({ children, className }: { children: React.ReactNode; className?: string }) {
  return <h3 className={cn("text-base font-semibold text-gray-900", className)}>{children}</h3>;
}

export function CardContent({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn(className)}>{children}</div>;
}
`);

// ─── 4. Button — light theme ──────────────────────────────────────────────────
write("components/ui/Button.tsx", `"use client";
import { cn } from "@/lib/utils";
import { type ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", loading, disabled, children, ...props }, ref) => {
    const base =
      "inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white disabled:opacity-50 disabled:cursor-not-allowed";

    const variants = {
      primary:
        "bg-violet-600 hover:bg-violet-700 text-white shadow-sm focus:ring-violet-500",
      secondary:
        "bg-violet-50 text-violet-700 hover:bg-violet-100 border border-violet-200 focus:ring-violet-400",
      outline:
        "border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 hover:border-gray-400 focus:ring-violet-400",
      ghost:
        "hover:bg-gray-100 text-gray-600 hover:text-gray-900 focus:ring-gray-400",
      danger:
        "bg-red-600 hover:bg-red-700 text-white shadow-sm focus:ring-red-500",
    };

    const sizes = {
      sm: "px-3 py-1.5 text-sm gap-1.5",
      md: "px-4 py-2.5 text-sm gap-2",
      lg: "px-6 py-3 text-base gap-2.5",
    };

    return (
      <button
        ref={ref}
        className={cn(base, variants[variant], sizes[size], className)}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <svg className="animate-spin -ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        )}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";
export default Button;
`);

// ─── 5. Badge — light theme ───────────────────────────────────────────────────
write("components/ui/Badge.tsx", `import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "danger" | "info" | "neutral";
  size?: "sm" | "md";
  className?: string;
}

export default function Badge({ children, variant = "default", size = "md", className }: BadgeProps) {
  const variants = {
    default: "bg-violet-50 text-violet-700 border border-violet-200",
    success: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    warning: "bg-amber-50 text-amber-700 border border-amber-200",
    danger:  "bg-red-50 text-red-700 border border-red-200",
    info:    "bg-cyan-50 text-cyan-700 border border-cyan-200",
    neutral: "bg-gray-100 text-gray-600 border border-gray-200",
  };
  const sizes = { sm: "px-2 py-0.5 text-xs", md: "px-2.5 py-1 text-xs" };
  return (
    <span className={cn("inline-flex items-center font-medium rounded-full", variants[variant], sizes[size], className)}>
      {children}
    </span>
  );
}
`);

// ─── 6. AdminSidebar ──────────────────────────────────────────────────────────
// Admin sidebar stays white/light to match the light admin pages
write("components/layout/AdminSidebar.tsx", `"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, Users, CalendarDays, Building2,
  Megaphone, Settings, ChevronRight, LogOut,
  ShieldCheck, UserCog, ClipboardCheck, type LucideIcon,
} from "lucide-react";

type AdminRole = "super_admin" | "admin" | "receptionist" | "space_lead";
interface NavLink { href: string; label: string; icon: LucideIcon; badge?: number; }

const ADMIN_LINKS: NavLink[] = [
  { href: "/admin",           label: "Overview",             icon: LayoutDashboard },
  { href: "/admin/bookings",  label: "Bookings & Approvals", icon: CalendarDays, badge: 5 },
  { href: "/admin/users",     label: "User Management",      icon: Users, badge: 3 },
  { href: "/admin/spaces",    label: "Spaces",               icon: Building2 },
  { href: "/admin/checkin",   label: "Check-in",             icon: ClipboardCheck },
  { href: "/admin/broadcast", label: "Broadcast",            icon: Megaphone },
  { href: "/admin/settings",  label: "Settings",             icon: Settings },
];

const SUPER_ADMIN_LINKS: NavLink[] = [
  { href: "/superadmin",        label: "Super Admin Panel", icon: ShieldCheck },
  { href: "/superadmin/admins", label: "Manage Admins",     icon: UserCog },
  ...ADMIN_LINKS,
];

const RECEPTIONIST_LINKS: NavLink[] = [
  { href: "/admin/checkin", label: "Check-in Desk", icon: ClipboardCheck },
];

const SPACE_LEAD_LINKS: NavLink[] = [
  { href: "/admin/space-lead", label: "Equipment Verification", icon: ShieldCheck },
];

interface Props { role?: AdminRole; }

export default function AdminSidebar({ role = "admin" }: Props) {
  const pathname = usePathname();
  const links =
    role === "super_admin"  ? SUPER_ADMIN_LINKS :
    role === "receptionist" ? RECEPTIONIST_LINKS :
    role === "space_lead"   ? SPACE_LEAD_LINKS :
    ADMIN_LINKS;

  const roleLabel: Record<AdminRole, string> = {
    super_admin: "Super Admin", admin: "Admin",
    receptionist: "Receptionist", space_lead: "Space Lead",
  };

  return (
    <aside className="w-60 min-h-screen flex flex-col shrink-0 bg-white border-r border-gray-200">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-gray-200">
        <Link href={role === "super_admin" ? "/superadmin" : "/admin"} className="flex flex-col">
          <span className="font-display font-black text-sm tracking-widest text-violet-600">AI-UNIPOD</span>
          <span className="text-[10px] text-gray-400 tracking-widest uppercase mt-0.5">{roleLabel[role]}</span>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {links.map(({ href, label, icon: Icon, badge }) => {
          const active = pathname === href ||
            (href !== "/admin" && href !== "/superadmin" && pathname.startsWith(href));
          return (
            <Link key={href} href={href}
              className={cn(
                "flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors",
                active
                  ? "bg-violet-50 text-violet-700"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              )}>
              <div className="flex items-center gap-3">
                <Icon size={15} className={active ? "text-violet-600" : "text-gray-400"} />
                {label}
              </div>
              {badge ? (
                <span className="bg-violet-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                  {badge}
                </span>
              ) : active ? (
                <ChevronRight size={13} className="text-violet-400" />
              ) : null}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 pb-5 pt-4 border-t border-gray-200">
        <Link href="/admin/login"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors">
          <LogOut size={15} /> Sign out
        </Link>
      </div>
    </aside>
  );
}
`);

console.log("\n✅ All files patched. Build can proceed.");
