-- ============================================================================
-- AI-UNIPOD UNILAG BMS — Supabase Database Schema (Idempotent)
-- Run this in: Supabase Dashboard → SQL Editor
-- ============================================================================

-- Enable UUID extension
create extension if not exists "pgcrypto";

-- ─── profiles ────────────────────────────────────────────────────────────────
-- Extends auth.users with BMS-specific fields.
-- One row per registered member.
create table if not exists public.profiles (
  id                          uuid references auth.users(id) on delete cascade primary key,
  full_name                   text not null,
  phone                       text,
  class                       text not null check (class in ('internal', 'external')),
  tier                        text not null default 'regular_student'
                                check (tier in (
                                  'regular_student','lecturer_staff','product_developer',
                                  'volunteer_space_lead','startup_team','partner_intern','external'
                                )),
  status                      text not null default 'pending'
                                check (status in ('pending','verified','rejected','active')),
  matric_number               text,
  staff_number                text,
  organisation                text,
  purpose_of_visit            text,
  document_url                text,     -- Supabase Storage URL
  no_show_count               integer not null default 0,
  weekly_bookings_used        integer not null default 0,
  weekly_group_bookings_led   integer not null default 0,
  weekly_group_bookings_joined integer not null default 0,
  weekly_reset_at             timestamptz not null default date_trunc('week', now()),
  created_at                  timestamptz not null default now()
);

-- ─── admin_accounts ──────────────────────────────────────────────────────────
-- Admins, receptionists, and space leads.
-- These are also auth.users — they log in with email/password.
create table if not exists public.admin_accounts (
  id                    uuid references auth.users(id) on delete cascade primary key,
  full_name             text not null,
  email                 text not null unique,
  phone                 text,
  role                  text not null check (role in ('super_admin','admin','receptionist','space_lead')),
  assigned_space_id     text,     -- slug of the space (for space_lead)
  assigned_space_name   text,
  status                text not null default 'active' check (status in ('active','suspended')),
  created_by            uuid references public.admin_accounts(id),
  created_at            timestamptz not null default now(),
  last_login_at         timestamptz
);

-- ─── bookings ────────────────────────────────────────────────────────────────
create table if not exists public.bookings (
  id                    uuid primary key default gen_random_uuid(),
  bms_code              text not null unique,
  user_id               uuid not null references public.profiles(id) on delete cascade,
  space_id              text not null,       -- slug from lib/data/spaces.ts
  space_name            text not null,
  type                  text not null check (type in ('individual','group')),
  status                text not null default 'pending'
                          check (status in (
                            'pending','confirmed','checked_in','completed',
                            'cancelled','no_show','rejected'
                          )),
  date                  date not null,
  start_time            time not null,
  end_time              time not null,
  duration              integer not null,    -- hours
  justification         text,
  group_members         jsonb,               -- GroupMember[]
  equipment_requested   jsonb,               -- EquipmentRequest[]
  payment_required      boolean not null default false,
  payment_amount        integer,             -- kobo
  payment_status        text default 'pending' check (payment_status in ('pending','paid')),
  admin_note            text,
  checked_in_at         timestamptz,
  session_expires_at    timestamptz,
  created_at            timestamptz not null default now()
);

-- ─── resource_requests ───────────────────────────────────────────────────────
create table if not exists public.resource_requests (
  id                      uuid primary key default gen_random_uuid(),
  user_id                 uuid not null references public.profiles(id) on delete cascade,
  resource_type           text not null,
  preferred_date          date not null,
  preferred_time_window   text not null,
  estimated_duration      text not null,
  justification           text not null,
  status                  text not null default 'pending'
                            check (status in ('pending','approved','rejected')),
  admin_note              text,
  allocated_slot          text,
  bms_code                text,
  created_at              timestamptz not null default now()
);

-- ─── equipment_access_codes ──────────────────────────────────────────────────
create table if not exists public.equipment_access_codes (
  id                  uuid primary key default gen_random_uuid(),
  code                text not null unique,
  booking_id          uuid not null references public.bookings(id) on delete cascade,
  bms_code            text not null,
  user_id             uuid not null references public.profiles(id) on delete cascade,
  user_name           text not null,
  equipment_type      text not null,
  equipment_label     text not null,
  space_id            text not null,
  space_name          text not null,
  status              text not null default 'active' check (status in ('active','used','expired')),
  generated_at        timestamptz not null default now(),
  used_at             timestamptz,
  used_by_admin_id    uuid references public.admin_accounts(id)
);

-- ─── notifications ───────────────────────────────────────────────────────────
create table if not exists public.notifications (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  type        text not null,
  title       text not null,
  message     text not null,
  read        boolean not null default false,
  created_at  timestamptz not null default now()
);

-- ─── broadcast_messages ──────────────────────────────────────────────────────
create table if not exists public.broadcast_messages (
  id            uuid primary key default gen_random_uuid(),
  admin_id      uuid not null references public.admin_accounts(id),
  admin_name    text not null,
  subject       text not null,
  message       text not null,
  target        text not null default 'all',  -- 'all', tier name, or 'internal'/'external'
  sent_at       timestamptz not null default now()
);

