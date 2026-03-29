"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import Button from "@/components/ui/Button";
import { Menu, X, Bell, ChevronDown, LogOut, User } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface NavbarProps {
  user?: {
    name: string;
    tier: string;
    tierLabel: string;
    avatar?: string;
  } | null;
}

export default function Navbar({ user }: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<Array<{ id: string; title: string; message: string; read: boolean; created_at: string }>>([]);

  useEffect(() => {
    if (!user) return;
    fetch("/api/notifications")
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (!data?.notifications) return;
        setNotifications(data.notifications);
        setUnreadCount(data.notifications.filter((n: { read: boolean }) => !n.read).length);
      })
      .catch(() => {});
  }, [user]);

  const openNotifications = () => {
    setNotifOpen(true);
    setProfileOpen(false);
    if (unreadCount > 0) {
      fetch("/api/notifications", { method: "PATCH" }).catch(() => {});
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    }
  };

  const handleSignOut = async () => {
    setSigningOut(true);
    setProfileOpen(false);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  const navLinks = user
    ? [
        { href: "/dashboard", label: "Dashboard" },
        { href: "/spaces", label: "Spaces" },
        { href: "/bookings", label: "My Bookings" },
        { href: "/resource-request", label: "Resources" },
      ]
    : [
        { href: "/#spaces", label: "Spaces" },
        { href: "/#about", label: "About" },
        { href: "/#news", label: "News" },
      ];

  return (
    <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-gray-200">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href={user ? "/dashboard" : "/"} className="flex items-center gap-2.5">
            <div className="hidden sm:block">
              <span className="font-bold text-gray-900 text-sm">AI-UNIPOD</span>
              <span className="block text-xs text-gray-500 -mt-0.5">UNILAG BMS</span>
            </div>
            <span className="sm:hidden font-bold text-gray-900 text-sm">AI-UNIPOD</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "px-3.5 py-2 rounded-lg text-sm font-medium transition-colors",
                  pathname === link.href
                    ? "bg-brand-50 text-brand-700"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            {user ? (
              <>
                {/* Notifications */}
                <div className="relative">
                  <button
                    onClick={openNotifications}
                    className="relative p-2 rounded-xl text-gray-500 hover:bg-gray-100 transition-colors"
                  >
                    <Bell size={18} />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 min-w-[16px] h-4 bg-red-500 rounded-full flex items-center justify-center text-white text-[9px] font-bold px-0.5">
                        {unreadCount > 9 ? "9+" : unreadCount}
                      </span>
                    )}
                  </button>

                  {notifOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setNotifOpen(false)} />
                      <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-200 z-50 overflow-hidden">
                        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                          <p className="text-sm font-semibold text-gray-900">Notifications</p>
                          <button onClick={() => setNotifOpen(false)} className="text-gray-400 hover:text-gray-600">
                            <X size={14} />
                          </button>
                        </div>
                        <div className="max-h-80 overflow-y-auto">
                          {notifications.length === 0 ? (
                            <p className="text-xs text-gray-400 text-center py-6">No notifications yet.</p>
                          ) : (
                            notifications.map((n) => (
                              <div key={n.id} className={`px-4 py-3 border-b border-gray-50 ${n.read ? "" : "bg-brand-50/40"}`}>
                                <p className="text-sm font-medium text-gray-900">{n.title}</p>
                                <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{n.message}</p>
                                <p className="text-xs text-gray-300 mt-1">
                                  {new Date(n.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                                </p>
                              </div>
                            ))
                          )}
                        </div>
                        <Link href="/dashboard" className="block px-4 py-2.5 text-xs text-center text-brand-600 hover:bg-gray-50 border-t border-gray-100" onClick={() => setNotifOpen(false)}>
                          View dashboard
                        </Link>
                      </div>
                    </>
                  )}
                </div>

                {/* Profile dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setProfileOpen(!profileOpen)}
                    className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl hover:bg-gray-100 transition-colors"
                  >
                    <div className="w-7 h-7 rounded-full bg-brand-100 flex items-center justify-center">
                      <span className="text-brand-700 text-xs font-bold">
                        {user.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="hidden sm:block text-left">
                      <p className="text-xs font-semibold text-gray-900 leading-tight">
                        {user.name.split(" ")[0]}
                      </p>
                      <p className="text-xs text-gray-500 leading-tight">{user.tierLabel}</p>
                    </div>
                    <ChevronDown size={14} className="text-gray-400" />
                  </button>

                  {profileOpen && (
                    <>
                      {/* Backdrop */}
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setProfileOpen(false)}
                      />
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-1 z-50">
                        <Link
                          href="/dashboard/profile"
                          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          onClick={() => setProfileOpen(false)}
                        >
                          <User size={14} /> Profile
                        </Link>
                        <hr className="my-1 border-gray-100" />
                        <button
                          onClick={handleSignOut}
                          disabled={signingOut}
                          className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
                        >
                          <LogOut size={14} /> {signingOut ? "Signing out..." : "Sign out"}
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link href="/auth/login">
                  <Button variant="outline" size="sm">Sign In</Button>
                </Link>
                <Link href="/auth/signup" className="hidden sm:block">
                  <Button size="sm">Sign Up Free</Button>
                </Link>
              </>
            )}

            {/* Mobile hamburger */}
            <button
              className="md:hidden p-2 rounded-xl hover:bg-gray-100 transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden pb-4 pt-2 border-t border-gray-100 mt-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "block px-4 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  pathname === link.href
                    ? "bg-brand-50 text-brand-700"
                    : "text-gray-600 hover:bg-gray-50"
                )}
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            {user ? (
              <button
                onClick={handleSignOut}
                className="w-full text-left mt-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-lg"
              >
                Sign out
              </button>
            ) : (
              <div className="mt-3 flex flex-col gap-2 px-4">
                <Link href="/auth/signup">
                  <Button className="w-full" size="sm">Sign Up Free</Button>
                </Link>
              </div>
            )}
          </div>
        )}
      </nav>
    </header>
  );
}
