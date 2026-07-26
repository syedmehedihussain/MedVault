"use client";

// Change-password control for the profile page. Collapsed to a single button
// until opened, so the Account card doesn't lead with three password fields
// for the common case of someone just signing out.
//
// The current password is verified server-side by /api/auth/change-password;
// the check here is only about catching typos before a round-trip.

import { useState } from "react";
import { Lock } from "@/components/icons";
import PasswordInput from "@/components/PasswordInput";
import Button from "@/components/Button";

export default function ChangePasswordForm() {
  const [open, setOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  function reset() {
    setCurrentPassword("");
    setNewPassword("");
    setConfirm("");
    setError(null);
    setBusy(false);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setError(null);
    setDone(false);

    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirm) {
      setError("Those passwords don't match.");
      return;
    }

    setBusy(true);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
      };

      if (!res.ok || !data.ok) {
        setError(data.error ?? "Could not change your password. Please try again.");
        setBusy(false);
        return;
      }

      reset();
      setOpen(false);
      setDone(true);
    } catch {
      setError("Network error. Please check your connection and try again.");
      setBusy(false);
    }
  }

  if (!open) {
    return (
      <div>
        <button
          type="button"
          onClick={() => {
            setOpen(true);
            setDone(false);
          }}
          className="flex w-full items-center gap-2 rounded-xl border border-line bg-white px-4 py-3 text-sm font-bold text-ink-900 transition-colors hover:bg-mint-page"
        >
          <Lock size={18} />
          Change password
        </button>
        {done && (
          <p
            role="status"
            className="mt-3 rounded-2xl border border-brand-200 bg-mint px-4 py-3 text-sm text-brand-700"
          >
            Password updated. Use it next time you sign in.
          </p>
        )}
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="flex flex-col gap-4 rounded-2xl border border-line bg-white p-4"
    >
      <div className="flex items-center gap-2 text-sm font-bold text-ink-900">
        <Lock size={18} />
        Change password
      </div>

      <PasswordInput
        label="Current password"
        required
        autoComplete="current-password"
        value={currentPassword}
        onChange={(e) => setCurrentPassword(e.target.value)}
        placeholder="Your current password"
        disabled={busy}
      />
      <PasswordInput
        label="New password"
        required
        minLength={8}
        autoComplete="new-password"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        placeholder="At least 8 characters"
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

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => {
            reset();
            setOpen(false);
          }}
          disabled={busy}
        >
          Cancel
        </Button>
        <Button type="submit" size="sm" disabled={busy}>
          {busy ? "Saving…" : "Save password"}
        </Button>
      </div>
    </form>
  );
}
