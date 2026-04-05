import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Server-side auth guard for all /dashboard routes.
 * Middleware only refreshes session tokens — it does NOT enforce authentication.
 * This layout is the real protection for the user dashboard.
 */
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  // Verify the profile exists and is not suspended/deleted
  const adminDb = createAdminClient();
  const { data: profile } = await adminDb
    .from("profiles")
    .select("status")
    .eq("id", user.id)
    .single();

  if (!profile || !["active", "verified"].includes(profile.status)) {
    redirect("/auth/login");
  }

  return <>{children}</>;
}
