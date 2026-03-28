"use client";

import { useState } from "react";
import {
  ShieldCheck,
  ScanLine,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Cpu,
  AlertCircle,
  RotateCcw,
  LogOut,
} from "lucide-react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import type { EquipmentAccessCode } from "@/types";

// ── Mock data: codes that are pending verification for this space lead ────────
const MOCK_PENDING_CODES: EquipmentAccessCode[] = [
  {
    id: "eq-001",
    code: "EQ-2025-T4K9P",
    bookingId: "bk-101",
    bmsCode: "BMS-2025-A7X3K",
    userId: "u-201",
    userName: "Adeola Fashola",
    equipmentType: "3d_printer_medium",
    equipmentLabel: "3D Printer (Medium)",
    spaceId: "maker-space",
    spaceName: "Maker Space",
    status: "active",
    generatedAt: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
  },
  {
    id: "eq-002",
    code: "EQ-2025-X8M2Q",
    bookingId: "bk-102",
    bmsCode: "BMS-2025-B3R1W",
    userId: "u-202",
    userName: "Chukwuemeka Obi",
    equipmentType: "laser_cutter",
    equipmentLabel: "Laser Cutter",
    spaceId: "maker-space",
    spaceName: "Maker Space",
    status: "active",
    generatedAt: new Date(Date.now() - 3 * 60 * 1000).toISOString(),
  },
];

const MOCK_VERIFIED: EquipmentAccessCode[] = [
  {
    id: "eq-000",
    code: "EQ-2025-Z2K7V",
    bookingId: "bk-099",
    bmsCode: "BMS-2025-C9N5D",
    userId: "u-199",
    userName: "Precious Okonkwo",
    equipmentType: "vinyl_cutter",
    equipmentLabel: "Vinyl Cutter",
    spaceId: "maker-space",
    spaceName: "Maker Space",
    status: "used",
    generatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    usedAt: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
    usedByAdminId: "a-003",
  },
];

function timeAgo(iso: string) {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  return `${Math.floor(diff / 3600)}h ago`;
}

type VerifyState = "idle" | "loading" | "success" | "error";

