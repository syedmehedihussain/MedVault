# puku.md

Guidance for the Puku Editor AI agent when working in this repository.

## Quick Reference

| Task | Command |
|------|---------|
| Install dependencies | `npm install` |
| Run dev server | `npm run dev` |
| Enable demo fallback (no API call) | set `USE_MOCK_EXTRACTION=true` in `.env` |
| Apply schema + RLS | paste the SQL block from `@docs/DATA_MODEL.md` into Supabase SQL editor |
| Create private storage bucket | name `reports`, set **Private**; serve files via signed URLs only |

## Project Overview

MedVault is a hackathon web app where a user photographs a medical report, a free Google Gemini Flash model reads it and returns structured JSON, and the result is stored securely under the user's account — a lifelong, searchable, portable health record. Stack: Next.js (App Router) + TypeScript + Tailwind, Supabase (auth + Postgres + storage), Gemini Flash free API, Vercel hosting. $0 budget.

## Architecture (non-obvious bits only)

- **One table, `reports`.** Test results are stored in a `jsonb` column on the row — no separate results table. See `@docs/DATA_MODEL.md`.
- **Storage path convention**: `{user_id}/{report_id}/{original_filename}` in a private bucket named `reports`.
- **Files are never served via public URLs.** Always issue short-lived signed URLs from the server (`@docs/DATA_MODEL.md`).
- **Extraction is a server-side step.** The browser uploads the file to a Next.js API route; the server pushes the original to Storage, then calls Gemini, then writes the `reports` row.

## Critical Rules

- **P0 before P1 before P2.** A working MVP beats a broken everything. See `@docs/TASKS.md`.
- **Never let a bad AI response crash upload.** Always save the original file first; on parse/AI failure, write the row with `extraction_status = "failed"` and a plain summary. See `@docs/DECISIONS.md` D6 and `@docs/AI_INTEGRATION.md`.
- **Per-user isolation is enforced by Supabase RLS**, not by app code. The `reports` RLS policy compares `auth.uid() = user_id`. See `@docs/DATA_MODEL.md`.
- **Keys never reach the client.** `SUPABASE_SERVICE_ROLE_KEY` is server-only; only the **anon** key is exposed via `NEXT_PUBLIC_*`. Never import the service-role client from a browser bundle.
- **Never commit secrets.** `.env` is gitignored; only `.env.example` (with placeholders) is committed.
- **Footer disclaimer required.** "Not a medical device; does not provide medical advice." See `@docs/PRD.md` §8.
- **Demo safety net.** If the live Gemini API rate-limits or stalls during judging, flip `USE_MOCK_EXTRACTION=true` to return a realistic hard-coded `ExtractedReport` instead of calling the API. See `@docs/DECISIONS.md` D9.

## Design (read on demand)

- `@docs/design/MedVault UI.html` — interactive UI mockup for the app (open in a browser; **do not read inline** — 392 lines of self-extracting bundle JS, not source). Treat it as the visual reference when building screens; match the look, color, and layout unless `docs/PRD.md` or `docs/ARCHITECTURE.md` says otherwise.

## External Docs (read on demand)

- `@docs/PRD.md` — problem, scope, success criteria.
- `@docs/ARCHITECTURE.md` — system diagram, file layout, data flow.
- `@docs/DATA_MODEL.md` — `reports` table SQL, RLS policy, JSON schema, TS types.
- `@docs/AI_INTEGRATION.md` — exact `extractReport()` implementation and prompt.
- `@docs/TASKS.md` — ordered build checklist (the build order).
- `@docs/DECISIONS.md` — rationale for stack and design choices.
