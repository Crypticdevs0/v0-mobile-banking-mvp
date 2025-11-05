-- Migration: create otp_codes table for storing one-time passcodes
-- Run this in Supabase SQL editor or via psql with service role key

create extension if not exists "uuid-ossp";

create table if not exists public.otp_codes (
  id uuid primary key default uuid_generate_v4(),
  email text not null,
  code text not null,
  expires_at timestamptz not null,
  attempts integer not null default 0,
  max_attempts integer not null default 5,
  verified_at timestamptz null,
  created_at timestamptz not null default now()
);

-- Index to quickly lookup recent codes by email
create index if not exists idx_otp_codes_email_created_at on public.otp_codes (email, created_at desc);

-- Security: enable Row Level Security and add minimal policies

alter table public.otp_codes enable row level security;

-- Policy: allow service role to do anything (service key bypasses RLS)
-- Policies below allow authenticated users to insert/select their own email rows if needed

create policy "allow_insert_for_authenticated" on public.otp_codes
  for insert
  to authenticated
  using (true);

create policy "allow_select_own_email" on public.otp_codes
  for select
  to authenticated
  using (auth.role() = 'authenticated' and otp_codes.email = auth.email());

-- NOTE: Backend endpoints should use the service role key to write/read OTPs.
-- If you do not want client-side access at all, remove the above policies and rely solely on server-side access.

-- Cleanup helper (optional): delete OTPs older than 24 hours
-- delete from public.otp_codes where created_at < now() - interval '24 hours';
