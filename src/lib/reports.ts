// Server-side helper for the dashboard list. Centralizes the query so the
// (authed) layout can pull the record count without re-implementing the
// PostgREST shape, and so the dashboard page itself can read the same rows
// it pre-rendered into the HTML.

import { createSupabaseServerClient } from "./supabaseServer";
import type { ReportRow } from "./types";

export type DashboardReport = ReportRow & {
  signedUrl: string | null;
};

export async function getDashboardReports(
  userId: string,
  query?: string,
): Promise<{ reports: DashboardReport[]; error?: string }> {
  const supabase = await createSupabaseServerClient();

  let builder = supabase
    .from("reports")
    .select(
      "id, user_id, report_type, report_date, doctor_or_hospital, summary, results, file_path, source, extraction_status, created_at",
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (query && query.trim()) {
    const escaped = query.trim().replace(/[%_]/g, (m) => "\\" + m);
    const needle = `%${escaped}%`;
    builder = builder.or(
      `report_type.ilike.${needle},doctor_or_hospital.ilike.${needle},summary.ilike.${needle}`,
    );
  }

  const { data: rows, error } = await builder;
  const list = (rows ?? []) as unknown as ReportRow[];

  if (error) {
    return { reports: [], error: error.message };
  }

  // Mint signed URLs for each original file. Failures degrade to null so a
  // broken signed URL doesn't kill the whole list.
  const reports: DashboardReport[] = await Promise.all(
    list.map(async (r) => {
      let signedUrl: string | null = null;
      if (r.file_path) {
        try {
          const { createSignedUrl } = await import("./storage");
          signedUrl = await createSignedUrl(r.file_path);
        } catch {
          signedUrl = null;
        }
      }
      return { ...r, signedUrl };
    }),
  );

  return { reports };
}