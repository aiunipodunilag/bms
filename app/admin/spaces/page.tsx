"use client";

import { useState, useEffect, useCallback } from "react";
import AdminSidebar from "@/components/layout/AdminSidebar";
import { Card } from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Toggle from "@/components/ui/Toggle";
import {
  Building2,
  Users,
  Edit2,
  Image as ImageIcon,
  Save,
  X,
  Cpu,
  ChevronDown,
  ChevronUp,
  Info,
} from "lucide-react";

type SpaceStatus = "active" | "inactive" | "maintenance";

interface AdminSpace {
  id: string;
  name: string;
  slug: string;
  capacity: number;
  type: "individual" | "group" | "both";
  status: SpaceStatus;
  equipment: string[];
  whoCanBook: string[];
  description: string;
  requiresApproval: boolean;
}

const BASE_SPACES: AdminSpace[] = [
  {
    id: "coworking",
    name: "Co-working Space",
    slug: "coworking",
    capacity: 40,
    type: "individual",
    status: "active",
    equipment: ["High-speed Wi-Fi", "Power outlets", "Standing desks", "Lockers"],
    whoCanBook: ["All tiers"],
    description: "Open co-working area for focused individual work.",
    requiresApproval: false,
  },
  {
    id: "collaboration",
    name: "Collaboration Space",
    slug: "collaboration",
    capacity: 20,
    type: "both",
    status: "active",
    equipment: ["Whiteboards", "TV screens", "Modular furniture"],
    whoCanBook: ["All tiers"],
    description: "Flexible space for team work and brainstorming.",
    requiresApproval: false,
  },
  {
    id: "boardroom-main",
    name: "Board Room (Main)",
    slug: "boardroom-main",
    capacity: 20,
    type: "group",
    status: "active",
    equipment: ["Projector", "Video conferencing", "Whiteboard", "AC"],
    whoCanBook: ["Product Developer", "Startup Team", "Partner/Intern", "Lecturer/Staff"],
    description: "Formal meeting room for presentations and investor meetings.",
    requiresApproval: true,
  },
  {
    id: "boardroom-mini",
    name: "Board Room (Mini)",
    slug: "boardroom-mini",
    capacity: 8,
    type: "group",
    status: "active",
    equipment: ["TV screen", "Whiteboard", "AC"],
    whoCanBook: ["Product Developer", "Startup Team", "Partner/Intern", "Lecturer/Staff"],
    description: "Smaller meeting room for focused team discussions.",
    requiresApproval: false,
  },
  {
    id: "ai-robotics-lab",
    name: "AI & Robotics Lab",
    slug: "ai-robotics-lab",
    capacity: 15,
    type: "both",
    status: "active",
    equipment: ["GPU Workstations", "Robotics Kits", "PCB Printer", "Soldering Stations"],
    whoCanBook: ["Product Developer", "Startup Team", "Lecturer/Staff", "Volunteer"],
    description: "Premium lab for AI/ML and robotics projects.",
    requiresApproval: true,
  },
  {
    id: "maker-space",
    name: "Maker Space",
    slug: "maker-space",
    capacity: 15,
    type: "both",
    status: "active",
    equipment: ["3D Printers (x3)", "Laser Cutter", "Vinyl Cutter", "3D Scanner", "Vacuum Former"],
    whoCanBook: ["Product Developer", "Startup Team", "Lecturer/Staff", "Volunteer"],
    description: "Hardware prototyping and fabrication lab.",
    requiresApproval: true,
  },
  {
    id: "vr-lab",
    name: "VR Lab",
    slug: "vr-lab",
    capacity: 10,
    type: "both",
    status: "active",
    equipment: ["VR Headsets (x4)", "Motion Trackers", "High-spec PCs"],
    whoCanBook: ["Product Developer", "Startup Team", "Lecturer/Staff", "Volunteer"],
    description: "Immersive VR/AR development and testing environment.",
    requiresApproval: true,
  },
  {
    id: "pitch-garage",
    name: "Pitch Garage",
    slug: "pitch-garage",
    capacity: 30,
    type: "group",
    status: "active",
    equipment: ["Stage setup", "Projector", "PA system", "Audience seating"],
    whoCanBook: ["Product Developer", "Startup Team", "Partner/Intern", "Lecturer/Staff"],
    description: "Presentation and pitch practice space for startup teams.",
    requiresApproval: true,
  },
  {
    id: "podcast-studio",
    name: "Podcast Studio",
    slug: "podcast-studio",
    capacity: 4,
    type: "individual",
    status: "active",
    equipment: ["Recording booth", "Microphones", "Audio interface", "Soundproofing"],
    whoCanBook: ["Product Developer", "Startup Team", "Volunteer", "Lecturer/Staff"],
    description: "Professional-grade audio recording studio.",
    requiresApproval: true,
  },
  {
    id: "design-studio",
    name: "Design Studio",
    slug: "design-studio",
    capacity: 12,
    type: "both",
    status: "active",
    equipment: ["iMacs with Adobe Creative Suite", "Drawing tablets", "Colour printer"],
    whoCanBook: ["Product Developer", "Startup Team", "Volunteer", "Lecturer/Staff"],
    description: "Creative workspace for UI/UX and graphic design.",
    requiresApproval: false,
  },
  {
    id: "design-lab",
    name: "Design Lab",
    slug: "design-lab",
    capacity: 20,
    type: "both",
    status: "inactive",
    equipment: ["Workstations", "Large displays"],
    whoCanBook: ["Admin only"],
    description: "Internal design lab — admin use only.",
    requiresApproval: true,
  },
  {
    id: "ict-room",
    name: "ICT Room",
    slug: "ict-room",
    capacity: 25,
    type: "both",
    status: "inactive",
    equipment: ["Networked PCs", "Server rack"],
    whoCanBook: ["Admin only"],
    description: "ICT infrastructure room — admin use only.",
    requiresApproval: true,
  },
];

