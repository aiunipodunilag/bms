"use client";

import AdminSidebar from "@/components/layout/AdminSidebar";
import { Card } from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { formatDate, formatTime, formatCurrency } from "@/lib/utils";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import {
  Users,
  CalendarDays,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  Building2,
  ArrowUpRight,
  MoreHorizontal,
} from "lucide-react";

// ─── MOCK DATA — Replace with real API calls ──────────────────────────────────
const stats = [
  {
    label: "Total Users",
    value: "248",
    change: "+12 this week",
    icon: Users,
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  {
    label: "Pending Verifications",
    value: "3",
    change: "Awaiting review",
    icon: AlertCircle,
    color: "text-amber-600",
    bg: "bg-amber-50",
  },
  {
    label: "Bookings Today",
    value: "27",
    change: "65% capacity",
    icon: CalendarDays,
    color: "text-brand-600",
    bg: "bg-brand-50",
  },
  {
    label: "Revenue This Month",
    value: "₦48,000",
    change: "+₦6,000 vs last month",
    icon: TrendingUp,
    color: "text-green-600",
    bg: "bg-green-50",
  },
];

const weeklyBookingsData = [
  { day: "Mon", bookings: 34, noShows: 3 },
  { day: "Tue", bookings: 41, noShows: 5 },
  { day: "Wed", bookings: 38, noShows: 2 },
  { day: "Thu", bookings: 52, noShows: 7 },
  { day: "Fri", bookings: 29, noShows: 4 },
];

const occupancyData = [
  { name: "Co-working", rate: 78 },
  { name: "AI & Robotics Lab", rate: 65 },
  { name: "Maker Space", rate: 42 },
  { name: "Pitch Garage", rate: 38 },
  { name: "Design Studio", rate: 55 },
  { name: "Collaboration", rate: 83 },
];

const pendingApprovals = [
  {
    id: "bk-101",
    user: "Amaka Obi",
    tier: "product_developer",
    space: "Maker Space",
    date: "2025-07-18",
    time: "10:00",
    duration: 3,
    justification:
      "Building a prototype for our team's hardware startup project using the 3D printers and laser cutter for our MVP demo next week.",
    submittedAt: "2 hours ago",
  },
  {
    id: "bk-102",
    user: "Seun Fadeyi",
    tier: "startup_team",
    space: "Board Room (Main)",
    date: "2025-07-17",
    time: "14:00",
    duration: 2,
    justification:
      "Monthly team strategy session with our 5-person startup. Need the screen and private space for investor deck preparation.",
    submittedAt: "4 hours ago",
  },
  {
    id: "bk-103",
    user: "Zara Mohammed",
    tier: "regular_student",
    space: "AI & Robotics Lab",
    date: "2025-07-19",
    time: "13:00",
    duration: 3,
    justification:
      "Final year project — training a CNN model on the GPU workstation for my image classification thesis project.",
    submittedAt: "6 hours ago",
  },
];

const pendingVerifications = [
  {
    id: "u-001",
    name: "Chidi Eze",
    email: "c.eze@student.unilag.edu.ng",
    userType: "Regular Student",
    matricNumber: "220305041",
    submittedAt: "1 day ago",
    documentUrl: "#",
  },
  {
    id: "u-002",
    name: "Dr. Bola Ogunwale",
    email: "b.ogunwale@unilag.edu.ng",
    userType: "Lecturer / Staff",
    staffNumber: "SS/0024",
    submittedAt: "2 days ago",
    documentUrl: "#",
  },
  {
    id: "u-003",
    name: "Temi Adesanya",
    email: "temi.adesanya@student.unilag.edu.ng",
    userType: "Regular Student",
    matricNumber: "190203017",
    submittedAt: "3 days ago",
    documentUrl: "#",
  },
];

export default function AdminDashboard() {
  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar />

      <div className="flex-1 overflow-auto">
        <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Overview</h1>
              <p className="text-sm text-gray-500 mt-0.5">
                {new Date().toLocaleDateString("en-NG", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
            <Button size="sm">
              Export Report <ArrowUpRight size={14} />
            </Button>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
            {stats.map(({ label, value, change, icon: Icon, color, bg }) => (
              <Card key={label}>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-1">{label}</p>
                    <p className="text-2xl font-bold text-gray-900">{value}</p>
                    <p className="text-xs text-gray-400 mt-1">{change}</p>
                  </div>
                  <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center`}>
                    <Icon size={17} className={color} />
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Weekly Bookings */}
            <Card padding="lg">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-semibold text-gray-900">Weekly Bookings</h2>
                <Badge variant="neutral" size="sm">This Week</Badge>
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={weeklyBookingsData} barSize={24}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="day" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "12px",
                      border: "1px solid #e5e7eb",
                      fontSize: 12,
                    }}
                  />
                  <Bar dataKey="bookings" fill="#4f5fff" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="noShows" fill="#fca5a5" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
              <div className="flex gap-4 mt-3 text-xs text-gray-500">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm bg-brand-500" /> Bookings
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm bg-red-300" /> No-shows
                </span>
              </div>
            </Card>

            {/* Space Occupancy */}
            <Card padding="lg">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-semibold text-gray-900">Space Occupancy</h2>
                <Badge variant="neutral" size="sm">Today</Badge>
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={occupancyData} layout="vertical" barSize={14}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                  <XAxis
                    type="number"
                    domain={[0, 100]}
                    tick={{ fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => `${v}%`}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    tick={{ fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    width={100}
                  />
                  <Tooltip
                    formatter={(v) => [`${v}%`, "Occupancy"]}
                    contentStyle={{
                      borderRadius: "12px",
                      border: "1px solid #e5e7eb",
                      fontSize: 12,
                    }}
                  />
                  <Bar dataKey="rate" fill="#4f5fff" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </div>

          {/* Approval Queue + Verifications */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Pending Approvals */}
            <Card>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                  <Clock size={16} className="text-amber-500" />
                  Pending Approvals
                  <Badge variant="warning">{pendingApprovals.length}</Badge>
                </h2>
                <Button variant="ghost" size="sm">View all</Button>
              </div>

              <div className="space-y-3">
                {pendingApprovals.map((item) => (
                  <div
                    key={item.id}
                    className="border border-gray-200 rounded-xl p-4 hover:border-brand-300 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-medium text-sm text-gray-900">{item.user}</p>
                        <p className="text-xs text-gray-400">{item.tier.replace("_", " ")} · {item.submittedAt}</p>
                      </div>
                      <Badge variant="warning" size="sm">Pending</Badge>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-600 mb-2">
                      <span className="flex items-center gap-1">
                        <Building2 size={11} /> {item.space}
                      </span>
                      <span className="flex items-center gap-1">
                        <CalendarDays size={11} /> {formatDate(item.date)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={11} /> {formatTime(item.time)}, {item.duration}h
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 line-clamp-2 mb-3 italic">
                      &ldquo;{item.justification}&rdquo;
                    </p>
                    <div className="flex gap-2">
                      <Button size="sm" className="flex-1">Approve</Button>
                      <Button size="sm" variant="danger" className="flex-1">Reject</Button>
                      <button className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                        <MoreHorizontal size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Pending Verifications */}
            <Card>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                  <Users size={16} className="text-blue-500" />
                  Pending Verifications
                  <Badge variant="info">{pendingVerifications.length}</Badge>
                </h2>
                <Button variant="ghost" size="sm">View all</Button>
              </div>

              <div className="space-y-3">
                {pendingVerifications.map((user) => (
                  <div
                    key={user.id}
                    className="border border-gray-200 rounded-xl p-4 hover:border-brand-300 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-1">
                      <div>
                        <p className="font-medium text-sm text-gray-900">{user.name}</p>
                        <p className="text-xs text-gray-400">{user.email}</p>
                      </div>
                      <Badge variant="neutral" size="sm">{user.userType}</Badge>
                    </div>
                    <div className="text-xs text-gray-500 mb-3">
                      {user.matricNumber
                        ? `Matric: ${user.matricNumber}`
                        : `Staff: ${user.staffNumber}`}{" "}
                      · Submitted {user.submittedAt}
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" className="flex-1">
                        <CheckCircle size={13} /> Verify
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1">
                        View Doc
                      </Button>
                      <Button size="sm" variant="danger" className="flex-1">
                        Reject
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
