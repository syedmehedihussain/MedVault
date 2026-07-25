"use client";

// Sidebar nav row. Auto-highlights when its href matches the current
// pathname so the user always knows where they are.

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight } from "./icons";

export default function SidebarLink({
  href,
  icon,
  children,
}: {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  const pathname = usePathname() ?? "";
  const active =
    pathname === href ||
    (href !== "/" && pathname.startsWith(href + "/"));
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`group flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors ${
        active
          ? "bg-mint text-brand-700"
          : "text-ink-700 hover:bg-canvas"
      }`}
    >
      <span className="flex items-center gap-3">
        <span
          className={`grid h-7 w-7 place-items-center rounded-lg ${
            active ? "bg-white text-brand-600 shadow-[var(--shadow-logo)]" : "text-ink-400"
          }`}
        >
          {icon}
        </span>
        {children}
      </span>
      {active ? <ChevronRight size={14} /> : null}
    </Link>
  );
}