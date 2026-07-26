// Mockup 06 / D3 — single-report view.
// Tinted header tile + chip, summary card, results table with per-row
// status pills, and the original scan as a side panel.

import type { ReportRow } from "@/lib/types";
import { typeForReport } from "@/lib/reportType";
import Pill from "./Pill";
import StatusPill from "./StatusPill";
import ScanPlaceholder from "./ScanPlaceholder";
import Disclaimer from "./Disclaimer";
import DeleteReportButton from "./DeleteReportButton";

function formatDate(iso: string | null): string {
  if (!iso) return "";
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  if (!m) return "";
  const [, y, mo, d] = m;
  const dt = new Date(`${y}-${mo}-${d}T00:00:00Z`);
  return dt.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

// Heuristic: compare a numeric value against a normal range like "<200",
// ">40", "70-100", "70 – 100". Returns "high" / "low" / "normal" / "watch".
function classify(
  value: string,
  range: string,
): "high" | "low" | "normal" | "watch" {
  const v = parseFloat(value);
  if (Number.isNaN(v)) return "watch";
  const r = (range ?? "").trim();
  // "<X" → above is bad
  const lt = /^<\s*([\d.]+)/.exec(r);
  if (lt) {
    const cap = parseFloat(lt[1]);
    if (v > cap * 1.1) return "high";
    if (v > cap) return "watch";
    return "normal";
  }
  // ">X" → below is bad
  const gt = /^>\s*([\d.]+)/.exec(r);
  if (gt) {
    const floor = parseFloat(gt[1]);
    if (v < floor * 0.9) return "low";
    if (v < floor) return "watch";
    return "normal";
  }
  // "X-Y"
  const rangeMatch = /([\d.]+)\s*[-–]\s*([\d.]+)/.exec(r);
  if (rangeMatch) {
    const lo = parseFloat(rangeMatch[1]);
    const hi = parseFloat(rangeMatch[2]);
    if (v < lo || v > hi) return v > hi ? "high" : "low";
    if (v < lo * 1.05 || v > hi * 0.95) return "watch";
    return "normal";
  }
  return "watch";
}

export default function ReportDetail({
  report,
  signedUrl,
}: {
  report: ReportRow;
  signedUrl: string | null;
}) {
  const dateLabel = formatDate(report.report_date);
  const createdLabel = formatDate(report.created_at);
  const meta = typeForReport(report);
  const Icon = meta.icon;
  const isFailed = report.extraction_status === "failed";
  const title = report.report_type?.trim() || "Medical report";

  return (
    <article className="flex flex-col gap-8">
      {/* Header */}
      <header className="flex flex-col gap-5 sm:flex-row sm:items-center sm:gap-6">
        <span
          className="grid h-20 w-20 shrink-0 place-items-center rounded-3xl shadow-[var(--shadow-logo)]"
          style={{ background: meta.tile, color: meta.tileText }}
          aria-hidden
        >
          <Icon size={36} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Pill tone={meta.tone}>{meta.label}</Pill>
            {isFailed ? <Pill tone="other">Read pending</Pill> : null}
            {report.source === "partner_hospital" ? (
              <Pill tone="mint">Partner hospital</Pill>
            ) : null}
          </div>
          <h1 className="mt-3 text-2xl font-extrabold text-ink-900 sm:text-3xl">
            {title}
          </h1>
          <dl className="mt-2 flex flex-wrap gap-x-6 gap-y-1 text-sm text-ink-500">
            {dateLabel && (
              <div>
                <dt className="sr-only">Report date</dt>
                <dd>{dateLabel}</dd>
              </div>
            )}
            {report.doctor_or_hospital && (
              <div>
                <dt className="sr-only">Doctor or hospital</dt>
                <dd>{report.doctor_or_hospital}</dd>
              </div>
            )}
            <div>
              <dt className="sr-only">Added on</dt>
              <dd className="text-ink-400">Added {createdLabel}</dd>
            </div>
          </dl>
        </div>

        <DeleteReportButton reportId={report.id} reportTitle={title} />
      </header>

      {/* Summary */}
      <section className="rounded-3xl border border-line bg-white p-6 shadow-[var(--shadow-soft)]">
        <h2 className="text-xs font-bold uppercase tracking-[0.18em] text-brand-600">
          Summary
        </h2>
        <p className="mt-3 text-base leading-relaxed text-ink-900">
          {report.summary?.trim() ||
            "No summary available for this report."}
        </p>
        {isFailed && (
          <p className="mt-4 rounded-2xl border border-blood-200 bg-blood-50 px-4 py-3 text-sm text-blood-700">
            We saved your file but couldn&apos;t read this report automatically.
            The original scan is shown on the right.
          </p>
        )}
      </section>

      {/* Results + Original — responsive split */}
      <section className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="rounded-3xl border border-line bg-white shadow-[var(--shadow-soft)]">
          <div className="border-b border-line p-6">
            <h2 className="text-xs font-bold uppercase tracking-[0.18em] text-brand-600">
              Extracted results
            </h2>
            <p className="mt-2 text-sm text-ink-500">
              {report.results.length} test
              {report.results.length === 1 ? "" : "s"} pulled out of the image.
            </p>
          </div>

          {report.results.length === 0 ? (
            <div className="p-6 text-sm text-ink-500">
              No individual test values were extracted.
            </div>
          ) : (
            <div className="overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="text-[11px] uppercase tracking-wider text-ink-400">
                    <th className="px-6 py-3 font-semibold">Test</th>
                    <th className="px-6 py-3 font-semibold">Value</th>
                    <th className="hidden px-6 py-3 font-semibold sm:table-cell">
                      Unit
                    </th>
                    <th className="px-6 py-3 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {report.results.map((r, i) => {
                    const status = classify(r.value, r.normalRange);
                    return (
                      <tr key={i} className="text-ink-900">
                        <td className="px-6 py-4 font-bold">{r.test || "—"}</td>
                        <td className="px-6 py-4">
                          <span className="font-extrabold">{r.value}</span>
                          {r.unit && (
                            <span className="ml-1 text-xs text-ink-400">
                              {r.unit}
                            </span>
                          )}
                          <div className="mt-0.5 text-[11px] text-ink-400">
                            {r.normalRange && `Normal: ${r.normalRange}`}
                          </div>
                        </td>
                        <td className="hidden px-6 py-4 text-ink-500 sm:table-cell">
                          {r.unit || "—"}
                        </td>
                        <td className="px-6 py-4">
                          <StatusPill status={status} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <aside className="rounded-3xl border border-line bg-white p-4 shadow-[var(--shadow-soft)]">
          <h2 className="px-2 text-xs font-bold uppercase tracking-[0.18em] text-brand-600">
            Original scan
          </h2>
          <div className="mt-3 overflow-hidden rounded-2xl border border-line">
            {signedUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={signedUrl}
                alt="Original medical report"
                className="block h-auto w-full"
              />
            ) : (
              <ScanPlaceholder label="Original unavailable" />
            )}
          </div>
          <Disclaimer className="mt-3 px-2" variant="strong" />
        </aside>
      </section>
    </article>
  );
}