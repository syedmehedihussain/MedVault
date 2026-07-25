# Architecture — MedVault

## Stack
| Layer | Choice | Why |
|-------|--------|-----|
| Frontend + Backend | Next.js (App Router) + React + TypeScript | One framework for UI and API routes; deploys to Vercel in one click. |
| Styling | Tailwind CSS | Fast, clean UI without writing much CSS. |
| Auth | Supabase Auth | Free email/password auth with almost no setup. |
| Database | Supabase (Postgres) | Free hosted DB; works on serverless Vercel (SQLite does not persist on Vercel). |
| File storage | Supabase Storage | Free bucket storage for the uploaded report images. |
| AI extraction | Google Gemini Flash (free API) | Reads images, returns text; free tier, no credit card. |
| Hosting | Vercel (free) | Native Next.js hosting; gives the public live link. |

Supabase is chosen because it bundles **auth + database + file storage** into one free service, removing the three hardest pieces of plumbing.

## System overview
```
[ Browser (Next.js UI) ]
        |  upload image, login, search
        v
[ Next.js API routes (server) ]
   |            |               |
   v            v               v
[Supabase   [Supabase       [Gemini API]
  Auth]      DB + Storage]   (extraction)
```

## Core data flow: uploading a report
1. User logs in (Supabase Auth issues a session).
2. User selects/takes a photo and uploads it.
3. Client sends the file to a Next.js API route (`/api/reports/upload`).
4. Server uploads the original file to Supabase Storage → gets a file path.
5. Server converts the image to base64 and calls the **Gemini API** with the extraction prompt (see `AI_INTEGRATION.md`).
6. Server parses the returned JSON. On success → `extraction_status = "done"`; on failure → `"failed"` (file still saved).
7. Server inserts a row into the `reports` table (with the extracted JSON) linked to the user.
8. Client shows the new report in the list and detail view.

## Search flow
- User types a query.
- Server queries the `reports` table for the current user, matching the query against the extracted text/JSON (test names, summary, doctor, type).
- Results returned newest first.

## Proposed project structure
```
medvault/
  docs/                     # this folder
  public/
    samples/                # sample report images for demos
  src/
    app/
      page.tsx              # landing / redirect
      login/page.tsx        # auth screen
      dashboard/page.tsx    # records list + search
      reports/[id]/page.tsx # record detail view
      api/
        reports/
          upload/route.ts   # handle upload + extraction + save
          list/route.ts     # list + search
          simulate/route.ts # F9 mock hospital import
    lib/
      supabaseClient.ts     # browser client
      supabaseServer.ts     # server client (service role)
      gemini.ts             # extractReport() — see AI_INTEGRATION.md
      types.ts              # shared TS types (ExtractedReport, etc.)
    components/
      ReportCard.tsx
      ReportDetail.tsx
      UploadButton.tsx
      SearchBar.tsx
  .env.example
  README.md
```

## External services & keys
- **Google AI Studio** → `GEMINI_API_KEY`
- **Supabase project** → `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
All set as environment variables locally (`.env`) and in Vercel's project settings.

## Non-functional notes
- **Privacy:** enforce per-user isolation with Supabase Row Level Security (see `DATA_MODEL.md`). Storage bucket is private; serve files via signed URLs.
- **Resilience:** extraction failures never block upload; the original file is always saved.
- **Demo safety:** ship sample images and, if needed, a fallback that returns mock extracted data so a live demo can't fully fail (see `DECISIONS.md`).
