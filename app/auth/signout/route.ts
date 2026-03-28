import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * GET /auth/signout
 * Signs the user out and redirects to the home page.
 */
export async function GET() {
  const supabase = createClient();
  await supabase.auth.signOut();
  return NextResponse.redirect(new URL("/", process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"));
}
