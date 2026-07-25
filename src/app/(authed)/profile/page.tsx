// Profile / account screen. Simple settings page so the sidebar nav
// lands somewhere real.

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { getDashboardReports } from "@/lib/reports";
import Avatar from "@/components/Avatar";
import Card from "@/components/Card";
import Disclaimer from "@/components/Disclaimer";
import EncryptedNotice from "@/components/EncryptedNotice";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { reports } = await getDashboardReports(user.id);

  const displayName = (user.user_metadata?.full_name as string | undefined) ??
    user.email?.split("@")[0] ??
    "there";
  const memberSince = new Date(user.created_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
  });

  return (
    <div className="flex flex-col gap-8">
      <header className="flex items-center gap-5">
        <Avatar name={displayName} size={72} />
        <div>
          <h1 className="text-2xl font-extrabold text-ink-900">{displayName}</h1>
          <p className="mt-1 text-sm text-ink-500">{user.email}</p>
          <p className="mt-1 text-xs text-ink-400">Member since {memberSince}</p>
        </div>
      </header>

      <section className="grid gap-4 sm:grid-cols-2">
        <Card>
          <h2 className="text-xs font-bold uppercase tracking-[0.18em] text-brand-600">
            Vault
          </h2>
          <p className="mt-3 text-3xl font-extrabold text-ink-900">{reports.length}</p>
          <p className="text-sm text-ink-500">reports stored securely</p>
        </Card>
        <Card>
          <h2 className="text-xs font-bold uppercase tracking-[0.18em] text-brand-600">
            Encryption
          </h2>
          <p className="mt-3 text-sm text-ink-900">
            Every file is stored privately in a Supabase bucket and served via
            short-lived signed URLs.
          </p>
          <div className="mt-4">
            <EncryptedNotice compact />
          </div>
        </Card>
      </section>

      <Disclaimer className="mt-4" />
    </div>
  );
}