import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = headers().get("x-pathname") ?? "";

  // Login page needs no auth check
  if (pathname === "/admin/login") return <>{children}</>;

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

  // Role-based access within /admin/*
  if (admin.role === "receptionist" && !pathname.startsWith("/admin/checkin")) {
    redirect("/admin/checkin");
  }
  if (admin.role === "space_lead" && !pathname.startsWith("/admin/space-lead")) {
    redirect("/admin/space-lead");
  }

  return <>{children}</>;
}
