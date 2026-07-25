// Round avatar with initials on a mint background. The mockup uses it
// for the dashboard greeting ("Sarah Doe" → "SD"). Falls back to "?" when
// no name is given.

export default function Avatar({
  name,
  size = 48,
}: {
  name?: string | null;
  size?: number;
}) {
  const initials = (name ?? "?")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
  return (
    <span
      className="grid place-items-center rounded-full bg-mint font-extrabold text-brand-600"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.36,
        letterSpacing: "-0.5px",
      }}
      aria-hidden={name ? undefined : "true"}
    >
      {initials || "?"}
    </span>
  );
}