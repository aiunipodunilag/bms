"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  UserPlus,
  X,
  Save,
  ChevronLeft,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Building2,
  ChevronDown,
  Eye,
  EyeOff,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import type { AdminAccount, AdminRole } from "@/types";
import { SPACES } from "@/lib/data/spaces";

const ROLE_OPTIONS: { value: AdminRole; label: string; description: string }[] = [
  {
    value: "admin",
    label: "Admin",
    description: "Can manage bookings, users, broadcast messages and view all analytics.",
  },
  {
    value: "receptionist",
    label: "Receptionist",
    description: "Front-desk only. Can check users in and generate equipment access codes.",
  },
  {
    value: "space_lead",
    label: "Space Lead",
    description: "Oversees a specific space. Verifies equipment access codes from users.",
  },
];

const ROLE_CONFIG: Record<AdminRole, { label: string; variant: "success" | "info" | "warning" | "neutral" }> = {
  super_admin:  { label: "Super Admin",  variant: "warning" },
  admin:        { label: "Admin",        variant: "info" },
  receptionist: { label: "Receptionist", variant: "success" },
  space_lead:   { label: "Space Lead",   variant: "neutral" },
};

const MOCK_ADMINS: AdminAccount[] = [
  {
    id: "a-001",
    fullName: "Chioma Adeyemi",
    email: "chioma@unipod.ng",
    phone: "08012345678",
    role: "admin",
    status: "active",
    createdBy: "super-001",
    createdAt: "2025-01-10",
    lastLoginAt: "2025-07-17T09:14:00",
  },
  {
    id: "a-002",
    fullName: "Tunde Okafor",
    email: "tunde@unipod.ng",
    phone: "08023456789",
    role: "receptionist",
    status: "active",
    createdBy: "super-001",
    createdAt: "2025-02-01",
    lastLoginAt: "2025-07-17T08:52:00",
  },
  {
    id: "a-003",
    fullName: "Amaka Eze",
    email: "amaka@unipod.ng",
    phone: "08034567890",
    role: "space_lead",
    assignedSpaceId: "maker-space",
    assignedSpaceName: "Maker Space",
    status: "active",
    createdBy: "super-001",
    createdAt: "2025-02-15",
    lastLoginAt: "2025-07-16T14:00:00",
  },
  {
    id: "a-004",
    fullName: "Segun Balogun",
    email: "segun@unipod.ng",
    phone: "08045678901",
    role: "space_lead",
    assignedSpaceId: "ai-robotics-lab",
    assignedSpaceName: "AI & Robotics Lab",
    status: "active",
    createdBy: "super-001",
    createdAt: "2025-03-01",
    lastLoginAt: "2025-07-15T11:30:00",
  },
  {
    id: "a-005",
    fullName: "Fatima Yusuf",
    email: "fatima@unipod.ng",
    phone: "08056789012",
    role: "space_lead",
    assignedSpaceId: "vr-lab",
    assignedSpaceName: "VR Lab",
    status: "active",
    createdBy: "super-001",
    createdAt: "2025-03-10",
    lastLoginAt: "2025-07-14T16:45:00",
  },
  {
    id: "a-006",
    fullName: "Obinna Nwosu",
    email: "obinna@unipod.ng",
    phone: "08067890123",
    role: "admin",
    status: "suspended",
    createdBy: "super-001",
    createdAt: "2025-01-20",
    lastLoginAt: "2025-07-10T10:00:00",
  },
];

const PREMIUM_SPACES = SPACES.filter((s) =>
  ["maker-space", "ai-robotics-lab", "vr-lab", "pitch-garage", "event-space", "boardroom-main"].includes(s.id)
);

