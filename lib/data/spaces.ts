import type { Space, UserTier } from "@/types";

// Photo filenames are actual images extracted from the UNIPOD Capacity document.
// They live in /public/spaces/ — served as /spaces/imageN.jpeg
// Mapping (from document order):
//   Pitch Garage         → image1.jpeg
//   Maker Space          → image4.jpeg
//   Board Room (Main)    → image9.png
//   Small Board Room     → image11.jpeg
//   Event Space          → image13.jpeg
//   AI & Robotics Lab    → image19.jpeg
//   Design Lab           → image21.jpeg
//   Design Studio        → image22.jpeg
//   ICT Room / Training  → image23.png

const ALL_TIERS: UserTier[] = [
  "regular_student",
  "lecturer_staff",
  "product_developer",
  "volunteer_space_lead",
  "startup_team",
  "partner_intern",
  "external",
];

const ADVANCED_TIERS: UserTier[] = [
  "lecturer_staff",
  "product_developer",
  "volunteer_space_lead",
  "startup_team",
  "partner_intern",
];

export const SPACES: Space[] = [
  // ── Publicly bookable ────────────────────────────────────────────────────────
  {
    id: "coworking",
    name: "Co-working Space",
    slug: "coworking",
    description:
      "Open workspace for individual focused work. Suitable for all members including external co-workers.",
    capacity: 10,
    capacityNote: "10 fixed seats with dedicated charger points",
    bookingType: "individual",
    approvalType: "auto",
    whoCanBook: ALL_TIERS,
    externalAllowed: true,
    equipment: ["Workstations with chargers", "Desks and chairs", "High-speed Wi-Fi"],
    imageUrl: "/spaces/image6.jpeg",
    availability: "available",
    requiresJustification: false,
    maxHoursPerDay: 4,
    isPubliclyListed: true,
    category: "work",
  },
  {
    id: "collaboration",
    name: "Collaboration Space",
    slug: "collaboration",
    description:
      "Small breakout space with a screen for group discussions and short team sessions.",
    capacity: 5,
    bookingType: "both",
    approvalType: "auto",
    whoCanBook: ALL_TIERS,
    externalAllowed: true,
    equipment: ["1 large screen", "Seating for teamwork", "Whiteboard"],
    imageUrl: "/spaces/image7.jpeg",
    availability: "available",
    requiresJustification: false,
    minGroupSize: 2,
    maxHoursPerDay: 3,
    isPubliclyListed: true,
    category: "collaboration",
  },
  {
    id: "boardroom-main",
    name: "Board Room (Main)",
    slug: "boardroom-main",
    description:
      "Formal meeting and decision-making space. Ideal for partner discussions, mentor sessions and investor meetings.",
    capacity: 12,
    capacityNote: "10 seats + 2 sofa spaces",
    bookingType: "group",
    approvalType: "manual",
    whoCanBook: ["lecturer_staff", "product_developer", "startup_team", "partner_intern", "volunteer_space_lead"],
    externalAllowed: false,
    equipment: ["Meeting table", "1 large screen", "Sofa seating", "AC", "Whiteboard"],
    imageUrl: "/spaces/image9.png",
    availability: "available",
    requiresJustification: true,
    minGroupSize: 3,
    maxHoursPerDay: 3,
    isPubliclyListed: true,
    category: "meeting",
  },
  {
    id: "boardroom-small",
    name: "Small Board Room",
    slug: "boardroom-small",
    description:
      "Compact meeting room for quick 1-on-1 sessions, interviews and small discussions.",
    capacity: 4,
    bookingType: "group",
    approvalType: "auto",
    whoCanBook: ["lecturer_staff", "product_developer", "startup_team", "partner_intern", "volunteer_space_lead"],
    externalAllowed: false,
    equipment: ["1 screen", "Meeting table", "AC"],
    imageUrl: "/spaces/image11.jpeg",
    availability: "available",
    requiresJustification: false,
    minGroupSize: 2,
    maxHoursPerDay: 2,
    isPubliclyListed: true,
    category: "meeting",
  },
  {
    id: "ai-robotics-lab",
    name: "AI & Robotics Lab",
    slug: "ai-robotics-lab",
    description:
      "Core technical lab for AI model development, hardware integration, IoT prototyping and robotics. Advanced equipment available.",
    capacity: 4,
    capacityNote: "4 seated for lab-intensive use; 6 workstations total",
    bookingType: "both",
    approvalType: "manual",
    whoCanBook: ADVANCED_TIERS,
    externalAllowed: false,
    equipment: [
      "6 computers",
      "Robotics kits",
      "Soldering station",
      "PCB printer",
      "Electronics tools",
      "GPU workstation",
    ],
    imageUrl: "/spaces/image19.jpeg",
    availability: "available",
    requiresJustification: true,
    maxHoursPerDay: 4,
    isPubliclyListed: true,
    category: "lab",
  },
  {
    id: "maker-space",
    name: "Maker Space",
    slug: "maker-space",
    description:
      "Advanced digital fabrication lab for building physical prototypes. Houses 3D printers, laser cutter, and precision fabrication tools.",
    capacity: 15,
    capacityNote: "11 seated; max ~15 with standing workbenches",
    bookingType: "both",
    approvalType: "manual",
    whoCanBook: ADVANCED_TIERS,
    externalAllowed: false,
    equipment: [
      "4 medium 3D printers",
      "2 large 3D printers",
      "1 resin 3D printer",
      "1 curing station",
      "1 vacuum former",
      "1 laser cutter",
      "1 vinyl cutter",
      "1 3D scanner",
      "2 high-performance desktops",
      "Workbenches",
    ],
    imageUrl: "/spaces/image4.jpeg",
    availability: "available",
    requiresJustification: true,
    maxHoursPerDay: 4,
    isPubliclyListed: true,
    category: "lab",
  },
  {
    id: "vr-lab",
    name: "VR Lab",
    slug: "vr-lab",
    description:
      "Immersive environment to simulate and test concepts in 3D. Equipped with VR headsets and motion trackers.",
    capacity: 8,
    capacityNote: "6–8 active VR users",
    bookingType: "both",
    approvalType: "manual",
    whoCanBook: ADVANCED_TIERS,
    externalAllowed: false,
    equipment: ["3 VR headsets", "2 motion trackers", "1 large screen", "Open interaction space"],
    imageUrl: "/spaces/image17.jpeg",
    availability: "available",
    requiresJustification: true,
    maxHoursPerDay: 3,
    isPubliclyListed: true,
    category: "lab",
  },
  {
    id: "pitch-garage",
    name: "Pitch Garage",
    slug: "pitch-garage",
    description:
      "Dedicated space for pitch practice, demos and investor presentations. Stage area with audience seating for up to 27.",
    capacity: 27,
    capacityNote: "21 audience + 5 judges + 1 presenter",
    bookingType: "group",
    approvalType: "manual",
    whoCanBook: ["product_developer", "startup_team", "partner_intern", "lecturer_staff"],
    externalAllowed: false,
    equipment: ["Stage and pitching area", "Audience and judge seating", "Presentation setup"],
    imageUrl: "/spaces/image1.jpeg",
    availability: "available",
    requiresJustification: true,
    minGroupSize: 4,
    maxHoursPerDay: 3,
    isPubliclyListed: true,
    category: "event",
  },
  {
    id: "design-studio",
    name: "Design Studio",
    slug: "design-studio",
    description:
      "Creative production space for UI/UX design, content creation, 3D design and concept visualisation.",
    capacity: 8,
    capacityNote: "5 seated + ~3 additional on banquette",
    bookingType: "both",
    approvalType: "auto",
    whoCanBook: ADVANCED_TIERS,
    externalAllowed: false,
    equipment: ["2 computers", "Collaborative tables", "Banquette seating"],
    imageUrl: "/spaces/image22.jpeg",
    availability: "available",
    requiresJustification: false,
    maxHoursPerDay: 4,
    isPubliclyListed: true,
    category: "work",
  },
  {
    id: "event-space",
    name: "Event Space / Demo Area",
    slug: "event-space",
    description:
      "Large open space for ecosystem events, hackathons, product demos and showcases. Accommodates up to 50 people.",
    capacity: 50,
    capacityNote: "~50 flexible (standing + seated)",
    bookingType: "group",
    approvalType: "manual",
    whoCanBook: ["product_developer", "startup_team", "partner_intern", "lecturer_staff"],
    externalAllowed: true,
    equipment: ["Stage area", "Screen", "Sound system", "Flexible seating"],
    imageUrl: "/spaces/image13.jpeg",
    availability: "available",
    requiresJustification: true,
    minGroupSize: 5,
    maxHoursPerDay: 6,
    isPubliclyListed: true,
    category: "event",
  },

  // ── Admin-only (not publicly listed) ─────────────────────────────────────────
  {
    id: "design-lab",
    name: "Design Lab",
    slug: "design-lab",
    description:
      "Early-stage ideation space with collaborative setup. Reserved for admin-scheduled sessions.",
    capacity: 8,
    bookingType: "admin_scheduled",
    approvalType: "admin_only",
    whoCanBook: [],
    externalAllowed: false,
    equipment: ["8 computers", "1 screen whiteboard"],
    imageUrl: "/spaces/image21.jpeg",
    availability: "admin_scheduled",
    requiresJustification: false,
    isPubliclyListed: false,
    category: "collaboration",
  },
  {
    id: "ict-room",
    name: "ICT Room",
    slug: "ict-room",
    description:
      "Structured computing room for training and workshops. Admin-scheduled use only.",
    capacity: 12,
    bookingType: "admin_scheduled",
    approvalType: "admin_only",
    whoCanBook: [],
    externalAllowed: false,
    equipment: ["12 desktops", "1 screen"],
    imageUrl: "/spaces/image23.png",
    availability: "admin_scheduled",
    requiresJustification: false,
    isPubliclyListed: false,
    category: "lab",
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

export const getPublicSpaces = (): Space[] =>
  SPACES.filter((s) => s.isPubliclyListed);

export const getSpaceById = (id: string): Space | undefined =>
  SPACES.find((s) => s.id === id);

export const getSpaceBySlug = (slug: string): Space | undefined =>
  SPACES.find((s) => s.slug === slug);

export const getSpacesByCategory = (category: Space["category"]): Space[] =>
  getPublicSpaces().filter((s) => s.category === category);

// Equipment that belongs to each space — used for equipment request + access code UI
export const SPACE_EQUIPMENT_MAP: Record<
  string,
  { type: string; label: string; spaceId: string; spaceName: string }[]
> = {
  "maker-space": [
    { type: "3d_printer_medium", label: "3D Printer (Medium)", spaceId: "maker-space", spaceName: "Maker Space" },
    { type: "3d_printer_large",  label: "3D Printer (Large)",  spaceId: "maker-space", spaceName: "Maker Space" },
    { type: "3d_printer_resin",  label: "3D Printer (Resin)",  spaceId: "maker-space", spaceName: "Maker Space" },
    { type: "laser_cutter",      label: "Laser Cutter",        spaceId: "maker-space", spaceName: "Maker Space" },
    { type: "vinyl_cutter",      label: "Vinyl Cutter",        spaceId: "maker-space", spaceName: "Maker Space" },
    { type: "vacuum_former",     label: "Vacuum Former",       spaceId: "maker-space", spaceName: "Maker Space" },
    { type: "3d_scanner",        label: "3D Scanner",          spaceId: "maker-space", spaceName: "Maker Space" },
  ],
  "ai-robotics-lab": [
    { type: "gpu_workstation",   label: "GPU Workstation",     spaceId: "ai-robotics-lab", spaceName: "AI & Robotics Lab" },
    { type: "robotics_kit",      label: "Robotics Kit",        spaceId: "ai-robotics-lab", spaceName: "AI & Robotics Lab" },
    { type: "pcb_printer",       label: "PCB Printer",         spaceId: "ai-robotics-lab", spaceName: "AI & Robotics Lab" },
    { type: "soldering_station", label: "Soldering Station",   spaceId: "ai-robotics-lab", spaceName: "AI & Robotics Lab" },
  ],
  "vr-lab": [
    { type: "vr_headset",        label: "VR Headset",          spaceId: "vr-lab", spaceName: "VR Lab" },
    { type: "motion_tracker",    label: "Motion Tracker",      spaceId: "vr-lab", spaceName: "VR Lab" },
  ],
};
