// Renders a single report: header (type / date / doctor), summary, and the
// extracted results table. When extraction failed we still show everything
// we DO know — the file path, the type if any — and explain why the table
// is empty.

import type { ReportRow } from "@/lib/types";

function formatDate(iso: string | null): string {
  if (!iso) return "";
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  if (!m) return "";
  const [, y, mo, d] = m;
  const dt = new Date(`${y}-${mo}-${d}T00:00:00Z`);
  return dt.toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
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

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        <header className="border-b border-zinc-100 pb-4">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
            {report.report_type?.trim() || "Medical report"}
          </h1>
          <dl className="mt-2 grid grid-cols-1 gap-x-6 gap-y-1 text-sm text-zinc-600 sm:grid-cols-2">
            <div>
              <dt className="inline font-medium text-zinc-900">Date: </dt>
              <dd className="inline">{dateLabel || "—"}</dd>
            </div>
            <div>
              <dt className="inline font-medium text-zinc-900">Added: </dt>
              <dd className="inline">{createdLabel || "—"}</dd>
            </div>
            {report.doctor_or_hospital && (
              <div className="sm:col-span-2">
                <dt className="inline font-medium text-zinc-900">Doctor / Hospital: </dt>
                <dd className="inline">{report.doctor_or_hospital}</dd>
              </div>
            )}
          </dl>
        </header>

        <div className="mt-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
            Summary
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-zinc-800">
            {report.summary?.trim() ||
              "No summary available for this report."}
          </p>
        </div>

        <div className="mt-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
            Extracted results
          </h2>
          {report.extraction_status === "failed" ? (
            <p className="mt-2 rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800">
              We saved your file but couldn&apos;t read this report automatically.
              The original image is shown on the right.
            </p>
          ) : report.results.length === 0 ? (
            <p className="mt-2 text-sm text-zinc-500">
              No individual test results were extracted.
            </p>
          ) : (
            <div className="mt-2 overflow-hidden rounded-lg border border-zinc-200">
              <table className="w-full text-left text-sm">
                <thead className="bg-zinc-50 text-xs uppercase tracking-wide text-zinc-500">
                  <tr>
                    <th className="px-3 py-2 font-medium">Test</th>
                    <th className="px-3 py-2 font-medium">Value</th>
                    <th className="px-3 py-2 font-medium">Unit</th>
                    <th className="px-3 py-2 font-medium">Normal range</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {report.results.map((r, i) => (
                    <tr key={i}>
                      <td className="px-3 py-2 font-medium text-zinc-900">
                        {r.test || "—"}
                      </td>
                      <td className="px-3 py-2 text-zinc-800">
                        {r.value || "—"}
                      </td>
                      <td className="px-3 py-2 text-zinc-500">
                        {r.unit || "—"}
                      </td>
                      <td className="px-3 py-2 text-zinc-500">
                        {r.normalRange || "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      <aside className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-zinc-500">
          Original image
        </h2>
        {signedUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={signedUrl}
            alt="Original medical report"
            className="w-full rounded-lg border border-zinc-200"
          />
        ) : (
          <p className="rounded-md bg-zinc-50 px-3 py-2 text-sm text-zinc-500">
            Original image unavailable. The file is still stored securely.
          </p>
        )}
      </aside>
    </div>
  );
}