export default function SpaceLeadPage() {
  const [inputCode, setInputCode]           = useState("");
  const [verifyState, setVerifyState]       = useState<VerifyState>("idle");
  const [verifiedItem, setVerifiedItem]     = useState<EquipmentAccessCode | null>(null);
  const [errorMessage, setErrorMessage]     = useState("");
  const [pendingCodes, setPendingCodes]     = useState<EquipmentAccessCode[]>(MOCK_PENDING_CODES);
  const [verifiedCodes, setVerifiedCodes]   = useState<EquipmentAccessCode[]>(MOCK_VERIFIED);

  // Verify a code (either typed or from pending list)
  const verifyCode = async (codeToVerify: string) => {
    const code = codeToVerify.trim().toUpperCase();
    if (!code) return;
    setVerifyState("loading");
    setErrorMessage("");
    setVerifiedItem(null);

    // TODO: POST /api/admin/equipment-codes/verify with { code }
    await new Promise((r) => setTimeout(r, 900));

    // Find in pending list
    const found = pendingCodes.find((c) => c.code === code);
    if (!found) {
      setVerifyState("error");
      setErrorMessage(
        code.startsWith("EQ-")
          ? "Code not found or already used. It may have expired."
          : "Invalid format. Equipment codes look like EQ-2025-XXXXX."
      );
      return;
    }

    // Mark as used
    const now = new Date().toISOString();
    const verified: EquipmentAccessCode = { ...found, status: "used", usedAt: now, usedByAdminId: "a-003" };
    setPendingCodes((prev) => prev.filter((c) => c.id !== found.id));
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
    <div className="min-h-screen bg-gray-950">
      {/* Top bar */}
      <header className="bg-gray-900 border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div>
            <p className="text-sm font-bold text-white">Space Lead — Maker Space</p>
            <p className="text-xs text-gray-500">Equipment access verification</p>
          </div>
        </div>
        <Link href="/admin/login">
          <Button variant="ghost" size="sm">
            <LogOut size={13} /> Sign out
          </Button>
        </Link>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8 space-y-6">
        {/* How it works banner */}
        <Card className="bg-brand-950/30 border-brand-800/30">
          <div className="flex items-start gap-3">
            <ShieldCheck size={15} className="text-brand-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-brand-300 mb-0.5">How equipment verification works</p>
              <p className="text-xs text-brand-600 leading-relaxed">
                When a user checks in at reception and has requested equipment from your space, the receptionist generates a one-time code (EQ-YYYY-XXXXX) and gives it to the user. The user shows you this code — you enter it below to confirm they are authorised to use that equipment. The code expires the moment you verify it.
              </p>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Verification input */}
          <div className="space-y-4">
            <Card className="bg-gray-900 border-gray-800">
              <h2 className="font-semibold text-white flex items-center gap-2 mb-4">
                <ScanLine size={16} className="text-brand-400" /> Verify Equipment Code
              </h2>

              {verifyState === "success" && verifiedItem ? (
                <div className="text-center py-4">
                  <div className="w-14 h-14 rounded-full bg-green-900/40 flex items-center justify-center mx-auto mb-3">
                    <CheckCircle size={28} className="text-green-400" />
                  </div>
                  <p className="text-green-400 font-bold text-lg">{verifiedItem.code}</p>
                  <p className="text-white font-semibold mt-1">{verifiedItem.userName}</p>
                  <p className="text-sm text-gray-400 mt-0.5">
                    is authorised to use the{" "}
                    <span className="text-brand-300 font-medium">{verifiedItem.equipmentLabel}</span>
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
                  <div className="w-14 h-14 rounded-full bg-red-900/40 flex items-center justify-center mx-auto mb-3">
                    <XCircle size={28} className="text-red-400" />
                  </div>
                  <p className="text-red-400 font-semibold">Verification failed</p>
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
                      type="text"
                      value={inputCode}
                      onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                      placeholder="EQ-2025-XXXXX"
                      autoFocus
                      className="w-full bg-gray-800 border border-gray-700 text-white text-sm font-mono tracking-widest rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-500 placeholder-gray-600"
                    />
                    <p className="text-xs text-gray-600 mt-1">
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
            <Card className="bg-gray-900 border-gray-800">
              <h3 className="font-semibold text-white text-sm flex items-center gap-2 mb-3">
                <Clock size={13} className="text-yellow-400" />
                Pending for this space
                {pendingCodes.length > 0 && (
                  <span className="ml-auto bg-yellow-900/50 text-yellow-400 text-xs font-bold px-2 py-0.5 rounded-full">
                    {pendingCodes.length}
                  </span>
                )}
              </h3>
              {pendingCodes.length === 0 ? (
                <p className="text-xs text-gray-600 text-center py-4">No pending equipment codes.</p>
              ) : (
                <div className="space-y-2">
                  {pendingCodes.map((code) => (
                    <div
                      key={code.id}
                      className="flex items-center justify-between bg-gray-800 rounded-xl px-3 py-2.5"
                    >
                      <div>
                        <p className="text-xs font-mono font-bold text-yellow-400">{code.code}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <p className="text-xs text-gray-400">{code.userName}</p>
                          <span className="text-gray-600">·</span>
                          <p className="text-xs text-gray-500">{code.equipmentLabel}</p>
                        </div>
                        <p className="text-xs text-gray-600 mt-0.5">Generated {timeAgo(code.generatedAt)}</p>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => verifyCode(code.code)}
                      >
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
            <Card className="bg-gray-900 border-gray-800">
              <h3 className="font-semibold text-white text-sm flex items-center gap-2 mb-3">
                <CheckCircle size={13} className="text-green-400" /> Verified Today
              </h3>
              {verifiedCodes.length === 0 ? (
                <p className="text-xs text-gray-600 text-center py-4">No verifications yet today.</p>
              ) : (
                <div className="space-y-2">
                  {verifiedCodes.map((code) => (
                    <div key={code.id} className="bg-gray-800/50 rounded-xl px-3 py-2.5 space-y-1">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-mono text-gray-400">{code.code}</p>
                        <Badge variant="success" size="sm">Used</Badge>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <User size={11} className="text-gray-500" />
                        <p className="text-xs text-gray-300">{code.userName}</p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Cpu size={11} className="text-gray-500" />
                        <p className="text-xs text-gray-400">{code.equipmentLabel}</p>
                      </div>
                      {code.usedAt && (
                        <p className="text-xs text-gray-600">Verified {timeAgo(code.usedAt)}</p>
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
  );
}
