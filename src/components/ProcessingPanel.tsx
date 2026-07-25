"use client";

// Animated pulse + heartbeat spinner shown while Gemini reads the report.
// Polls /api/reports/<id>/status every 1.5s and redirects to the detail
// page the moment extraction_status flips to "done". If we never receive
// a "done" within MAX_POLLS, we still send the user to the detail page
// (the row will just show "Read pending" — D6 fallback).

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, Check } from "./icons";

const POLL_MS = 1500;
const MAX_POLLS = 60; // 90s ceiling — matches Gemini free tier usual latency.

const STEPS = [
  "Reading the original image",
  "Locating report header",
  "Extracting each test value",
  "Matching normal ranges",
  "Saving to your vault",
];

export default function ProcessingPanel({
  reportId,
  hintType,
}: {
  reportId: string;
  hintType: string | null;
}) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [polls, setPolls] = useState(0);

  // Cycle through the visual steps every ~2s for a sense of progress.
  useEffect(() => {
    const t = window.setInterval(() => {
      setStep((s) => (s + 1) % STEPS.length);
    }, 2000);
    return () => window.clearInterval(t);
  }, []);

  // Poll status endpoint. When done, redirect.
  useEffect(() => {
    let cancelled = false;
    let attempts = 0;

    const tick = async () => {
      if (cancelled) return;
      attempts += 1;
      setPolls(attempts);
      try {
        const res = await fetch(`/api/reports/${reportId}/status`, {
          cache: "no-store",
        });
        if (res.ok) {
          const body = (await res.json()) as { status?: string };
          if (body.status === "done") {
            router.replace(`/reports/${reportId}`);
            return;
          }
        }
      } catch {
        /* network blip — keep polling */
      }
      if (attempts >= MAX_POLLS) {
        // Give up gracefully — D6: never let the user lose the report.
        router.replace(`/reports/${reportId}`);
        return;
      }
      window.setTimeout(tick, POLL_MS);
    };

    window.setTimeout(tick, POLL_MS);
    return () => {
      cancelled = true;
    };
  }, [reportId, router]);

  return (
    <div className="flex max-w-md flex-col items-center text-center">
      {/* Pulse ring */}
      <div className="relative mb-8 grid h-32 w-32 place-items-center">
        <span className="absolute inset-0 rounded-full bg-brand-500/30 mv-pulse-ring" />
        <span className="absolute inset-3 rounded-full bg-brand-500/20 mv-pulse-ring" style={{ animationDelay: "0.6s" }} />
        <span className="relative grid h-20 w-20 place-items-center rounded-full bg-white text-brand-600 shadow-[var(--shadow-shield)]">
          <ShieldCheck size={36} strokeWidth={2.2} />
        </span>
      </div>

      <h1 className="text-2xl font-extrabold text-ink-900">
        Reading your report…
      </h1>
      <p className="mt-2 max-w-sm text-sm text-ink-500">
        {hintType
          ? `We recognised this as ${hintType} — pulling out every value now.`
          : "Hold tight while we pull out every value. This usually takes 10–30 seconds."}
      </p>

      <ol className="mt-10 w-full max-w-sm space-y-3 text-left">
        {STEPS.map((label, i) => {
          const active = i === step;
          const done = polls > i + 1;
          return (
            <li key={label} className="flex items-center gap-3">
              <span
                className={`grid h-7 w-7 shrink-0 place-items-center rounded-full text-[11px] font-bold transition-colors ${
                  done
                    ? "bg-brand-500 text-white"
                    : active
                      ? "bg-white text-brand-600 shadow-[var(--shadow-logo)]"
                      : "bg-white/60 text-ink-400"
                }`}
                aria-hidden
              >
                {done ? <Check size={14} strokeWidth={3} /> : i + 1}
              </span>
              <span
                className={`text-sm transition-colors ${
                  active ? "font-semibold text-ink-900" : "text-ink-500"
                }`}
              >
                {label}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}