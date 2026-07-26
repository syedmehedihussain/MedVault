// GET /auth/confirm — the landing point for links sent by email
// (password recovery, signup confirmation, email change).
//
// Two link shapes are accepted, because which one Supabase sends depends on
// the email template configured in the dashboard:
//
//   ?token_hash=...&type=recovery   the PKCE shape Supabase recommends for
//                                   server-side frameworks. Verified with
//                                   verifyOtp(); works from any device.
//   ?code=...                       the default template's shape. Exchanged
//                                   with exchangeCodeForSession(), which needs
//                                   the PKCE verifier cookie, so it only works
//                                   in the browser that started the request.
//
// Either way the result is a session written to cookies, after which we send
// the user on to `next` (defaults to /dashboard).

import { NextResponse } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/lib/supabaseServer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Only allow relative paths, so a crafted link can't bounce a freshly
// authenticated user to an attacker's domain.
function safeNext(raw: string | null): string {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) return "/dashboard";
  return raw;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const tokenHash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type") as EmailOtpType | null;
  const code = url.searchParams.get("code");
  const next = safeNext(url.searchParams.get("next"));

  const supabase = await createSupabaseServerClient();

  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash: tokenHash,
    });
    if (!error) {
      return NextResponse.redirect(new URL(next, url.origin));
    }
    console.error("verifyOtp failed:", error.message);
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(error.message)}`, url.origin),
    );
  }

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(new URL(next, url.origin));
    }
    console.error("exchangeCodeForSession failed:", error.message);
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(error.message)}`, url.origin),
    );
  }

  return NextResponse.redirect(
    new URL(
      "/login?error=" +
        encodeURIComponent("That link is invalid or has expired."),
      url.origin,
    ),
  );
}
