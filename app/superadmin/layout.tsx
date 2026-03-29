import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export default async function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/admin/login");

  // Use service-role client to bypass RLS for admin lookup
  const adminDb = createAdminClient();
  const { data: admin } = await adminDb
    .from("admin_accounts")
    .select("role, status")
    .eq("id", user.id)
    .single();

  if (!admin || admin.status !== "active") redirect("/admin/login");
  if (admin.role !== "super_admin") redirect("/admin");

  return <>{children}</>;
}
