-- Legacy Goods: Supabase schema and role management
-- Run this script in the Supabase SQL editor for the target project.

create extension if not exists pgcrypto;

do $$
begin
  create type public.user_role as enum ('customer', 'admin');
exception
  when duplicate_object then null;
end $$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  role public.user_role not null default 'customer',
  admin_seq_id text unique,
  display_name text,
  created_at timestamptz not null default timezone('utc', now())
);

alter table public.profiles add column if not exists email text;

alter table public.profiles enable row level security;

create or replace function public.resequence_admin_identifiers()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- The depth guard prevents the UPDATE below from recursively invoking this trigger.
  if pg_trigger_depth() > 1 then
    if tg_op = 'DELETE' then return old; end if;
    return new;
  end if;

  with ranked_admins as (
    select id, row_number() over (order by created_at, id) as sequence_number
    from public.profiles
    where role = 'admin'
  )
  update public.profiles as profile
  set admin_seq_id = 'ADMIN_LOCA' || ranked_admins.sequence_number
  from ranked_admins
  where profile.id = ranked_admins.id;

  update public.profiles
  set admin_seq_id = null
  where role <> 'admin' and admin_seq_id is not null;

  if tg_op = 'DELETE' then return old; end if;
  return new;
end;
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, display_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1)))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

drop trigger if exists profiles_resequence_admins on public.profiles;
create trigger profiles_resequence_admins
after insert or update of role or delete on public.profiles
for each row execute procedure public.resequence_admin_identifiers();

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

-- Existing projects can run this idempotently to add ownership to orders.
alter table public.orders add column if not exists user_id uuid references auth.users(id) on delete set null;
alter table public.orders enable row level security;

create index if not exists profiles_role_idx on public.profiles(role);
create index if not exists orders_user_id_idx on public.orders(user_id);

-- Products remain publicly readable while writes stay server-side.
alter table public.products enable row level security;
drop policy if exists "Public can view products" on public.products;
create policy "Public can view products"
on public.products for select using (true);

-- Customers can see only their own profile; admins can operate the directories.
drop policy if exists "Users can view own profile" on public.profiles;
create policy "Users can view own profile"
on public.profiles for select to authenticated
using (id = auth.uid() or public.is_admin());

drop policy if exists "Admins manage profiles" on public.profiles;
create policy "Admins manage profiles"
on public.profiles for update to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Customers view own orders" on public.orders;
create policy "Customers view own orders"
on public.orders for select to authenticated
using (user_id = auth.uid() or public.is_admin());

drop policy if exists "Customers create own orders" on public.orders;
create policy "Customers create own orders"
on public.orders for insert to authenticated
with check (user_id = auth.uid());

drop policy if exists "Admins manage orders" on public.orders;
create policy "Admins manage orders"
on public.orders for update to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Admins delete orders" on public.orders;
create policy "Admins delete orders"
on public.orders for delete to authenticated
using (public.is_admin());

-- Backfill profiles for users created before this script was installed.
insert into public.profiles (id, email, display_name)
select id, email, coalesce(raw_user_meta_data ->> 'display_name', split_part(email, '@', 1))
from auth.users
on conflict (id) do nothing;

update public.profiles as profile
set email = users.email
from auth.users as users
where profile.id = users.id and profile.email is distinct from users.email;

update public.profiles set role = role;
