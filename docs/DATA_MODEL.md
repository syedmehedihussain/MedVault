# Data Model — MedVault

## Overview
Supabase Auth manages users (table `auth.users`). We add one main table, `reports`. Extracted test results are stored as a JSON column to keep things simple — no separate results table needed for the MVP.

## Table: `reports`
| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid (PK) | default `gen_random_uuid()` |
| `user_id` | uuid | references `auth.users.id`; owner of the record |
| `created_at` | timestamptz | default `now()` |
| `report_type` | text | e.g. "Blood Test", "Prescription", "Scan" |
| `report_date` | date | date printed on the report (nullable) |
| `doctor_or_hospital` | text | nullable |
| `summary` | text | plain-language summary from the AI |
| `results` | jsonb | array of `{ test, value, unit, normalRange }` |
| `file_path` | text | path in Supabase Storage bucket `reports` |
| `source` | text | "upload" or "partner_hospital" (for F9) |
| `extraction_status` | text | "done" or "failed" |

### SQL (run in Supabase SQL editor)
```sql
create table reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  report_type text,
  report_date date,
  doctor_or_hospital text,
  summary text,
  results jsonb default '[]'::jsonb,
  file_path text,
  source text default 'upload',
  extraction_status text default 'done'
);

alter table reports enable row level security;

create policy "users manage own reports"
  on reports for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
```
Row Level Security (RLS) guarantees each user can only read/write their own rows — this is the core privacy control.

## Storage bucket: `reports`
- Create a **private** bucket named `reports`.
- Path convention: `{user_id}/{report_id}/{original_filename}`.
- Serve images to the client using **signed URLs** (short-lived), never public URLs.

## AI extraction JSON schema
The Gemini call must return exactly this shape (see `AI_INTEGRATION.md` for the prompt). This maps directly onto the `reports` columns.
```json
{
  "reportType": "string",
  "date": "string (YYYY-MM-DD if possible, else empty)",
  "doctorOrHospital": "string",
  "results": [
    { "test": "string", "value": "string", "unit": "string", "normalRange": "string" }
  ],
  "summary": "string"
}
```
Mapping: `reportType→report_type`, `date→report_date`, `doctorOrHospital→doctor_or_hospital`, `results→results`, `summary→summary`.

## Shared TypeScript types (`src/lib/types.ts`)
```ts
export interface ExtractedResult {
  test: string;
  value: string;
  unit: string;
  normalRange: string;
}

export interface ExtractedReport {
  reportType: string;
  date: string;
  doctorOrHospital: string;
  results: ExtractedResult[];
  summary: string;
}
```

## Search
For the MVP, search the current user's `reports` where any of `report_type`, `doctor_or_hospital`, `summary`, or the text inside `results` contains the query (case-insensitive). A simple Postgres `ilike` across these fields (or a concatenated text search) is enough — no full-text search setup required.
