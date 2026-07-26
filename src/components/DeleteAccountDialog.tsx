"use client";

// Delete-account confirmation modal. Two-step:
//   1. Click the trigger button on the profile page.
//   2. Type the user's password AND the literal word CONFIRM, then submit.
//
// On success the API returns a redirect URL; we navigate the browser to it
// (which clears any stale UI state, e.g. the (authed) layout).
//
// The dialog renders as a fixed overlay with a click-outside / Escape handler
// so users can bail out without typing anything.

import { useEffect, useRef, useState } from "react";
import { AlertTriangle, Lock } from "@/components/icons";
import Input from "@/components/Input";
import Button from "@/components/Button";

export default function DeleteAccountDialog() {
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  // Close on Escape, return focus to trigger on close.
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        close();
      }
    }
    window.addEventListener("keydown", onKey);
    // Move focus into the dialog for keyboard users.
    dialogRef.current?.querySelector<HTMLInputElement>("input")?.focus();
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  function reset() {
    setPassword("");
    setConfirm("");
    setError(null);
    setBusy(false);
  }

  function close() {
    setOpen(false);
    reset();
    // Restore focus to the trigger after the dialog unmounts.
    requestAnimationFrame(() => triggerRef.current?.focus());
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setError(null);

    if (confirm.trim() !== "CONFIRM") {
      setError('Type the word CONFIRM (in capitals) exactly to continue.');
      return;
    }
    if (!password) {
      setError("Please enter your password.");
      return;
    }

    setBusy(true);
    try {
      const res = await fetch("/api/auth/delete-account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, confirm }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
        redirect?: string;
      };

      if (!res.ok || !data.ok) {
        setError(data.error ?? "Could not delete your account. Please try again.");
        setBusy(false);
        return;
      }

      // Account gone — navigate to the public welcome screen.
      window.location.href = data.redirect ?? "/welcome";
      // Note: we intentionally don't clear local state here. The page will
      // unload on the navigation above.
    } catch {
      setError("Network error. Please check your connection and try again.");
      setBusy(false);
    }
  }

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(true)}
        className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-blood-600 transition-colors hover:bg-blood-50 hover:text-blood-700"
      >
        <AlertTriangle size={16} />
        Delete account
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-account-title"
        >
          {/* Backdrop. Clicking it closes the dialog. */}
          <button
            type="button"
            aria-label="Close delete account dialog"
            onClick={close}
            className="absolute inset-0 bg-ink-900/40 backdrop-blur-sm"
          />

          {/* Dialog body. stopPropagation so clicks inside don't dismiss. */}
          <div
            ref={dialogRef}
            role="document"
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md overflow-hidden rounded-3xl border border-line bg-white shadow-[var(--shadow-soft)]"
          >
            <div className="border-b border-line bg-blood-50 px-6 py-4">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-blood-600 shadow-[var(--shadow-soft)]">
                  <AlertTriangle size={20} />
                </span>
                <div>
                  <h2
                    id="delete-account-title"
                    className="text-base font-extrabold text-blood-700"
                  >
                    Delete your account
                  </h2>
                  <p className="text-xs text-blood-700/80">
                    This permanently removes every report you&apos;ve stored.
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={submit} className="flex flex-col gap-5 px-6 py-6">
              <div className="rounded-2xl border border-blood-200 bg-white p-4 text-sm text-ink-700">
                <p className="font-semibold text-ink-900">This will:</p>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-ink-500">
                  <li>Delete every report file in your vault.</li>
                  <li>Delete your account record and email.</li>
                  <li>
                    Free up your email so it can be used to sign up again.
                  </li>
                </ul>
                <p className="mt-3 text-xs font-medium text-blood-700">
                  This cannot be undone.
                </p>
              </div>

              <Input
                label="Your password"
                type="password"
                autoComplete="current-password"
                placeholder="Enter your password"
                leadingIcon={<Lock size={18} />}
                value={password}
                onChange={(e) => setPassword(e.currentTarget.value)}
                disabled={busy}
                required
              />

              <div>
                <label
                  htmlFor="delete-confirm"
                  className="mb-2 block text-xs font-bold uppercase tracking-[0.12em] text-ink-500"
                >
                  Type CONFIRM to continue
                </label>
                <input
                  id="delete-confirm"
                  type="text"
                  autoComplete="off"
                  spellCheck={false}
                  placeholder="CONFIRM"
                  value={confirm}
                  onChange={(e) => setConfirm(e.currentTarget.value)}
                  disabled={busy}
                  className="h-14 w-full rounded-2xl border border-line-input bg-white px-4 text-[15px] tracking-wider text-ink-900 placeholder:text-ink-400 focus:border-blood-500 focus:outline-none focus:ring-2 focus:ring-blood-500/20"
                />
              </div>

              {error && (
                <p
                  role="alert"
                  className="rounded-2xl border border-blood-200 bg-blood-50 px-4 py-3 text-sm text-blood-700"
                >
                  {error}
                </p>
              )}

              <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <Button
                  type="button"
                  variant="secondary"
                  size="md"
                  onClick={close}
                  disabled={busy}
                >
                  Cancel
                </Button>
                <button
                  type="submit"
                  disabled={busy}
                  className="inline-flex h-[58px] items-center justify-center gap-2 rounded-2xl bg-blood-600 px-6 text-[16px] font-bold leading-none tracking-tight text-white shadow-[var(--shadow-button)] transition-colors hover:bg-blood-700 active:bg-blood-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {busy ? "Deleting..." : "Delete my account"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

