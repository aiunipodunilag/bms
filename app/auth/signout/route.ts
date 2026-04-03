import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

/**
 * GET /auth/signout
 *
 * IMPORTANT: we must NOT use createClient() from @/lib/supabase/server here.
 * That helper uses `cookies()` from `next/headers`, whose setAll() writes
 * cookie headers onto Next.js's internal response object — NOT onto the
 * NextResponse.redirect() we return. The browser therefore never receives the
 * Set-Cookie: expired headers and the session persists in cookies.
 *
 * Instead we build the Supabase client directly against the NextRequest and
 * the redirect NextResponse so that signOut()'s setAll() writes cookie
 * deletions directly onto the response we return.
 *
 * scope:"global" revokes the refresh token server-side so that even if the
 * browser still has a copy in localStorage, Supabase will reject it on the
 * next exchange attempt.
 */
export async function GET(request: NextRequest) {
  const home = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const response = NextResponse.redirect(new URL("/", home));

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // Write cookie deletions onto the redirect response we are returning
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
