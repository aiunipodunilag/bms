import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh session — must be called before checking user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // ── User-facing protected routes ──────────────────────────────────────────
  const userProtectedPaths = ["/dashboard", "/bookings", "/resource-request"];
  const isUserProtected =
    userProtectedPaths.some((p) => pathname.startsWith(p)) ||
    /^\/spaces\/[^/]+\/book/.test(pathname);

  if (isUserProtected && !user) {
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // ── Admin / Superadmin protected routes ───────────────────────────────────
  const isAdminPath =
    pathname.startsWith("/admin") && pathname !== "/admin/login";
  const isSuperAdminPath = pathname.startsWith("/superadmin");

  if (isAdminPath || isSuperAdminPath) {
    if (!user) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }

    // Verify admin account and role
    const { data: adminAccount } = await supabase
      .from("admin_accounts")
      .select("role, status")
      .eq("id", user.id)
      .single();

    if (!adminAccount || adminAccount.status !== "active") {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }

    // Superadmin-only route
    if (isSuperAdminPath && adminAccount.role !== "super_admin") {
      return NextResponse.redirect(new URL("/admin", request.url));
    }

    // Receptionist: only /admin/checkin
    if (
      adminAccount.role === "receptionist" &&
      pathname.startsWith("/admin") &&
      !pathname.startsWith("/admin/checkin")
    ) {
      return NextResponse.redirect(new URL("/admin/checkin", request.url));
    }

    // Space lead: only /admin/space-lead
    if (
      adminAccount.role === "space_lead" &&
      pathname.startsWith("/admin") &&
      !pathname.startsWith("/admin/space-lead")
    ) {
      return NextResponse.redirect(new URL("/admin/space-lead", request.url));
    }
  }

  // ── Redirect already-authenticated users away from auth pages ─────────────
  if (user && (pathname.startsWith("/auth/login") || pathname.startsWith("/auth/signup"))) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|public|spaces$|spaces/[^/]+$).*)",
  ],
};
