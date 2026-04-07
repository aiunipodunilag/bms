"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  Building2,
  QrCode,
  Megaphone,
  Settings,
  ChevronRight,
  LogOut,
  ShieldCheck,
  UserCog,
  Package,
  type LucideIcon,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";


// Full admin nav — shown to super_admin and admin
const ADMIN_LINKS: NavLink[] = [
  { href: "/admin",                    label: "Overview",             icon: LayoutDashboard },
  { href: "/admin/bookings",           label: "Bookings & Approvals", icon: CalendarDays },
  { href: "/admin/resource-requests",  label: "Resource Requests",    icon: Package },
  { href: "/admin/users",              label: "User Management",      icon: Users },
  { href: "/admin/spaces",             label: "Spaces",               icon: Building2 },
  { href: "/admin/checkin",            label: "Check-in",             icon: QrCode },
  { href: "/admin/broadcast",          label: "Broadcast",            icon: Megaphone },
  { href: "/admin/settings",           label: "Settings",             icon: Settings },
];

// Super admin gets an extra link to their control panel
const SUPER_ADMIN_LINKS: NavLink[] = [
  { href: "/superadmin",         label: "Super Admin Panel",  icon: ShieldCheck },
  { href: "/superadmin/admins",  label: "Manage Admins",      icon: UserCog },
  ...ADMIN_LINKS,
];

// Receptionist: check-in desk only
const RECEPTIONIST_LINKS: NavLink[] = [
  { href: "/admin/checkin",  label: "Check-in Desk", icon: QrCode },
];

// Space lead: their verification dashboard only
const SPACE_LEAD_LINKS: NavLink[] = [
  { href: "/admin/space-lead", label: "Equipment Verification", icon: ShieldCheck },
];

type AdminRole = "super_admin" | "admin" | "receptionist" | "space_lead";

interface NavLink {
  href: string;
  label: string;
  icon: LucideIcon;
  badge?: number;
}

interface Props {
  role?: AdminRole;
}

export default function AdminSidebar({ role: roleProp }: Props) {
  const pathname = usePathname();
  // Default to null so no links are shown until the real role is confirmed.
  // This prevents a receptionist/space_lead from briefly seeing admin links.
  const [role, setRole] = useState<AdminRole | null>(roleProp ?? null);
  const [adminName, setAdminName] = useState<string>("");
  const [adminEmail, setAdminEmail] = useState<string>("");
  const [pendingCounts, setPendingCounts] = useState<Record<string, number>>({});

  // Fetch actual role from session so nav links are always correct
  useEffect(() => {
    fetch("/api/admin/me")
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (data?.role) setRole(data.role as AdminRole);
        if (data?.full_name) setAdminName(data.full_name);
        if (data?.email) setAdminEmail(data.email);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (role === "admin" || role === "super_admin") {
      const today = new Date().toISOString().split("T")[0];
      Promise.all([
        fetch(`/api/admin/bookings?status=pending&date_gte=${today}`).then((r) => r.json()),
        fetch("/api/admin/users?status=pending").then((r) => r.json()),
        fetch("/api/admin/resource-requests?status=pending").then((r) => r.json()),
      ]).then(([bookingsData, usersData, resourceData]) => {
        setPendingCounts({
          "/admin/bookings": bookingsData.bookings?.length ?? 0,
          "/admin/users": usersData.users?.length ?? 0,
          "/admin/resource-requests": resourceData.requests?.length ?? 0,
        });
      }).catch(() => {});
    }
  }, [role]);

  // Step 1: clear localStorage via browser client, step 2: clear server cookies
  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut({ scope: "global" });
    window.location.href = "/auth/signout";
  };

  const links =
    role === null           ? [] :
    role === "super_admin"  ? SUPER_ADMIN_LINKS :
    role === "receptionist" ? RECEPTIONIST_LINKS :
    role === "space_lead"   ? SPACE_LEAD_LINKS :
    ADMIN_LINKS;

  const roleLabel: Record<AdminRole, string> = {
    super_admin:  "Super Admin",
    admin:        "Admin",
    receptionist: "Receptionist",
    space_lead:   "Space Lead",
  };

  const roleBadgeColor: Record<AdminRole, string> = {
    super_admin:  "bg-violet-100 text-violet-700",
    admin:        "bg-brand-50 text-brand-700",
    receptionist: "bg-cyan-50 text-cyan-700",
    space_lead:   "bg-emerald-50 text-emerald-700",
  };

  return (
    <aside className="w-60 min-h-screen bg-white border-r border-black/[0.06] flex flex-col shrink-0"
      style={{ boxShadow: "1px 0 0 rgba(0,0,0,0.04)" }}>
      {/* Logo */}
      <div className="px-5 py-4 border-b border-black/[0.06]">
        <Link href={role === "super_admin" ? "/superadmin" : "/admin"} className="flex flex-col gap-2">
          <Image
            src="/logo.svg"
            alt="UniPod"
            height={34}
            width={136}
            className="object-contain"
            priority
          />
          <span className={cn("text-[10px] font-semibold px-1.5 py-0.5 rounded-full w-fit", role ? roleBadgeColor[role] : "bg-gray-100 text-gray-400")}>
            {role ? roleLabel[role] : "Loading…"}
          </span>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {links.map(({ href, label, icon: Icon, badge }) => {
          const active = pathname === href || (href !== "/admin" && href !== "/superadmin" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "relative flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150",
                active
                  ? "bg-brand-50 text-brand-700"
                  : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
              )}
            >
              {/* Active left indicator */}
              {active && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full bg-brand-500" />
              )}
              <div className="flex items-center gap-3">
                <Icon size={16} className={active ? "text-brand-600" : "text-gray-400"} />
                {label}
              </div>
              {(pendingCounts[href] ?? badge ?? 0) > 0 ? (
                <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                  {pendingCounts[href] ?? badge}
                </span>
              ) : (
                active && <ChevronRight size={13} className="text-brand-400 opacity-60" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer — admin identity + sign out */}
      <div className="px-3 pb-4 border-t border-black/[0.06] pt-3 space-y-1">
        {(adminName || adminEmail) && (
          <div className="flex items-center gap-2.5 px-3 py-2.5 mb-1">
            <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
              <Users size={13} className="text-gray-500" />
            </div>
            <div className="min-w-0">
              {adminName && (
                <p className="text-xs font-semibold text-gray-800 truncate" style={{ letterSpacing: "-0.01em" }}>
                  {adminName}
                </p>
              )}
              {adminEmail && (
                <p className="text-[10px] text-gray-400 truncate">{adminEmail}</p>
              )}
            </div>
          </div>
        )}
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all duration-150"
        >
          <LogOut size={16} />
          Sign out
        </button>
      </div>
    </aside>
  );
}
