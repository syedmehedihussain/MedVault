"use client";

import { Suspense, useState, useEffect, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createSupabaseBrowserClient } from "@/lib/supabaseClient";
import Logo from "@/components/Logo";
import Button from "@/components/Button";
import Input from "@/components/Input";
import PasswordInput from "@/components/PasswordInput";
import EncryptedNotice from "@/components/EncryptedNotice";
import Disclaimer from "@/components/Disclaimer";
import { Lock, Camera } from "@/components/icons";

type Mode = "signin" | "signup" | "reset";

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginFallback />}>
      <LoginForm />
    </Suspense>
  );
}

function LoginFallback() {
  return (
    <div className="grid min-h-screen place-items-center bg-mint-page text-ink-300">
      Loading…
    </div>
  );
}

function LoginForm() {
  const router = useRouter();
  const search = useSearchParams();
  const initialMode: Mode = search.get("mode") === "signup" ? "signup" : "signin";
  const [mode, setMode] = useState<Mode>(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  // Seeded from ?error=, which is how /auth/confirm reports an expired or
  // already-used recovery link. Derived once at mount rather than in an
  // effect, so submitting the form clears it for good.
  const [error, setError] = useState<string | null>(search.get("error"));
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Keep the URL in sync so the segmented control reflects the actual page.
  // "reset" is a transient sub-state of sign-in, not a third tab, so it
  // doesn't get its own URL mode.
  useEffect(() => {
    if (mode === "reset") return;
    const url = new URL(window.location.href);
    url.searchParams.set("mode", mode);
    window.history.replaceState({}, "", url.toString());
  }, [mode]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (mode === "reset") {
      if (!email.trim()) {
        setError("Enter the email address on your account.");
        return;
      }
      startTransition(async () => {
        const supabase = createSupabaseBrowserClient();
        // `next` is where /auth/confirm sends the user once the recovery
        // token has been turned into a session.
        const redirectTo = `${window.location.origin}/auth/confirm?next=/reset-password`;
        const { error } = await supabase.auth.resetPasswordForEmail(
          email.trim(),
          { redirectTo },
        );
        if (error) {
          setError(error.message);
          return;
        }
        // Deliberately not revealing whether the address has an account.
        setMessage(
          "If that email has an account, a reset link is on its way. It expires in one hour.",
        );
      });
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    startTransition(async () => {
      const supabase = createSupabaseBrowserClient();
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) {
          setError(error.message);
          return;
        }
        const { data } = await supabase.auth.getSession();
        if (data.session) {
          router.replace("/dashboard");
          router.refresh();
        } else {
          setMessage(
            "Account created. Check your email to confirm, then sign in.",
          );
          setMode("signin");
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) {
          setError(error.message);
          return;
        }
        router.replace("/dashboard");
        router.refresh();
      }
    });
  };

  return (
    <div className="flex min-h-[100dvh] flex-col bg-canvas lg:flex-row">
      {/* LEFT — Hero panel (mirrors /welcome). */}
      <aside className="relative flex flex-col justify-between overflow-hidden bg-mint px-6 py-10 lg:basis-[45%] lg:px-14 lg:py-16">
        <Link href="/welcome">
          <Logo size="md" />
        </Link>

        <div className="relative z-10 mt-12 max-w-sm lg:mt-0">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-600">
            One quiet place for health
          </p>
          <h1 className="mt-3 text-3xl font-extrabold leading-tight text-ink-900 lg:text-4xl">
            Sign in to <span className="text-brand-600">your records.</span>
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-ink-500">
            Pick up where you left off — every report, every value, every
            image, all from your last visit.
          </p>

          <div className="mt-8 hidden lg:block">
            <EncryptedNotice />
          </div>
        </div>

        <div className="mt-12 flex items-center gap-3 rounded-2xl bg-white/70 p-4 text-xs text-ink-500 lg:hidden">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-mint text-brand-600">
            <Camera size={16} />
          </span>
          <p>OcardiSnap a photo, find it instantly. Your phone, your rules.</p>
        </div>

        <Disclaimer className="hidden lg:block" variant="strong" />
      </aside>

      {/* RIGHT — Form card. */}
      <section className="flex flex-1 items-center justify-center px-5 py-10 lg:px-12">
        <div className="w-full max-w-sm">
          <h2 className="text-2xl font-extrabold text-ink-900">
            {mode === "signin"
              ? "Welcome back"
              : mode === "signup"
                ? "Create your account"
                : "Reset your password"}
          </h2>
          <p className="mt-2 text-sm text-ink-500">
            {mode === "signin"
              ? "Sign in to access your records."
              : mode === "signup"
                ? "Set up your private vault in under a minute."
                : "We'll email you a link to choose a new password."}
          </p>

          {/* Segmented control */}
          <div
            role="tablist"
            aria-label="Authentication mode"
            className="mt-7 grid grid-cols-2 rounded-full bg-white p-1 ring-1 ring-line"
          >
            {(["signin", "signup"] as Mode[]).map((m) => (
              <button
                key={m}
                role="tab"
                // Reset is a detour off sign-in, so sign-in stays the
                // highlighted tab while the user is in it.
                aria-selected={mode === m || (mode === "reset" && m === "signin")}
                type="button"
                onClick={() => {
                  setMode(m);
                  setError(null);
                  setMessage(null);
                }}
                className={`rounded-full py-2 text-sm font-semibold transition-colors ${
                  mode === m || (mode === "reset" && m === "signin")
                    ? "bg-brand-500 text-white shadow-[var(--shadow-button)]"
                    : "text-ink-500 hover:text-ink-900"
                }`}
              >
                {m === "signin" ? "Sign in" : "Sign up"}
              </button>
            ))}
          </div>

          <form onSubmit={onSubmit} className="mt-7 space-y-4">
            <Input
              label="Email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
            {mode !== "reset" && (
              <div>
                <PasswordInput
                  label="Password"
                  required
                  minLength={8}
                  autoComplete={
                    mode === "signin" ? "current-password" : "new-password"
                  }
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  leadingIcon={<Lock size={16} />}
                />
                {mode === "signin" && (
                  <button
                    type="button"
                    onClick={() => {
                      setMode("reset");
                      setPassword("");
                      setError(null);
                      setMessage(null);
                    }}
                    className="mt-2 text-sm font-semibold text-brand-600 transition-colors hover:text-brand-700"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
            )}

            {error && (
              <p
                role="alert"
                className="rounded-2xl border border-blood-200 bg-blood-50 px-4 py-3 text-sm text-blood-700"
              >
                {error}
              </p>
            )}
            {message && (
              <p
                role="status"
                className="rounded-2xl border border-brand-200 bg-mint px-4 py-3 text-sm text-brand-700"
              >
                {message}
              </p>
            )}

            <Button
              type="submit"
              size={60}
              disabled={isPending}
              className="w-full"
            >
              {isPending
                ? "Working…"
                : mode === "signin"
                  ? "Sign in"
                  : mode === "signup"
                    ? "Create account"
                    : "Email me a reset link"}
            </Button>

            {mode === "reset" && (
              <button
                type="button"
                onClick={() => {
                  setMode("signin");
                  setError(null);
                  setMessage(null);
                }}
                className="w-full text-center text-sm font-semibold text-ink-500 transition-colors hover:text-ink-900"
              >
                Back to sign in
              </button>
            )}
          </form>

          <div className="mt-6 lg:hidden">
            <EncryptedNotice compact />
          </div>

          <p className="mt-8 text-center text-[11px] text-ink-400">
            By continuing you agree to keep your records private. MedVault is
            not a medical device.
          </p>
        </div>
      </section>
    </div>
  );
}
