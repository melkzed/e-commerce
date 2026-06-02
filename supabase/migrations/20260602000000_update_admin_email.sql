alter table public.quote_requests
alter column admin_email set default 'melkzedd@gmail.com';

update public.quote_requests
set admin_email = 'melkzedd@gmail.com'
where admin_email = 'melkzedektech@gmail.com';

drop policy if exists "profiles_select_own_or_admin" on public.profiles;
create policy "profiles_select_own_or_admin"
on public.profiles for select
using (
  auth.uid() = id
  or auth.jwt() ->> 'email' = 'melkzedd@gmail.com'
);

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

drop policy if exists "quote_requests_update_admin" on public.quote_requests;
create policy "quote_requests_update_admin"
on public.quote_requests for update
using (auth.jwt() ->> 'email' = 'melkzedd@gmail.com')
with check (auth.jwt() ->> 'email' = 'melkzedd@gmail.com');
