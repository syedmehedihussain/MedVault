"use client";

// Search "no results" panel — used when a search query returns zero rows.
// Includes a one-tap clear button so the user can recover instantly.

import { Search } from "./icons";

export default function SearchEmpty({ query }: { query: string }) {
  return (
    <div className="mt-8 rounded-3xl border border-line bg-white p-8 text-center">
      <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-mint text-brand-600">
        <Search size={22} />
      </span>
      <p className="mt-4 text-base font-bold text-ink-900">
        No reports match &ldquo;{query}&rdquo;
      </p>
      <p className="mt-2 text-sm text-ink-500">
        Try a different word, or upload a new report that mentions it.
      </p>
    </div>
  );
}