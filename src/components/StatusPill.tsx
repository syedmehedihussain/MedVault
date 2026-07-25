// Status pill for a single row of the results table. Tinted by status
// (Normal / Watch / High / Low / Pending), preserving the mockup's
// calm palette. Accepts both lowercase keys (from classify()) and
// Title Case for legacy callers.

import { CheckIcon } from "./icons";

type StatusKey =
  | "normal"
  | "watch"
  | "high"
  | "low"
  | "pending"
  | "Normal"
  | "Watch"
  | "High"
  | "Low"
  | "Pending";

type Normalized = "Normal" | "Watch" | "High" | "Low" | "Pending";

const TONE: Record<Normalized, string> = {
  Normal: "bg-normal-bg text-normal-fg",
  Watch: "bg-watch-bg text-watch-fg",
  High: "bg-high-bg text-high-fg",
  Low: "bg-low-bg text-low-fg",
  Pending: "bg-mint text-brand-600",
};

function normalize(s: StatusKey): Normalized {
  const lower = s.toLowerCase();
  if (lower === "normal") return "Normal";
  if (lower === "watch") return "Watch";
  if (lower === "high") return "High";
  if (lower === "low") return "Low";
  return "Pending";
}

export default function StatusPill({ status }: { status: StatusKey }) {
  const n = normalize(status);
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-pill px-2.5 py-1 text-[11px] font-bold tracking-[0.04em] ${TONE[n]}`}
    >
      {n === "Normal" && <CheckIcon strokeWidth={2.4} className="h-3 w-3" />}
      {n}
    </span>
  );
}