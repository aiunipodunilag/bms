import type { TierBookingRules, UserTier } from "@/types";

export const TIER_RULES: Record<UserTier, TierBookingRules> = {
  regular_student: {
    tier: "regular_student",
    weeklyIndividualLimit: 3,
    weeklyGroupLeadLimit: 2,
    weeklyGroupMemberLimit: 2,
    maxSlotHours: 3,
    maxDailyHours: "unlimited",
    canAccessPremiumResources: false,
    requiresResourceRequest: false,
    approvalMode: "auto",
  },
  lecturer_staff: {
    tier: "lecturer_staff",
    weeklyIndividualLimit: "unlimited",
    weeklyGroupLeadLimit: "unlimited",
    weeklyGroupMemberLimit: "unlimited",
    maxSlotHours: "flexible",
    maxDailyHours: "unlimited",
    canAccessPremiumResources: true,
    requiresResourceRequest: true,
    approvalMode: "auto",
  },
  product_developer: {
    tier: "product_developer",
    weeklyIndividualLimit: "unlimited",
    weeklyGroupLeadLimit: "unlimited",
    weeklyGroupMemberLimit: "unlimited",
    maxSlotHours: 6,
    maxDailyHours: 6,
    canAccessPremiumResources: true,
    requiresResourceRequest: true,
    approvalMode: "auto",
  },
  volunteer_space_lead: {
    tier: "volunteer_space_lead",
    weeklyIndividualLimit: "unlimited",
    weeklyGroupLeadLimit: "unlimited",
    weeklyGroupMemberLimit: "unlimited",
    maxSlotHours: "flexible",
    maxDailyHours: "unlimited",
    canAccessPremiumResources: true,
    requiresResourceRequest: true,
    approvalMode: "auto",
  },
  startup_team: {
    tier: "startup_team",
    weeklyIndividualLimit: "unlimited",
    weeklyGroupLeadLimit: "unlimited",
    weeklyGroupMemberLimit: "unlimited",
    maxSlotHours: "flexible",
    maxDailyHours: "unlimited",
    canAccessPremiumResources: true,
    requiresResourceRequest: true,
    approvalMode: "auto",
  },
  partner_intern: {
    tier: "partner_intern",
    weeklyIndividualLimit: "unlimited",
    weeklyGroupLeadLimit: "unlimited",
    weeklyGroupMemberLimit: "unlimited",
    maxSlotHours: "flexible",
    maxDailyHours: "unlimited",
    canAccessPremiumResources: true,
    requiresResourceRequest: true,
    approvalMode: "auto",
  },
  external: {
    tier: "external",
    weeklyIndividualLimit: "unlimited",
    weeklyGroupLeadLimit: 0,       // External users cannot lead group bookings
    weeklyGroupMemberLimit: 0,     // External users cannot join group bookings
    maxSlotHours: "flexible",
    maxDailyHours: "unlimited",
    canAccessPremiumResources: false,
    requiresResourceRequest: true, // Via BMS request + admin approval
    approvalMode: "auto",
  },
};

export const TIER_LABELS: Record<UserTier, string> = {
  regular_student: "Regular Student",
  lecturer_staff: "Lecturer / Staff",
  product_developer: "Product Developer",
  volunteer_space_lead: "Volunteer / Space Lead",
  startup_team: "Startup Team",
  partner_intern: "Partner / Intern",
  external: "External User",
};

export const TIER_COLORS: Record<UserTier, string> = {
  regular_student: "bg-slate-100 text-slate-700",
  lecturer_staff: "bg-blue-100 text-blue-700",
  product_developer: "bg-purple-100 text-purple-700",
  volunteer_space_lead: "bg-green-100 text-green-700",
  startup_team: "bg-orange-100 text-orange-700",
  partner_intern: "bg-yellow-100 text-yellow-700",
  external: "bg-gray-100 text-gray-600",
};

// Operating hours
export const OPERATING_HOURS = {
  start: "10:00",
  end: "17:00",
  days: [1, 2, 3, 4, 5], // Monday–Friday (0 = Sunday)
};

// Rules
export const BOOKING_RULES = {
  maxAdvanceDays: 14,
  noShowGracePeriod: 20,          // minutes
  groupSessionMinHours: 2,
  groupSessionMaxHours: 3,
  extraBookingFee: 2000,          // ₦ — 4th individual booking for Regular Student
  externalCoworkingFee: 3000,     // ₦
};
