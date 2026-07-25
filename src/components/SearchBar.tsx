"use client";

// Debounced search input that updates the URL `?q=` parameter.
// Filtering happens client-side via <RecordsList /> for instant feedback;
// the API endpoint is still kept for /future server-paginated cases.

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "./icons";

const DEBOUNCE_MS = 250;

export default function SearchBar({ initialQuery }: { initialQuery?: string }) {
  const router = useRouter();
  const params = useSearchParams();
  const [value, setValue] = useState(initialQuery ?? params.get("q") ?? "");

  // Mirror input into URL after the user stops typing.
  useEffect(() => {
    const handle = window.setTimeout(() => {
      const next = new URLSearchParams(params.toString());
      if (value.trim()) next.set("q", value.trim());
      else next.delete("q");
      const url = next.toString() ? `/dashboard?${next.toString()}` : "/dashboard";
      router.replace(url, { scroll: false });
    }, DEBOUNCE_MS);
    return () => window.clearTimeout(handle);
    // We deliberately don't include `params` / `router` to avoid loops —
    // URL updates are entirely driven by this effect.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-ink-400">
        <Search size={18} />
      </span>
      <input
        type="search"
        inputMode="search"
        autoComplete="off"
        spellCheck={false}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder='Try "blood sugar", "thyroid", or a doctor name…'
        aria-label="Search your reports"
        className="h-14 w-full rounded-2xl border border-line bg-white pl-12 pr-12 text-sm font-medium text-ink-900 placeholder:text-ink-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
      />
      {value.length > 0 && (
        <button
          type="button"
          onClick={() => setValue("")}
          aria-label="Clear search"
          className="absolute right-4 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-full text-ink-400 transition-colors hover:bg-mint hover:text-brand-600"
        >
          ×
        </button>
      )}
    </div>
  );
}