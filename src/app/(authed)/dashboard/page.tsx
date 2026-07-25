// Milestone 4: list the user's reports newest-first. RLS guarantees we
// only ever see rows where user_id matches the session — see
// docs/DATA_MODEL.md. Milestone 5 layered a <SearchBar> on top of this
// page that filters live via /api/reports/list.

import { Suspense } from "react";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import UploadButton from "@/components/UploadButton";
import ReportCard from "@/components/ReportCard";
import SearchBar from "@/components/SearchBar";
import type { ReportRow } from "@/lib/types";

export default async function DashboardPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: rows, error } = await supabase
    .from("reports")
    .select(
      "id, user_id, created_at, report_type, report_date, doctor_or_hospital, summary, results, file_path, source, extraction_status",
    )
    .order("created_at", { ascending: false })
    .returns<ReportRow[]>();

  const reports = rows ?? [];

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-10">
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Your reports</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Signed in as {user?.email}
          </p>
        </div>
      </div>

      <div className="mb-8">
        <UploadButton />
      </div>

      {error && (
        <p className="mb-6 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          Could not load your reports: {error.message}
        </p>
      )}

      <Suspense
        fallback={
          <div className="h-12 w-full animate-pulse rounded-xl bg-zinc-100" />
        }
      >
        <SearchBar initialReports={reports} />
      </Suspense>

      {/* When the user has zero reports at all, show the friendly empty
          state from Milestone 4 — otherwise the SearchBar's own empty
          state ("No reports match …") takes over. */}
      {reports.length === 0 && (
        <div className="mt-8 rounded-2xl border border-dashed border-zinc-300 bg-white p-10 text-center">
          <h2 className="text-base font-medium text-zinc-900">
            No reports yet
          </h2>
          <p className="mt-1 text-sm text-zinc-500">
            Upload your first report above. We will read it and keep it here
            forever.
          </p>
        </div>
      )}
      {reports.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2">
          {reports.map((r) => (
            <ReportCard key={r.id} report={r} />
          ))}
        </div>
      )}
    </main>
  );
}
