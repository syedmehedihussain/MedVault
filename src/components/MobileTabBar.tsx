"use client";

// Mobile bottom tab bar. Mirrors the desktop sidebar for the three nav
// destinations used in the mockup. Hidden on lg.

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ChartLine, Person } from "./icons";

const tabs = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/trends", label: "Trends", icon: ChartLine },
  { href: "/profile", label: "Profile", icon: Person },
] as const;

export default function MobileTabBar() {
  const pathname = usePathname() ?? "";
  return (
    <nav
      aria-label="Primary"
      className="sticky bottom-0 z-20 grid grid-cols-3 border-t border-line bg-white/95 px-2 pb-[max(env(safe-area-inset-bottom),0.5rem)] pt-2 backdrop-blur lg:hidden"
    >
      {tabs.map(({ href, label, icon: Icon }) => {
        const active =
          pathname === href || pathname.startsWith(href + "/");
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={`flex flex-col items-center gap-1 rounded-xl py-2 text-[11px] font-semibold transition-colors ${
              active ? "text-brand-600" : "text-ink-400"
            }`}
          >
            <span
              className={`grid h-9 w-9 place-items-center rounded-xl ${
                active ? "bg-mint" : ""
              }`}
            >
              <Icon size={20} />
            </span>
            {label}
          </Link>
        );
      })}
    </nav>
  );
}