-- =============================================================
-- CARLUXE — Smart Car Wash & Detailing Booking Platform
-- Complete Supabase Database Setup SQL
-- Run this in your Supabase SQL Editor (in order)
-- =============================================================

-- ========================
-- 1. CREATE BOOKINGS TABLE
-- ========================
create table if not exists public.bookings (
  id              uuid default gen_random_uuid() primary key,
  user_id         uuid references auth.users(id) on delete cascade not null,
  service_type    text not null check (service_type in ('basic', 'premium', 'luxury')),
  vehicle_type    text not null default 'sedan' check (vehicle_type in ('sedan', 'suv', 'premium')),
  booking_date    date not null,
  base_time       text not null,
  assigned_time   text,
  batch_number    integer default 1,
  queue_position  integer default 1,
  status          text not null default 'pending'
                  check (status in ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled')),
  notes           text,
  location        text,
  phone           text,
  created_at      timestamptz default now() not null,
  updated_at      timestamptz default now() not null
);

-- Note: If the table already exists, run these manually:
-- alter table public.bookings add column if not exists location text;
-- alter table public.bookings add column if not exists phone text;
-- alter table public.bookings drop constraint if exists bookings_vehicle_type_check;
-- alter table public.bookings add constraint bookings_vehicle_type_check check (vehicle_type in ('sedan', 'suv', 'premium'));

-- Auto-update updated_at
create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists bookings_updated_at on public.bookings;
create trigger bookings_updated_at
  before update on public.bookings
  for each row execute function update_updated_at();

-- ========================
-- 2. ROW LEVEL SECURITY
-- ========================
alter table public.bookings enable row level security;

-- Drop all existing policies first
drop policy if exists "Users can view own bookings" on public.bookings;
drop policy if exists "Users can create own bookings" on public.bookings;
drop policy if exists "Admin can view all bookings" on public.bookings;
drop policy if exists "Admin can update all bookings" on public.bookings;
drop policy if exists "Admin can delete bookings" on public.bookings;

-- Users can only see their own bookings
create policy "Users can view own bookings"
  on public.bookings
  for select
  using (auth.uid() = user_id);

-- Users can create their own bookings
create policy "Users can create own bookings"
  on public.bookings
  for insert
  with check (auth.uid() = user_id);

-- Admin can view all bookings
create policy "Admin can view all bookings"
  on public.bookings
  for select
  using (
    auth.jwt() ->> 'email' = 'resulthub001@gmail.com'
  );

-- Admin can update all bookings
create policy "Admin can update all bookings"
  on public.bookings
  for update
  using (
    auth.jwt() ->> 'email' = 'resulthub001@gmail.com'
  );

-- Admin can delete bookings
create policy "Admin can delete bookings"
  on public.bookings
  for delete
  using (
    auth.jwt() ->> 'email' = 'resulthub001@gmail.com'
  );

-- ========================
-- 3. SMART BOOKING RPC FUNCTION
-- ========================
-- This function implements the smart batching logic:
-- - Max 3 cars per base time slot
-- - After every 3 bookings → assigned_time shifts by +15 minutes
-- - Transaction-safe with FOR UPDATE SKIP LOCKED
-- ========================

create or replace function create_smart_booking(
  p_user_id      uuid,
  p_service_type text,
  p_base_time    text,
  p_booking_date date,
  p_vehicle_type text default 'sedan',
  p_location     text default null,
  p_phone        text default null
)
returns json
language plpgsql
security definer
as $$
declare
  v_count         integer;
  v_batch_number  integer;
  v_queue_pos     integer;
  v_assigned_time text;
  v_base_minutes  integer;
  v_offset_mins   integer;
  v_assigned_hour integer;
  v_assigned_min  integer;
  v_new_booking   public.bookings;
begin
  -- Lock rows for this slot to prevent race conditions
  perform 1 from public.bookings
  where booking_date = p_booking_date
    and base_time = p_base_time
  for update skip locked;

  -- Count existing bookings for this date + base_time slot
  select count(*) into v_count
  from public.bookings
  where booking_date = p_booking_date
    and base_time = p_base_time
    and status != 'cancelled';

  -- Calculate batch and queue position
  -- batch_number = ceil((count + 1) / 3)
  -- queue_position = count + 1
  v_queue_pos := v_count + 1;
  v_batch_number := ceil(v_queue_pos::numeric / 3);

  -- Calculate assigned_time from base_time
  -- offset = (batch_number - 1) * 15 minutes
  v_offset_mins := (v_batch_number - 1) * 15;

  -- Parse base_time (format: "HH:MM")
  v_base_minutes := (split_part(p_base_time, ':', 1)::integer * 60)
                  + split_part(p_base_time, ':', 2)::integer;

  -- Add offset
  v_base_minutes := v_base_minutes + v_offset_mins;

  -- Convert back to HH:MM
  v_assigned_hour := v_base_minutes / 60;
  v_assigned_min  := v_base_minutes % 60;
  v_assigned_time := lpad(v_assigned_hour::text, 2, '0') || ':' || lpad(v_assigned_min::text, 2, '0');

  -- Insert the booking
  insert into public.bookings (
    user_id,
    service_type,
    vehicle_type,
    booking_date,
    base_time,
    assigned_time,
    batch_number,
    queue_position,
    status,
    location,
    phone
  )
  values (
    p_user_id,
    p_service_type,
    p_vehicle_type,
    p_booking_date,
    p_base_time,
    v_assigned_time,
    v_batch_number,
    v_queue_pos,
    'confirmed',
    p_location,
    p_phone
  )
  returning * into v_new_booking;

  -- Return as JSON
  return row_to_json(v_new_booking);
end;
$$;

-- Grant execute permission to authenticated users
grant execute on function create_smart_booking to authenticated;

-- ========================
-- 4. ENABLE REALTIME
-- ========================
-- Run these in Supabase SQL Editor:

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and tablename = 'bookings'
  ) then
    alter publication supabase_realtime add table public.bookings;
  end if;
