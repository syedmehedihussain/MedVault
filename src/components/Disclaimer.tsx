// Inline medical disclaimer. Per the user's choice it's attached to each
// screen rather than living in a global footer.

export default function Disclaimer({
  variant = "subtle",
  className = "",
}: {
  variant?: "subtle" | "strong";
  className?: string;
}) {
  const tone =
    variant === "strong"
      ? "border-line bg-white text-ink-700"
      : "border-transparent text-ink-400";
  return (
    <p
      className={`text-[11px] leading-snug ${tone} ${className}`}
      role="note"
      aria-label="Medical disclaimer"
    >
      Not a medical device; does not provide medical advice.
    </p>
  );
}