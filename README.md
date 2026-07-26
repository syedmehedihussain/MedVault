# MedVault

A secure, searchable, lifelong home for your medical reports. Photograph a paper
report and MedVault extracts the structured data from it, so your full history
is in your pocket and shareable with any doctor.

> Not a medical device. MedVault stores and organizes records; it does not
> diagnose or give medical advice.

## How it works

1. You photograph a lab report or prescription (JPG/PNG).
2. The original image goes to a private Supabase Storage bucket.
3. Gemini reads the image and returns structured JSON: report type, date,
   doctor/hospital, a plain-language summary, and a table of test results.
4. The row lands in Postgres behind row-level security, so only you can read it.
5. The dashboard lists and searches across every field, including test names.

Extraction failure is not data loss: the row is still saved with
`extraction_status="failed"` and the original image is always retrievable.

## Stack

| Layer             | Choice                                                         |
| ----------------- | -------------------------------------------------------------- |
| Framework         | Next.js 16.2.12 (App Router, RSC)                              |
| UI                | React 19.2.4, Tailwind CSS 4                                   |
| Language          | TypeScript 5                                                   |
| Auth, DB, storage | Supabase (`@supabase/supabase-js` 2.x, `@supabase/ssr` 0.12.x) |
| AI extraction     | Google Gemini via `@google/genai` 2.x                          |

Requires Node.js >= 20.9.0 (the version Next 16 declares).

## Setup

### 1. Install

```bash
git clone https://github.com/syedmehedihussain/MedVault.git
cd MedVault
npm install
```

### 2. Create a Supabase project

Free tier is enough. From the new project you need three values, all under
**Project Settings > API**: the project URL, the anon/publishable key, and the
service role/secret key.

Then, in the **SQL Editor**, run [supabase/migrations/0001_reports.sql](supabase/migrations/0001_reports.sql).
It creates the `reports` table, enables RLS, and adds the policy that scopes
every row to its owner.

### 3. Create the storage bucket

Under **Storage**, create a bucket named exactly `reports` and mark it
**private**. The app hands out short-lived signed URLs; the browser must never
receive a public object URL.

Then add the read policy, in the SQL Editor:

```sql
create policy "users read own report files"
on storage.objects for select
to authenticated
using (
  bucket_id = 'reports'
  and (storage.foldername(name))[1] = auth.uid()::text
);
```

This is required. Uploads are written with the service-role client so they
bypass storage policies, but signed URLs are minted with the caller's session
client, so without this policy every report detail page fails to load its image.

### 4. Configure environment

```bash
cp .env.example .env.local
```

[.env.example](.env.example) is the template, placeholders only:

```bash
# Copy this file to .env.local and fill in real values.
# `.env.local` is gitignored; never commit secrets.
#
# Note: anything you paste into a real .env.local can be picked up by local
# indexing tools. Keep tool state directories (e.g. .puku/) out of git.

# --- Google AI Studio (Gemini, free tier) ---
# Get one at https://aistudio.google.com → "Get API key".
GEMINI_API_KEY=your-gemini-api-key

# --- Supabase (free tier) ---
# Project URL and anon key from Supabase → Project Settings → API.
# The anon key is safe to expose to the browser; RLS still protects the data.
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT-REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Server-only — NEVER expose to the browser. Bypasses RLS; used by API routes.
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Optional demo safety net (see docs/DECISIONS.md D9).
# Set to "true" to skip the live Gemini call and return a hard-coded
# ExtractedReport. Off by default.
USE_MOCK_EXTRACTION=false
```

Fill in the real values:

| Variable                        | Where from                                                    | Exposed to browser           |
| ------------------------------- | ------------------------------------------------------------- | ---------------------------- |
| `GEMINI_API_KEY`                | [Google AI Studio](https://aistudio.google.com) > Get API key | no                           |
| `NEXT_PUBLIC_SUPABASE_URL`      | Supabase > Project Settings > API                             | yes                          |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | same                                                          | yes, safe, RLS still applies |
| `SUPABASE_SERVICE_ROLE_KEY`     | same                                                          | **never**                    |
| `USE_MOCK_EXTRACTION`           | optional, `true` skips the live Gemini call                   | no                           |

`SUPABASE_SERVICE_ROLE_KEY` bypasses row-level security. It is read only in
[src/lib/supabaseServer.ts](src/lib/supabaseServer.ts) inside server code. Never
import the admin client from anything that reaches the browser, and never commit
it. Note that local indexing and AI tooling can copy `.env.local` into their own
databases; keep those directories gitignored.

### 5. Run

```bash
npm run dev     # http://localhost:3000
npm run build   # production build
npm start       # serve the production build
npm run lint    # eslint
```

Sign up with any email and password, then upload a report to verify the whole
chain end to end.

## Project layout

```
src/app/(authed)/      dashboard, report detail, trends, profile (auth-gated)
src/app/api/           upload, list, status, simulate, auth routes
src/components/        UI components
src/lib/               supabase clients, gemini extraction, storage, types
supabase/migrations/   database schema and RLS
docs/                  PRD, architecture, data model, decisions, tasks
```

## Security notes

- Every `reports` row is scoped by RLS to `auth.uid()`; a user cannot read
  another user's records even with a valid anon key.
- Report images live in a private bucket, reachable only through signed URLs
  that expire in five minutes.
- The service-role key is server-only and never shipped to the client.
- `.env.local` is gitignored. `.env.example` is the committed template and holds
  placeholders only.

## License

Hackathon project. No warranty. Not a medical device, and it does not provide
medical advice.
