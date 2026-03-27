import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, addDays, isWeekend, isWithinInterval, parseISO } from "date-fns";
import type { UserTier, Space } from "@/types";
import { OPERATING_HOURS, BOOKING_RULES } from "@/lib/data/tiers";

// ─── Tailwind class merger ────────────────────────────────────────────────────
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ─── BMS code generator ───────────────────────────────────────────────────────
export function generateBMSCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 5; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  const year = new Date().getFullYear();
  return `BMS-${year}-${code}`;
}

// ─── Date & Time helpers ──────────────────────────────────────────────────────

/** Returns list of valid booking dates (Mon–Fri, up to 4 days ahead) */
export function getBookableDates(): Date[] {
  const dates: Date[] = [];
  let day = new Date();
  let count = 0;

  while (dates.length < BOOKING_RULES.maxAdvanceDays) {
    count++;
    const candidate = addDays(day, count);
    if (!isWeekend(candidate)) {
      dates.push(candidate);
    }
    if (count > 20) break; // safety valve
  }

  return dates;
}

/** Returns time slots between 10:00 and 17:00 in 1-hour increments */
export function getTimeSlots(durationHours: number = 1): string[] {
  const slots: string[] = [];
  const [startH] = OPERATING_HOURS.start.split(":").map(Number);
  const [endH] = OPERATING_HOURS.end.split(":").map(Number);

  for (let h = startH; h + durationHours <= endH; h++) {
    const start = `${String(h).padStart(2, "0")}:00`;
    const end = `${String(h + durationHours).padStart(2, "0")}:00`;
    slots.push(`${start} – ${end}`);
  }
  return slots;
}

export function formatDate(date: string | Date): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  return format(d, "EEE, d MMM yyyy");
}

export function formatTime(time: string): string {
  const [h, m] = time.split(":").map(Number);
  const suffix = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, "0")} ${suffix}`;
}

// ─── Access control helpers ────────────────────────────────────────────────────

/** Can a given tier book a given space? */
export function canTierBookSpace(tier: UserTier, space: Space): boolean {
  if (space.approvalType === "admin_only") return false;
  if (!space.isPubliclyListed) return false;
  if (tier === "external" && !space.externalAllowed) return false;
  return space.whoCanBook.includes(tier);
}

// ─── Format helpers ───────────────────────────────────────────────────────────

export function formatCurrency(amount: number): string {
  return `₦${amount.toLocaleString("en-NG")}`;
}

export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function slugToTitle(slug: string): string {
  return slug.split("-").map(capitalize).join(" ");
}
