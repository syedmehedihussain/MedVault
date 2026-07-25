import Link from "next/link";
import type { ReportRow } from "@/lib/types";

// One row of a report, rendered as a click-through card on the dashboard.
// Date is intentionally prominent — most users will scan by recency.

function formatDate(iso: string | null): string {
  if (!iso) return "";
  // Accept either "YYYY-MM-DD" or a full ISO timestamp.
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  if (!m) return "";
  const [, y, mo, d] = m;
  const dt = new Date(`${y}-${mo}-${d}T00:00:00Z`);
  return dt.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function ReportCard({ report }: { report: ReportRow }) {
  const date = formatDate(report.report_date) || formatDate(report.created_at);
  const title = report.report_type?.trim() || "Untitled report";
  const subtitle =
    report.doctor_or_hospital?.trim() ||
    (report.source === "partner_hospital"
      ? "Partner hospital"
      : "Personal record");
  const summary =
    report.summary?.trim() ||
    (report.extraction_status === "failed"
      ? "Saved — we couldn't read this report automatically."
      : "No summary available.");

  return (
    <Link
      href={`/reports/${report.id}`}
      className="group block rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-2">
            <h3 className="truncate text-base font-semibold text-zinc-900">
              {title}
            </h3>
            {report.extraction_status === "failed" && (
              <span className="inline-flex items-center rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">
                Read pending
              </span>
            )}
          </div>
          <p className="mt-0.5 truncate text-sm text-zinc-500">
            {subtitle}
            {date ? ` · ${date}` : ""}
          </p>
        </div>
        <span className="shrink-0 text-zinc-400 transition-colors group-hover:text-zinc-700">
          →
        </span>
      </div>
      <p className="mt-3 line-clamp-2 text-sm text-zinc-700">{summary}</p>
      {report.results.length > 0 && (
        <p className="mt-3 text-xs text-zinc-400">
          {report.results.length} test
          {report.results.length === 1 ? "" : "s"} extracted
        </p>
      )}
    </Link>
  );
}