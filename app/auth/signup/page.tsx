"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import {
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  CheckCircle,
  Upload,
  GraduationCap,
  Building2,
  CreditCard,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Step = "class_select" | "internal_form" | "external_form" | "success";
type UserClass = "internal" | "external";
type InternalType = "regular_student" | "lecturer_staff" | "product_developer";

export default function SignupPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("class_select");
  const [userClass, setUserClass] = useState<UserClass | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpSending, setOtpSending] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpVerifying, setOtpVerifying] = useState(false);

  const [internalForm, setInternalForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    userType: "regular_student" as InternalType,
    matricNumber: "",
    staffNumber: "",
    password: "",
    confirmPassword: "",
    documentFile: null as File | null,
  });

  const [externalForm, setExternalForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    organisation: "",
    purposeOfVisit: "",
    password: "",
    confirmPassword: "",
    otp: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [globalError, setGlobalError] = useState("");

  const handleClassSelect = (cls: UserClass) => {
    setUserClass(cls);
    setStep(cls === "internal" ? "internal_form" : "external_form");
  };

  const sendOTP = async () => {
    if (!externalForm.phone) {
      setErrors({ phone: "Phone number is required" });
      return;
    }
    setOtpSending(true);
    setErrors({});

    const res = await fetch("/api/auth/send-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone: externalForm.phone }),
    });

    const data = await res.json();
    if (!res.ok) {
      setErrors({ phone: data.error ?? "Failed to send OTP" });
    } else {
      setOtpSent(true);
    }
    setOtpSending(false);
  };

  const verifyOTP = async () => {
    if (!externalForm.otp) {
      setErrors({ otp: "Please enter the OTP" });
      return;
    }
    setOtpVerifying(true);
    setErrors({});

    const res = await fetch("/api/auth/send-otp", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone: externalForm.phone, otp: externalForm.otp }),
    });

    const data = await res.json();
    if (!res.ok) {
      setErrors({ otp: data.error ?? "Invalid OTP" });
    } else {
      setOtpVerified(true);
    }
    setOtpVerifying(false);
  };

  const handleInternalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setGlobalError("");

    if (internalForm.password !== internalForm.confirmPassword) {
      setErrors({ confirmPassword: "Passwords do not match." });
      return;
    }
    if (internalForm.password.length < 8) {
      setErrors({ password: "Password must be at least 8 characters." });
      return;
    }
    if (!internalForm.documentFile) {
      setErrors({ documentFile: "Please upload an identity document." });
      return;
    }

    setLoading(true);

    const supabase = createClient();

    // 1. Create Supabase auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: internalForm.email.trim().toLowerCase(),
      password: internalForm.password,
      options: {
        data: { full_name: internalForm.fullName },
      },
    });

    if (authError || !authData.user) {
      setGlobalError(authError?.message ?? "Failed to create account. Please try again.");
      setLoading(false);
      return;
    }

    // 2. Upload identity document to Supabase Storage
    let documentUrl: string | null = null;
    if (internalForm.documentFile) {
      const ext = internalForm.documentFile.name.split(".").pop();
      const filePath = `${authData.user.id}/identity.${ext}`;
      const { data: uploadData, error: uploadErr } = await supabase.storage
        .from("documents")
        .upload(filePath, internalForm.documentFile, { upsert: true });

      if (uploadErr) {
        console.error("Document upload failed:", uploadErr);
        // Continue — admin can request document again
      } else {
        const { data: urlData } = supabase.storage
          .from("documents")
          .getPublicUrl(uploadData.path);
        documentUrl = urlData.publicUrl;
      }
    }

    // 3. Create profile via API
    const profileRes = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: authData.user.id,
        fullName: internalForm.fullName,
        phone: internalForm.phone,
        userClass: "internal",
        tier: internalForm.userType,
        matricNumber: internalForm.userType === "regular_student" ? internalForm.matricNumber : null,
        staffNumber: internalForm.userType !== "regular_student" ? internalForm.staffNumber : null,
        documentUrl,
      }),
    });

    if (!profileRes.ok) {
      const err = await profileRes.json();
      setGlobalError(err.error ?? "Failed to create profile.");
      setLoading(false);
      return;
    }

    // Sign out immediately — internal users must wait for admin verification
    await supabase.auth.signOut();
    setStep("success");
    setLoading(false);
  };

  const handleExternalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setGlobalError("");

    if (!otpVerified) {
      setErrors({ otp: "Please verify your phone number first." });
      return;
    }
    if (externalForm.password !== externalForm.confirmPassword) {
      setErrors({ confirmPassword: "Passwords do not match." });
      return;
    }
    if (externalForm.password.length < 8) {
      setErrors({ password: "Password must be at least 8 characters." });
      return;
    }

    setLoading(true);
    const supabase = createClient();

    // 1. Create Supabase auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: externalForm.email.trim().toLowerCase(),
      password: externalForm.password,
      options: { data: { full_name: externalForm.fullName } },
    });

    if (authError || !authData.user) {
      setGlobalError(authError?.message ?? "Failed to create account.");
      setLoading(false);
      return;
    }

    // 2. Create profile
    const profileRes = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: authData.user.id,
        fullName: externalForm.fullName,
        phone: externalForm.phone,
        userClass: "external",
        tier: "external",
        organisation: externalForm.organisation,
        purposeOfVisit: externalForm.purposeOfVisit,
      }),
    });

    if (!profileRes.ok) {
      const err = await profileRes.json();
      setGlobalError(err.error ?? "Failed to create profile.");
      setLoading(false);
      return;
    }

    // External users are active immediately — redirect to login
    await supabase.auth.signOut();
    setStep("success");
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-950 via-brand-900 to-brand-800 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-brand-300 hover:text-white text-sm mb-8 transition-colors"
        >
          <ArrowLeft size={15} /> Back to home
        </Link>

        {/* ── STEP 1: Class Selection ──────────────────────────────────── */}
        {step === "class_select" && (
          <div className="bg-white rounded-3xl p-8 shadow-2xl">
            <div className="mb-7">
              <div className="w-10 h-10 rounded-xl bg-brand-100 flex items-center justify-center mb-4">
                <span className="text-brand-700 font-bold text-lg">U</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Create your account</h1>
              <p className="text-gray-500 text-sm mt-1">Tell us who you are to get started</p>
            </div>

            <p className="font-medium text-gray-800 mb-4">Are you a UNILAG student or staff member?</p>

            <div className="grid grid-cols-1 gap-4">
              <button
                onClick={() => handleClassSelect("internal")}
                className="group flex items-start gap-4 p-5 rounded-2xl border-2 border-gray-200 hover:border-brand-500 hover:bg-brand-50 transition-all text-left"
              >
                <div className="w-10 h-10 rounded-xl bg-brand-100 group-hover:bg-brand-200 flex items-center justify-center shrink-0 transition-colors">
                  <GraduationCap size={18} className="text-brand-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Yes — I&apos;m a UNILAG student or staff</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Free access with your matric or staff number. Account pending admin verification.
                  </p>
                </div>
                <ArrowRight size={18} className="text-gray-400 group-hover:text-brand-500 mt-1 shrink-0 transition-colors" />
              </button>

              <button
                onClick={() => handleClassSelect("external")}
                className="group flex items-start gap-4 p-5 rounded-2xl border-2 border-gray-200 hover:border-brand-500 hover:bg-brand-50 transition-all text-left"
              >
                <div className="w-10 h-10 rounded-xl bg-gray-100 group-hover:bg-brand-100 flex items-center justify-center shrink-0 transition-colors">
                  <Building2 size={18} className="text-gray-600 group-hover:text-brand-600 transition-colors" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">No — I&apos;m an external user</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Individual, organisation, or freelancer from outside UNILAG. Phone OTP required. ₦3,000/session at front desk.
                  </p>
                </div>
                <ArrowRight size={18} className="text-gray-400 group-hover:text-brand-500 mt-1 shrink-0 transition-colors" />
              </button>
            </div>

            <p className="mt-6 text-center text-sm text-gray-500">
              Already have an account?{" "}
              <Link href="/auth/login" className="text-brand-600 font-medium hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        )}

        {/* ── STEP 2A: Internal (UNILAG) Form ──────────────────────────── */}
        {step === "internal_form" && (
          <div className="bg-white rounded-3xl p-8 shadow-2xl">
            <button
              onClick={() => setStep("class_select")}
              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-6 transition-colors"
            >
              <ArrowLeft size={14} /> Back
            </button>

            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900">UNILAG Student / Staff</h1>
              <p className="text-sm text-gray-500 mt-1">
                Fill in your details. Your account will be reviewed by admin before activation.
              </p>
            </div>

            {globalError && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl mb-4">
                {globalError}
              </div>
            )}

            <form onSubmit={handleInternalSubmit} className="space-y-4">
              {/* User type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">I am a</label>
                <select
                  value={internalForm.userType}
                  onChange={(e) => setInternalForm({ ...internalForm, userType: e.target.value as InternalType })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  <option value="regular_student">Regular Student</option>
                  <option value="lecturer_staff">Lecturer / Staff</option>
                  <option value="product_developer">Product Developer</option>
                </select>
              </div>

              {/* Full name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Full name</label>
                <input
                  type="text"
                  required
                  placeholder="Your full name"
                  value={internalForm.fullName}
                  onChange={(e) => setInternalForm({ ...internalForm, fullName: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email address</label>
                <input
                  type="email"
                  required
                  placeholder="you@unilag.edu.ng"
                  value={internalForm.email}
                  onChange={(e) => setInternalForm({ ...internalForm, email: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone number</label>
                <input
                  type="tel"
                  required
                  placeholder="+234 800 000 0000"
                  value={internalForm.phone}
                  onChange={(e) => setInternalForm({ ...internalForm, phone: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              {/* Matric / Staff number */}
              {internalForm.userType === "regular_student" ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Matric number</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 210404001"
                    value={internalForm.matricNumber}
                    onChange={(e) => setInternalForm({ ...internalForm, matricNumber: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Staff number</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. SS/0001"
                    value={internalForm.staffNumber}
                    onChange={(e) => setInternalForm({ ...internalForm, staffNumber: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              )}

              {/* Document upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Identity document{" "}
                  <span className="text-gray-400 font-normal">(student ID, biodata, or receipt)</span>
                </label>
                <label className="flex items-center gap-3 px-4 py-3 rounded-xl border-2 border-dashed border-gray-300 hover:border-brand-400 cursor-pointer transition-colors">
                  <Upload size={18} className="text-gray-400" />
                  <span className="text-sm text-gray-500">
                    {internalForm.documentFile
                      ? internalForm.documentFile.name
                      : "Click to upload (PDF, JPG, PNG — max 5MB)"}
                  </span>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    className="hidden"
                    onChange={(e) =>
                      setInternalForm({ ...internalForm, documentFile: e.target.files?.[0] ?? null })
                    }
                  />
                </label>
                {errors.documentFile && (
                  <p className="text-xs text-red-500 mt-1">{errors.documentFile}</p>
                )}
              </div>

              {/* Password */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      placeholder="Min. 8 chars"
                      minLength={8}
                      autoComplete="new-password"
                      value={internalForm.password}
                      onChange={(e) => setInternalForm({ ...internalForm, password: e.target.value })}
                      className="w-full px-4 py-2.5 pr-9 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                    >
                      {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                  {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm password</label>
                  <input
                    type="password"
                    required
                    placeholder="Repeat password"
                    autoComplete="new-password"
                    value={internalForm.confirmPassword}
                    onChange={(e) => setInternalForm({ ...internalForm, confirmPassword: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                  {errors.confirmPassword && (
                    <p className="text-xs text-red-500 mt-1">{errors.confirmPassword}</p>
                  )}
                </div>
              </div>

              <Button type="submit" className="w-full mt-2" size="lg" loading={loading}>
                Create Account <ArrowRight size={16} />
              </Button>
            </form>
          </div>
        )}

        {/* ── STEP 2B: External Form ────────────────────────────────────── */}
        {step === "external_form" && (
          <div className="bg-white rounded-3xl p-8 shadow-2xl">
            <button
              onClick={() => setStep("class_select")}
              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-6 transition-colors"
            >
              <ArrowLeft size={14} /> Back
            </button>

            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900">External User</h1>
              <p className="text-sm text-gray-500 mt-1">
                No UNILAG affiliation required. Verify your phone number to activate your account instantly.
              </p>
            </div>

            {globalError && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl mb-4">
                {globalError}
              </div>
            )}

            <form onSubmit={handleExternalSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Full name</label>
                <input
                  type="text"
                  required
                  placeholder="Your full name"
                  value={externalForm.fullName}
                  onChange={(e) => setExternalForm({ ...externalForm, fullName: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                  <input
                    type="email"
                    required
                    placeholder="you@email.com"
                    value={externalForm.email}
                    onChange={(e) => setExternalForm({ ...externalForm, email: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Organisation</label>
                  <input
                    type="text"
                    required
                    placeholder="Company / School"
                    value={externalForm.organisation}
                    onChange={(e) => setExternalForm({ ...externalForm, organisation: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Purpose of visit</label>
                <textarea
                  required
                  rows={2}
                  placeholder="Why are you visiting AI-UNIPOD?"
                  value={externalForm.purposeOfVisit}
                  onChange={(e) => setExternalForm({ ...externalForm, purposeOfVisit: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
                />
              </div>

              {/* Phone + OTP */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Phone number <span className="text-gray-400 font-normal">(OTP required)</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="tel"
                    required
                    placeholder="+234 800 000 0000"
                    value={externalForm.phone}
                    onChange={(e) => setExternalForm({ ...externalForm, phone: e.target.value })}
                    disabled={otpVerified}
                    className="flex-1 px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 disabled:bg-gray-50"
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={sendOTP}
                    loading={otpSending}
                    disabled={!externalForm.phone || otpSent || otpVerified}
                  >
                    {otpSent ? "Resend" : "Send OTP"}
                  </Button>
                </div>
                {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}

                {otpSent && !otpVerified && (
                  <div className="mt-2 flex gap-2">
                    <input
                      type="text"
                      placeholder="Enter 6-digit OTP"
                      maxLength={6}
                      value={externalForm.otp}
                      onChange={(e) => setExternalForm({ ...externalForm, otp: e.target.value })}
                      className="flex-1 px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 tracking-widest font-mono"
                    />
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={verifyOTP}
                      loading={otpVerifying}
                    >
                      Verify
                    </Button>
                  </div>
                )}
                {otpVerified && (
                  <p className="text-sm text-green-600 flex items-center gap-1 mt-1.5">
                    <CheckCircle size={14} /> Phone number verified
                  </p>
                )}
                {errors.otp && <p className="text-xs text-red-500 mt-1">{errors.otp}</p>}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
                  <input
                    type="password"
                    required
                    minLength={8}
                    placeholder="Min. 8 chars"
                    autoComplete="new-password"
                    value={externalForm.password}
                    onChange={(e) => setExternalForm({ ...externalForm, password: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                  {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm</label>
                  <input
                    type="password"
                    required
                    placeholder="Repeat"
                    autoComplete="new-password"
                    value={externalForm.confirmPassword}
                    onChange={(e) => setExternalForm({ ...externalForm, confirmPassword: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                  {errors.confirmPassword && (
                    <p className="text-xs text-red-500 mt-1">{errors.confirmPassword}</p>
                  )}
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 text-amber-700 text-xs px-4 py-3 rounded-xl">
                <CreditCard size={13} className="inline mr-1 shrink-0" />
                External users pay <strong>₦3,000</strong> at the front desk per coworking session.
                Other space pricing is confirmed at booking.
              </div>

              <Button type="submit" className="w-full mt-2" size="lg" loading={loading}>
                Create Account <ArrowRight size={16} />
              </Button>
            </form>
          </div>
        )}

        {/* ── STEP 3: Success ───────────────────────────────────────────── */}
        {step === "success" && (
          <div className="bg-white rounded-3xl p-10 shadow-2xl text-center">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-5">
              <CheckCircle size={32} className="text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {userClass === "internal" ? "Account submitted!" : "Welcome aboard!"}
            </h2>
            {userClass === "internal" ? (
              <p className="text-gray-500 text-sm leading-relaxed mb-6">
                Your account is <strong>pending verification</strong>. Admin will review your
                document and activate your account — usually within 24 hours. You&apos;ll receive
                a confirmation email once it&apos;s done.
              </p>
            ) : (
              <p className="text-gray-500 text-sm leading-relaxed mb-6">
                Your account is <strong>active</strong>! You can now log in and start booking
                available spaces. Remember to pay ₦3,000 at the front desk for coworking access.
              </p>
            )}
            <Button className="w-full" size="lg" onClick={() => router.push("/auth/login")}>
              Go to Sign In
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
