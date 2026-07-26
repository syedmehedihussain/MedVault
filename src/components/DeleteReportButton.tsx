"use client";

// Delete control for a single report, shown in the detail header.
//
// One confirmation step, not the two-step password + CONFIRM ceremony the
// account dialog uses: this removes one record, not the whole vault. The
// dialog still names the report being deleted so a mis-click on the wrong
// row is obvious before it is irreversible.

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Trash, AlertTriangle } from "@/components/icons";
import Button from "@/components/Button";

export default function DeleteReportButton({
  reportId,
  reportTitle,
}: {
  reportId: string;
  reportTitle: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  // Escape to dismiss; focus lands on the safe action (Cancel) rather than
  // the destructive one, so a stray Enter cannot delete anything.
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        close();
      }
    }
    window.addEventListener("keydown", onKey);
    dialogRef.current?.querySelector<HTMLButtonElement>("button")?.focus();
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  function close() {
    if (busy) return;
    setOpen(false);
    setError(null);
    requestAnimationFrame(() => triggerRef.current?.focus());
  }

  async function confirmDelete() {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/reports/${reportId}`, { method: "DELETE" });
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
      };

      if (!res.ok || !data.ok) {
        setError(data.error ?? "Could not delete this report. Please try again.");
        setBusy(false);
        return;
      }

      // Leave the now-dead detail route, then refresh so the dashboard list
      // and its "N total" count reflect the deletion instead of serving the
      // cached RSC payload.
      router.replace("/dashboard");
      router.refresh();
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
        className="inline-flex shrink-0 items-center gap-2 rounded-2xl border border-line bg-white px-4 py-2.5 text-sm font-semibold text-ink-500 transition-colors hover:border-blood-200 hover:bg-blood-50 hover:text-blood-700"
      >
        <Trash size={16} />
        Delete
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-report-title"
        >
          <button
            type="button"
            aria-label="Close delete report dialog"
            onClick={close}
            className="absolute inset-0 bg-ink-900/40 backdrop-blur-sm"
          />

          <div
            ref={dialogRef}
            role="document"
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md overflow-hidden rounded-3xl border border-line bg-white shadow-[var(--shadow-card-hover)]"
          >
            <div className="border-b border-line bg-blood-50 px-6 py-4">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white text-blood-600">
                  <AlertTriangle size={20} />
                </span>
                <div className="min-w-0">
                  <h2
                    id="delete-report-title"
                    className="text-base font-extrabold text-blood-700"
                  >
                    Delete this report?
                  </h2>
                  <p className="truncate text-xs text-blood-700/80">
                    {reportTitle}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-5 px-6 py-6">
              <p className="text-sm text-ink-700">
                This permanently removes the record and its original scan from
                your vault. It cannot be undone.
              </p>

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
                  type="button"
                  onClick={confirmDelete}
                  disabled={busy}
                  className="inline-flex h-[58px] items-center justify-center gap-2 rounded-2xl bg-blood-600 px-6 text-[16px] font-bold leading-none tracking-tight text-white shadow-[var(--shadow-button)] transition-colors hover:bg-blood-700 active:bg-blood-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {busy ? "Deleting..." : "Delete report"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
