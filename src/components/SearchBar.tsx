"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import ReportCard from "./ReportCard";
import type { ReportRow } from "@/lib/types";

// SearchBar — debounced free-text search across the user's reports.
//
// Behaviour:
//  • Controlled input bound to ?q= in the URL (so deep-links and refresh
//    keep the same query).
//  • 200ms debounce before hitting GET /api/reports/list?q=...; in-flight
//    requests are cancelled via AbortController when a newer keystroke
//    arrives, so results always reflect the latest query.
//  • Shows a small loading hint while fetching, an error banner on failure,
//    and an empty-state line ("No reports match …") for zero hits.
//  • Renders the matching reports using the same ReportCard as the dashboard.

const DEBOUNCE_MS = 200;

type ListResponse = {
  q: string;
  results: ReportRow[];
  count: number;
};

export default function SearchBar({
  initialReports,
}: {
  // Reports the server already loaded for the user. Used so the panel has
  // something to render instantly on first paint before the first fetch
  // completes; we never re-query unless the input has content.
  initialReports: ReportRow[];
}) {
  const router = useRouter();
  const params = useSearchParams();
  const urlQ = params.get("q") ?? "";

  const [value, setValue] = useState(urlQ);
  const [results, setResults] = useState<ReportRow[]>(initialReports);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(urlQ.trim().length > 0);

  const inFlight = useRef<AbortController | null>(null);

  // Keep the input in sync if the URL changes externally (e.g. back/forward
  // navigation). We intentionally do NOT push a router update for every
  // keystroke — that would spam history. Instead we mirror to the URL via
  // replace() in the debounced effect below.
  useEffect(() => {
    setValue(urlQ);
  }, [urlQ]);

  const trimmed = value.trim();

  // Debounced fetch whenever the trimmed query changes.
  useEffect(() => {
    // Empty query → fall back to the SSR list, no network call.
    if (trimmed.length === 0) {
      setResults(initialReports);
      setSearched(false);
      setError(null);
      setLoading(false);
      return;
    }

    const handle = window.setTimeout(async () => {
      // Cancel any previous request.
      inFlight.current?.abort();
      const controller = new AbortController();
      inFlight.current = controller;

      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `/api/reports/list?q=${encodeURIComponent(trimmed)}`,
          { signal: controller.signal, cache: "no-store" },
        );
        if (!res.ok) {
          const body = (await res.json().catch(() => ({}))) as {
            error?: string;
          };
          throw new Error(body.error ?? `Search failed (HTTP ${res.status})`);
        }
        const data = (await res.json()) as ListResponse;
        if (controller.signal.aborted) return;
        setResults(data.results);
        setSearched(true);
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setError(err instanceof Error ? err.message : "Search failed.");
        setSearched(true);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }

      // Mirror the query into the URL (replace, not push, so each keystroke
      // does not add a history entry).
      const next = new URLSearchParams(params.toString());
      next.set("q", trimmed);
      router.replace(`/dashboard?${next.toString()}`, { scroll: false });
    }, DEBOUNCE_MS);

    return () => window.clearTimeout(handle);
    // We deliberately exclude `params` / `router` from deps to avoid
    // re-firing on every render; the URL is only ever updated from inside
    // this effect.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trimmed, initialReports]);

  const summary = useMemo(() => {
    if (trimmed.length === 0) return null;
    if (loading) return "Searching…";
    if (error) return null;
    if (!searched) return null;
    if (results.length === 0) return `No reports match “${trimmed}”.`;
    return `${results.length} ${
      results.length === 1 ? "report matches" : "reports match"
    } “${trimmed}”.`;
  }, [trimmed, loading, error, searched, results.length]);

  return (
    <div className="space-y-4">
      <div className="relative">
        <input
          type="search"
          inputMode="search"
          autoComplete="off"
          spellCheck={false}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Search by type, doctor, summary, or test name…"
          aria-label="Search your reports"
          className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 pr-10 text-sm text-zinc-900 shadow-sm placeholder:text-zinc-400 focus:border-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/10"
        />
        {value.length > 0 && (
          <button
            type="button"
            onClick={() => setValue("")}
            aria-label="Clear search"
            className="absolute inset-y-0 right-2 my-auto h-7 w-7 rounded-full text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700"
          >
            ×
          </button>
        )}
      </div>

      {error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      {summary && (
        <p className="text-sm text-zinc-500" aria-live="polite">
          {summary}
        </p>
      )}

      {searched && results.length === 0 && !loading && !error ? null : null}

      {results.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2">
          {results.map((r) => (
            <ReportCard key={r.id} report={r} />
          ))}
        </div>
      )}
    </div>
  );
}