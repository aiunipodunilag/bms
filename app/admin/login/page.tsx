"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Lock, Mail, AlertCircle } from "lucide-react";
import Image from "next/image";
import Button from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/client";
import type { AdminRole } from "@/types";

const ROLE_REDIRECTS: Record<AdminRole, string> = {
  super_admin:  "/superadmin",
  admin:        "/admin",
  receptionist: "/admin/checkin",
  space_lead:   "/admin/space-lead",
};


const ROLE_LABELS: Record<AdminRole, string> = {
  super_admin:  "Super Admin",
  admin:        "Admin",
  receptionist: "Receptionist",
  space_lead:   "Space Lead",
};

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw]     = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");

  // If already logged in as admin, skip login screen
  useEffect(() => {
    fetch("/api/admin/me")
      .then((r) => r.json())
      .then(({ role }) => {
        if (role) window.location.href = ROLE_REDIRECTS[role as AdminRole];
      })
      .catch(() => {});
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }

    setLoading(true);
    console.log("[admin-login] step 1: attempting signInWithPassword for", email.trim().toLowerCase());

    try {
      const supabase = createClient();

      const { data: authData, error: authErr } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      console.log("[admin-login] step 2: auth result", { user: authData?.user?.id, error: authErr?.message });

      if (authErr || !authData.user) {
        const msg = authErr?.message === "Invalid login credentials"
          ? "Incorrect email or password."
          : (authErr?.message ?? "Login failed \u2014 no user returned");
        console.error("[admin-login] auth failed:", msg);
        setError(msg);
        setLoading(false);
        return;
      }

      console.log("[admin-login] step 3: verifying admin status via API");
      const meRes = await fetch("/api/admin/me");
      const meData = await meRes.json();

      console.log("[admin-login] step 4: admin/me result", meData);

      if (!meRes.ok || !meData.role) {
        await supabase.auth.signOut();
        setError("Access denied. No admin account found for this email.");
        setLoading(false);
        return;
      }

      if (meData.status !== "active") {
        await supabase.auth.signOut();
        setError(`Account not active (status: ${meData.status}). Contact a super admin.`);
        setLoading(false);
        return;
      }

      console.log("[admin-login] step 5: success! role =", meData.role, "\u2192 redirecting to", ROLE_REDIRECTS[meData.role as AdminRole]);

      window.location.href = ROLE_REDIRECTS[meData.role as AdminRole];
    } catch (err) {
      console.error("[admin-login] unexpected exception:", err);
      setError(`Unexpected error: ${err instanceof Error ? err.message : String(err)}`);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FB] flex items-center justify-center px-4">
      {/* Subtle radial bg */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full opacity-[0.05]"
          style={{ background: "radial-gradient(circle, #5B4CF5 0%, transparent 70%)" }} />
      </div>

      <div className="relative w-full max-w-sm">
        {/* Logo / brand */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-5">
            <Image src="/logo.svg" alt="UniPod" height={56} width={224} className="object-contain" priority />
          </div>
          <p className="text-sm text-gray-400">Admin Portal — Sign in with your credentials</p>
        </div>

        {/* Card */}
        <div className="bg-white border border-black/[0.07] rounded-2xl p-6"
          style={{ boxShadow: "0 8px 40px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.04)" }}>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label htmlFor="admin-email" className="text-xs text-gray-600 font-medium mb-1.5 block">Admin email</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  id="admin-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="admin@unipod.unilag.edu.ng"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-gray-50/50 border border-gray-200 text-gray-900 placeholder-gray-400 text-sm rounded-xl pl-10 pr-4 py-2.5 transition-all focus:bg-white"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="admin-password" className="text-xs text-gray-600 font-medium mb-1.5 block">Password</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  id="admin-password"
                  name="password"
                  type={showPw ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-gray-50/50 border border-gray-200 text-gray-900 placeholder-gray-400 text-sm rounded-xl pl-10 pr-10 py-2.5 transition-all focus:bg-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors"
                >
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-start gap-2 bg-red-50 border border-red-100 rounded-xl px-3 py-3">
                <AlertCircle size={15} className="text-red-500 shrink-0 mt-0.5" />
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <Button type="submit" className="w-full mt-1" loading={loading}>
              <ShieldCheck size={15} /> Sign in to Admin Portal
            </Button>
          </form>

          <p className="text-center text-xs text-gray-400 mt-5">
            This portal is for authorised UNIPOD staff only.
            <br />
            Not an admin?{" "}
            <a href="/auth/login" className="text-brand-600 hover:underline">
              Go to member login
            </a>
          </p>
        </div>

        {/* Role hint */}
        <div className="mt-4 bg-white border border-black/[0.07] rounded-2xl px-4 py-3"
          style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
          <p className="text-xs text-gray-400 font-medium mb-2">Role-based access</p>
          <div className="space-y-1">
            {(Object.entries(ROLE_LABELS) as [AdminRole, string][]).map(([role, label]) => (
              <div key={role} className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-400 shrink-0" />
                <span className="text-xs text-gray-500">
                  <span className="text-gray-700 font-medium">{label}</span>
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
