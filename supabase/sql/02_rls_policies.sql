alter table public.users enable row level security;
alter table public.services enable row level security;
alter table public.availability enable row level security;
alter table public.appointments enable row level security;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.users
    where id = auth.uid()
      and role = 'admin'
  );
$$;

drop policy if exists "users_select_self_or_admin" on public.users;
create policy "users_select_self_or_admin"
on public.users
for select
to authenticated
using (id = auth.uid() or public.is_admin());

drop policy if exists "users_update_self_or_admin" on public.users;
create policy "users_update_self_or_admin"
on public.users
for update
to authenticated
using (id = auth.uid() or public.is_admin())
with check (id = auth.uid() or public.is_admin());

drop policy if exists "services_select_all" on public.services;
create policy "services_select_all"
on public.services
for select
to authenticated
using (true);

drop policy if exists "services_admin_manage" on public.services;
create policy "services_admin_manage"
on public.services
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "availability_select_all" on public.availability;
create policy "availability_select_all"
on public.availability
for select
to authenticated
using (true);

drop policy if exists "availability_admin_manage" on public.availability;
create policy "availability_admin_manage"
on public.availability
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "appointments_select_self_or_admin" on public.appointments;
create policy "appointments_select_self_or_admin"
on public.appointments
for select
to authenticated
using (user_id = auth.uid() or public.is_admin());

drop policy if exists "appointments_insert_self" on public.appointments;
create policy "appointments_insert_self"
on public.appointments
for insert
to authenticated
with check (user_id = auth.uid());

drop policy if exists "appointments_update_self_or_admin" on public.appointments;
create policy "appointments_update_self_or_admin"
on public.appointments
for update
to authenticated
using (user_id = auth.uid() or public.is_admin())
with check (user_id = auth.uid() or public.is_admin());
