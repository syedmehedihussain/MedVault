"use client";

// "Simulate from partner hospital" demo button — calls the mock API
// endpoint that fabricates a plausible report and stages it under the
// current user. Documented in D7 as a demo-safety / wow-moment affordance.

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Button from "./Button";
import { ShieldCheck, Spinner } from "./icons";

export default function PartnerHospitalButton() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const simulate = () => {
    setError(null);
    startTransition(async () => {
      const res = await fetch("/api/reports/simulate", {
        method: "POST",
      });
      if (!res.ok) {
        let message = `Could not simulate (${res.status})`;
        try {
          const j = await res.json();
          if (j?.error) message = j.error;
        } catch {
          /* ignore */
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
    <div className="flex flex-col gap-1">
      <Button
        size="lg"
        variant="secondary"
        onClick={simulate}
        disabled={isPending}
        className="w-full sm:w-auto"
      >
        {isPending ? (
          <>
            <Spinner size={18} className="mr-2 animate-spin" />
            Importing…
          </>
        ) : (
          <>
            <ShieldCheck size={18} className="mr-2" />
            Partner hospital
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