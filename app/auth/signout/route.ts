import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

/**
 * GET /auth/signout
 *
 * Two-layer sign-out strategy:
 *
 * Layer 1 (client-side, in Navbar/AdminSidebar):
 *   supabase.auth.signOut({ scope: 'global' }) clears localStorage and
 *   revokes the refresh token server-side before navigation starts.
 *
 * Layer 2 (this route):
 *   a) We build a Supabase client wired directly to the redirect response
 *      so signOut()'s setAll() writes cookie deletions onto the response
 *      the browser actually receives (not onto Next.js's internal response).
 *   b) We also brute-force delete every sb-* / supabase-* cookie by name so
 *      no stale token survives regardless of what Supabase's signOut sets.
 *
 * Middleware is excluded from running getUser() on this path (see middleware.ts)
 * so it cannot race ahead and write fresh session cookies before we clear them.
 */
export async function GET(request: NextRequest) {
  const home = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const response = NextResponse.redirect(new URL("/", home));

  // Brute-force: delete every Supabase auth cookie by name
  const cookieDeleteOptions = {
    maxAge: 0,
    path: "/",
    httpOnly: true,
    sameSite: "lax" as const,
  };

  request.cookies.getAll().forEach(({ name }) => {
    if (
      name.startsWith("sb-") ||
      name.startsWith("supabase-") ||
      name.includes("auth-token") ||
      name.includes("supabase")
    ) {
      response.cookies.set(name, "", cookieDeleteOptions);
    }
  });

  // Also call signOut via Supabase SSR client to handle any remaining tokens
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  await supabase.auth.signOut({ scope: "global" });

  return response;
}
