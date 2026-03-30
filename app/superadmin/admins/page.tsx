"use client";

import { useState, useEffect } from "react";
import {
  ShieldCheck,
  UserPlus,
  X,
  Save,
  Trash2,
  Building2,
  ChevronDown,
  Eye,
  EyeOff,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Toggle from "@/components/ui/Toggle";
import AdminSidebar from "@/components/layout/AdminSidebar";
import type { AdminRole } from "@/types";
import { SPACES } from "@/lib/data/spaces";

interface AdminAccount {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  role: AdminRole;
  assigned_space_id: string | null;
  assigned_space_name: string | null;
  status: string;
  created_at: string;
  last_login_at: string | null;
}

const ROLE_OPTIONS: { value: AdminRole; label: string; description: string }[] = [
  { value: "admin",        label: "Admin",        description: "Can manage bookings, users, broadcast messages and view all analytics." },
  { value: "receptionist", label: "Receptionist", description: "Front-desk only. Can check users in and generate equipment access codes." },
  { value: "space_lead",   label: "Space Lead",   description: "Oversees a specific space. Verifies equipment access codes from users." },
];

const ROLE_CONFIG: Record<AdminRole, { label: string; variant: "success" | "info" | "warning" | "neutral" }> = {
  super_admin:  { label: "Super Admin",  variant: "warning" },
  admin:        { label: "Admin",        variant: "info" },
  receptionist: { label: "Receptionist", variant: "success" },
  space_lead:   { label: "Space Lead",   variant: "neutral" },
};

const PREMIUM_SPACES = SPACES.filter((s) =>
  ["maker-space", "ai-robotics-lab", "vr-lab", "pitch-garage", "event-space", "boardroom-main"].includes(s.id)
);

export default function SuperAdminAdminsPage() {
  const [admins, setAdmins]         = useState<AdminAccount[]>([]);
  const [loadingAdmins, setLoadingAdmins] = useState(true);
  const [showForm, setShowForm]     = useState(false);
  const [saving, setSaving]         = useState(false);
  const [success, setSuccess]       = useState(false);
  const [showPw, setShowPw]         = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

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

  const fetchAdmins = () => {
    setLoadingAdmins(true);
    fetch("/api/admin/admins")
      .then((r) => r.json())
      .then(({ admins: a }) => setAdmins(a ?? []))
      .catch(() => {})
      .finally(() => setLoadingAdmins(false));
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const validateForm = () => {
    const e: Record<string, string> = {};
    if (!form.fullName.trim())  e.fullName  = "Full name is required.";
    if (!form.email.trim())     e.email     = "Email is required.";
    if (!form.phone.trim())     e.phone     = "Phone is required.";
    if (!form.tempPassword)     e.tempPassword = "Temporary password is required.";
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

    const selectedSpace = PREMIUM_SPACES.find((s) => s.id === form.assignedSpaceId);
    const res = await fetch("/api/admin/admins", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fullName: form.fullName,
        email: form.email,
        phone: form.phone,
        role: form.role,
        assignedSpaceId: form.assignedSpaceId || undefined,
        assignedSpaceName: selectedSpace?.name,
        tempPassword: form.tempPassword,
      }),
    });
    const data = await res.json();

    setSaving(false);
    if (res.ok) {
      setSuccess(true);
      fetchAdmins();
      setTimeout(() => {
        setSuccess(false);
        setShowForm(false);
        setForm({ fullName: "", email: "", phone: "", role: "admin", assignedSpaceId: "", tempPassword: "", confirmPassword: "" });
      }, 1800);
    } else {
      setFormErrors({ email: data.error ?? "Failed to create admin." });
    }
  };

  const toggleStatus = async (admin: AdminAccount) => {
    const newStatus = admin.status === "active" ? "suspended" : "active";
    setActionLoading(admin.id + "toggle");
    await fetch(`/api/admin/admins/${admin.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    setActionLoading(null);
    fetchAdmins();
  };

  const removeAdmin = async (id: string) => {
    if (!confirm("Are you sure you want to remove this admin?")) return;
    setActionLoading(id + "delete");
    await fetch(`/api/admin/admins/${id}`, { method: "DELETE" });
    setActionLoading(null);
    fetchAdmins();
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />

      <div className="flex-1 overflow-auto">
        <main className="max-w-5xl mx-auto px-6 py-8 space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Manage Admin Accounts</h1>
            <p className="text-sm text-gray-500 mt-0.5">Create and manage all staff access</p>
          </div>
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            {admins.filter((a) => a.status === "active").length} active ·{" "}
            {admins.filter((a) => a.status !== "active").length} suspended
          </p>
          <Button onClick={() => setShowForm(true)}>
            <UserPlus size={14} /> Add Admin
          </Button>
        </div>

        {/* Create form */}
        {showForm && (
          <Card className="bg-white border-violet-200">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                <UserPlus size={15} className="text-violet-600" /> New Admin Account
              </h2>
              <button onClick={() => setShowForm(false)} className="text-gray-500 hover:text-gray-900">
                <X size={16} />
              </button>
            </div>

            {success ? (
              <div className="text-center py-6">
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
                  <ShieldCheck size={24} className="text-green-600" />
                </div>
                <p className="text-green-600 font-semibold">Admin account created</p>
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
                      className="w-full bg-white border border-gray-300 text-gray-900 text-sm rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-violet-500"
                    />
                    {formErrors.fullName && <p className="text-xs text-red-500 mt-1">{formErrors.fullName}</p>}
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 font-medium mb-1.5 block">Email</label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="amaka@unipod.ng"
                      className="w-full bg-white border border-gray-300 text-gray-900 text-sm rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-violet-500"
                    />
                    {formErrors.email && <p className="text-xs text-red-500 mt-1">{formErrors.email}</p>}
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 font-medium mb-1.5 block">Phone number</label>
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      placeholder="080XXXXXXXX"
                      className="w-full bg-white border border-gray-300 text-gray-900 text-sm rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-violet-500"
                    />
                    {formErrors.phone && <p className="text-xs text-red-500 mt-1">{formErrors.phone}</p>}
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 font-medium mb-1.5 block">Role</label>
                    <div className="relative">
                      <select
                        value={form.role}
                        onChange={(e) => setForm({ ...form, role: e.target.value as AdminRole, assignedSpaceId: "" })}
                        className="w-full appearance-none bg-white border border-gray-300 text-gray-900 text-sm rounded-xl px-3 py-2.5 pr-8 focus:outline-none focus:ring-2 focus:ring-violet-500"
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
                                ? "border-violet-500 bg-violet-50 text-violet-700"
                                : "border-gray-200 text-gray-600 hover:border-gray-400"
                            }`}
                          >
                            {space.name}
                          </button>
                        ))}
                      </div>
                      {formErrors.assignedSpaceId && (
                        <p className="text-xs text-red-500 mt-1">{formErrors.assignedSpaceId}</p>
                      )}
                    </div>
                  )}

                  <div>
                    <label className="text-xs text-gray-400 font-medium mb-1.5 block">Temporary password</label>
                    <div className="relative">
                      <input
                        type={showPw ? "text" : "password"}
                        value={form.tempPassword}
                        onChange={(e) => setForm({ ...form, tempPassword: e.target.value })}
                        placeholder="Min. 8 characters"
                        className="w-full bg-white border border-gray-300 text-gray-900 text-sm rounded-xl px-3 py-2.5 pr-9 focus:outline-none focus:ring-2 focus:ring-violet-500"
                      />
                      <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                        {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                    {formErrors.tempPassword && <p className="text-xs text-red-500 mt-1">{formErrors.tempPassword}</p>}
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 font-medium mb-1.5 block">Confirm password</label>
                    <input
                      type={showPw ? "text" : "password"}
                      value={form.confirmPassword}
                      onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                      placeholder="Repeat password"
                      className="w-full bg-white border border-gray-300 text-gray-900 text-sm rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-violet-500"
                    />
                    {formErrors.confirmPassword && <p className="text-xs text-red-500 mt-1">{formErrors.confirmPassword}</p>}
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
        <Card className="bg-white border-gray-200" padding="none">
          {loadingAdmins ? (
            <div className="text-center py-12 text-gray-500 text-sm">Loading admins…</div>
          ) : (
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
              <tbody className="divide-y divide-gray-100">
                {admins.map((admin) => {
                  const rc = ROLE_CONFIG[admin.role] ?? { label: admin.role, variant: "neutral" as const };
                  return (
                    <tr key={admin.id} className="hover:bg-[#F8F9FB]/40 transition-colors">
                      <td className="px-5 py-3">
                        <p className="text-sm text-gray-900 font-medium">{admin.full_name}</p>
                        <p className="text-xs text-gray-500">{admin.email}</p>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={rc.variant} size="sm">{rc.label}</Badge>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <span className="text-xs text-gray-500">{admin.assigned_space_name ?? "—"}</span>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={admin.status === "active" ? "success" : "danger"} size="sm">
                          {admin.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <span className="text-xs text-gray-500">
                          {admin.last_login_at
                            ? new Date(admin.last_login_at).toLocaleDateString("en-GB", { day: "numeric", month: "short" })
                            : "Never"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <Toggle
                            checked={admin.status === "active"}
                            onChange={() => toggleStatus(admin)}
                            disabled={actionLoading === admin.id + "toggle"}
                            size="sm"
                          />
                          <button
                            onClick={() => removeAdmin(admin.id)}
                            disabled={actionLoading === admin.id + "delete"}
                            className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
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
          )}
        </Card>
        </main>
      </div>
    </div>
  );
}
