// Pre-login splash screen (Mobile 01 / Desktop D1 in the mockup).
// Renders the teal hero panel on the left half on desktop, with the
// headline + CTAs stacked on top of the hero illustration.

import Link from "next/link";
import Logo from "@/components/Logo";
import Button from "@/components/Button";
import HeroIllustration from "@/components/HeroIllustration";
import Disclaimer from "@/components/Disclaimer";

export const metadata = {
  title: "Welcome — MedVault",
};

export default function WelcomePage() {
  return (
    <div className="flex min-h-[100dvh] flex-col bg-canvas lg:flex-row">
      {/* LEFT — Hero panel */}
      <section className="relative flex flex-col items-center justify-center overflow-hidden bg-mint px-6 pb-12 pt-10 lg:flex-row lg:items-center lg:gap-12 lg:px-16 lg:py-16 lg:basis-[58%]">
        <div className="relative z-10 max-w-md text-center lg:text-left">
          <Logo size="lg" className="mx-auto mb-8 lg:mx-0" />
          <h1 className="text-balance text-3xl font-extrabold leading-tight text-ink-900 sm:text-4xl lg:text-5xl">
            Your complete <br className="hidden lg:block" />
            health record. <br className="hidden lg:block" />
            <span className="text-brand-600">Always with you.</span>
          </h1>
          <p className="mt-5 text-pretty text-[15px] leading-relaxed text-ink-500 lg:text-base">
            Photograph a lab report. MedVault extracts every value, stores the
            original, and gives you a lifelong, searchable history — even if
            your hospital doesn&apos;t.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center lg:justify-start">
            <Link href="/login?mode=signup" className="sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto">
                Create account
              </Button>
            </Link>
            <Link href="/login" className="sm:w-auto">
              <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                I already have one
              </Button>
            </Link>
          </div>

          <Disclaimer className="mt-10 hidden lg:block" />
        </div>

        {/* Hero illustration anchored bottom-right on desktop, below on mobile. */}
        <div className="mt-10 flex w-full justify-center lg:absolute lg:bottom-10 lg:right-10 lg:mt-0 lg:w-auto lg:justify-end">
          <HeroIllustration size={300} variant="shield" />
        </div>
      </section>

      {/* RIGHT — Soft cream panel with sign-in CTA (desktop only).
          On mobile this section is hidden; the hero takes the full viewport. */}
      <section className="hidden flex-1 flex-col items-center justify-center bg-canvas px-12 py-16 lg:flex">
        <div className="max-w-sm text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-600">
            Private & portable
          </p>
          <h2 className="mt-3 text-2xl font-extrabold text-ink-900">
            One place for every report.
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-ink-500">
            From a blood test to a chest X-ray — MedVault reads it, indexes it,
            and keeps it under your control.
          </p>

          <ul className="mt-8 space-y-4 text-left">
            {[
              "Snap a photo of any report",
              "AI pulls out every value",
              "Search \"blood sugar\" to find every mention",
            ].map((line) => (
              <li key={line} className="flex items-start gap-3 text-sm text-ink-700">
                <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-mint text-brand-600">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <path d="M5 12l5 5L20 7" />
                  </svg>
                </span>
                {line}
              </li>
            ))}
          </ul>

          <Link href="/login" className="mt-10 block">
            <Button size="lg" variant="ghost" className="w-full">
              Sign in to existing account →
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}