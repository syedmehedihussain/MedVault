"use client";

// "+ Add new report" pill from mockup 03. Click → file picker → upload
// to /api/reports/upload → on success, redirect to /reports/<id>/processing
// where the user watches the AI extract fields. Background refreshes the
// dashboard so the new card appears next visit.

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Button from "./Button";
import { Camera, Spinner } from "./icons";

const ACCEPT = "image/jpeg,image/png";

export default function UploadButton() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const upload = (file: File) => {
    setError(null);

    if (!["image/jpeg", "image/png"].includes(file.type)) {
      setError("Only JPG or PNG files are supported.");
      return;
    }

    const form = new FormData();
    form.append("file", file);

    startTransition(async () => {
      const res = await fetch("/api/reports/upload", {
        method: "POST",
        body: form,
      });

      if (!res.ok) {
        let message = `Upload failed (${res.status})`;
        try {
          const j = await res.json();
          if (j?.error) message = j.error;
        } catch {
          /* non-JSON error body */
        }
        setError(message);
        return;
      }

      const body = (await res.json().catch(() => null)) as {
        reportId?: string;
      } | null;
      if (body?.reportId) {
        router.push(`/reports/${body.reportId}/processing`);
      } else {
        router.refresh();
      }
    });
  };

  return (
    <div className="flex flex-col gap-2">
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) upload(f);
          e.target.value = "";
        }}
      />
      <Button
        size="lg"
        onClick={() => inputRef.current?.click()}
        disabled={isPending}
        className="w-full sm:w-auto"
      >
        {isPending ? (
          <>
            <Spinner size={18} className="mr-2 animate-spin" />
            Uploading…
          </>
        ) : (
          <>
            <Camera size={18} className="mr-2" />
            Add new report
          </>
        )}
      </Button>
      {error && (
        <p className="rounded-2xl border border-blood-200 bg-blood-50 px-4 py-2 text-sm text-blood-700">
          {error}
        </p>
      )}
    </div>
  );
}