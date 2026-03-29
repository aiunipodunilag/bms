import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

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

  const { data: admin } = await supabase
    .from("admin_accounts")
    .select("role, status")
    .eq("id", user.id)
    .single();

  if (!admin || admin.status !== "active") redirect("/admin/login");
  if (admin.role !== "super_admin") redirect("/admin");

  return <>{children}</>;
}
