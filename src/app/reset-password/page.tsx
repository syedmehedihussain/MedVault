"use client";

// Set-a-new-password screen, reached from the recovery email via
// /auth/confirm. By the time this renders the recovery link has already been
// exchanged for a real session, so updateUser() is all that's left.
//
// It lives outside the (authed) group deliberately: the layout there paints
// the full app shell (sidebar, record count), which is the wrong frame for
// someone who is mid-recovery and not yet "in" the app.

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createSupabaseBrowserClient } from "@/lib/supabaseClient";
import Logo from "@/components/Logo";
import Button from "@/components/Button";
import PasswordInput from "@/components/PasswordInput";
import Disclaimer from "@/components/Disclaimer";
import { Lock } from "@/components/icons";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [hasSession, setHasSession] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // A valid recovery session is the only thing that authorises this page.
  // Without it the form would fail on submit anyway, so we say so up front.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const supabase = createSupabaseBrowserClient();
      const { data } = await supabase.auth.getSession();
      if (cancelled) return;
      setHasSession(Boolean(data.session));
      setChecking(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setError(null);

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Those passwords don't match.");
      return;
    }

    setBusy(true);
    const supabase = createSupabaseBrowserClient();
    const { error: updateError } = await supabase.auth.updateUser({ password });

    if (updateError) {
      setError(updateError.message);
      setBusy(false);
      return;
    }

    router.replace("/dashboard");
    router.refresh();
  }

  return (
    <div className="grid min-h-[100dvh] place-items-center bg-canvas px-5 py-10">
      <div className="w-full max-w-sm">
        <Link href="/welcome" className="mb-8 inline-block">
          <Logo size="md" />
        </Link>

        <h1 className="text-2xl font-extrabold text-ink-900">
          Choose a new password
        </h1>

        {checking ? (
          <p className="mt-3 text-sm text-ink-400">Checking your link…</p>
        ) : !hasSession ? (
          <>
            <p className="mt-3 text-sm text-ink-500">
              This reset link is invalid or has expired. Request a fresh one and
              use it within the hour.
            </p>
            <Link href="/login" className="mt-6 inline-block">
              <Button size={60}>Back to sign in</Button>
            </Link>
          </>
        ) : (
          <>
            <p className="mt-2 text-sm text-ink-500">
              Pick something you haven&apos;t used before. You&apos;ll stay
              signed in on this device.
            </p>

            <form onSubmit={onSubmit} className="mt-7 space-y-4">
              <PasswordInput
                label="New password"
                required
                minLength={8}
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters"
                leadingIcon={<Lock size={16} />}
                disabled={busy}
              />
              <PasswordInput
                label="Confirm new password"
                required
                minLength={8}
                autoComplete="new-password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Type it again"
                leadingIcon={<Lock size={16} />}
                disabled={busy}
              />

              {error && (
                <p
                  role="alert"
                  className="rounded-2xl border border-blood-200 bg-blood-50 px-4 py-3 text-sm text-blood-700"
                >
                  {error}
                </p>
              )}

              <Button
                type="submit"
                size={60}
                disabled={busy}
                className="w-full"
              >
                {busy ? "Saving…" : "Save new password"}
              </Button>
            </form>
          </>
        )}

        <Disclaimer className="mt-10" />
      </div>
    </div>
  );
}
