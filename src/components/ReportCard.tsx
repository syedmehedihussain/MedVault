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

// First sentence/clause of `text`, hard-capped at `max` characters.
function firstClause(text: string | null | undefined, max: number): string {
  if (!text) return "";
  const clause = text.match(/^[^.!?\n]+/)?.[0] ?? text;
  return clause.length > max ? `${clause.slice(0, max).trimEnd()}…` : clause;
}

export default function ReportCard({ report }: { report: ReportRow }) {
  const date = formatDate(report.report_date) || formatDate(report.created_at);
  // Compose subtitle from doctor/hospital, partner-source tag, and date — but
  // only show parts that carry real info. Skipping the "Personal record"
  // fallback keeps cards from feeling padded with empty text.
  // Extraction sometimes dumps a whole referral paragraph into
  // doctor_or_hospital — keep the first clause so the meta line reads as a
  // name, not a wall of text that only CSS truncation is holding back.
  const docOrHospital = firstClause(report.doctor_or_hospital?.trim(), 48);
  const sourceTag =
    report.source === "partner_hospital" ? "Partner hospital" : "";
  const subtitleParts = [docOrHospital || sourceTag || null, date || null]
    .filter(Boolean)
    .join(" · ");
  const title = report.report_type?.trim() || "Untitled report";
  // Truncate to a single readable sentence so cards stay tight. Long
  // clinical paragraphs from the model get trimmed to the first period
  // (or ~120 chars) before display.
  const rawSummary =
    report.summary?.trim() ||
    (report.extraction_status === "failed"
      ? "Saved — we couldn't read this report automatically."
      : "No summary available.");
  const sentenceMatch = rawSummary.match(/^[^.!?\n]+[.!?]/);
  const summary = (sentenceMatch ? sentenceMatch[0] : rawSummary).slice(0, 140);
  const typeMeta = typeForReport(report);
  const Icon = typeMeta.icon;

  return (
    // Every text node is truncated and every flex ancestor carries min-w-0,
    // so the card is sized by its column and never by its content — long
    // extracted titles/summaries can't push the page into a sideways scroll.
    <article className="group flex w-full min-w-0 items-center gap-3 overflow-hidden rounded-2xl border border-line bg-white px-3 py-2.5 transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-card-hover)]">
      {/* Tinted icon tile */}
      <span
        className="grid h-10 w-10 shrink-0 place-items-center rounded-xl"
        style={{
          background: typeMeta.tile,
          color: typeMeta.tileText,
        }}
        aria-hidden
      >
        <Icon size={18} />
      </span>

      {/* Body */}
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <div className="flex min-w-0 items-baseline gap-2">
          <h3 className="min-w-0 flex-1 truncate text-sm font-bold text-ink-900">
            {title}
          </h3>
          {report.results.length > 0 ? (
            <span className="shrink-0 text-[11px] text-ink-400">
              {report.results.length} test
              {report.results.length === 1 ? "" : "s"}
            </span>
          ) : null}
        </div>

        <div className="flex min-w-0 items-center gap-1.5 text-[11px] text-ink-500">
          <Pill tone={typeMeta.tone} className="shrink-0 px-1.5 py-0.5 text-[10px]">
            {typeMeta.label}
          </Pill>
          {report.extraction_status === "failed" ? (
            <Pill tone="other" className="shrink-0 px-1.5 py-0.5 text-[10px]">
              Read pending
            </Pill>
          ) : null}
          {subtitleParts ? (
            <span className="min-w-0 flex-1 truncate">{subtitleParts}</span>
          ) : null}
        </div>

        <p className="truncate text-xs text-ink-700">{summary}</p>
      </div>

      <span className="shrink-0 text-ink-400 transition-colors group-hover:text-brand-600">
        <ChevronRight size={16} />
      </span>
    </article>
  );
}