end $$;

-- ========================
-- 5. INDEXES FOR PERFORMANCE
-- ========================
create index if not exists bookings_user_id_idx on public.bookings(user_id);
create index if not exists bookings_date_time_idx on public.bookings(booking_date, base_time);
create index if not exists bookings_status_idx on public.bookings(status);
create index if not exists bookings_created_at_idx on public.bookings(created_at desc);

-- ========================
-- 6. TEST THE SMART BOOKING
-- ========================
-- Example: Test the smart batching RPC
-- select create_smart_booking(
--   auth.uid(),
--   'basic',
--   '09:00',
--   '2025-06-01',
--   'sedan'
-- );
--
-- Expected behavior:
-- Booking 1 → batch 1, queue 1, assigned 09:00
-- Booking 2 → batch 1, queue 2, assigned 09:00
-- Booking 3 → batch 1, queue 3, assigned 09:00
-- Booking 4 → batch 2, queue 4, assigned 09:15
-- Booking 5 → batch 2, queue 5, assigned 09:15
-- ...

-- ========================
-- SUPABASE DASHBOARD STEPS
-- ========================
-- 1. Authentication > Providers > Enable Google OAuth
--    - Add your Google Client ID and Secret from Google Cloud Console
--    - Add redirect URL: https://your-project.supabase.co/auth/v1/callback
--
-- 2. Authentication > URL Configuration
--    - Site URL: https://your-app-url.vercel.app (or http://localhost:3000 for dev)
--    - Redirect URLs: Add http://localhost:3000/auth/callback
--
-- 3. Realtime > Tables
--    - Enable bookings table for realtime
--    - Or run: alter publication supabase_realtime add table public.bookings;
--
-- 4. API > Settings → Copy URL and anon key to .env.local