-- ─── system_settings ─────────────────────────────────────────────────────────
-- Stores key-value pairs for system-wide settings (schedule, booking rules).
create table if not exists public.system_settings (
  key         text primary key,
  value       jsonb not null,
  updated_at  timestamptz not null default now(),
  updated_by  uuid references public.admin_accounts(id)
);

-- ─── space_overrides ─────────────────────────────────────────────────────────
-- Persists admin edits to space status, description, and capacity.
-- The space_id matches the slug from lib/data/spaces.ts.
create table if not exists public.space_overrides (
  space_id    text primary key,
  status      text check (status in ('active','inactive','maintenance')),
  description text,
  capacity    integer,
  updated_at  timestamptz not null default now(),
  updated_by  uuid references public.admin_accounts(id)
);

-- ============================================================================
-- Row Level Security (RLS) – with idempotent policy creation
-- ============================================================================

alter table public.profiles              enable row level security;
alter table public.admin_accounts        enable row level security;
alter table public.bookings              enable row level security;
alter table public.resource_requests     enable row level security;
alter table public.equipment_access_codes enable row level security;
alter table public.notifications         enable row level security;
alter table public.broadcast_messages    enable row level security;

-- ── profiles RLS ─────────────────────────────────────────────────────────────
drop policy if exists "Users can read own profile" on public.profiles;
create policy "Users can read own profile"
  on public.profiles for select
  using (auth.uid() = id);

drop policy if exists "Users can insert own profile" on public.profiles;
create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

drop policy if exists "Admins can read all profiles" on public.profiles;
create policy "Admins can read all profiles"
  on public.profiles for select
  using (
    exists (
      select 1 from public.admin_accounts
      where id = auth.uid() and status = 'active'
    )
  );

drop policy if exists "Admins can update profiles" on public.profiles;
create policy "Admins can update profiles"
  on public.profiles for update
  using (
    exists (
      select 1 from public.admin_accounts
      where id = auth.uid() and status = 'active'
    )
  );

-- ── admin_accounts RLS ───────────────────────────────────────────────────────
drop policy if exists "Admins can read own account" on public.admin_accounts;
create policy "Admins can read own account"
  on public.admin_accounts for select
  using (auth.uid() = id);

drop policy if exists "Super admin can read all admin accounts" on public.admin_accounts;
create policy "Super admin can read all admin accounts"
  on public.admin_accounts for select
  using (
    exists (
      select 1 from public.admin_accounts
      where id = auth.uid() and role = 'super_admin' and status = 'active'
    )
  );

drop policy if exists "Super admin can insert admin accounts" on public.admin_accounts;
create policy "Super admin can insert admin accounts"
  on public.admin_accounts for insert
  with check (
    exists (
      select 1 from public.admin_accounts
      where id = auth.uid() and role = 'super_admin' and status = 'active'
    )
  );

drop policy if exists "Super admin can update admin accounts" on public.admin_accounts;
create policy "Super admin can update admin accounts"
  on public.admin_accounts for update
  using (
    exists (
      select 1 from public.admin_accounts
      where id = auth.uid() and role = 'super_admin' and status = 'active'
    )
  );

-- ── bookings RLS ─────────────────────────────────────────────────────────────
drop policy if exists "Users can read own bookings" on public.bookings;
create policy "Users can read own bookings"
  on public.bookings for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own bookings" on public.bookings;
create policy "Users can insert own bookings"
  on public.bookings for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own bookings (cancel)" on public.bookings;
create policy "Users can update own bookings (cancel)"
  on public.bookings for update
  using (auth.uid() = user_id);

drop policy if exists "Admins can read all bookings" on public.bookings;
create policy "Admins can read all bookings"
  on public.bookings for select
  using (
    exists (
      select 1 from public.admin_accounts
      where id = auth.uid() and status = 'active'
    )
  );

drop policy if exists "Admins can update bookings" on public.bookings;
create policy "Admins can update bookings"
  on public.bookings for update
  using (
    exists (
      select 1 from public.admin_accounts
      where id = auth.uid() and status = 'active'
    )
  );

-- ── resource_requests RLS ────────────────────────────────────────────────────
drop policy if exists "Users can read own resource requests" on public.resource_requests;
create policy "Users can read own resource requests"
  on public.resource_requests for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert resource requests" on public.resource_requests;
create policy "Users can insert resource requests"
  on public.resource_requests for insert
  with check (auth.uid() = user_id);

drop policy if exists "Admins can read all resource requests" on public.resource_requests;
create policy "Admins can read all resource requests"
  on public.resource_requests for select
  using (
    exists (
      select 1 from public.admin_accounts
      where id = auth.uid() and status = 'active'
    )
  );

drop policy if exists "Admins can update resource requests" on public.resource_requests;
create policy "Admins can update resource requests"
  on public.resource_requests for update
  using (
    exists (
      select 1 from public.admin_accounts
      where id = auth.uid() and status = 'active'
    )
  );

