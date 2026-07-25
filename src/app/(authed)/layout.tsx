import { redirect } from "next/navigation";
import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { getDashboardReports } from "@/lib/reports";
import Logo from "@/components/Logo";
import Avatar from "@/components/Avatar";
import EncryptedNotice from "@/components/EncryptedNotice";
import Disclaimer from "@/components/Disclaimer";
import { Home, ChartLine, Logout, Person } from "@/components/icons";
import SidebarLink from "@/components/SidebarLink";
import MobileTabBar from "@/components/MobileTabBar";

// Server-side auth gate. Anything inside the (authed) route group is rendered
// only when a valid Supabase session is present. Logged-out users are sent
// to /login by `redirect()` before any HTML is sent.
export default async function AuthedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Pull the latest report count so the sidebar can show a small badge.
  const { reports } = await getDashboardReports(user.id);
  const recordCount = reports.length;

  const displayName = (user.user_metadata?.full_name as string | undefined) ??
    user.email?.split("@")[0] ??
    "there";

  return (
    <div className="flex min-h-[100dvh] flex-col bg-canvas">
      {/* Desktop sidebar (≥lg). On mobile it's hidden and the bottom tab bar takes over. */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-line bg-white px-6 py-8 lg:flex lg:flex-col">
        <Link href="/dashboard" className="mb-10 block">
          <Logo size="md" />
        </Link>

        <div className="mb-8 flex items-center gap-3">
          <Avatar name={displayName} size={44} />
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-ink-900">
              {displayName}
            </p>
            <p className="truncate text-[11px] text-ink-500">{user.email}</p>
          </div>
        </div>

        <nav className="flex flex-col gap-1">
          <SidebarLink href="/dashboard" icon={<Home size={18} />}>
            Home
          </SidebarLink>
          <SidebarLink href="/trends" icon={<ChartLine size={18} />}>
            Trends
          </SidebarLink>
          <SidebarLink href="/profile" icon={<Person size={18} />}>
            Profile
          </SidebarLink>
        </nav>

        <div className="mt-8">
          <EncryptedNotice compact />
        </div>

        <div className="mt-auto pt-8">
          <form action="/api/auth/signout" method="post">
            <button
              type="submit"
              className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-ink-500 transition-colors hover:bg-mint hover:text-brand-700"
            >
              <Logout size={16} />
              Sign out
            </button>
          </form>
          <Disclaimer className="mt-4" />
        </div>
      </aside>

      {/* Mobile top bar (hidden on lg). */}
      <header className="sticky top-0 z-20 border-b border-line bg-white/90 px-4 py-3 backdrop-blur lg:hidden">
        <div className="mx-auto flex max-w-screen-sm items-center justify-between">
          <Link href="/dashboard">
            <Logo size="sm" />
          </Link>
          <Avatar name={displayName} size={36} />
        </div>
      </header>

      {/* Main content. On desktop it has padding-left to make room for the sidebar. */}
      <main className="flex-1 lg:pl-64">
        <div className="mx-auto w-full max-w-screen-sm px-5 py-6 lg:max-w-3xl lg:px-10 lg:py-10">
          {children}
        </div>
      </main>

      {/* Mobile bottom tab bar (hidden on lg). */}
      <MobileTabBar />

      {/* Hidden SSR marker so the record count is available to client nav without a re-fetch. */}
      <span className="sr-only" data-record-count={recordCount} />
    </div>
  );
}
