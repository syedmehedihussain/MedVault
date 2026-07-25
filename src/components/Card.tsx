// Plain rounded card surface — the mockup's panels (white, 24px radius,
// subtle 1px line border, light shadow). Use this for any panel that
// needs the same elevation as the dashboard's "Records" section.

export default function Card({
  as: Tag = "div",
  className = "",
  children,
}: {
  as?: "div" | "section" | "article" | "li";
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Tag
      className={`rounded-3xl border border-line bg-white p-5 shadow-[var(--shadow-soft)] ${className}`}
    >
      {children}
    </Tag>
  );
}