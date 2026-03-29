"use client";

import { useState, useEffect, useCallback } from "react";
import {
  ShieldCheck,
  ScanLine,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Cpu,
  RotateCcw,
  RefreshCw,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import AdminSidebar from "@/components/layout/AdminSidebar";

interface EquipmentCode {
  id: string;
  code: string;
  booking_id: string;
  bms_code: string;
  user_id: string;
  user_name: string;
  equipment_type: string;
  equipment_label: string;
  space_id: string;
  space_name: string;
  status: "active" | "used" | "expired";
  generated_at: string;
  used_at: string | null;
}

function timeAgo(iso: string) {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  return `${Math.floor(diff / 3600)}h ago`;
}

type VerifyState = "idle" | "loading" | "success" | "error";

export default function SpaceLeadPage() {
  const [inputCode, setInputCode]         = useState("");
  const [verifyState, setVerifyState]     = useState<VerifyState>("idle");
  const [verifiedItem, setVerifiedItem]   = useState<EquipmentCode | null>(null);
  const [errorMessage, setErrorMessage]   = useState("");
  const [pendingCodes, setPendingCodes]   = useState<EquipmentCode[]>([]);
  const [verifiedCodes, setVerifiedCodes] = useState<EquipmentCode[]>([]);
  const [spaceName, setSpaceName]         = useState("Your Space");

  const loadCodes = useCallback(async () => {
    const [activeRes, usedRes] = await Promise.all([
      fetch("/api/admin/equipment-codes?status=active"),
      fetch("/api/admin/equipment-codes?status=used"),
    ]);

    if (activeRes.ok) {
      const { codes } = await activeRes.json();
      setPendingCodes(codes ?? []);
      if (codes?.[0]?.space_name) setSpaceName(codes[0].space_name);
    }
    if (usedRes.ok) {
      const { codes } = await usedRes.json();
      setVerifiedCodes(codes ?? []);
      if (!pendingCodes[0] && codes?.[0]?.space_name) setSpaceName(codes[0].space_name);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    // Fetch admin info for space name display
    fetch("/api/admin/me")
      .then((r) => r.json())
      .then(({ assigned_space_name }) => { if (assigned_space_name) setSpaceName(assigned_space_name); })
      .catch(() => {});

    loadCodes();
  }, [loadCodes]);

  const verifyCode = async (codeToVerify: string) => {
    const code = codeToVerify.trim().toUpperCase();
    if (!code) return;
    setVerifyState("loading");
    setErrorMessage("");
    setVerifiedItem(null);

    const res = await fetch(`/api/admin/equipment-codes/${encodeURIComponent(code)}/verify`, {
      method: "POST",
    });
    const data = await res.json();

    if (!res.ok) {
      setVerifyState("error");
      setErrorMessage(
        data.error ?? (
          code.startsWith("EQ-")
            ? "Code not found or already used. It may have expired."
            : "Invalid format. Equipment codes look like EQ-2025-XXXXX."
        )
      );
      return;
    }

    const verified: EquipmentCode = data.equipmentCode;
    setPendingCodes((prev) => prev.filter((c) => c.code !== code));
    setVerifiedCodes((prev) => [verified, ...prev]);
    setVerifiedItem(verified);
    setVerifyState("success");
    setInputCode("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    verifyCode(inputCode);
  };

  const reset = () => {
    setVerifyState("idle");
    setVerifiedItem(null);
    setErrorMessage("");
    setInputCode("");
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />

      <div className="flex-1 overflow-auto">
        <div className="flex items-center justify-between px-6 pt-6 pb-2">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Space Lead — {spaceName}</h1>
            <p className="text-sm text-gray-500 mt-0.5">Equipment access verification</p>
          </div>
          <button
            onClick={loadCodes}
            className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors"
            title="Refresh"
          >
            <RefreshCw size={14} />
          </button>
        </div>

        <main className="max-w-4xl mx-auto px-6 py-4 space-y-6">
        <Card className="bg-violet-50 border-violet-200">
          <div className="flex items-start gap-3">
            <ShieldCheck size={15} className="text-violet-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-violet-600 mb-0.5">How equipment verification works</p>
              <p className="text-xs text-violet-600 leading-relaxed">
                When a user checks in at reception and has requested equipment from your space, the receptionist generates a one-time code (EQ-YYYY-XXXXX) and gives it to the user. The user shows you this code — you enter it below to confirm they are authorised to use that equipment. The code expires the moment you verify it.
              </p>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Verification input */}
          <div className="space-y-4">
            <Card className="bg-white border-gray-200">
              <h2 className="font-semibold text-gray-900 flex items-center gap-2 mb-4">
                <ScanLine size={16} className="text-violet-600" /> Verify Equipment Code
              </h2>

              {verifyState === "success" && verifiedItem ? (
                <div className="text-center py-4">
                  <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
                    <CheckCircle size={28} className="text-green-500" />
                  </div>
                  <p className="text-green-600 font-bold text-lg">{verifiedItem.code}</p>
                  <p className="text-gray-900 font-semibold mt-1">{verifiedItem.user_name}</p>
                  <p className="text-sm text-gray-400 mt-0.5">
                    is authorised to use the{" "}
                    <span className="text-violet-600 font-medium">{verifiedItem.equipment_label}</span>
                  </p>
                  <Badge variant="success" className="mt-3">Code used — now expired</Badge>
                  <div className="mt-4">
                    <Button variant="outline" size="sm" onClick={reset}>
                      <RotateCcw size={13} /> Verify another code
                    </Button>
                  </div>
                </div>
              ) : verifyState === "error" ? (
                <div className="text-center py-4">
                  <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-3">
                    <XCircle size={28} className="text-red-500" />
                  </div>
                  <p className="text-red-500 font-semibold">Verification failed</p>
                  <p className="text-sm text-gray-400 mt-1">{errorMessage}</p>
                  <div className="mt-4">
                    <Button variant="outline" size="sm" onClick={reset}>
                      <RotateCcw size={13} /> Try again
                    </Button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-3">
                  <div>
                    <label className="text-xs text-gray-400 font-medium mb-1.5 block">
                      Enter equipment access code
                    </label>
                    <input
                      id="eq-code-input"
                      name="equipment_code"
                      type="text"
                      value={inputCode}
                      onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                      placeholder="EQ-2025-XXXXX"
                      autoFocus
                      className="w-full bg-white border border-gray-300 text-gray-900 text-sm font-mono tracking-widest rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-violet-500 placeholder-gray-400"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      The user should show you this code from the receptionist.
                    </p>
                  </div>
                  <Button
                    type="submit"
                    className="w-full"
                    loading={verifyState === "loading"}
                  >
                    <ShieldCheck size={14} /> Verify & Confirm Access
                  </Button>
                </form>
              )}
            </Card>

            {/* Pending codes for this space */}
            <Card className="bg-white border-gray-200">
              <h3 className="font-semibold text-gray-900 text-sm flex items-center gap-2 mb-3">
                <Clock size={13} className="text-yellow-600" />
                Pending for this space
                {pendingCodes.length > 0 && (
                  <span className="ml-auto bg-yellow-100 text-yellow-700 text-xs font-bold px-2 py-0.5 rounded-full">
                    {pendingCodes.length}
                  </span>
                )}
              </h3>
              {pendingCodes.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-4">No pending equipment codes.</p>
              ) : (
                <div className="space-y-2">
                  {pendingCodes.map((code) => (
                    <div
                      key={code.id}
                      className="flex items-center justify-between bg-gray-100 rounded-xl px-3 py-2.5"
                    >
                      <div>
                        <p className="text-xs font-mono font-bold text-yellow-600">{code.code}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <p className="text-xs text-gray-500">{code.user_name}</p>
                          <span className="text-gray-600">·</span>
                          <p className="text-xs text-gray-500">{code.equipment_label}</p>
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">Generated {timeAgo(code.generated_at)}</p>
                      </div>
                      <Button size="sm" onClick={() => verifyCode(code.code)}>
                        Verify
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>

          {/* Verification history */}
          <div>
            <Card className="bg-white border-gray-200">
              <h3 className="font-semibold text-gray-900 text-sm flex items-center gap-2 mb-3">
                <CheckCircle size={13} className="text-green-500" /> Verified Today
              </h3>
              {verifiedCodes.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-4">No verifications yet today.</p>
              ) : (
                <div className="space-y-2">
                  {verifiedCodes.map((code) => (
                    <div key={code.id} className="bg-gray-50 rounded-xl px-3 py-2.5 space-y-1">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-mono text-gray-400">{code.code}</p>
                        <Badge variant="success" size="sm">Used</Badge>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <User size={11} className="text-gray-500" />
                        <p className="text-xs text-gray-700">{code.user_name}</p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Cpu size={11} className="text-gray-500" />
                        <p className="text-xs text-gray-500">{code.equipment_label}</p>
                      </div>
                      {code.used_at && (
                        <p className="text-xs text-gray-500">Verified {timeAgo(code.used_at)}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </div>
        </main>
      </div>
    </div>
  );
}
