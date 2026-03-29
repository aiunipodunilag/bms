"use client";

import { useState, useEffect } from "react";
import AdminSidebar from "@/components/layout/AdminSidebar";
import { Card } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import {
  Clock,
  CalendarDays,
  Save,
  CheckCircle,
  AlertCircle,
  DollarSign,
  ShieldCheck,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";

interface DaySchedule {
  enabled: boolean;
  open: string;
  close: string;
}

type WeekSchedule = Record<string, DaySchedule>;

interface BookingSettings {
  maxAdvanceDays: number;
  noShowGracePeriodMinutes: number;
  extraIndividualFeeNGN: number;
  externalCoworkingFeeNGN: number;
  groupMinMembers: number;
  groupMaxHours: number;
  maintenanceMode: boolean;
  requireJustificationForPremium: boolean;
}

const DEFAULT_SCHEDULE: WeekSchedule = {
  Monday:    { enabled: true,  open: "10:00", close: "17:00" },
  Tuesday:   { enabled: true,  open: "10:00", close: "17:00" },
  Wednesday: { enabled: true,  open: "10:00", close: "17:00" },
  Thursday:  { enabled: true,  open: "10:00", close: "17:00" },
  Friday:    { enabled: true,  open: "10:00", close: "17:00" },
  Saturday:  { enabled: false, open: "10:00", close: "15:00" },
  Sunday:    { enabled: false, open: "10:00", close: "15:00" },
};

const DEFAULT_BOOKING_SETTINGS: BookingSettings = {
  maxAdvanceDays: 4,
  noShowGracePeriodMinutes: 20,
  extraIndividualFeeNGN: 2000,
  externalCoworkingFeeNGN: 3000,
  groupMinMembers: 4,
  groupMaxHours: 3,
  maintenanceMode: false,
  requireJustificationForPremium: true,
};

export default function AdminSettingsPage() {
  const [schedule, setSchedule] = useState<WeekSchedule>(DEFAULT_SCHEDULE);
  const [settings, setSettings] = useState<BookingSettings>(DEFAULT_BOOKING_SETTINGS);
  const [savingSchedule, setSavingSchedule] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);
  const [scheduleSaved, setScheduleSaved] = useState(false);
  const [settingsSaved, setSettingsSaved] = useState(false);
  const [scheduleError, setScheduleError] = useState("");
  const [settingsError, setSettingsError] = useState("");

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then(({ schedule: s, bookingRules: b }) => {
        if (s) setSchedule(s);
        if (b) setSettings(b);
      })
      .catch(() => {});
  }, []);

  const updateDay = (day: string, field: keyof DaySchedule, value: string | boolean) => {
    setSchedule((prev) => ({ ...prev, [day]: { ...prev[day], [field]: value } }));
    setScheduleSaved(false);
  };

  const handleSaveSchedule = async () => {
    setSavingSchedule(true);
    setScheduleError("");
    const res = await fetch("/api/admin/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ schedule }),
    });
    setSavingSchedule(false);
    if (res.ok) {
      setScheduleSaved(true);
    } else {
      const data = await res.json();
      setScheduleError(data.error ?? "Failed to save schedule.");
    }
  };

  const handleSaveSettings = async () => {
    setSavingSettings(true);
    setSettingsError("");
    const res = await fetch("/api/admin/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bookingRules: settings }),
    });
    setSavingSettings(false);
    if (res.ok) {
      setSettingsSaved(true);
    } else {
      const data = await res.json();
      setSettingsError(data.error ?? "Failed to save settings.");
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar />

      <div className="flex-1 overflow-auto">
        <main className="max-w-4xl mx-auto px-6 py-8 space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">System Settings</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Configure operating hours, booking rules, and system behaviour.
            </p>
          </div>

          {settings.maintenanceMode && (
            <div className="flex items-start gap-3 bg-red-50 border border-red-100 rounded-2xl px-4 py-3">
              <AlertCircle size={16} className="text-red-500 shrink-0 mt-0.5" />
              <p className="text-sm text-red-700 font-medium">
                Maintenance mode is ON. New bookings are currently blocked for all users.
              </p>
            </div>
          )}

          {/* Operating hours */}
          <Card>
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                <Clock size={16} className="text-brand-500" /> Operating Hours
              </h2>
              {scheduleSaved && (
                <span className="flex items-center gap-1 text-xs text-green-600 font-medium">
                  <CheckCircle size={13} /> Saved
                </span>
              )}
            </div>

            <div className="space-y-3">
              {Object.entries(schedule).map(([day, config]) => (
                <div key={day} className="flex items-center gap-4">
                  <div className="w-28 flex items-center gap-2">
                    <button
                      onClick={() => updateDay(day, "enabled", !config.enabled)}
                      className={`transition-colors ${config.enabled ? "text-brand-600" : "text-gray-300"}`}
                    >
                      {config.enabled ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                    </button>
                    <span className={`text-sm font-medium ${config.enabled ? "text-gray-800" : "text-gray-400"}`}>
                      {day}
                    </span>
                  </div>

                  {config.enabled ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="time"
                        value={config.open}
                        onChange={(e) => updateDay(day, "open", e.target.value)}
                        className="px-3 py-1.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                      />
                      <span className="text-gray-400 text-sm">to</span>
                      <input
                        type="time"
                        value={config.close}
                        onChange={(e) => updateDay(day, "close", e.target.value)}
                        className="px-3 py-1.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                      />
                    </div>
                  ) : (
                    <span className="text-sm text-gray-400 italic">Closed</span>
                  )}
                </div>
              ))}
            </div>

            {scheduleError && (
              <p className="text-xs text-red-500 mt-3">{scheduleError}</p>
            )}
            <div className="mt-5 pt-4 border-t border-gray-100">
              <Button size="sm" loading={savingSchedule} onClick={handleSaveSchedule}>
                <Save size={13} /> Save Operating Hours
              </Button>
            </div>
          </Card>

          {/* Booking rules */}
          <Card>
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                <CalendarDays size={16} className="text-brand-500" /> Booking Rules
              </h2>
              {settingsSaved && (
                <span className="flex items-center gap-1 text-xs text-green-600 font-medium">
                  <CheckCircle size={13} /> Saved
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="text-xs text-gray-500 font-medium mb-1.5 block">
                  Max advance booking (days)
                </label>
                <input
                  type="number"
                  min={1}
                  max={30}
                  value={settings.maxAdvanceDays}
                  onChange={(e) => setSettings({ ...settings, maxAdvanceDays: parseInt(e.target.value) || 1 })}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
                <p className="text-xs text-gray-400 mt-1">Users can book up to this many days ahead.</p>
              </div>

              <div>
                <label className="text-xs text-gray-500 font-medium mb-1.5 block">
                  No-show grace period (minutes)
                </label>
                <input
                  type="number"
                  min={5}
                  max={60}
                  value={settings.noShowGracePeriodMinutes}
                  onChange={(e) => setSettings({ ...settings, noShowGracePeriodMinutes: parseInt(e.target.value) || 5 })}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
                <p className="text-xs text-gray-400 mt-1">Time after booking start before marking as no-show.</p>
              </div>

              <div>
                <label className="text-xs text-gray-500 font-medium mb-1.5 block">
                  Group booking minimum members
                </label>
                <input
                  type="number"
                  min={2}
                  max={10}
                  value={settings.groupMinMembers}
                  onChange={(e) => setSettings({ ...settings, groupMinMembers: parseInt(e.target.value) || 2 })}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="text-xs text-gray-500 font-medium mb-1.5 block">
                  Group booking max duration (hours)
                </label>
                <input
                  type="number"
                  min={1}
                  max={8}
                  value={settings.groupMaxHours}
                  onChange={(e) => setSettings({ ...settings, groupMaxHours: parseInt(e.target.value) || 1 })}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>

            <div className="mt-5 pt-5 border-t border-gray-100">
              <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-4">
                <DollarSign size={14} className="text-brand-500" /> Fee Configuration
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="text-xs text-gray-500 font-medium mb-1.5 block">
                    Regular Student extra fee (₦)
                  </label>
                  <input
                    type="number"
                    min={0}
                    step={500}
                    value={settings.extraIndividualFeeNGN}
                    onChange={(e) => setSettings({ ...settings, extraIndividualFeeNGN: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                  <p className="text-xs text-gray-400 mt-1">Applied per individual booking for Regular Students.</p>
                </div>
                <div>
                  <label className="text-xs text-gray-500 font-medium mb-1.5 block">
                    External co-working fee (₦)
                  </label>
                  <input
                    type="number"
                    min={0}
                    step={500}
                    value={settings.externalCoworkingFeeNGN}
                    onChange={(e) => setSettings({ ...settings, externalCoworkingFeeNGN: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                  <p className="text-xs text-gray-400 mt-1">Daily fee for external co-working space access.</p>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-5 border-t border-gray-100 space-y-3">
              <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-4">
                <ShieldCheck size={14} className="text-brand-500" /> System Flags
              </h3>

              <div className="flex items-center justify-between p-3 rounded-xl border border-gray-200 bg-gray-50">
                <div>
                  <p className="text-sm font-medium text-gray-800">Maintenance Mode</p>
                  <p className="text-xs text-gray-400 mt-0.5">Block all new bookings site-wide.</p>
                </div>
                <button
                  onClick={() => setSettings({ ...settings, maintenanceMode: !settings.maintenanceMode })}
                  className={`transition-colors ${settings.maintenanceMode ? "text-red-500" : "text-gray-300"}`}
                >
                  {settings.maintenanceMode ? <ToggleRight size={24} /> : <ToggleLeft size={24} />}
                </button>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl border border-gray-200 bg-gray-50">
                <div>
                  <p className="text-sm font-medium text-gray-800">Require Justification for Premium Spaces</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Users must explain why they need AI Lab, Maker Space, VR Lab, etc.
                  </p>
                </div>
                <button
                  onClick={() => setSettings({ ...settings, requireJustificationForPremium: !settings.requireJustificationForPremium })}
                  className={`transition-colors ${settings.requireJustificationForPremium ? "text-brand-600" : "text-gray-300"}`}
                >
                  {settings.requireJustificationForPremium ? <ToggleRight size={24} /> : <ToggleLeft size={24} />}
                </button>
              </div>
            </div>

            {settingsError && (
              <p className="text-xs text-red-500 mt-3">{settingsError}</p>
            )}
            <div className="mt-5 pt-4 border-t border-gray-100">
              <Button size="sm" loading={savingSettings} onClick={handleSaveSettings}>
                <Save size={13} /> Save Booking Settings
              </Button>
            </div>
          </Card>
        </main>
      </div>
    </div>
  );
}
