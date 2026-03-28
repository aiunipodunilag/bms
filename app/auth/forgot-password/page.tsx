"use client";

import { useState } from "react";
import Link from "next/link";
import Button from "@/components/ui/Button";
import { ArrowLeft, Mail, CheckCircle } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email.trim().toLowerCase() }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Something went wrong. Please try again.");
    } else {
      setSent(true);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-950 via-brand-900 to-brand-800 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <Link
          href="/auth/login"
          className="inline-flex items-center gap-2 text-brand-300 hover:text-white text-sm mb-8 transition-colors"
        >
          <ArrowLeft size={15} /> Back to sign in
        </Link>

        <div className="bg-white rounded-3xl p-8 shadow-2xl">
          {!sent ? (
            <>
              <div className="w-10 h-10 rounded-xl bg-brand-100 flex items-center justify-center mb-5">
                <Mail size={18} className="text-brand-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-1">Reset your password</h1>
              <p className="text-gray-500 text-sm mb-6">
                Enter the email address on your account and we&apos;ll send you a reset link.
              </p>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl mb-4">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Email address
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="you@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                  />
                </div>
                <Button type="submit" className="w-full" size="lg" loading={loading}>
                  Send Reset Link
                </Button>
              </form>
            </>
          ) : (
            <div className="text-center">
              <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={28} className="text-green-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Check your email</h2>
              <p className="text-gray-500 text-sm mb-6">
                If an account exists for <strong>{email}</strong>, a password reset link has
                been sent. Check your inbox and follow the instructions.
              </p>
              <Link href="/auth/login">
                <Button className="w-full" variant="secondary">
                  Back to Sign In
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
