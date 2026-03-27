"use client";

import { useState } from "react";
import AdminSidebar from "@/components/layout/AdminSidebar";
import { Card } from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import {
  Send,
  Users,
  Bell,
  Mail,
  CheckCircle,
  Clock,
  ChevronDown,
} from "lucide-react";

type Channel = "in_app" | "email" | "both";
type AudienceFilter = "all" | "regular_student" | "product_developer" | "startup_team" | "volunteer_space_lead" | "lecturer_staff" | "partner_intern" | "external";

interface SentMessage {
  id: string;
  subject: string;
  preview: string;
  audience: string;
  channel: Channel;
  sentAt: string;
  recipientCount: number;
}

const SENT_MESSAGES: SentMessage[] = [
  {
    id: "bc-001",
    subject: "UNIPOD is open this Saturday!",
    preview: "Good news — UNIPOD will be open this Saturday from 10AM to 3PM for all members...",
    audience: "All users",
    channel: "both",
    sentAt: "2025-07-15 · 9:02 AM",
    recipientCount: 214,
  },
  {
    id: "bc-002",
    subject: "Reminder: No-show policy update",
    preview: "Please note that our no-show grace period has been updated to 20 minutes...",
    audience: "All users",
    channel: "in_app",
    sentAt: "2025-07-10 · 2:15 PM",
    recipientCount: 214,
  },
  {
    id: "bc-003",
    subject: "Maker Space 3D Printer Maintenance",
    preview: "The large 3D printer in the Maker Space will be unavailable from July 18–20...",
    audience: "Product Developers & Startup Teams",
    channel: "email",
    sentAt: "2025-07-08 · 11:30 AM",
    recipientCount: 47,
  },
];

const AUDIENCE_OPTIONS: { value: AudienceFilter; label: string }[] = [
  { value: "all", label: "All Users" },
  { value: "regular_student", label: "Regular Students" },
  { value: "product_developer", label: "Product Developers" },
  { value: "startup_team", label: "Startup Teams" },
  { value: "volunteer_space_lead", label: "Volunteers / Space Leads" },
  { value: "lecturer_staff", label: "Lecturers / Staff" },
  { value: "partner_intern", label: "Partners / Interns" },
  { value: "external", label: "External Members" },
];

const CHANNEL_CONFIG: Record<Channel, { label: string; icon: typeof Bell }> = {
  in_app: { label: "In-app only", icon: Bell },
  email: { label: "Email only", icon: Mail },
  both: { label: "In-app + Email", icon: Send },
};

export default function AdminBroadcastPage() {
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [audience, setAudience] = useState<AudienceFilter>("all");
  const [channel, setChannel] = useState<Channel>("both");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!subject.trim()) e.subject = "Subject is required.";
    if (body.trim().length < 20) e.body = "Message body must be at least 20 characters.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    // TODO: POST /api/admin/broadcast with { subject, body, audience, channel }
    await new Promise((r) => setTimeout(r, 1400));
    setSent(true);
    setLoading(false);
  };

  const resetForm = () => {
    setSubject("");
    setBody("");
    setAudience("all");
    setChannel("both");
    setErrors({});
    setSent(false);
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar />

      <div className="flex-1 overflow-auto">
        <main className="max-w-5xl mx-auto px-6 py-8 space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Broadcast Message</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Send announcements, reminders, or alerts to users.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Compose form */}
            <div className="lg:col-span-2 space-y-5">
              {sent ? (
                <Card className="text-center py-10">
                  <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle size={28} className="text-green-600" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 mb-2">Message Sent</h2>
                  <p className="text-gray-500 text-sm mb-6">
                    Your broadcast has been queued and will be delivered to the selected audience shortly.
                  </p>
                  <Button onClick={resetForm}>Compose New Message</Button>
                </Card>
              ) : (
                <form onSubmit={handleSend} className="space-y-5">
                  {/* Subject */}
                  <Card>
                    <h2 className="font-semibold text-gray-800 mb-3">Message Details</h2>
                    <div className="space-y-4">
                      <div>
                        <label className="text-xs text-gray-500 font-medium mb-1.5 block">
                          Subject line
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. UNIPOD closed on Friday 18th July"
                          value={subject}
                          onChange={(e) => setSubject(e.target.value)}
                          className="w-full px-3 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                        />
                        {errors.subject && (
                          <p className="text-xs text-red-500 mt-1">{errors.subject}</p>
                        )}
                      </div>

                      <div>
                        <label className="text-xs text-gray-500 font-medium mb-1.5 block">
                          Message body
                        </label>
                        <textarea
                          rows={7}
                          placeholder="Write your broadcast message here. Keep it clear and informative."
                          value={body}
                          onChange={(e) => setBody(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
                        />
                        <p className="text-xs text-gray-400 mt-1 text-right">{body.length} chars</p>
                        {errors.body && (
                          <p className="text-xs text-red-500 mt-1">{errors.body}</p>
                        )}
                      </div>
                    </div>
                  </Card>

                  {/* Audience + channel */}
                  <Card>
                    <h2 className="font-semibold text-gray-800 mb-3">Audience & Delivery</h2>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs text-gray-500 font-medium mb-1.5 block flex items-center gap-1.5">
                          <Users size={12} /> Target audience
                        </label>
                        <div className="relative">
                          <select
                            value={audience}
                            onChange={(e) => setAudience(e.target.value as AudienceFilter)}
                            className="w-full appearance-none px-3 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white pr-8"
                          >
                            {AUDIENCE_OPTIONS.map((o) => (
                              <option key={o.value} value={o.value}>{o.label}</option>
                            ))}
                          </select>
                          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                        </div>
                      </div>

                      <div>
                        <label className="text-xs text-gray-500 font-medium mb-1.5 block">
                          Delivery channel
                        </label>
                        <div className="flex flex-col gap-1.5">
                          {(["in_app", "email", "both"] as Channel[]).map((c) => {
                            const cfg = CHANNEL_CONFIG[c];
                            const Icon = cfg.icon;
                            return (
                              <button
                                key={c}
                                type="button"
                                onClick={() => setChannel(c)}
                                className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm transition-all ${
                                  channel === c
                                    ? "border-brand-500 bg-brand-50 text-brand-700"
                                    : "border-gray-200 text-gray-600 hover:border-brand-200"
                                }`}
                              >
                                <Icon size={13} />
                                {cfg.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </Card>

                  <Button type="submit" className="w-full" size="lg" loading={loading}>
                    <Send size={16} /> Send Broadcast
                  </Button>
                </form>
              )}
            </div>

            {/* Sent history */}
            <div className="space-y-4">
              <h2 className="font-semibold text-gray-700 text-sm uppercase tracking-wide">
                Recent Broadcasts
              </h2>
              {SENT_MESSAGES.map((msg) => {
                const ChannelIcon = CHANNEL_CONFIG[msg.channel].icon;
                return (
                  <Card key={msg.id} className="space-y-2">
                    <p className="text-sm font-semibold text-gray-900 leading-snug">{msg.subject}</p>
                    <p className="text-xs text-gray-400 line-clamp-2">{msg.preview}</p>
                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-center gap-1 text-xs text-gray-400">
                        <Clock size={11} />
                        {msg.sentAt}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Badge variant="neutral" size="sm">
                          <ChannelIcon size={10} />
                        </Badge>
                        <Badge variant="info" size="sm">
                          <Users size={10} /> {msg.recipientCount}
                        </Badge>
                      </div>
                    </div>
                    <p className="text-xs text-gray-400">{msg.audience}</p>
                  </Card>
                );
              })}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
