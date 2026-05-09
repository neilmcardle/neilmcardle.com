-- WePray — initial schema, RLS, RPCs, realtime.
-- Paste into a NEW Supabase project's SQL Editor and run once.
-- Safe to re-run: drops view + recreates functions, but tables/policies use IF NOT EXISTS / OR REPLACE where possible.

-- ============================================================================
-- Tables
-- ============================================================================

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default 'Friend',
  avatar_url text,
  created_at timestamptz not null default now()
);

create table if not exists public.groups (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(trim(name)) > 0),
  invite_code text not null unique,
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now()
);

create table if not exists public.members (
  group_id uuid not null references public.groups(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'member' check (role in ('owner','member')),
  joined_at timestamptz not null default now(),
  primary key (group_id, user_id)
);
create index if not exists members_user_id_idx on public.members(user_id);

do $$ begin
  create type public.prayer_tag as enum ('praise','urgent','ongoing');
exception when duplicate_object then null; end $$;

create table if not exists public.prayers (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups(id) on delete cascade,
  author_id uuid not null references auth.users(id) on delete cascade,
  body text not null check (length(trim(body)) > 0),
  tag public.prayer_tag not null default 'ongoing',
  verse_ref text,
  verse_text text,
  answered boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists prayers_group_id_created_at_idx
  on public.prayers(group_id, created_at desc);

create table if not exists public.prayer_events (
  id uuid primary key default gen_random_uuid(),
  prayer_id uuid not null references public.prayers(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
create index if not exists prayer_events_prayer_id_idx on public.prayer_events(prayer_id);
create index if not exists prayer_events_user_id_idx on public.prayer_events(user_id);

create table if not exists public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  created_at timestamptz not null default now()
);

-- ============================================================================
-- Triggers / helpers
-- ============================================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1), 'Friend')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 6-char invite code, omits 0/1/I/O for legibility.
create or replace function public.generate_invite_code()
returns text
language plpgsql
as $$
declare
  chars text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  result text := '';
  i int;
begin
  for i in 1..6 loop
    result := result || substr(chars, 1 + floor(random() * length(chars))::int, 1);
  end loop;
  return result;
end;
$$;

-- Membership check, used inside RLS policies. SECURITY DEFINER avoids
-- recursion when the policy is itself on `members`.
create or replace function public.is_group_member(p_group_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.members
    where group_id = p_group_id and user_id = auth.uid()
  );
$$;

-- ============================================================================
-- RLS
-- ============================================================================

alter table public.profiles          enable row level security;
alter table public.groups            enable row level security;
alter table public.members           enable row level security;
alter table public.prayers           enable row level security;
alter table public.prayer_events     enable row level security;
alter table public.push_subscriptions enable row level security;

drop policy if exists "profiles_select_authed" on public.profiles;
create policy "profiles_select_authed" on public.profiles
  for select to authenticated using (true);

drop policy if exists "profiles_update_self" on public.profiles;
create policy "profiles_update_self" on public.profiles
  for update to authenticated
  using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists "groups_select_members" on public.groups;
create policy "groups_select_members" on public.groups
  for select to authenticated
  using (public.is_group_member(id));

drop policy if exists "members_select_same_group" on public.members;
create policy "members_select_same_group" on public.members
  for select to authenticated
  using (public.is_group_member(group_id));

drop policy if exists "prayers_select_members" on public.prayers;
create policy "prayers_select_members" on public.prayers
  for select to authenticated
  using (public.is_group_member(group_id));

drop policy if exists "prayers_insert_members" on public.prayers;
create policy "prayers_insert_members" on public.prayers
  for insert to authenticated
  with check (public.is_group_member(group_id) and author_id = auth.uid());

drop policy if exists "prayers_update_author" on public.prayers;
create policy "prayers_update_author" on public.prayers
  for update to authenticated
  using (author_id = auth.uid()) with check (author_id = auth.uid());

drop policy if exists "prayers_delete_author" on public.prayers;
create policy "prayers_delete_author" on public.prayers
  for delete to authenticated
  using (author_id = auth.uid());

drop policy if exists "prayer_events_select_members" on public.prayer_events;
create policy "prayer_events_select_members" on public.prayer_events
  for select to authenticated
  using (
    exists (
      select 1 from public.prayers p
      where p.id = prayer_id and public.is_group_member(p.group_id)
    )
  );

drop policy if exists "prayer_events_insert_members" on public.prayer_events;
create policy "prayer_events_insert_members" on public.prayer_events
  for insert to authenticated
  with check (
    user_id = auth.uid() and
    exists (
      select 1 from public.prayers p
      where p.id = prayer_id and public.is_group_member(p.group_id)
    )
  );

drop policy if exists "push_subs_select_self" on public.push_subscriptions;
create policy "push_subs_select_self" on public.push_subscriptions
  for select to authenticated using (user_id = auth.uid());
drop policy if exists "push_subs_insert_self" on public.push_subscriptions;
create policy "push_subs_insert_self" on public.push_subscriptions
  for insert to authenticated with check (user_id = auth.uid());
drop policy if exists "push_subs_delete_self" on public.push_subscriptions;
create policy "push_subs_delete_self" on public.push_subscriptions
  for delete to authenticated using (user_id = auth.uid());

-- ============================================================================
-- View: prayers + author name + count + i_prayed flag (one query for the UI)
-- ============================================================================

drop view if exists public.prayers_view;
create view public.prayers_view
with (security_invoker = on)
as
select
  p.id,
  p.group_id,
  p.author_id,
  p.body,
  p.tag,
  p.verse_ref,
  p.verse_text,
  p.answered,
  p.created_at,
  pr.display_name as author_name,
  (select count(*)::int from public.prayer_events pe where pe.prayer_id = p.id) as prayer_count,
  exists (
    select 1 from public.prayer_events pe
    where pe.prayer_id = p.id and pe.user_id = auth.uid()
  ) as i_prayed
from public.prayers p
left join public.profiles pr on pr.id = p.author_id;

-- ============================================================================
-- RPCs
-- ============================================================================

create or replace function public.create_group(p_name text)
returns public.groups
language plpgsql
security definer
set search_path = public
as $$
declare
  v_group public.groups;
  v_code text;
  v_attempts int := 0;
begin
  if auth.uid() is null then
    raise exception 'not authenticated';
  end if;
  if length(trim(coalesce(p_name,''))) = 0 then
    raise exception 'name required';
  end if;

  loop
    v_code := public.generate_invite_code();
    begin
      insert into public.groups (name, invite_code, created_by)
      values (trim(p_name), v_code, auth.uid())
      returning * into v_group;
      exit;
    exception when unique_violation then
      v_attempts := v_attempts + 1;
      if v_attempts > 5 then raise; end if;
    end;
  end loop;

  insert into public.members (group_id, user_id, role)
  values (v_group.id, auth.uid(), 'owner');

  return v_group;
end;
$$;

create or replace function public.join_group_by_code(p_code text)
returns public.groups
language plpgsql
security definer
set search_path = public
as $$
declare
  v_group public.groups;
begin
  if auth.uid() is null then
    raise exception 'not authenticated';
  end if;

  select * into v_group
  from public.groups
  where invite_code = upper(trim(p_code));

  if v_group.id is null then
    raise exception 'invalid invite code';
  end if;

  insert into public.members (group_id, user_id, role)
  values (v_group.id, auth.uid(), 'member')
  on conflict do nothing;

  return v_group;
end;
$$;

-- ============================================================================
-- Realtime: live updates for prayers + prayer_events
-- ============================================================================

do $$ begin
  alter publication supabase_realtime add table public.prayers;
exception when duplicate_object then null; end $$;

do $$ begin
  alter publication supabase_realtime add table public.prayer_events;
exception when duplicate_object then null; end $$;
