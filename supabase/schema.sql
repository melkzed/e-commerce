create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  full_name text not null default '',
  company_name text not null default '',
  tax_id text not null default '',
  phone text not null default '',
  segment text not null default '',
  store_name text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.quote_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  plan_key text not null,
  profile_snapshot jsonb not null default '{}'::jsonb,
  answers jsonb not null default '{}'::jsonb,
  status text not null default 'novo',
  admin_email text not null default 'melkzedd@gmail.com',
  email_status text not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists set_quote_requests_updated_at on public.quote_requests;
create trigger set_quote_requests_updated_at
before update on public.quote_requests
for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.quote_requests enable row level security;

drop policy if exists "profiles_select_own_or_admin" on public.profiles;
create policy "profiles_select_own_or_admin"
on public.profiles for select
using (
  auth.uid() = id
  or auth.jwt() ->> 'email' = 'melkzedd@gmail.com'
);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
on public.profiles for insert
with check (auth.uid() = id);

drop policy if exists "profiles_update_own_or_admin" on public.profiles;
create policy "profiles_update_own_or_admin"
on public.profiles for update
using (
  auth.uid() = id
  or auth.jwt() ->> 'email' = 'melkzedd@gmail.com'
)
with check (
  auth.uid() = id
  or auth.jwt() ->> 'email' = 'melkzedd@gmail.com'
);

drop policy if exists "quote_requests_select_own_or_admin" on public.quote_requests;
create policy "quote_requests_select_own_or_admin"
on public.quote_requests for select
using (
  auth.uid() = user_id
  or auth.jwt() ->> 'email' = 'melkzedd@gmail.com'
);

drop policy if exists "quote_requests_insert_own" on public.quote_requests;
create policy "quote_requests_insert_own"
on public.quote_requests for insert
with check (auth.uid() = user_id);

drop policy if exists "quote_requests_update_admin" on public.quote_requests;
create policy "quote_requests_update_admin"
on public.quote_requests for update
using (auth.jwt() ->> 'email' = 'melkzedd@gmail.com')
with check (auth.jwt() ->> 'email' = 'melkzedd@gmail.com');
