/**
 * patch-pages.js — Runs before `npm run build` on Vercel.
 * Fixes applied at build time:
 *   1. Calendar safety valve (utils.ts)
 *   2. Space image corrections (spaces.ts)
 *   3. Admin bookings — payment_pending status
 *   4. Admin pages — mobile top-bar offset
 *   5. Dashboard / booking — remove QR code references
 */

const fs   = require("fs");
const path = require("path");
const root = path.join(__dirname, "..");

function patch(rel, replacements) {
  const target = path.join(root, rel);
  let content = fs.readFileSync(target, "utf8");
  for (const [from, to] of replacements) {
    content = content.split(from).join(to);
  }
  fs.writeFileSync(target, content, "utf8");
  console.log(`✓ patched ${rel}`);
}

// ─── 1. Fix calendar safety valve in lib/utils.ts ────────────────────────────
patch("lib/utils.ts", [
  ["if (count > 20) break;", "if (count > 60) break;"],
  ["up to 4 days ahead",     "up to maxAdvanceDays weekdays ahead"],
]);

// ─── 2. Fix space image mapping in lib/data/spaces.ts ────────────────────────
// Verified by viewing each photo directly:
//   image4  = circuit board mural + lab tables  → fits AI & Robotics Lab perfectly
//   image7  = large industrial 3D printers      → fits Maker Space better than image4
//   image21 = co-working area (same sunset mural as image16) → WRONG for AI Robotics
//
// IMPORTANT: fix Maker Space FIRST so image4 is free for AI Robotics Lab
patch("lib/data/spaces.ts", [
  ['imageUrl: "/spaces/image4.jpeg"',  'imageUrl: "/spaces/image7.jpeg"'],   // Maker Space → clear 3D printers shot
  ['imageUrl: "/spaces/image21.jpeg"', 'imageUrl: "/spaces/image4.jpeg"'],   // AI Robotics Lab → circuit board mural
]);

// ─── 3. Admin bookings — add payment_pending status ──────────────────────────
patch("app/admin/bookings/page.tsx", [
  [
    `import {
  Search,
  CalendarDays,
  Clock,
  Building2,
  CheckCircle,
  XCircle,
  MoreHorizontal,
  Filter,
} from "lucide-react";`,
    `import {
  Search, CalendarDays, Clock, Building2,
  CheckCircle, XCircle, MoreHorizontal, Filter, Banknote,
} from "lucide-react";`,
  ],
  [
    `  no_show:   { label: "No Show", variant: "danger" },
  cancelled: { label: "Cancelled", variant: "neutral" },`,
    `  no_show:         { label: "No Show",      variant: "danger"  },
  cancelled:       { label: "Cancelled",    variant: "neutral" },
  payment_pending: { label: "Awaiting Pay", variant: "warning" },`,
  ],
]);

// ─── 4. Admin pages — add mobile top-bar offset (pt-14 lg:pt-0) ──────────────
for (const file of [
  "app/admin/page.tsx",
  "app/admin/users/page.tsx",
  "app/admin/spaces/page.tsx",
  "app/admin/checkin/page.tsx",
  "app/admin/broadcast/page.tsx",
  "app/admin/space-lead/page.tsx",
]) {
  patch(file, [
    ['<div className="flex-1 overflow-auto">', '<div className="flex-1 overflow-auto pt-14 lg:pt-0">'],
  ]);
}

// ─── 5. Dashboard — remove "View QR" reference ───────────────────────────────
patch("app/dashboard/page.tsx", [
  ["View QR <ArrowRight size={14} />", "View Details <ArrowRight size={14} />"],
  ["View QR<",                         "View Details<"],
]);

// ─── 6. Booking confirmation — remove all QR code text ───────────────────────
patch("app/spaces/[id]/book/page.tsx", [
  ["A confirmation email with your QR code and booking code", "A confirmation email with your booking code"],
  ["You'll receive an email with your QR code once approved.", "You'll receive a confirmation email once approved."],
  ["Present this code or your QR code to the receptionist",   "Present this booking code to the receptionist"],
  ["with your QR code",                                        "with your booking details"],
]);

console.log("\n✅ patch-pages.js complete.");
