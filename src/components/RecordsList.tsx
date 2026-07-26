"use client";

// Client-side records list. Receives the SSR-rendered list as
// `initialReports` so the first paint is instant. When `query` is non-empty
// it filters by the same three columns used by the API (report_type,
// doctor_or_hospital, summary) without a round-trip — small lists, fast UX.
// Degrades gracefully on empty input.

import Link from "next/link";
import type { ReportRow } from "@/lib/types";
import ReportCard from "./ReportCard";
import SearchEmpty from "./SearchEmpty";

export default function RecordsList({
  initialReports,
  query,
}: {
  initialReports: ReportRow[];
  query: string;
}) {
  const q = query.trim().toLowerCase();
  const filtered = q
    ? initialReports.filter((r) => {
        const haystack = [
          r.report_type,
          r.doctor_or_hospital,
          r.summary,
          ...(r.results ?? []).map((res) => `${res.test} ${res.value} ${res.unit}`),
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return haystack.includes(q);
      })
    : initialReports;

  if (filtered.length === 0 && q) {
    return <SearchEmpty query={query} />;
  }

  if (filtered.length === 0) {
    // Truly empty vault — show the "Add your first report" panel.
    return (
      <div className="mt-8 grid gap-4">
        <div className="rounded-3xl border border-dashed border-line bg-white p-8 text-center">
          <p className="text-base font-bold text-ink-900">No reports yet</p>
          <p className="mt-2 text-sm text-ink-500">
            Upload your first report — we&apos;ll read it and keep it here
            forever.
          </p>
        </div>
      </div>
    );
  }

  return (
    // `min-w-0` on each row is load-bearing: grid children default to
    // `min-width: auto`, so a long title or summary would otherwise widen the
    // column past the page and give the whole dashboard a horizontal scroll.
    <ul className="grid w-full gap-2.5">
      {filtered.map((r) => (
        <li key={r.id} className="min-w-0">
          <Link href={`/reports/${r.id}`} className="block min-w-0">
            <ReportCard report={r} />
          </Link>
        </li>
      ))}
    </ul>
  );
}