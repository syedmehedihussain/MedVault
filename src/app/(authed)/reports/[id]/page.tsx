// Report detail page — loads a single report by id (RLS-scoped) and
// hands it to <ReportDetail>. The original scan is served via a
// short-lived signed URL minted on the server.

import Link from "next/link";
import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { createSignedUrl } from "@/lib/storage";
import ReportDetail from "@/components/ReportDetail";
import { ChevronLeft } from "@/components/icons";
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
    .maybeSingle();

  if (error || !report) notFound();

  const signedUrl = report.file_path
    ? await createSignedUrl(report.file_path)
    : null;

  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 self-start rounded-full bg-white px-3 py-2 text-sm font-semibold text-ink-500 shadow-[var(--shadow-soft)] transition-colors hover:text-brand-600"
      >
        <ChevronLeft size={16} />
        All reports
      </Link>

      <ReportDetail report={report as unknown as ReportRow} signedUrl={signedUrl} />
    </div>
  );
}