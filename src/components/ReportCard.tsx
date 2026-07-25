// Dashboard record card. Mockup 03 — tinted icon tile on the left, type
// + date + summary on the right, plus a per-type chip below the title.

import type { ReportRow } from "@/lib/types";
import Pill from "./Pill";
import { ChevronRight } from "./icons";
import { typeForReport } from "@/lib/reportType";

function formatDate(iso: string | null): string {
  if (!iso) return "";
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  if (!m) return "";
  const [, y, mo, d] = m;
  const dt = new Date(`${y}-${mo}-${d}T00:00:00Z`);
  return dt.toLocaleDateString("en-US", {
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
  const typeMeta = typeForReport(report);
  const Icon = typeMeta.icon;

  return (
    <article className="group flex items-stretch gap-4 rounded-3xl border border-line bg-white p-4 transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-soft)]">
      {/* Tinted icon tile */}
      <span
        className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl"
        style={{
          background: typeMeta.tile,
          color: typeMeta.tileText,
        }}
        aria-hidden
      >
        <Icon size={26} />
      </span>

      {/* Body */}
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="truncate text-base font-extrabold text-ink-900">
              {title}
            </h3>
            <p className="mt-0.5 truncate text-xs text-ink-500">
              {subtitle}
              {date ? ` · ${date}` : ""}
            </p>
          </div>
          <span className="shrink-0 text-ink-400 transition-colors group-hover:text-brand-600">
            <ChevronRight size={18} />
          </span>
        </div>

        <p className="line-clamp-2 text-sm text-ink-700">{summary}</p>

        <div className="mt-1 flex flex-wrap items-center gap-2">
          <Pill tone={typeMeta.tone}>{typeMeta.label}</Pill>
          {report.extraction_status === "failed" ? (
            <Pill tone="other">Read pending</Pill>
          ) : null}
          {report.results.length > 0 ? (
            <span className="text-[11px] text-ink-400">
              {report.results.length} test
              {report.results.length === 1 ? "" : "s"}
            </span>
          ) : null}
        </div>
      </div>
    </article>
  );
}