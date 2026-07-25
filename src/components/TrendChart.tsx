// Pure-SVG line chart for a single test across multiple reports. No
// external chart library — keeps the bundle slim and the look on-brand.

type Point = { iso: string; value: number; unit: string; range: string };

export default function TrendChart({
  test,
  unit,
  range,
  points,
}: {
  test: string;
  unit: string;
  range: string;
  points: Point[];
}) {
  const width = 480;
  const height = 140;
  const padding = { left: 36, right: 16, top: 16, bottom: 28 };

  const values = points.map((p) => p.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range_ = max - min || 1;
  const lo = min - range_ * 0.2;
  const hi = max + range_ * 0.2;

  const xStep = (width - padding.left - padding.right) / Math.max(points.length - 1, 1);
  const xAt = (i: number) => padding.left + i * xStep;
  const yAt = (v: number) =>
    height - padding.bottom - ((v - lo) / (hi - lo)) * (height - padding.top - padding.bottom);

  // Build the polyline path.
  const path = points
    .map((p, i) => `${i === 0 ? "M" : "L"}${xAt(i)},${yAt(p.value)}`)
    .join(" ");

  // Y-axis ticks (3 evenly spaced).
  const ticks = [0, 0.5, 1].map((t) => lo + (hi - lo) * t);

  const trend =
    points[points.length - 1].value - points[0].value > 0
      ? "up"
      : points[points.length - 1].value - points[0].value < 0
      ? "down"
      : "flat";

  const trendColor =
    trend === "up" ? "text-blood-600" : trend === "down" ? "text-brand-600" : "text-ink-500";

  return (
    <article className="rounded-3xl border border-line bg-white p-5 shadow-[var(--shadow-soft)]">
      <header className="mb-4 flex items-baseline justify-between gap-3">
        <div>
          <h3 className="text-base font-extrabold text-ink-900">{test}</h3>
          <p className="text-xs text-ink-500">
            {unit && `Unit: ${unit}`}
            {range && ` · Normal: ${range}`}
          </p>
        </div>
        <span className={`text-xs font-bold ${trendColor}`}>
          {trend === "up" ? "▲ trending up" : trend === "down" ? "▼ trending down" : "→ stable"}
        </span>
      </header>

      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full"
        role="img"
        aria-label={`Chart of ${test} over ${points.length} readings`}
      >
        {/* Y-axis grid lines */}
        {ticks.map((v, i) => (
          <g key={i}>
            <line
              x1={padding.left}
              x2={width - padding.right}
              y1={yAt(v)}
              y2={yAt(v)}
              stroke="#EAE5DC"
              strokeWidth={1}
            />
            <text
              x={padding.left - 8}
              y={yAt(v) + 4}
              fontSize="10"
              textAnchor="end"
              fill="#9A9388"
            >
              {Number.isInteger(v) ? v : v.toFixed(1)}
            </text>
          </g>
        ))}

        {/* Line */}
        <path
          d={path}
          fill="none"
          stroke="#0E9C90"
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Points */}
        {points.map((p, i) => (
          <g key={i}>
            <circle
              cx={xAt(i)}
              cy={yAt(p.value)}
              r={5}
              fill="#0E9C90"
              stroke="white"
              strokeWidth={2}
            />
            <text
              x={xAt(i)}
              y={height - padding.bottom + 14}
              fontSize="10"
              textAnchor="middle"
              fill="#9A9388"
            >
              {p.iso.slice(5)}
            </text>
          </g>
        ))}
      </svg>
    </article>
  );
}