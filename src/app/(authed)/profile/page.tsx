// Profile / account screen. Simple settings page so the sidebar nav
// lands somewhere real, with Sign out and Delete account controls.

import { redirect } from "next/navigation";
import { Logout } from "@/components/icons";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { getDashboardReports } from "@/lib/reports";
import Avatar from "@/components/Avatar";
import Card from "@/components/Card";
import Disclaimer from "@/components/Disclaimer";
import EncryptedNotice from "@/components/EncryptedNotice";
import DeleteAccountDialog from "@/components/DeleteAccountDialog";
import ChangePasswordForm from "@/components/ChangePasswordForm";

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

      <section>
        <Card>
          <h2 className="text-xs font-bold uppercase tracking-[0.18em] text-brand-600">
            Account
          </h2>
          <p className="mt-3 text-sm text-ink-900">
            Change your password, sign out of this device, or permanently delete
            your account and every report stored under it.
          </p>

          <div className="mt-5 flex flex-col gap-4">
            <ChangePasswordForm />

            <form action="/api/auth/signout" method="post">
              <button
                type="submit"
                className="flex w-full items-center gap-2 rounded-xl border border-line bg-white px-4 py-3 text-sm font-bold text-ink-900 transition-colors hover:bg-mint-page"
              >
                <Logout size={18} />
                Sign out
              </button>
            </form>

            <div className="rounded-2xl border border-blood-200 bg-blood-50/60 p-4">
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-blood-700">
                Danger zone
              </p>
              <p className="mt-2 text-sm text-ink-700">
                Deleting your account removes every report file from storage and
                erases your account record. This cannot be undone.
              </p>
              <div className="mt-4">
                <DeleteAccountDialog />
              </div>
            </div>
          </div>
        </Card>
      </section>

      <Disclaimer className="mt-4" />
    </div>
  );
}