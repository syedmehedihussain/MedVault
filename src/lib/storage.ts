// Storage helpers for the Supabase `reports` bucket.
//
// Files are stored as `{user_id}/{report_id}/{original_filename}` inside a
// PRIVATE bucket. The browser must NEVER receive a public URL — we hand out
// short-lived signed URLs minted here on the server.

import { createSupabaseServerClient } from "./supabaseServer";

export const REPORTS_BUCKET = "reports";

export function buildReportPath(
  userId: string,
  reportId: string,
  filename: string,
): string {
  return `${userId}/${reportId}/${filename}`;
}

export async function createSignedUrl(
  filePath: string,
  expiresInSeconds = 60 * 5,
): Promise<string | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.storage
    .from(REPORTS_BUCKET)
    .createSignedUrl(filePath, expiresInSeconds);

  if (error) {
    console.error("createSignedUrl failed:", error);
    return null;
  }
  return data.signedUrl;
}