export default function SuperAdminAdminsPage() {
  const [admins, setAdmins]         = useState<AdminAccount[]>(MOCK_ADMINS);
  const [showForm, setShowForm]     = useState(false);
  const [saving, setSaving]         = useState(false);
  const [success, setSuccess]       = useState(false);
  const [showPw, setShowPw]         = useState(false);

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    role: "admin" as AdminRole,
    assignedSpaceId: "",
    tempPassword: "",
    confirmPassword: "",
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const e: Record<string, string> = {};
    if (!form.fullName.trim())   e.fullName   = "Full name is required.";
    if (!form.email.trim())      e.email      = "Email is required.";
    if (!form.phone.trim())      e.phone      = "Phone is required.";
    if (!form.tempPassword)      e.tempPassword = "Temporary password is required.";
    if (form.tempPassword.length < 8) e.tempPassword = "Password must be at least 8 characters.";
    if (form.tempPassword !== form.confirmPassword) e.confirmPassword = "Passwords do not match.";
    if (form.role === "space_lead" && !form.assignedSpaceId) e.assignedSpaceId = "Select a space for this lead.";
    setFormErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setSaving(true);
    // TODO: POST /api/admin/admins/create with form data
    await new Promise((r) => setTimeout(r, 1000));
    const newAdmin: AdminAccount = {
      id: `a-${Date.now()}`,
      fullName: form.fullName,
      email: form.email,
      phone: form.phone,
      role: form.role,
      assignedSpaceId: form.assignedSpaceId || undefined,
      assignedSpaceName: PREMIUM_SPACES.find((s) => s.id === form.assignedSpaceId)?.name,
      status: "active",
      createdBy: "super-001",
      createdAt: new Date().toISOString().split("T")[0],
    };
    setAdmins((prev) => [newAdmin, ...prev]);
    setSaving(false);
    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      setShowForm(false);
      setForm({ fullName: "", email: "", phone: "", role: "admin", assignedSpaceId: "", tempPassword: "", confirmPassword: "" });
    }, 1800);
  };

  const toggleStatus = (id: string) => {
    setAdmins((prev) =>
      prev.map((a) =>
        a.id === id ? { ...a, status: a.status === "active" ? "suspended" : "active" } : a
      )
    );
  };

  const removeAdmin = (id: string) => {
    setAdmins((prev) => prev.filter((a) => a.id !== id));
  };

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Top bar */}
      <header className="bg-gray-900 border-b border-gray-800 px-6 py-4 flex items-center gap-4">
        <Link href="/superadmin" className="text-gray-400 hover:text-white transition-colors">
          <ChevronLeft size={18} />
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center">
            <ShieldCheck size={16} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-white">Manage Admin Accounts</p>
            <p className="text-xs text-gray-500">Create and manage all staff access</p>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8 space-y-6">
        {/* Header row */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-400">
            {admins.filter((a) => a.status === "active").length} active ·{" "}
            {admins.filter((a) => a.status === "suspended").length} suspended
          </p>
          <Button onClick={() => setShowForm(true)}>
            <UserPlus size={14} /> Add Admin
          </Button>
        </div>

        {/* Create form */}
        {showForm && (
          <Card className="bg-gray-900 border-brand-700/40">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-semibold text-white flex items-center gap-2">
                <UserPlus size={15} className="text-brand-400" /> New Admin Account
              </h2>
              <button onClick={() => setShowForm(false)} className="text-gray-500 hover:text-white">
                <X size={16} />
              </button>
            </div>

            {success ? (
              <div className="text-center py-6">
                <div className="w-12 h-12 rounded-full bg-green-900/50 flex items-center justify-center mx-auto mb-3">
                  <ShieldCheck size={24} className="text-green-400" />
                </div>
                <p className="text-green-400 font-semibold">Admin account created</p>
                <p className="text-gray-500 text-sm mt-1">Login credentials sent to their email.</p>
              </div>
            ) : (
              <form onSubmit={handleCreate} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-gray-400 font-medium mb-1.5 block">Full name</label>
                    <input
                      type="text"
                      value={form.fullName}
                      onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                      placeholder="e.g. Amaka Eze"
                      className="w-full bg-gray-800 border border-gray-700 text-white text-sm rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                    {formErrors.fullName && <p className="text-xs text-red-400 mt-1">{formErrors.fullName}</p>}
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 font-medium mb-1.5 block">Email</label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="amaka@unipod.ng"
                      className="w-full bg-gray-800 border border-gray-700 text-white text-sm rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                    {formErrors.email && <p className="text-xs text-red-400 mt-1">{formErrors.email}</p>}
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 font-medium mb-1.5 block">Phone number</label>
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      placeholder="080XXXXXXXX"
                      className="w-full bg-gray-800 border border-gray-700 text-white text-sm rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                    {formErrors.phone && <p className="text-xs text-red-400 mt-1">{formErrors.phone}</p>}
                  </div>

                  {/* Role */}
                  <div>
                    <label className="text-xs text-gray-400 font-medium mb-1.5 block">Role</label>
                    <div className="relative">
                      <select
                        value={form.role}
                        onChange={(e) => setForm({ ...form, role: e.target.value as AdminRole, assignedSpaceId: "" })}
                        className="w-full appearance-none bg-gray-800 border border-gray-700 text-white text-sm rounded-xl px-3 py-2.5 pr-8 focus:outline-none focus:ring-2 focus:ring-brand-500"
                      >
                        {ROLE_OPTIONS.map((r) => (
                          <option key={r.value} value={r.value}>{r.label}</option>
                        ))}
                      </select>
                      <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {ROLE_OPTIONS.find((r) => r.value === form.role)?.description}
                    </p>
                  </div>

                  {/* Assigned space (only for space_lead) */}
                  {form.role === "space_lead" && (
                    <div className="sm:col-span-2">
                      <label className="text-xs text-gray-400 font-medium mb-1.5 flex items-center gap-1.5 block">
                        <Building2 size={11} /> Assigned Space
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {PREMIUM_SPACES.map((space) => (
                          <button
                            key={space.id}
                            type="button"
                            onClick={() => setForm({ ...form, assignedSpaceId: space.id })}
                            className={`text-left px-3 py-2 rounded-xl border text-xs transition-all ${
                              form.assignedSpaceId === space.id
                                ? "border-brand-500 bg-brand-900/30 text-brand-300"
                                : "border-gray-700 text-gray-400 hover:border-gray-600"
                            }`}
                          >
                            {space.name}
                          </button>
                        ))}
                      </div>
                      {formErrors.assignedSpaceId && (
                        <p className="text-xs text-red-400 mt-1">{formErrors.assignedSpaceId}</p>
                      )}
                    </div>
                  )}

                  {/* Temp password */}
                  <div>
                    <label className="text-xs text-gray-400 font-medium mb-1.5 block">Temporary password</label>
                    <div className="relative">
                      <input
                        type={showPw ? "text" : "password"}
                        value={form.tempPassword}
                        onChange={(e) => setForm({ ...form, tempPassword: e.target.value })}
                        placeholder="Min. 8 characters"
                        className="w-full bg-gray-800 border border-gray-700 text-white text-sm rounded-xl px-3 py-2.5 pr-9 focus:outline-none focus:ring-2 focus:ring-brand-500"
                      />
                      <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                        {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                    {formErrors.tempPassword && <p className="text-xs text-red-400 mt-1">{formErrors.tempPassword}</p>}
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 font-medium mb-1.5 block">Confirm password</label>
                    <input
                      type={showPw ? "text" : "password"}
                      value={form.confirmPassword}
                      onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                      placeholder="Repeat password"
                      className="w-full bg-gray-800 border border-gray-700 text-white text-sm rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                    {formErrors.confirmPassword && <p className="text-xs text-red-400 mt-1">{formErrors.confirmPassword}</p>}
                  </div>
                </div>

                <div className="flex gap-3 pt-1">
                  <Button type="submit" loading={saving}>
                    <Save size={13} /> Create Admin Account
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            )}
          </Card>
        )}

        {/* Admins table */}
        <Card className="bg-gray-900 border-gray-800" padding="none">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left text-xs font-medium text-gray-500 px-5 py-3">Name</th>
                <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Role</th>
                <th className="text-left text-xs font-medium text-gray-500 px-4 py-3 hidden md:table-cell">Space</th>
                <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Status</th>
                <th className="text-left text-xs font-medium text-gray-500 px-4 py-3 hidden sm:table-cell">Last Login</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {admins.map((admin) => {
                const rc = ROLE_CONFIG[admin.role];
                return (
                  <tr key={admin.id} className="hover:bg-gray-800/40 transition-colors">
                    <td className="px-5 py-3">
                      <p className="text-sm text-white font-medium">{admin.fullName}</p>
                      <p className="text-xs text-gray-500">{admin.email}</p>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={rc.variant} size="sm">{rc.label}</Badge>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="text-xs text-gray-400">{admin.assignedSpaceName ?? "—"}</span>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={admin.status === "active" ? "success" : "danger"} size="sm">
                        {admin.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span className="text-xs text-gray-500">
                        {admin.lastLoginAt
                          ? new Date(admin.lastLoginAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" })
                          : "Never"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => toggleStatus(admin.id)}
                          className={`p-1.5 rounded-lg transition-colors ${
                            admin.status === "active"
                              ? "text-green-500 hover:bg-green-900/30"
                              : "text-gray-600 hover:bg-gray-800"
                          }`}
                          title={admin.status === "active" ? "Suspend" : "Reactivate"}
                        >
                          {admin.status === "active" ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                        </button>
                        <button
                          onClick={() => removeAdmin(admin.id)}
                          className="p-1.5 rounded-lg text-red-600 hover:bg-red-900/30 transition-colors"
                          title="Remove admin"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      </main>
    </div>
  );
}
