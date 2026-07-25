// Browser-side Supabase client.
//
// Uses the anon key (subject to RLS). Safe to import from any client component.
// Reads/writes the auth cookies that the server-side client also uses, so the
// session stays in sync between SSR and the browser.

import { createBrowserClient } from "@supabase/ssr";

export function createSupabaseBrowserClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY. " +
        "Add them to .env.local (see .env.example).",
    );
  }

  return createBrowserClient(url, anonKey);
}
