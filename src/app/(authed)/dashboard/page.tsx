// Dashboard — mockup mobile 03 / desktop D2.
// Server-renders the report list and hands it to a client component for
// instant client-side filtering. The sidebar lives in (authed)/layout.tsx.

import { Suspense } from "react";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { getDashboardReports } from "@/lib/reports";
import UploadButton from "@/components/UploadButton";
import SearchBar from "@/components/SearchBar";
import RecordsList from "@/components/RecordsList";
import PartnerHospitalButton from "@/components/PartnerHospitalButton";
import Disclaimer from "@/components/Disclaimer";
import type { ReportRow } from "@/lib/types";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { reports, error } = await getDashboardReports(user.id, q);
  const initialReports = reports as unknown as ReportRow[];

  const displayName = (user?.user_metadata?.full_name as string | undefined) ??
    user?.email?.split("@")[0] ??
    "there";
  const firstName = displayName.split(/\s+/)[0];

  return (
    <div className="flex flex-col gap-8">
      {/* Greeting + primary CTA */}
      <header className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-600">
            Good day
          </p>
          <h1 className="mt-2 text-2xl font-extrabold text-ink-900 sm:text-3xl">
            Hi, {firstName}.
          </h1>
          <p className="mt-1 text-sm text-ink-500">
            {reports.length === 0
              ? "Let's add your first report."
              : `You have ${reports.length} report${reports.length === 1 ? "" : "s"} in your vault.`}
          </p>
        </div>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
          <PartnerHospitalButton />
          <UploadButton />
        </div>
      </header>

      {/* Search */}
      <Suspense
        fallback={
          <div className="h-14 w-full animate-pulse rounded-2xl bg-mint" />
        }
      >
        <SearchBar initialQuery={q} />
      </Suspense>

      {error && (
        <p className="rounded-2xl border border-blood-200 bg-blood-50 px-4 py-3 text-sm text-blood-700">
          Could not load your reports: {error}
        </p>
      )}

      {/* Records */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-bold text-ink-900">Recent records</h2>
          <span className="text-xs text-ink-400">
            {reports.length} total
          </span>
        </div>
        <RecordsList initialReports={initialReports} query={q} />
      </section>

      <Disclaimer className="mt-4" />
    </div>
  );
}
