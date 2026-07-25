// The hero illustration used on the welcome screen, the landing page, and
// the empty state. Two tilted white "page" cards on a mint-to-cream
// gradient, plus a teal circle containing either a shield-check (welcome
// / landing) or a plus (empty state). The mockup uses the same motif at
// three sizes: 250px (mobile welcome), 300px (desktop landing), 180px
// (empty state). The orange flourish square is purely decorative.

import { ShieldCheckIcon, PlusIcon } from "./icons";

export default function HeroIllustration({
  size = 250,
  variant = "shield",
  className,
}: {
  size?: number;
  variant?: "shield" | "plus";
  className?: string;
}) {
  const r = size / 2;
  // Scale knob: the inner card positions are tuned for size=250 and scale
  // linearly with the prop.
  const inner = size / 250; // 0.72 for 180, 1.0 for 250, 1.2 for 300
  return (
    <div
      aria-hidden="true"
      className={`relative mv-hero-gradient ${className ?? ""}`}
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.16,
      }}
    >
      {/* Tilted white page cards */}
      <div
        className="absolute rounded-[10px] bg-white"
        style={{
          width: 50 * inner,
          height: 64 * inner,
          left: 30 * inner,
          top: 50 * inner,
          transform: "rotate(-9deg)",
          boxShadow: "var(--shadow-page)",
        }}
      />
      <div
        className="absolute rounded-[10px] bg-white"
        style={{
          width: 50 * inner,
          height: 64 * inner,
          left: 60 * inner,
          top: 38 * inner,
          transform: "rotate(7deg)",
          boxShadow: "var(--shadow-page)",
        }}
      />

      {/* Teal circle */}
      <div
        className="absolute grid place-items-center rounded-full bg-brand-500 text-white"
        style={{
          width: r * 0.78,
          height: r * 0.78,
          right: 32 * inner,
          bottom: 32 * inner,
          boxShadow: "var(--shadow-shield)",
        }}
      >
        {variant === "shield" ? (
          <ShieldCheckIcon
            className="text-white"
            strokeWidth={2.2}
            style={{ width: r * 0.42, height: r * 0.42 }}
          />
        ) : (
          <PlusIcon
            className="text-white"
            strokeWidth={3}
            style={{ width: r * 0.44, height: r * 0.44 }}
          />
        )}
      </div>

      {/* Orange flourish square */}
      <div
        className="absolute rounded-[6px]"
        style={{
          width: 22 * inner,
          height: 22 * inner,
          right: 38 * inner,
          top: 38 * inner,
          background: "var(--color-flourish)",
          transform: "rotate(8deg)",
        }}
      />
    </div>
  );
}
