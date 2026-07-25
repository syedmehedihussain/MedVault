# Build Tasks — MedVault

Work top to bottom. Finish all **P0** before starting **P1**. Check items off as you go.

## Milestone 0 — Project setup (P0)
- [ ] Create a Next.js + TypeScript app with Tailwind CSS.
- [ ] Add `.env.example` with all keys from `AGENTS.md`; add `.env` to `.gitignore`.
- [ ] Create `src/lib/types.ts` with the types from `DATA_MODEL.md`.
- [ ] Create `public/samples/` and add 1–2 sample medical report images for demos.

## Milestone 1 — Supabase (auth + DB + storage) (P0)
- [ ] Create a free Supabase project; copy URL + anon key + service role key into `.env`.
- [ ] Run the `reports` table SQL and the RLS policy from `DATA_MODEL.md`.
- [ ] Create a private Storage bucket named `reports`.
- [ ] Add `src/lib/supabaseClient.ts` (browser) and `src/lib/supabaseServer.ts` (server, service role).

## Milestone 2 — Auth (F1, P0)
- [ ] Build a `login` page: email/password sign-up and sign-in via Supabase Auth.
- [ ] Redirect logged-out users away from `dashboard` and report pages.
- [ ] Confirm each user only ever sees their own data (RLS enforces this).

## Milestone 3 — Upload + AI extraction (F2, F3, F4, P0)
- [ ] Add `src/lib/gemini.ts` with `extractReport()` from `AI_INTEGRATION.md`.
- [ ] Build `UploadButton` component (accept JPG/PNG).
- [ ] Build `POST /api/reports/upload`:
  - [ ] save original file to Supabase Storage (`{user_id}/{report_id}/{filename}`),
  - [ ] call `extractReport()`,
  - [ ] insert a `reports` row mapping the JSON onto columns,
  - [ ] on extraction failure, still save the row with `extraction_status="failed"`.
- [ ] Show a loading state while extraction runs.

## Milestone 4 — View records (F5, F6, P0)
- [ ] Build `dashboard` page: list the user's reports newest-first (type, date, summary) using `ReportCard`.
- [ ] Build `reports/[id]` detail page: show the original image (signed URL) beside the extracted data table (`ReportDetail`).
- [ ] Handle the empty state ("No reports yet — upload your first one").

## Milestone 5 — Search (F7, P0)
- [ ] Build `SearchBar` on the dashboard.
- [ ] Build `GET /api/reports/list?q=` that filters the user's reports by query across type, doctor, summary, and results (case-insensitive).
- [ ] Show filtered results live.

## Milestone 6 — Deploy (P0)
- [ ] Write root `README.md`: setup, env vars, run locally, deploy steps.
- [ ] Push to GitHub (ensure `.env` is ignored, `.env.example` is committed).
- [ ] Deploy to Vercel; add all env vars in Vercel settings.
- [ ] Test the live URL end-to-end (sign up → upload → extract → search).

## Milestone 7 — Wow features (P1, only if P0 is done)
- [ ] F9: `POST /api/reports/simulate` + a "Simulate report from Partner Hospital" button that inserts a pre-made sample report (`source="partner_hospital"`) with no photo — demonstrates the auto-import vision.
- [ ] F8: Trends chart — if a test name repeats across reports, plot its value over time (e.g. with a simple chart lib).

## Milestone 8 — Stretch (P2)
- [ ] F10: PDF upload support.
- [ ] F11: delete / edit a record.
- [ ] Add the `USE_MOCK_EXTRACTION` demo fallback (see `AI_INTEGRATION.md`).

## Done checklist (before submitting)
- [ ] MVP flow works on the deployed URL.
- [ ] GitHub repo link ready, no secrets committed.
- [ ] One wow feature works (F9 or F8).
- [ ] Footer notes MedVault is not a medical device and does not give medical advice.
