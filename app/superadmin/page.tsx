"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Users,
  Building2,
  CalendarCheck,
  UserPlus,
  Settings,
  Megaphone,
  BarChart2,
  TrendingUp,
  AlertTriangle,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import AdminSidebar from "@/components/layout/AdminSidebar";
import type { AdminRole } from "@/types";

interface Stats {
  totalUsers: number;
  pendingVerifications: number;
  activeBookingsToday: number;
  totalBookingsThisWeek: number;
  pendingApprovals: number;
}

interface AdminAccount {
  id: string;
  full_name: string;
  email: string;
  role: AdminRole;
  assigned_space_name: string | null;
  status: string;
  last_login_at: string | null;
}

const ROLE_CONFIG: Record<string, { label: string; variant: "success" | "info" | "warning" | "neutral" }> = {
  super_admin:  { label: "Super Admin",  variant: "warning" },
  admin:        { label: "Admin",        variant: "info" },
  receptionist: { label: "Receptionist", variant: "success" },
  space_lead:   { label: "Space Lead",   variant: "neutral" },
};

export default function SuperAdminPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [admins, setAdmins] = useState<AdminAccount[]>([]);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then(({ stats: s }) => setStats(s))
      .catch(() => {});

    fetch("/api/admin/admins")
      .then((r) => r.json())
      .then(({ admins: a }) => setAdmins(a ?? []))
      .catch(() => {});
  }, []);

  const statCards = stats
    ? [
        { label: "Total Admin Accounts", value: admins.length, icon: ShieldCheck, color: "text-violet-600", bg: "bg-brand-50" },
        { label: "Registered Users",     value: stats.totalUsers, icon: Users, color: "text-green-600", bg: "bg-green-50" },
        { label: "Bookings This Week",   value: stats.totalBookingsThisWeek, icon: CalendarCheck, color: "text-blue-600", bg: "bg-blue-50" },
        { label: "Pending Approvals",    value: stats.pendingApprovals, icon: Building2, color: "text-orange-600", bg: "bg-orange-50" },
      ]
    : [];

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />

      <div className="flex-1 overflow-auto">
        <main className="max-w-6xl mx-auto px-6 py-8 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.label} className="bg-white border-gray-200">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl ${stat.bg} flex items-center justify-center shrink-0`}>
                    <Icon size={16} className={stat.color} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{stat.value ?? "—"}</p>
                    <p className="text-xs text-gray-500 leading-tight">{stat.label}</p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Admin accounts overview */}
          <div className="lg:col-span-2">
            <Card className="bg-white border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                  <Users size={15} className="text-violet-600" /> Admin Accounts
                </h2>
                <Link href="/superadmin/admins">
                  <Button size="sm">
                    <UserPlus size={13} /> Manage Admins
                  </Button>
                </Link>
              </div>

              {admins.length === 0 ? (
                <p className="text-xs text-gray-500 text-center py-6">Loading admin accounts…</p>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-800">
                      <th className="text-left text-xs font-medium text-gray-500 pb-2.5">Name</th>
                      <th className="text-left text-xs font-medium text-gray-500 pb-2.5">Role</th>
                      <th className="text-left text-xs font-medium text-gray-500 pb-2.5 hidden sm:table-cell">Space</th>
                      <th className="text-left text-xs font-medium text-gray-500 pb-2.5">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {admins.slice(0, 8).map((admin) => {
                      const rc = ROLE_CONFIG[admin.role] ?? { label: admin.role, variant: "neutral" as const };
                      return (
                        <tr key={admin.id} className="hover:bg-gray-50">
                          <td className="py-2.5">
                            <p className="text-sm text-white font-medium">{admin.full_name}</p>
                            <p className="text-xs text-gray-500">{admin.email}</p>
                          </td>
                          <td className="py-2.5">
                            <Badge variant={rc.variant} size="sm">{rc.label}</Badge>
                          </td>
                          <td className="py-2.5 hidden sm:table-cell">
                            <span className="text-xs text-gray-500">{admin.assigned_space_name ?? "—"}</span>
                          </td>
                          <td className="py-2.5">
                            <Badge variant={admin.status === "active" ? "success" : "danger"} size="sm">
                              {admin.status}
                            </Badge>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </Card>
          </div>

          {/* Quick actions */}
          <div className="space-y-4">
            <Card className="bg-white border-gray-200">
              <h2 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <TrendingUp size={15} className="text-violet-600" /> Quick Actions
              </h2>
              <div className="space-y-2">
                {[
                  { href: "/superadmin/admins", icon: UserPlus,  label: "Add / Manage Admins" },
                  { href: "/admin",             icon: BarChart2, label: "Bookings Dashboard" },
                  { href: "/admin/spaces",      icon: Building2, label: "Space Management" },
                  { href: "/admin/broadcast",   icon: Megaphone, label: "Broadcast Message" },
                  { href: "/admin/settings",    icon: Settings,  label: "System Settings" },
                ].map(({ href, icon: Icon, label }) => (
                  <Link
                    key={href}
                    href={href}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#F8F9FB] text-gray-700 hover:text-gray-900 transition-colors text-sm"
                  >
                    <Icon size={14} className="text-gray-500" />
                    {label}
                  </Link>
                ))}
              </div>
            </Card>

            <Card className="bg-yellow-50 border-yellow-200">
              <div className="flex items-start gap-2">
                <AlertTriangle size={14} className="text-yellow-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-yellow-700 mb-1">Super Admin Access</p>
                  <p className="text-xs text-yellow-600 leading-relaxed">
                    You have full system access. Changes made here affect all users and admins immediately.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
        </main>
      </div>
    </div>
  );
}
