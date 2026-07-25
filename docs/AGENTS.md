# AGENTS.md — Read This First

You are an AI coding agent building **MedVault**. This file orients you. Read the other docs in the order below before writing code.

## What MedVault is (one line)
A web app where a user photographs a medical report, a free AI model reads it and extracts the data as structured JSON, and it's stored securely and searchably under the user's account — a lifelong, portable health record.

## Reading order
1. `PRD.md` — what to build and why (requirements, scope, priorities).
2. `ARCHITECTURE.md` — the stack and how pieces fit.
3. `DATA_MODEL.md` — database tables and the extraction JSON schema.
4. `AI_INTEGRATION.md` — exactly how to call the free Gemini API (code + prompt).
5. `TASKS.md` — the ordered build checklist. Work through it top to bottom.
6. `DECISIONS.md` — why each major choice was made (don't undo these without reason).

## Tech stack (do not swap without updating DECISIONS.md)
- **Framework:** Next.js (App Router) + React + TypeScript
- **Styling:** Tailwind CSS
- **Auth + Database + File Storage:** Supabase (free tier) — handles all three
- **AI extraction:** Google Gemini Flash via the free API (`@google/genai`)
- **Deploy:** Vercel (free)

## Golden rules
- **Build P0 (MVP) tasks fully before touching P1/P2.** A working core beats a broken everything.
- **Never hard-code secrets.** All keys come from environment variables. Keep a `.env.example` with placeholder values; never commit a real `.env`.
- **The app must never crash on a bad AI response.** Always wrap JSON parsing in try/catch and save the file with `extraction_status = "failed"` if parsing fails.
- **Each user sees only their own records.** Enforce this with Supabase Row Level Security (RLS) — see `DATA_MODEL.md`.
- **Keep the UI simple and clean.** A judge should understand any screen in 5 seconds.
- **Add sample report images** to `/public/samples/` so the app can be demoed without a real report.
- **Write a clear `README.md`** at the project root with setup + run + deploy steps.

## Environment variables (define in `.env.example`)
```
GEMINI_API_KEY=your_google_ai_studio_key
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key   # server-side only, never expose to client
```

## Definition of done (MVP)
- A user can sign up, log in, and only sees their own data.
- A user can upload a report image; the original is stored.
- The AI extracts structured data and it's saved and shown.
- The user can list, open, and search their reports.
- The app is deployed to Vercel with a working public URL.
- `README.md` explains how to run it locally and how to deploy.

When in doubt, prefer the simplest thing that satisfies the PRD and works in a live demo.
