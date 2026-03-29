"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, Eye, EyeOff, Lock, Mail, AlertCircle } from "lucide-react";
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
    const supabase = createClient();
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) return;
      const { data } = await supabase
        .from("admin_accounts")
        .select("role")
        .eq("id", session.user.id)
        .single();
      if (data?.role) window.location.href = ROLE_REDIRECTS[data.role as AdminRole];
    });
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

      console.log("[admin-login] step 3: querying admin_accounts for user", authData.user.id);
      const { data: adminAccount, error: adminErr } = await supabase
        .from("admin_accounts")
        .select("role, status")
        .eq("id", authData.user.id)
        .single();

      console.log("[admin-login] step 4: admin_accounts result", { adminAccount, error: adminErr?.message, code: adminErr?.code });

      if (adminErr || !adminAccount) {
        await supabase.auth.signOut();
        const msg = `Access denied \u2014 no admin record found. (DB error: ${adminErr?.message ?? "no row"})`;
        console.error("[admin-login]", msg);
        setError("Access denied. No admin account found for this email. Check the DB.");
        setLoading(false);
        return;
      }

      if (adminAccount.status !== "active") {
        await supabase.auth.signOut();
        const msg = `Account status is "${adminAccount.status}", not active.`;
        console.error("[admin-login]", msg);
        setError(`Account not active (status: ${adminAccount.status}). Contact a super admin.`);
        setLoading(false);
        return;
      }

      console.log("[admin-login] step 5: success! role =", adminAccount.role, "\u2192 redirecting to", ROLE_REDIRECTS[adminAccount.role as AdminRole]);

      supabase
        .from("admin_accounts")
        .update({ last_login_at: new Date().toISOString() })
        .eq("id", authData.user.id)
        .then(() => {});

      window.location.href = ROLE_REDIRECTS[adminAccount.role as AdminRole];
    } catch (err) {
      console.error("[admin-login] unexpected exception:", err);
      setError(`Unexpected error: ${err instanceof Error ? err.message : String(err)}`);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo / brand */}
        <div className="text-center mb-8">
          <h1 className="text-xl font-bold text-white">UNIPOD Admin Portal</h1>
          <p className="text-sm text-gray-400 mt-1">Sign in with your admin credentials</p>
        </div>

        {/* Card */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="text-xs text-gray-400 font-medium mb-1.5 block">Admin email</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
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
              <label className="text-xs text-gray-400 font-medium mb-1.5 block">Password</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type={showPw ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022"
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
              <div className="flex items-start gap-2 bg-red-500/20 border-2 border-red-500 rounded-xl px-3 py-3">
                <AlertCircle size={16} className="text-red-400 shrink-0 mt-0.5" />
                <p className="text-sm text-red-200 font-medium">{error}</p>
              </div>
            )}

            <Button type="submit" className="w-full mt-1" loading={loading}>
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
                  {" \u2192 "}
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
