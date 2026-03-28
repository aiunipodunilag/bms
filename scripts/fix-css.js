/**
 * fix-css.js  —  Runs before `npm run build` on Vercel.
 * Rewrites source files that either have build errors or need the dark-glass redesign applied.
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
@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700;800;900&family=Space+Grotesk:wght@300;400;500;600;700&display=swap');
@tailwind base;
@tailwind components;
@tailwind utilities;

html { scroll-behavior: smooth; }
*, *::before, *::after { box-sizing: border-box; }

body {
  background-color: #09090f;
  color: #f1f5f9;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  font-family: 'Space Grotesk', system-ui, sans-serif;
}

.font-display { font-family: 'Orbitron', monospace; }
.text-balance  { text-wrap: balance; }

/* ── Scrollbar ── */
::-webkit-scrollbar              { width: 4px; height: 4px; }
::-webkit-scrollbar-track        { background: transparent; }
::-webkit-scrollbar-thumb        { background: rgba(124,58,237,0.5); border-radius: 99px; }

/* ── Animations ── */
@keyframes scroll-x {
  0%   { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}
.animate-scroll-x { animation: scroll-x 40s linear infinite; }

@keyframes pulse-glow {
  0%, 100% { box-shadow: 0 0 20px rgba(124,58,237,0.3); }
  50%       { box-shadow: 0 0 40px rgba(124,58,237,0.6), 0 0 60px rgba(6,182,212,0.2); }
}
.animate-pulse-glow { animation: pulse-glow 3s ease-in-out infinite; }

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50%       { transform: translateY(-8px); }
}
.animate-float { animation: float 4s ease-in-out infinite; }
`.trimStart());

// ─── 2. Navbar ────────────────────────────────────────────────────────────────
write("components/layout/Navbar.tsx", `"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";
import Button from "@/components/ui/Button";
import { Menu, X, Bell, ChevronDown, LogOut, User, Settings } from "lucide-react";

