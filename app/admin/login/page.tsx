"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, Eye, EyeOff, Lock, Mail, AlertCircle } from "lucide-react";
import Button from "@/components/ui/Button";
import type { AdminRole } from "@/types";

// Role-to-redirect map — after login, each role goes to their own landing page
const ROLE_REDIRECTS: Record<AdminRole, string> = {
  super_admin:  "/superadmin",
  admin:        "/admin",
  receptionist: "/admin/checkin",
  space_lead:   "/admin/space-lead",
};

// Role labels shown in the "You are logged in as" success message
const ROLE_LABELS: Record<AdminRole, string> = {
  super_admin:  "Super Admin",
  admin:        "Admin",
  receptionist: "Receptionist",
  space_lead:   "Space Lead",
};

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail]         = useState("");
  const [password, setPassword]   = useState("");
  const [showPw, setShowPw]       = useState(false);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }

    setLoading(true);
    // TODO: POST /api/admin/auth/login
    // Returns: { admin: AdminAccount, role: AdminRole, token: string }
    await new Promise((r) => setTimeout(r, 1000));

    // ── Mock role detection (replace with real API response) ──────────────────
    let mockRole: AdminRole = "admin";
    if (email.includes("super"))       mockRole = "super_admin";
    else if (email.includes("recep"))  mockRole = "receptionist";
    else if (email.includes("lead"))   mockRole = "space_lead";

    setLoading(false);
    router.push(ROLE_REDIRECTS[mockRole]);
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo / brand */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-brand-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-brand-900/40">
            <ShieldCheck size={28} className="text-white" />
          </div>
          <h1 className="text-xl font-bold text-white">UNIPOD Admin Portal</h1>
          <p className="text-sm text-gray-400 mt-1">Sign in with your admin credentials</p>
        </div>

        {/* Card */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="text-xs text-gray-400 font-medium mb-1.5 block">
                Admin email
              </label>
              <div className="relative">
                <Mail
                  size={15}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                />
                <input
                  type="email"
                  autoComplete="email"
                  placeholder="admin@unipod.unilag.edu.ng"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 text-white placeholder-gray-600 text-sm rounded-xl pl-9 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="text-xs text-gray-400 font-medium mb-1.5 block">
                Password
              </label>
              <div className="relative">
                <Lock
                  size={15}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                />
                <input
                  type={showPw ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 text-white placeholder-gray-600 text-sm rounded-xl pl-9 pr-10 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                >
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 bg-red-900/30 border border-red-800 rounded-xl px-3 py-2.5">
                <AlertCircle size={14} className="text-red-400 shrink-0" />
                <p className="text-xs text-red-300">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              className="w-full mt-1"
              loading={loading}
            >
              <ShieldCheck size={15} /> Sign in to Admin Portal
            </Button>
          </form>

          <p className="text-center text-xs text-gray-600 mt-5">
            This portal is for authorised UNIPOD staff only.
            <br />
            Not an admin?{" "}
            <a href="/auth/login" className="text-brand-400 hover:underline">
              Go to member login
            </a>
          </p>
        </div>

        {/* Role hint */}
        <div className="mt-5 bg-gray-900/50 border border-gray-800 rounded-2xl px-4 py-3">
          <p className="text-xs text-gray-500 font-medium mb-2">Role-based access</p>
          <div className="space-y-1">
            {(Object.entries(ROLE_LABELS) as [AdminRole, string][]).map(([role, label]) => (
              <div key={role} className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-500 shrink-0" />
                <span className="text-xs text-gray-500">
                  <span className="text-gray-300">{label}</span>
                  {" → "}
                  {ROLE_REDIRECTS[role]}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