-- ── equipment_access_codes RLS ───────────────────────────────────────────────
drop policy if exists "Users can read own equipment codes" on public.equipment_access_codes;
create policy "Users can read own equipment codes"
  on public.equipment_access_codes for select
  using (auth.uid() = user_id);

drop policy if exists "Admins can read and manage equipment codes" on public.equipment_access_codes;
create policy "Admins can read and manage equipment codes"
  on public.equipment_access_codes for all
  using (
    exists (
      select 1 from public.admin_accounts
      where id = auth.uid() and status = 'active'
    )
  );

-- ── notifications RLS ────────────────────────────────────────────────────────
drop policy if exists "Users can read own notifications" on public.notifications;
create policy "Users can read own notifications"
  on public.notifications for select
  using (auth.uid() = user_id);

drop policy if exists "Users can update own notifications (mark read)" on public.notifications;
create policy "Users can update own notifications (mark read)"
  on public.notifications for update
  using (auth.uid() = user_id);

-- ── system_settings RLS ──────────────────────────────────────────────────────
alter table public.system_settings enable row level security;

drop policy if exists "Admins can read system settings" on public.system_settings;
create policy "Admins can read system settings"
  on public.system_settings for select
  using (
    exists (select 1 from public.admin_accounts where id = auth.uid() and status = 'active')
  );

drop policy if exists "Admins can manage system settings" on public.system_settings;
create policy "Admins can manage system settings"
  on public.system_settings for all
  using (
    exists (select 1 from public.admin_accounts where id = auth.uid() and role in ('admin','super_admin') and status = 'active')
  );

-- ── space_overrides RLS ───────────────────────────────────────────────────────
alter table public.space_overrides enable row level security;

drop policy if exists "Admins can read space overrides" on public.space_overrides;
create policy "Admins can read space overrides"
  on public.space_overrides for select
  using (
    exists (select 1 from public.admin_accounts where id = auth.uid() and status = 'active')
  );

drop policy if exists "Admins can manage space overrides" on public.space_overrides;
create policy "Admins can manage space overrides"
  on public.space_overrides for all
  using (
    exists (select 1 from public.admin_accounts where id = auth.uid() and role in ('admin','super_admin') and status = 'active')
  );

-- ============================================================================
-- Indexes
-- ============================================================================
create index if not exists bookings_user_id_idx        on public.bookings(user_id);
create index if not exists bookings_date_idx           on public.bookings(date);
create index if not exists bookings_status_idx         on public.bookings(status);
create index if not exists bookings_bms_code_idx       on public.bookings(bms_code);
create index if not exists bookings_space_date_idx     on public.bookings(space_id, date);
create index if not exists resource_requests_user_idx  on public.resource_requests(user_id);
create index if not exists notifications_user_idx      on public.notifications(user_id);
create index if not exists equipment_codes_code_idx    on public.equipment_access_codes(code);

-- ============================================================================
-- Storage Buckets (run after creating storage via Supabase dashboard)
-- ============================================================================
-- Create two buckets:
--   1. "documents"  — identity documents uploaded at signup (private, admin-read)
--   2. "spaces"     — space images (public read)
--
-- Via SQL:
insert into storage.buckets (id, name, public)
  values ('documents', 'documents', false)
  on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
  values ('spaces', 'spaces', true)
  on conflict (id) do nothing;

-- Storage RLS for documents bucket
drop policy if exists "Users can upload own documents" on storage.objects;
create policy "Users can upload own documents"
  on storage.objects for insert
  with check (bucket_id = 'documents' and auth.uid()::text = (storage.foldername(name))[1]);

drop policy if exists "Users can read own documents" on storage.objects;
create policy "Users can read own documents"
  on storage.objects for select
  using (bucket_id = 'documents' and auth.uid()::text = (storage.foldername(name))[1]);

drop policy if exists "Admins can read all documents" on storage.objects;
create policy "Admins can read all documents"
  on storage.objects for select
  using (
    bucket_id = 'documents' and
    exists (
      select 1 from public.admin_accounts
      where id = auth.uid() and status = 'active'
    )
  );

-- Storage RLS for spaces bucket (public read)
drop policy if exists "Anyone can read space images" on storage.objects;
create policy "Anyone can read space images"
  on storage.objects for select
  using (bucket_id = 'spaces');

drop policy if exists "Admins can manage space images" on storage.objects;
create policy "Admins can manage space images"
  on storage.objects for all
  using (
    bucket_id = 'spaces' and
    exists (
      select 1 from public.admin_accounts
      where id = auth.uid() and status = 'active'
    )
  );

-- ============================================================================
-- Helper function: reset weekly booking counters (run via cron every Monday)
-- ============================================================================
create or replace function public.reset_weekly_bookings()
returns void language plpgsql security definer as $$
begin
  update public.profiles
  set
    weekly_bookings_used        = 0,
    weekly_group_bookings_led   = 0,
    weekly_group_bookings_joined = 0,
    weekly_reset_at             = date_trunc('week', now())
  where weekly_reset_at < date_trunc('week', now());
end;
$$;
