"use client";

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

// Mock stats for super admin overview
const STATS = [
  { label: "Total Admin Accounts", value: "8", icon: ShieldCheck, color: "text-brand-600", bg: "bg-brand-50" },
  { label: "Active Users", value: "214", icon: Users, color: "text-green-600", bg: "bg-green-50" },
  { label: "Bookings This Week", value: "47", icon: CalendarCheck, color: "text-blue-600", bg: "bg-blue-50" },
  { label: "Spaces Online", value: "10", icon: Building2, color: "text-orange-600", bg: "bg-orange-50" },
];

const ADMIN_ACCOUNTS = [
  { id: "a-001", name: "Chioma Adeyemi",   email: "chioma@unipod.ng",  role: "admin",        space: null,          status: "active",    last: "Today, 9:14 AM" },
  { id: "a-002", name: "Tunde Okafor",     email: "tunde@unipod.ng",   role: "receptionist", space: null,          status: "active",    last: "Today, 8:52 AM" },
  { id: "a-003", name: "Amaka Eze",        email: "amaka@unipod.ng",   role: "space_lead",   space: "Maker Space", status: "active",    last: "Yesterday" },
  { id: "a-004", name: "Segun Balogun",    email: "segun@unipod.ng",   role: "space_lead",   space: "AI & Robotics Lab", status: "active", last: "2 days ago" },
  { id: "a-005", name: "Fatima Yusuf",     email: "fatima@unipod.ng",  role: "space_lead",   space: "VR Lab",      status: "active",    last: "3 days ago" },
  { id: "a-006", name: "Obinna Nwosu",     email: "obinna@unipod.ng",  role: "admin",        space: null,          status: "suspended", last: "1 week ago" },
];

const ROLE_CONFIG: Record<string, { label: string; variant: "success" | "info" | "warning" | "neutral" }> = {
  super_admin:  { label: "Super Admin",  variant: "warning" },
  admin:        { label: "Admin",        variant: "info" },
  receptionist: { label: "Receptionist", variant: "success" },
  space_lead:   { label: "Space Lead",   variant: "neutral" },
};

export default function SuperAdminPage() {
  return (
    <div className="min-h-screen bg-gray-950">
      {/* Top bar */}
      <header className="bg-gray-900 border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center">
            <ShieldCheck size={16} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-white">Super Admin</p>
            <p className="text-xs text-gray-500">UNIPOD BMS Control Panel</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/admin">
            <Button variant="outline" size="sm">
              <BarChart2 size={13} /> Main Admin
            </Button>
          </Link>
          <Link href="/admin/login">
            <Button variant="ghost" size="sm">Sign out</Button>
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {STATS.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.label} className="bg-gray-900 border-gray-800">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl ${stat.bg} flex items-center justify-center shrink-0`}>
                    <Icon size={16} className={stat.color} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{stat.value}</p>
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
            <Card className="bg-gray-900 border-gray-800">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-white flex items-center gap-2">
                  <Users size={15} className="text-brand-400" /> Admin Accounts
                </h2>
                <Link href="/superadmin/admins">
                  <Button size="sm">
                    <UserPlus size={13} /> Manage Admins
                  </Button>
                </Link>
              </div>

              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-800">
                    <th className="text-left text-xs font-medium text-gray-500 pb-2.5">Name</th>
                    <th className="text-left text-xs font-medium text-gray-500 pb-2.5">Role</th>
                    <th className="text-left text-xs font-medium text-gray-500 pb-2.5 hidden sm:table-cell">Space</th>
                    <th className="text-left text-xs font-medium text-gray-500 pb-2.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {ADMIN_ACCOUNTS.map((admin) => {
                    const rc = ROLE_CONFIG[admin.role];
                    return (
                      <tr key={admin.id} className="hover:bg-gray-800/50">
                        <td className="py-2.5">
                          <p className="text-sm text-white font-medium">{admin.name}</p>
                          <p className="text-xs text-gray-500">{admin.email}</p>
                        </td>
                        <td className="py-2.5">
                          <Badge variant={rc.variant} size="sm">{rc.label}</Badge>
                        </td>
                        <td className="py-2.5 hidden sm:table-cell">
                          <span className="text-xs text-gray-400">{admin.space ?? "—"}</span>
                        </td>
                        <td className="py-2.5">
                          <Badge
                            variant={admin.status === "active" ? "success" : "danger"}
                            size="sm"
                          >
                            {admin.status}
                          </Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </Card>
          </div>

          {/* Quick actions */}
          <div className="space-y-4">
            <Card className="bg-gray-900 border-gray-800">
              <h2 className="font-semibold text-white mb-3 flex items-center gap-2">
                <TrendingUp size={15} className="text-brand-400" /> Quick Actions
              </h2>
              <div className="space-y-2">
                {[
                  { href: "/superadmin/admins",   icon: UserPlus,    label: "Add / Manage Admins" },
                  { href: "/admin",               icon: BarChart2,   label: "Bookings Dashboard" },
                  { href: "/admin/spaces",        icon: Building2,   label: "Space Management" },
                  { href: "/admin/broadcast",     icon: Megaphone,   label: "Broadcast Message" },
                  { href: "/admin/settings",      icon: Settings,    label: "System Settings" },
                ].map(({ href, icon: Icon, label }) => (
                  <Link
                    key={href}
                    href={href}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-800 text-gray-300 hover:text-white transition-colors text-sm"
                  >
                    <Icon size={14} className="text-gray-500" />
                    {label}
                  </Link>
                ))}
              </div>
            </Card>

            <Card className="bg-yellow-950/40 border-yellow-800/40">
              <div className="flex items-start gap-2">
                <AlertTriangle size={14} className="text-yellow-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-yellow-400 mb-1">Super Admin Access</p>
                  <p className="text-xs text-yellow-700 leading-relaxed">
                    You have full system access. Changes made here affect all users and admins immediately.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