interface NavbarProps {
  user?: { name: string; tier: string; tierLabel: string; avatar?: string } | null;
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
    <header className="sticky top-0 z-50 w-full glass border-b border-white/[0.07]">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* ── Logo ── */}
          <Link href={user ? "/dashboard" : "/"} className="flex items-center gap-1.5 group">
            <span className="font-display font-bold text-base tracking-widest gradient-text group-hover:opacity-80 transition-opacity">
              AI-UNIPOD
            </span>
            <span className="text-[10px] text-slate-500 tracking-[0.15em] uppercase hidden sm:inline self-end mb-0.5">
              · BMS
            </span>
          </Link>

          {/* ── Desktop nav ── */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200",
                  pathname === link.href
                    ? "bg-violet-500/20 text-violet-300 border border-violet-500/30"
                    : "text-slate-400 hover:text-slate-100 hover:bg-white/[0.06]"
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* ── Right ── */}
          <div className="flex items-center gap-2">
            {user ? (
              <>
                <button className="relative p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-white/[0.06] transition-colors">
                  <Bell size={18} />
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                </button>
                <div className="relative">
                  <button
                    onClick={() => setProf(!prof)}
                    className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl hover:bg-white/[0.06] border border-transparent hover:border-white/[0.08] transition-all"
                  >
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-600 to-cyan-500 flex items-center justify-center">
                      <span className="text-white text-xs font-bold">{user.name.charAt(0).toUpperCase()}</span>
                    </div>
                    <div className="hidden sm:block text-left">
                      <p className="text-xs font-semibold text-slate-100 leading-tight">{user.name.split(" ")[0]}</p>
                      <p className="text-[10px] text-slate-400 leading-tight">{user.tierLabel}</p>
                    </div>
                    <ChevronDown size={14} className="text-slate-400" />
                  </button>
                  {prof && (
                    <div className="absolute right-0 mt-2 w-52 glass rounded-xl shadow-glass border border-white/[0.08] py-1 z-50">
                      <Link href="/dashboard/profile" onClick={() => setProf(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-300 hover:text-slate-100 hover:bg-white/[0.06] transition-colors">
                        <User size={14} className="text-violet-400" /> Profile
                      </Link>
                      <Link href="/dashboard/settings" onClick={() => setProf(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-300 hover:text-slate-100 hover:bg-white/[0.06] transition-colors">
                        <Settings size={14} className="text-violet-400" /> Settings
                      </Link>
                      <div className="my-1 border-t border-white/[0.06]" />
                      <Link href="/auth/logout" onClick={() => setProf(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors">
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
            <button className="md:hidden p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-white/[0.06] transition-colors"
              onClick={() => setMob(!mob)}>
              {mob ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* ── Mobile menu ── */}
        {mob && (
          <div className="md:hidden pb-4 pt-2 border-t border-white/[0.06] mt-2">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} onClick={() => setMob(false)}
                className={cn(
                  "block px-4 py-2.5 rounded-xl text-sm font-medium transition-colors",
                  pathname === link.href
                    ? "bg-violet-500/20 text-violet-300"
                    : "text-slate-400 hover:text-slate-100 hover:bg-white/[0.06]"
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

// ─── 3. Card ──────────────────────────────────────────────────────────────────
write("components/ui/Card.tsx", `import { cn } from "@/lib/utils";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: "none" | "sm" | "md" | "lg";
  hover?: boolean;
  glow?: boolean;
}

export function Card({ children, className, padding = "md", hover = false, glow = false }: CardProps) {
  const paddings = { none: "", sm: "p-4", md: "p-5", lg: "p-6" };
  return (
    <div className={cn(
      "glass rounded-2xl shadow-glass",
      paddings[padding],
      hover && "hover:bg-white/[0.07] hover:-translate-y-0.5 transition-all duration-200 cursor-pointer",
      glow && "shadow-glow",
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
  return <h3 className={cn("text-base font-semibold text-slate-100", className)}>{children}</h3>;
}

export function CardContent({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn(className)}>{children}</div>;
}
`);

// ─── 4. Button ────────────────────────────────────────────────────────────────
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
      "inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#09090f] disabled:opacity-50 disabled:cursor-not-allowed";

    const variants = {
      primary:
        "bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 text-white shadow-glow-sm hover:shadow-glow focus:ring-violet-500",
      secondary:
        "glass text-violet-300 hover:bg-white/[0.08] border-violet-500/30 focus:ring-violet-400",
      outline:
        "border border-white/10 bg-transparent hover:bg-white/[0.06] text-slate-200 hover:border-white/20 focus:ring-violet-400",
      ghost:
        "hover:bg-white/[0.06] text-slate-300 focus:ring-slate-400",
      danger:
        "bg-red-600/90 hover:bg-red-500 text-white focus:ring-red-500 shadow-sm",
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

// ─── 5. Badge ─────────────────────────────────────────────────────────────────
write("components/ui/Badge.tsx", `import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "danger" | "info" | "neutral";
  size?: "sm" | "md";
  className?: string;
}

export default function Badge({ children, variant = "default", size = "md", className }: BadgeProps) {
  const variants = {
    default: "bg-violet-500/20 text-violet-300 border border-violet-500/30",
    success: "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30",
    warning: "bg-amber-500/20 text-amber-300 border border-amber-500/30",
    danger:  "bg-red-500/20 text-red-300 border border-red-500/30",
    info:    "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30",
    neutral: "bg-white/10 text-slate-300 border border-white/10",
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
    <aside className="w-60 min-h-screen flex flex-col shrink-0" style={{ background: "#06060e", borderRight: "1px solid rgba(255,255,255,0.06)" }}>
      {/* Logo */}
      <div className="px-5 py-5" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <Link href={role === "super_admin" ? "/superadmin" : "/admin"} className="flex items-center gap-3 group">
          <div className="relative w-8 h-8 flex items-center justify-center">
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-violet-600 to-cyan-500" />
            <span className="relative text-white font-display font-bold text-sm">U</span>
          </div>
          <div>
            <p className="font-display font-bold text-xs tracking-widest gradient-text">AI-UNIPOD</p>
            <p className="text-[10px] text-slate-500 tracking-widest uppercase">{roleLabel[role]}</p>
          </div>
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
                "flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150",
                active
                  ? "bg-violet-500/20 text-violet-300 border border-violet-500/25"
                  : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.05]"
              )}>
              <div className="flex items-center gap-3">
                <Icon size={15} className={active ? "text-violet-400" : "text-slate-500"} />
                {label}
              </div>
              {badge ? (
                <span className="bg-gradient-to-r from-violet-600 to-cyan-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                  {badge}
                </span>
              ) : active ? (
                <ChevronRight size={13} className="text-violet-400 opacity-60" />
              ) : null}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 pb-5 pt-4" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <Link href="/admin/login"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all">
          <LogOut size={15} /> Sign out
        </Link>
      </div>
    </aside>
  );
}
`);

console.log("\n✅ All files patched. Build can proceed.");
