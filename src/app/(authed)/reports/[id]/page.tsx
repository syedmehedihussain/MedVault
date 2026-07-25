// Milestone 4: report detail view.
//
// Loads a single report by id. RLS guarantees the row only returns when
// user_id matches the session — if someone hits another user's id, they
// see the same notFound() response (no signal that the row exists).
//
// The original image is served via a short-lived signed URL minted on the
// server. The browser never receives a public URL.

import Link from "next/link";
import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { createSignedUrl } from "@/lib/storage";
import ReportDetail from "@/components/ReportDetail";
import type { ReportRow } from "@/lib/types";

export default async function ReportDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) notFound(); // belt-and-braces; (authed) layout already gated this.

  const { data: report, error } = await supabase
    .from("reports")
    .select(
      "id, user_id, created_at, report_type, report_date, doctor_or_hospital, summary, results, file_path, source, extraction_status",
    )
    .eq("id", id)
    .maybeSingle<ReportRow>();

  if (error || !report) notFound();

  const signedUrl = report.file_path
    ? await createSignedUrl(report.file_path)
    : null;

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-10">
      <div className="mb-6">
        <Link
          href="/dashboard"
          className="text-sm text-zinc-500 hover:text-zinc-900"
        >
          ← Back to your reports
        </Link>
      </div>

      <ReportDetail report={report} signedUrl={signedUrl} />
    </main>
  );
}