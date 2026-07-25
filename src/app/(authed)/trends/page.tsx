// Trends screen — mockup 07. For each test value that appears in two or
// more of the user's reports, render a small inline line chart with the
// most recent readings. The chart is pure SVG (no chart library).

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { getDashboardReports } from "@/lib/reports";
import Disclaimer from "@/components/Disclaimer";
import TrendChart from "@/components/TrendChart";
import type { ReportRow } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function TrendsPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { reports } = await getDashboardReports(user.id);
  const rows = reports as unknown as ReportRow[];

  // Group every reading by its test name, keeping the report's date.
  type Point = { iso: string; value: number; unit: string; range: string };
  const byTest = new Map<string, Point[]>();

  for (const r of rows) {
    const date = r.report_date ?? r.created_at.slice(0, 10);
    for (const res of r.results ?? []) {
      const v = parseFloat(res.value);
      if (Number.isNaN(v)) continue;
      const key = res.test.trim();
      if (!key) continue;
      const arr = byTest.get(key) ?? [];
      arr.push({ iso: date, value: v, unit: res.unit, range: res.normalRange });
      byTest.set(key, arr);
    }
  }

  // Only show repeated tests (F8 "trends for a repeated test value").
  const trends = Array.from(byTest.entries())
    .filter(([, pts]) => pts.length >= 2)
    .map(([test, pts]) => ({
      test,
      points: pts.sort((a, b) => a.iso.localeCompare(b.iso)),
    }))
    .sort((a, b) => a.test.localeCompare(b.test));

  return (
    <div className="flex flex-col gap-8">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-600">
          Trends
        </p>
        <h1 className="mt-2 text-2xl font-extrabold text-ink-900 sm:text-3xl">
          Your values over time.
        </h1>
        <p className="mt-2 text-sm text-ink-500">
          We chart every test that appears in two or more of your reports.
        </p>
      </header>

      {trends.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-line bg-white p-10 text-center">
          <p className="text-base font-bold text-ink-900">No trends yet</p>
          <p className="mt-2 text-sm text-ink-500">
            Add another report with the same test name (e.g. another lipid
            panel) to start seeing your numbers move over time.
          </p>
        </div>
      ) : (
        <section className="grid gap-4">
          {trends.map((t) => (
            <TrendChart
              key={t.test}
              test={t.test}
              unit={t.points[0].unit}
              range={t.points[0].range}
              points={t.points}
            />
          ))}
        </section>
      )}

      <Disclaimer className="mt-4" />
    </div>
  );
}