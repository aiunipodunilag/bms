import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * GET /auth/signout
 * Signs the user out globally (revokes the refresh token on Supabase's servers)
 * and redirects to the home page.
 *
 * scope: "global" is critical — without it, signOut() only clears the server-side
 * cookie but leaves a valid token in the browser's localStorage. On the next page
 * load, Supabase's browser client finds that localStorage token, exchanges it for
 * a new session, and writes it back to cookies — silently signing the user back in.
 * With scope: "global", the token is revoked server-side so localStorage can't
 * restore it even if the browser still has it cached.
 */
export async function GET() {
  const supabase = createClient();
  await supabase.auth.signOut({ scope: "global" });
  const home = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  return NextResponse.redirect(new URL("/", home));
}
