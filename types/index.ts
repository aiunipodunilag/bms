// ─── User Types ──────────────────────────────────────────────────────────────

export type UserClass = "internal" | "external";

export type UserTier =
  | "regular_student"
  | "lecturer_staff"
  | "product_developer"
  | "volunteer_space_lead"
  | "startup_team"
  | "partner_intern"
  | "external";

export type UserStatus = "pending" | "verified" | "rejected" | "active";

export type AdminRole = "super_admin" | "student_lead" | "receptionist";

export interface User {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  class: UserClass;
  tier: UserTier;
  status: UserStatus;
  matricNumber?: string;         // internal students
  staffNumber?: string;          // lecturers/staff
  organisation?: string;         // external users
  purposeOfVisit?: string;       // external users
  adminRole?: AdminRole;
  noShowCount: number;
  weeklyBookingsUsed: number;    // resets Monday midnight
  weeklyGroupBookingsLed: number;
  weeklyGroupBookingsJoined: number;
  createdAt: string;
}

// ─── Space Types ──────────────────────────────────────────────────────────────

export type BookingType = "individual" | "group" | "admin_scheduled" | "both";
export type ApprovalType = "auto" | "manual" | "admin_only";
export type SpaceAvailability = "available" | "full" | "admin_scheduled" | "closed";

export interface Space {
  id: string;
  name: string;
  slug: string;
  description: string;
  capacity: number;
  capacityNote?: string;         // e.g. "max ~15 with standing"
  bookingType: BookingType;
  approvalType: ApprovalType;
  whoCanBook: UserTier[];        // tiers allowed to book
  externalAllowed: boolean;
  equipment: string[];
  imageUrl?: string;
  availability: SpaceAvailability;
  seatsAvailable?: number;
  requiresJustification: boolean; // "why do you need this space?" field
  minGroupSize?: number;
  maxHoursPerDay?: number;
  isPubliclyListed: boolean;     // false = Design Lab & ICT Room (admin-only)
  category: "lab" | "collaboration" | "event" | "work" | "meeting";
}

// ─── Booking Types ────────────────────────────────────────────────────────────

export type BookingStatus =
  | "pending"
  | "confirmed"
  | "checked_in"
  | "completed"
  | "cancelled"
  | "no_show"
  | "rejected";

export interface Booking {
  id: string;
  bmsCode: string;               // e.g. BMS-2025-A7X3K
  userId: string;
  user?: User;
  spaceId: string;
  space?: Space;
  type: "individual" | "group";
  status: BookingStatus;
  date: string;                  // ISO date
  startTime: string;             // e.g. "10:00"
  endTime: string;               // e.g. "12:00"
  duration: number;              // hours
  justification?: string;
  groupMembers?: GroupMember[];
  paymentRequired?: boolean;
  paymentAmount?: number;
  paymentStatus?: "pending" | "paid";
  adminNote?: string;
  checkedInAt?: string;
  createdAt: string;
}

export interface GroupMember {
  userId: string;
  name: string;
  matricNumber?: string;
  email: string;
  status: "valid" | "flagged" | "limit_reached";
}

// ─── Resource Request Types ───────────────────────────────────────────────────

export type ResourceType =
  | "gpu_workstation"
  | "robotics_kit"
  | "pcb_printer"
  | "soldering_station"
  | "3d_printer_medium"
  | "3d_printer_large"
  | "3d_printer_resin"
  | "laser_cutter"
  | "vinyl_cutter"
  | "vacuum_former"
  | "3d_scanner"
  | "vr_headset"
  | "motion_tracker";

export interface ResourceRequest {
  id: string;
  userId: string;
  user?: User;
  resourceType: ResourceType;
  preferredDate: string;
  preferredTimeWindow: string;
  estimatedDuration: string;
  justification: string;
  status: "pending" | "approved" | "rejected";
  adminNote?: string;
  allocatedSlot?: string;
  bmsCode?: string;
  createdAt: string;
}

// ─── Booking Rule Types ───────────────────────────────────────────────────────

export interface TierBookingRules {
  tier: UserTier;
  weeklyIndividualLimit: number | "unlimited";
  weeklyGroupLeadLimit: number | "unlimited";
  weeklyGroupMemberLimit: number | "unlimited";
  maxSlotHours: number | "flexible";
  maxDailyHours: number | "unlimited";
  canAccessPremiumResources: boolean;
  requiresResourceRequest: boolean;
  approvalMode: "auto" | "manual";
}

// ─── Notification / Email Types ──────────────────────────────────────────────

export type NotificationType =
  | "booking_confirmed"
  | "booking_rejected"
  | "booking_cancelled"
  | "no_show_warning"
  | "account_verified"
  | "account_rejected"
  | "resource_approved"
  | "group_membership"
  | "admin_broadcast";

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

// ─── Admin Types ──────────────────────────────────────────────────────────────

export interface AdminStats {
  totalUsers: number;
  pendingVerifications: number;
  activeBookingsToday: number;
  totalBookingsThisWeek: number;
  noShowsThisWeek: number;
  pendingApprovals: number;
  revenueThisMonth: number;
  occupancyRate: number;
}

// ─── Slot / Calendar Types ───────────────────────────────────────────────────

export interface TimeSlot {
  date: string;
  startTime: string;
  endTime: string;
  available: boolean;
  seatsLeft?: number;
}

// ─── Form Types ──────────────────────────────────────────────────────────────

export interface SignupFormInternal {
  fullName: string;
  email: string;
  phone: string;
  userType: Exclude<UserTier, "external">;
  matricNumber?: string;
  staffNumber?: string;
  documentFile: File;
  password: string;
  confirmPassword: string;
}

export interface SignupFormExternal {
  fullName: string;
  email: string;
  phone: string;
  organisation: string;
  purposeOfVisit: string;
  password: string;
  confirmPassword: string;
  otp: string;
}
