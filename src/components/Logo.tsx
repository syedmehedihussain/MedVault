// MedVault logo — a teal rounded square with a white "+" glyph, paired
// with the wordmark. Used on the landing page, the auth screens, and the
// authed sidebar. Size scales the tile from 34px (small inline) to 44px
// (auth screens).

import type { CSSProperties } from "react";

type LogoSize = "sm" | "md" | "lg";

const SIZE_MAP: Record<LogoSize, { tile: number; wordmark: string; plus: number }> = {
  sm: { tile: 28, wordmark: "text-[15px]", plus: 14 },
  md: { tile: 36, wordmark: "text-[19px]", plus: 18 },
  lg: { tile: 44, wordmark: "text-[26px]", plus: 22 },
};

export default function Logo({
  size = "md",
  showWordmark = true,
  className,
  style,
}: {
  size?: LogoSize;
  showWordmark?: boolean;
  className?: string;
  style?: CSSProperties;
}) {
  const { tile, wordmark, plus } = SIZE_MAP[size];
  return (
    <span
      className={`inline-flex items-center gap-2 ${className ?? ""}`}
      style={style}
    >
      <span
        aria-hidden="true"
        className="grid place-items-center rounded-[10px] bg-brand-500 text-white"
        style={{
          width: tile,
          height: tile,
          boxShadow: "var(--shadow-logo)",
        }}
      >
        <svg
          width={plus}
          height={plus}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={3.2}
          strokeLinecap="round"
        >
          <path d="M12 5v14M5 12h14" />
        </svg>
      </span>
      {showWordmark && (
        <span
          className={`font-extrabold tracking-tight text-ink-900 ${wordmark}`}
          style={{ letterSpacing: "-0.4px" }}
        >
          MedVault
        </span>
      )}
    </span>
  );
}
