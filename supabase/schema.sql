-- ============================================================================
-- AI-UNIPOD UNILAG BMS — Supabase Database Schema
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

-- ─── phone_verifications ─────────────────────────────────────────────────────
-- Temporary OTP store for external user phone verification during signup.
create table if not exists public.phone_verifications (
  id          uuid primary key default gen_random_uuid(),
  phone       text not null,
  otp_hash    text not null,   -- bcrypt hash of the OTP
  verified    boolean not null default false,
  expires_at  timestamptz not null,
  created_at  timestamptz not null default now()
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

-- ============================================================================
-- Row Level Security (RLS)
-- ============================================================================

alter table public.profiles              enable row level security;
alter table public.admin_accounts        enable row level security;
alter table public.phone_verifications   enable row level security;
alter table public.bookings              enable row level security;
alter table public.resource_requests     enable row level security;
alter table public.equipment_access_codes enable row level security;
alter table public.notifications         enable row level security;
alter table public.broadcast_messages    enable row level security;

-- ── profiles RLS ─────────────────────────────────────────────────────────────
create policy "Users can read own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Admins can read all profiles"
  on public.profiles for select
  using (
    exists (
      select 1 from public.admin_accounts
      where id = auth.uid() and status = 'active'
    )
  );

create policy "Admins can update profiles"
  on public.profiles for update
  using (
    exists (
      select 1 from public.admin_accounts
      where id = auth.uid() and status = 'active'
    )
  );

-- ── admin_accounts RLS ───────────────────────────────────────────────────────
create policy "Admins can read own account"
  on public.admin_accounts for select
  using (auth.uid() = id);

create policy "Super admin can read all admin accounts"
  on public.admin_accounts for select
  using (
    exists (
      select 1 from public.admin_accounts
      where id = auth.uid() and role = 'super_admin' and status = 'active'
    )
  );

create policy "Super admin can insert admin accounts"
  on public.admin_accounts for insert
  with check (
    exists (
      select 1 from public.admin_accounts
      where id = auth.uid() and role = 'super_admin' and status = 'active'
    )
  );

create policy "Super admin can update admin accounts"
  on public.admin_accounts for update
  using (
    exists (
      select 1 from public.admin_accounts
      where id = auth.uid() and role = 'super_admin' and status = 'active'
    )
  );

-- ── bookings RLS ─────────────────────────────────────────────────────────────
create policy "Users can read own bookings"
  on public.bookings for select
  using (auth.uid() = user_id);

create policy "Users can insert own bookings"
  on public.bookings for insert
  with check (auth.uid() = user_id);

create policy "Users can update own bookings (cancel)"
  on public.bookings for update
  using (auth.uid() = user_id);

create policy "Admins can read all bookings"
  on public.bookings for select
  using (
    exists (
      select 1 from public.admin_accounts
      where id = auth.uid() and status = 'active'
    )
  );

create policy "Admins can update bookings"
  on public.bookings for update
  using (
    exists (
      select 1 from public.admin_accounts
      where id = auth.uid() and status = 'active'
    )
  );

-- ── resource_requests RLS ────────────────────────────────────────────────────
create policy "Users can read own resource requests"
  on public.resource_requests for select
  using (auth.uid() = user_id);

create policy "Users can insert resource requests"
  on public.resource_requests for insert
  with check (auth.uid() = user_id);

create policy "Admins can read all resource requests"
  on public.resource_requests for select
  using (
    exists (
      select 1 from public.admin_accounts
      where id = auth.uid() and status = 'active'
    )
  );

create policy "Admins can update resource requests"
  on public.resource_requests for update
  using (
    exists (
      select 1 from public.admin_accounts
      where id = auth.uid() and status = 'active'
    )
  );

-- ── equipment_access_codes RLS ───────────────────────────────────────────────
create policy "Users can read own equipment codes"
  on public.equipment_access_codes for select
  using (auth.uid() = user_id);

create policy "Admins can read and manage equipment codes"
  on public.equipment_access_codes for all
  using (
    exists (
      select 1 from public.admin_accounts
      where id = auth.uid() and status = 'active'
    )
  );

-- ── notifications RLS ────────────────────────────────────────────────────────
create policy "Users can read own notifications"
  on public.notifications for select
  using (auth.uid() = user_id);

create policy "Users can update own notifications (mark read)"
  on public.notifications for update
  using (auth.uid() = user_id);

-- ── phone_verifications RLS ──────────────────────────────────────────────────
create policy "Anyone can insert phone verifications"
  on public.phone_verifications for insert
  with check (true);

create policy "Anyone can read their own phone verification"
  on public.phone_verifications for select
  using (true);  -- filtered by phone in application code

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
create policy "Users can upload own documents"
  on storage.objects for insert
  with check (bucket_id = 'documents' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Users can read own documents"
  on storage.objects for select
  using (bucket_id = 'documents' and auth.uid()::text = (storage.foldername(name))[1]);

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
create policy "Anyone can read space images"
  on storage.objects for select
  using (bucket_id = 'spaces');

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
