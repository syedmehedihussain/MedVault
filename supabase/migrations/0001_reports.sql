-- 0001_reports.sql — MedVault schema (Milestone 1).
-- Run this in the Supabase SQL editor on a fresh project.
-- Source of truth: docs/DATA_MODEL.md.

create extension if not exists "pgcrypto";

create table if not exists reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  report_type text,
  report_date date,
  doctor_or_hospital text,
  summary text,
  results jsonb not null default '[]'::jsonb,
  file_path text,
  source text not null default 'upload',
  extraction_status text not null default 'done'
);

alter table reports enable row level security;

-- Per-user isolation: a user can only see / write / delete their own rows.
-- This is the core privacy control for MedVault.
drop policy if exists "users manage own reports" on reports;
create policy "users manage own reports"
  on reports for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Helpful index for the dashboard's "newest first" query and search.
create index if not exists reports_user_id_created_at_idx
  on reports (user_id, created_at desc);
