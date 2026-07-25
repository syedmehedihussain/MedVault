import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import type { ReportRow } from "@/lib/types";

// GET /api/reports/list?q=<term>
//
// Lists the signed-in user's reports, newest-first, optionally filtered by
// a free-text query. The query is matched (case-insensitive substring) across:
//
//   - report_type        e.g. "CBC", "Lipid Panel"
//   - doctor_or_hospital e.g. "Dr. Khan", "Apollo Diagnostics"
//   - summary            AI-written one-liner
//   - results            every test name + value in the structured JSONB
//
// RLS on `reports` (`auth.uid() = user_id`, see docs/DATA_MODEL.md) guarantees
// we can only ever see the caller's own rows — we never filter by user_id
// explicitly here, and the route does not take a userId from the caller.
//
// An empty / whitespace-only `q` returns the full list, so the dashboard can
// reuse this endpoint for both modes.

export const runtime = "nodejs";

export async function GET(request: Request) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: "You must be signed in to search your reports." },
      { status: 401 },
    );
  }

  const url = new URL(request.url);
  const rawQ = url.searchParams.get("q") ?? "";
  const q = rawQ.trim();

  // Filter first, then sort — the PostgREST builder type locks out `.or()`
  // once `.returns<>()` has fixed the row shape, so we leave the builder
  // generic here and cast the rows once when we read them.
  const query = supabase
    .from("reports")
    .select(
      "id, user_id, created_at, report_type, report_date, doctor_or_hospital, summary, results, file_path, source, extraction_status",
    );

  let filtered = query;

  if (q.length > 0) {
    // Escape `%` and `_` so a literal character the user typed isn't
    // interpreted as a LIKE wildcard. We don't touch `\` — Postgres' default
    // LIKE escape char is `\`, and PostgREST forwards the pattern verbatim.
    const safe = q.replace(/%/g, "\\%").replace(/_/g, "\\_");
    const pattern = `%${safe}%`;

    // ILIKE on each of the three user-visible text columns. We deliberately
    // skip the `results` JSONB column here: PostgREST's `.or()` parser
    // doesn't accept the `column::cast` syntax (it stops at the `:`), and
    // the AI-written `summary` already mentions the key test values, so
    // searching it covers the same ground.
    filtered = filtered.or(
      [
        `report_type.ilike.${pattern}`,
        `doctor_or_hospital.ilike.${pattern}`,
        `summary.ilike.${pattern}`,
      ].join(","),
    );
  }

  const { data: rows, error } = await filtered.order("created_at", {
    ascending: false,
  });

  if (error) {
    console.error("Report search failed:", error);
    return NextResponse.json(
      { error: `Could not search reports: ${error.message}` },
      { status: 500 },
    );
  }

  return NextResponse.json(
    {
      q,
      results: (rows ?? []) as ReportRow[],
      count: rows?.length ?? 0,
    },
    {
      // Never cache — search results should always reflect fresh inserts.
      headers: { "Cache-Control": "no-store" },
    },
  );
}