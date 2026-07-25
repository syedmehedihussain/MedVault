// Server-side Supabase clients.
//
// Two flavours:
//   - createSupabaseServerClient(): uses the anon key + the request's cookies,
//     so it respects RLS and can read the logged-in user. Use this in route
//     handlers and server components when you need to know WHO is calling.
//   - createSupabaseAdminClient(): uses the SUPABASE_SERVICE_ROLE_KEY, which
//     BYPASSES RLS. Only for trusted server code (e.g. service-side upload
//     flows that must write on behalf of a user). Never import this from a
//     client component — the service role key must never reach the browser.

import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";

export async function createSupabaseServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY. " +
        "Add them to .env.local (see .env.example).",
    );
  }

  const cookieStore = await cookies();

  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Called from a Server Component (read-only). Safe to ignore for reads;
          // the browser client will keep the session in sync via its own writes.
        }
      },
    },
  });
}

export function createSupabaseAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. " +
        "The admin client can only be used on the server.",
    );
  }

  return createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
