-- Migration: create tier_upgrade_requests table
-- Run this entire block in your Supabase SQL editor.

create table if not exists public.tier_upgrade_requests (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references public.profiles(id) on delete cascade,
  current_tier   text not null,
  requested_tier text not null,
  reason         text not null,
  status         text not null default 'pending'
                   check (status in ('pending', 'approved', 'rejected')),
  admin_note     text,
  reviewed_by    uuid references public.admin_accounts(id),
  reviewed_at    timestamptz,
  created_at     timestamptz not null default now()
);

alter table public.tier_upgrade_requests enable row level security;

-- Users can read their own requests
drop policy if exists "Users read own upgrade requests" on public.tier_upgrade_requests;
create policy "Users read own upgrade requests"
  on public.tier_upgrade_requests for select
  using (user_id = auth.uid());

-- Users can submit new requests (INSERT)
drop policy if exists "Users insert own upgrade requests" on public.tier_upgrade_requests;
create policy "Users insert own upgrade requests"
  on public.tier_upgrade_requests for insert
  with check (user_id = auth.uid());
