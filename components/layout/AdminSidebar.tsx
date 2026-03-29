"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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
  const router = useRouter();
  const [role, setRole] = useState<AdminRole>(roleProp ?? "admin");
  const [pendingCounts, setPendingCounts] = useState<Record<string, number>>({});
  const [signingOut, setSigningOut] = useState(false);

  // Fetch actual role from session so nav links are always correct
  useEffect(() => {
    fetch("/api/admin/me")
      .then((r) => r.ok ? r.json() : null)
      .then((data) => { if (data?.role) setRole(data.role as AdminRole); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (role === "admin" || role === "super_admin") {
      Promise.all([
        fetch("/api/admin/bookings?status=pending").then((r) => r.json()),
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

  const handleSignOut = async () => {
    setSigningOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
  };

  const links =
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

  return (
    <aside className="w-60 min-h-screen bg-white border-r border-gray-200 flex flex-col shrink-0">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-gray-200">
        <Link href={role === "super_admin" ? "/superadmin" : "/admin"} className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-violet-600 flex items-center justify-center">
            <span className="text-white font-bold text-xs">U</span>
          </div>
          <div>
            <p className="text-gray-900 font-semibold text-sm">AI-UNIPOD</p>
            <p className="text-gray-400 text-xs">{roleLabel[role]}</p>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {links.map(({ href, label, icon: Icon, badge }) => {
          const active = pathname === href || (href !== "/admin" && href !== "/superadmin" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors",
                active
                  ? "bg-violet-600 text-white"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              )}
            >
              <div className="flex items-center gap-3">
                <Icon size={16} />
                {label}
              </div>
              {(pendingCounts[href] ?? badge ?? 0) > 0 ? (
                <span className="bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                  {pendingCounts[href] ?? badge}
                </span>
              ) : (
                active && <ChevronRight size={14} className="opacity-60" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 pb-5 border-t border-gray-200 pt-4">
        <button
          onClick={handleSignOut}
          disabled={signingOut}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors disabled:opacity-50"
        >
          <LogOut size={16} />
          {signingOut ? "Signing out…" : "Sign out"}
        </button>
      </div>
    </aside>
  );
}
