// Placeholder for an original report scan. Used wherever a report has a
// file_path that we can't (yet) load — failed extractions, partner-hospital
// simulator inserts, missing files. Diagonal-stripe pattern with a small
// mono caption ("original scan" / "original report photo").

import type { CSSProperties } from "react";

export default function ScanPlaceholder({
  width = 96,
  height = 124,
  caption = "original scan",
  label,
  className,
  style,
  rounded = 18,
}: {
  width?: number | string;
  height?: number | string;
  caption?: string;
  label?: string;
  className?: string;
  style?: CSSProperties;
  rounded?: number;
}) {
  const shown = label ?? caption;
  return (
    <div
      aria-hidden="true"
      className={`mv-scan-pattern relative grid place-items-end overflow-hidden ${className ?? ""}`}
      style={{
        width,
        height,
        borderRadius: rounded,
        border: "1px solid var(--color-line)",
        ...style,
      }}
    >
      <span
        className="m-2 rounded-md bg-white/85 px-2 py-1 text-[10px] uppercase tracking-[0.12em] text-ink-400"
        style={{ fontFamily: "ui-monospace, Menlo, monospace" }}
      >
        {shown}
      </span>
    </div>
  );
}