const STATUS_CONFIG: Record<SpaceStatus, { label: string; variant: "success" | "danger" | "warning" }> = {
  active:      { label: "Active",      variant: "success" },
  inactive:    { label: "Inactive",    variant: "danger" },
  maintenance: { label: "Maintenance", variant: "warning" },
};

export default function AdminSpacesPage() {
  const [spaces, setSpaces] = useState<AdminSpace[]>(BASE_SPACES);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{ description: string; capacity: number } | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);

  // Load persisted overrides from DB and merge with base data
  useEffect(() => {
    fetch("/api/admin/spaces")
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (!data?.overrides) return;
        const overrideMap: Record<string, Partial<AdminSpace>> = {};
        for (const o of data.overrides) {
          overrideMap[o.space_id] = {
            ...(o.status && { status: o.status }),
            ...(o.description && { description: o.description }),
            ...(o.capacity && { capacity: o.capacity }),
          };
        }
        setSpaces((prev) =>
          prev.map((s) => overrideMap[s.id] ? { ...s, ...overrideMap[s.id] } : s)
        );
      })
      .catch(() => {});
  }, []);

  const toggleStatus = useCallback(async (id: string) => {
    setSpaces((prev) =>
      prev.map((s) => s.id === id ? { ...s, status: s.status === "active" ? "inactive" : "active" } : s)
    );
    const space = spaces.find((s) => s.id === id);
    if (!space) return;
    const newStatus = space.status === "active" ? "inactive" : "active";
    await fetch(`/api/admin/spaces/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
  }, [spaces]);

  const startEdit = (space: AdminSpace) => {
    setEditingId(space.id);
    setEditForm({ description: space.description, capacity: space.capacity });
    setExpandedId(space.id);
  };

  const saveEdit = async (id: string) => {
    if (!editForm) return;
    setSavingId(id);
    setSpaces((prev) =>
      prev.map((s) => s.id === id ? { ...s, description: editForm.description, capacity: editForm.capacity } : s)
    );
    await fetch(`/api/admin/spaces/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ description: editForm.description, capacity: editForm.capacity }),
    });
    setSavingId(null);
    setEditingId(null);
    setEditForm(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm(null);
  };

  const activeCount = spaces.filter((s) => s.status === "active").length;
  const inactiveCount = spaces.filter((s) => s.status !== "active").length;

  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar />

      <div className="flex-1 overflow-auto">
        <main className="max-w-6xl mx-auto px-6 py-8 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Space Management</h1>
              <p className="text-sm text-gray-500 mt-0.5">
                {activeCount} active · {inactiveCount} inactive · {spaces.length} total spaces
              </p>
            </div>
          </div>

          <Card className="bg-blue-50 border-blue-100 py-3">
            <div className="flex items-start gap-3">
              <Info size={15} className="text-blue-500 shrink-0 mt-0.5" />
              <p className="text-sm text-blue-700">
                Toggling a space inactive immediately removes it from the booking flow. Users with existing confirmed bookings are not affected.
              </p>
            </div>
          </Card>

          <Card padding="none">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left text-xs font-semibold text-gray-500 px-5 py-3.5">Space</th>
                  <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3.5">Capacity</th>
                  <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3.5">Type</th>
                  <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3.5">Approval</th>
                  <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {spaces.map((space) => {
                  const sc = STATUS_CONFIG[space.status];
                  const isExpanded = expandedId === space.id;
                  const isEditing = editingId === space.id;

                  return (
                    <>
                      <tr
                        key={space.id}
                        className={`hover:bg-gray-50 transition-colors ${isExpanded ? "bg-gray-50" : ""}`}
                      >
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2">
                            <Building2 size={14} className="text-gray-400 shrink-0" />
                            <div>
                              <p className="text-sm font-medium text-gray-900">{space.name}</p>
                              <p className="text-xs text-gray-400">{space.slug}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-1 text-sm text-gray-700">
                            <Users size={13} className="text-gray-400" />
                            {space.capacity}
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          <Badge variant="neutral" size="sm" className="capitalize">{space.type}</Badge>
                        </td>
                        <td className="px-4 py-3.5">
                          {space.requiresApproval
                            ? <Badge variant="warning" size="sm">Required</Badge>
                            : <Badge variant="success" size="sm">Auto</Badge>
                          }
                        </td>
                        <td className="px-4 py-3.5">
                          <Badge variant={sc.variant} size="sm">{sc.label}</Badge>
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-1.5">
                            <Toggle
                              checked={space.status === "active"}
                              onChange={() => toggleStatus(space.id)}
                              size="sm"
                            />
                            <button
                              onClick={() => startEdit(space)}
                              className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                              title="Edit space"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              onClick={() => setExpandedId(isExpanded ? null : space.id)}
                              className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                              {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                            </button>
                          </div>
                        </td>
                      </tr>

                      {isExpanded && (
                        <tr key={`${space.id}-expanded`} className="bg-gray-50">
                          <td colSpan={6} className="px-5 py-4 space-y-4">
                            <div>
                              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Description</p>
                              {isEditing && editForm ? (
                                <textarea
                                  rows={2}
                                  value={editForm.description}
                                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                                  className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
                                />
                              ) : (
                                <p className="text-sm text-gray-700">{space.description}</p>
                              )}
                            </div>

                            {isEditing && editForm && (
                              <div>
                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Capacity</p>
                                <input
                                  type="number"
                                  value={editForm.capacity}
                                  onChange={(e) => setEditForm({ ...editForm, capacity: parseInt(e.target.value) || 0 })}
                                  className="w-28 px-3 py-2 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                                />
                              </div>
                            )}

                            <div>
                              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 flex items-center gap-1.5">
                                <Cpu size={11} /> Equipment
                              </p>
                              <div className="flex flex-wrap gap-1.5">
                                {space.equipment.map((eq) => (
                                  <span key={eq} className="text-xs bg-white border border-gray-200 text-gray-600 px-2.5 py-1 rounded-full">
                                    {eq}
                                  </span>
                                ))}
                              </div>
                            </div>

                            <div>
                              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Who Can Book</p>
                              <div className="flex flex-wrap gap-1.5">
                                {space.whoCanBook.map((tier) => (
                                  <Badge key={tier} variant="info" size="sm">{tier}</Badge>
                                ))}
                              </div>
                            </div>

                            <div>
                              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 flex items-center gap-1.5">
                                <ImageIcon size={11} /> Space Photo
                              </p>
                              <div className="border-2 border-dashed border-gray-200 rounded-xl p-5 flex flex-col items-center gap-2 bg-white">
                                <ImageIcon size={22} className="text-gray-300" />
                                <p className="text-xs text-gray-400 text-center">
                                  Image upload available when Supabase Storage is connected.
                                </p>
                                <Button size="sm" variant="outline" disabled>Upload Photo</Button>
                              </div>
                            </div>

                            {isEditing ? (
                              <div className="flex gap-2">
                                <Button size="sm" loading={savingId === space.id} onClick={() => saveEdit(space.id)}>
                                  <Save size={13} /> Save Changes
                                </Button>
                                <Button size="sm" variant="outline" onClick={cancelEdit}>
                                  <X size={13} /> Cancel
                                </Button>
                              </div>
                            ) : null}
                          </td>
                        </tr>
                      )}
                    </>
                  );
                })}
              </tbody>
            </table>
          </Card>
        </main>
      </div>
    </div>
  );
}
