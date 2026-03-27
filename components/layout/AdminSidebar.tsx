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
} from "lucide-react";

// Full admin nav — shown to super_admin and admin
const ADMIN_LINKS = [
  { href: "/admin",            label: "Overview",            icon: LayoutDashboard },
  { href: "/admin/bookings",   label: "Bookings & Approvals", icon: CalendarDays, badge: 5 },
  { href: "/admin/users",      label: "User Management",     icon: Users, badge: 3 },
  { href: "/admin/spaces",     label: "Spaces",              icon: Building2 },
  { href: "/admin/checkin",    label: "Check-in",            icon: QrCode },
  { href: "/admin/broadcast",  label: "Broadcast",           icon: Megaphone },
  { href: "/admin/settings",   label: "Settings",            icon: Settings },
];

// Super admin gets an extra link to their control panel
const SUPER_ADMIN_LINKS = [
  { href: "/superadmin",         label: "Super Admin Panel",  icon: ShieldCheck },
  { href: "/superadmin/admins",  label: "Manage Admins",      icon: UserCog },
  ...ADMIN_LINKS,
];

// Receptionist: check-in desk only
const RECEPTIONIST_LINKS = [
  { href: "/admin/checkin",  label: "Check-in Desk", icon: QrCode },
];

// Space lead: their verification dashboard only
const SPACE_LEAD_LINKS = [
  { href: "/admin/space-lead", label: "Equipment Verification", icon: ShieldCheck },
];

type AdminRole = "super_admin" | "admin" | "receptionist" | "space_lead";

interface Props {
  // TODO: Replace with real role from session/auth context
  role?: AdminRole;
}

export default function AdminSidebar({ role = "admin" }: Props) {
  const pathname = usePathname();

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
    <aside className="w-60 min-h-screen bg-gray-950 flex flex-col shrink-0">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-gray-800">
        <Link href={role === "super_admin" ? "/superadmin" : "/admin"} className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-brand-500 flex items-center justify-center">
            <span className="text-white font-bold text-sm">U</span>
          </div>
          <div>
            <p className="text-white font-semibold text-sm">AI-UNIPOD</p>
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
                  ? "bg-brand-600 text-white"
                  : "text-gray-400 hover:text-white hover:bg-gray-800"
              )}
            >
              <div className="flex items-center gap-3">
                <Icon size={16} />
                {label}
              </div>
              {badge ? (
                <span className="bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                  {badge}
                </span>
              ) : (
                active && <ChevronRight size={14} className="opacity-60" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 pb-5 border-t border-gray-800 pt-4">
        <Link
          href="/admin/login"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
        >
          <LogOut size={16} />
          Sign out
        </Link>
      </div>
    </aside>
  );
}
