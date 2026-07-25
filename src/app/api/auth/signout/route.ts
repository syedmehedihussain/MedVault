import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServer";

// POST /api/auth/signout — clears the Supabase session cookies and bounces
// the user back to /login. Triggered by the "Sign out" button in the authed
// layout's header.
export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();

  const origin = new URL(request.url).origin;
  return NextResponse.redirect(`${origin}/login`, { status: 303 });
}
