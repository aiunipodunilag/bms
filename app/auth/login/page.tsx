"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();

  // If already logged in, skip login screen.
  // Use getUser() (server-verified) instead of getSession() (reads stale localStorage)
  // to prevent the sign-out loop: stale localStorage token → redirect to /dashboard →
  // server sees no cookie → redirect back to /auth/login → infinite loop.
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) window.location.href = "/dashboard";
    });
  }, []);

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const supabase = createClient();

      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: form.email.trim().toLowerCase(),
        password: form.password,
      });

      if (authError || !authData.user) {
        setError(
          authError?.message === "Invalid login credentials"
            ? "Incorrect email or password. Please try again."
            : authError?.message ?? "Login failed. Please try again."
        );
        setLoading(false);
        return;
      }

      window.location.href = "/dashboard";
    } catch (err) {
      console.error("[login]", err);
      setError("Something went wrong. Check your connection and try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FB] flex items-center justify-center px-4">
      {/* Subtle gradient bg */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full opacity-[0.06]"
          style={{ background: "radial-gradient(circle, #5B4CF5 0%, transparent 70%)" }} />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full opacity-[0.04]"
          style={{ background: "radial-gradient(circle, #06b6d4 0%, transparent 70%)" }} />
      </div>

      <div className="relative w-full max-w-md">
        {/* Back link */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-gray-700 text-sm mb-8 transition-colors"
        >
          <ArrowLeft size={15} /> Back to home
        </Link>

        <div className="bg-white rounded-3xl p-8 border border-black/[0.07]"
          style={{ boxShadow: "0 20px 60px rgba(0,0,0,0.08), 0 8px 24px rgba(0,0,0,0.05)" }}>
          {/* Header */}
          <div className="mb-7">
            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: "linear-gradient(135deg, #5B4CF5 0%, #7D67EF 100%)", boxShadow: "0 4px 12px rgba(91,76,245,0.25)" }}>
                <span className="text-white font-bold text-sm">U</span>
              </div>
              <div>
                <p className="font-bold text-gray-900 text-sm" style={{ letterSpacing: "-0.02em" }}>AI-UNIPOD</p>
                <p className="text-[10px] text-gray-400 font-medium tracking-widest uppercase">BMS</p>
              </div>
            </div>
            <h1 className="text-2xl font-bold text-gray-900" style={{ letterSpacing: "-0.025em" }}>Welcome back</h1>
            <p className="text-gray-500 text-sm mt-1">
              Sign in to your AI-UNIPOD BMS account
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Email address
              </label>
              <input
                type="email"
                required
                autoComplete="email"
                placeholder="you@email.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-gray-50/50 placeholder-gray-400 transition-all focus:bg-white"
              />
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-medium text-gray-700">Password</label>
                <Link
                  href="/auth/forgot-password"
                  className="text-xs text-brand-600 hover:text-brand-700 hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  placeholder="Your password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full px-4 py-2.5 pr-10 rounded-xl border border-gray-200 text-sm bg-gray-50/50 placeholder-gray-400 transition-all focus:bg-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-xl">
                {error}
              </div>
            )}

            {/* Submit */}
            <Button type="submit" className="w-full" size="lg" loading={loading}>
              Sign In
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            Don&apos;t have an account?{" "}
            <Link href="/auth/signup" className="text-brand-600 font-medium hover:underline">
              Sign up free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
