"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

// Drag-and-drop + click-to-pick upload button.
//
// Shows a clear loading state while Gemini reads the image, then refreshes
// the dashboard so the new card appears. Surfaces server errors inline so a
// failed AI call doesn't look like a lost upload.

const ACCEPT = "image/jpeg,image/png";

export default function UploadButton() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

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

      router.refresh();
    });
  };

  return (
    <div className="flex flex-col gap-2">
      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          const f = e.dataTransfer.files?.[0];
          if (f) upload(f);
        }}
        className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-10 text-center transition-colors ${
          dragOver
            ? "border-zinc-900 bg-zinc-100"
            : "border-zinc-300 bg-white hover:border-zinc-500"
        }`}
      >
        <p className="text-sm font-medium text-zinc-900">
          {isPending ? "Reading the report…" : "Upload a report"}
        </p>
        <p className="mt-1 text-xs text-zinc-500">
          Drop a JPG or PNG here, or click to pick a file.
        </p>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT}
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) upload(f);
            // Reset so picking the same file again still fires onChange.
            e.target.value = "";
          }}
        />
      </div>
      {error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}