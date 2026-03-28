"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";
import Button from "@/components/ui/Button";
import { Menu, X, Bell, ChevronDown, LogOut, User, Settings } from "lucide-react";
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
            <div className="w-8 h-8 rounded-xl bg-brand-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">U</span>
            </div>
            <div className="hidden sm:block">
              <span className="font-bold text-gray-900 text-sm">AI-UNIPOD</span>
              <span className="block text-xs text-gray-500 -mt-0.5">UNILAG BMS</span>
            </div>
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
                <button className="relative p-2 rounded-xl text-gray-500 hover:bg-gray-100 transition-colors">
                  <Bell size={18} />
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
                </button>

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
