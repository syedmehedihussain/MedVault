// Rounded pill chip used for category labels ("Blood test", "Private by
// design") and trend deltas ("0.1 lower"). The mockup uses them as
// inline labels with optional leading icons.

import type { ReactNode } from "react";

type Tone = "mint" | "blood" | "rx" | "scan" | "other";

const TONE_STYLE: Record<Tone, string> = {
  mint: "bg-mint-soft text-brand-600",
  blood: "bg-blood-bg text-blood-fg",
  rx: "bg-rx-bg text-rx-fg",
  scan: "bg-scan-bg text-scan-fg",
  other: "bg-other-bg text-other-fg",
};

export default function Pill({
  tone = "mint",
  leadingIcon,
  children,
  className,
}: {
  tone?: Tone;
  leadingIcon?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-pill px-3 py-1.5 text-[12px] font-bold tracking-[0.04em] ${TONE_STYLE[tone]} ${className ?? ""}`}
    >
      {leadingIcon}
      {children}
    </span>
  );
}