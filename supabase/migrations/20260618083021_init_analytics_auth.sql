-- Random Word analytics + auth schema (Supabase).
-- Ported from sql/0001_init.sql + sql/0002_user_id.sql, with:
--   * user_id changed from TEXT to UUID referencing auth.users
--   * a profiles table (1:1 with auth.users) + handle_new_user trigger
--   * a `language` dimension on events/sessions
--   * extended daily_stats (distinct users + per-mode / per-language rollups)
--   * RLS enabled everywhere (server writes via the direct postgres connection
--     bypass RLS as table owner; no client-facing policies on analytics tables)

-- ---------------------------------------------------------------------------
-- profiles: app-level user record, one row per auth.users row
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id            uuid primary key references auth.users (id) on delete cascade,
  is_anonymous  boolean     not null default true,
  email         text,
  display_name  text,
  role          text        not null default 'user',
  country       text,
  created_at    timestamptz not null default now(),
  last_seen_at  timestamptz not null default now()
);

-- Auto-create a profile whenever an auth user is created (incl. anonymous).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, is_anonymous, email)
  values (new.id, coalesce(new.is_anonymous, false), new.email)
  on conflict (id) do update
    set is_anonymous = coalesce(new.is_anonymous, false),
        email        = coalesce(new.email, public.profiles.email);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert or update on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- events: raw event log
-- ---------------------------------------------------------------------------
create table if not exists public.events (
  id           bigserial primary key,
  ts           timestamptz not null default now(),
  session_id   text        not null,
  user_id      uuid        references auth.users (id) on delete set null,
  name         text        not null,
  path         text,
  referrer     text,
  utm_source   text,
  utm_medium   text,
  utm_campaign text,
  country      text,
  region       text,
  city         text,
  device       text,
  browser      text,
  os           text,
  language     text,
  props        jsonb       not null default '{}'
);

create index if not exists events_ts         on public.events (ts desc);
create index if not exists events_name_ts    on public.events (name, ts desc);
create index if not exists events_session_id on public.events (session_id);
create index if not exists events_user_ts    on public.events (user_id, ts desc);

-- ---------------------------------------------------------------------------
-- sessions: per-session rollup
-- ---------------------------------------------------------------------------
create table if not exists public.sessions (
  session_id   text primary key,
  user_id      uuid        references auth.users (id) on delete set null,
  started_at   timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  country      text,
  device       text,
  browser      text,
  referrer     text,
  utm_source   text,
  language     text,
  pageviews    int not null default 0,
  words        int not null default 0,
  recordings   int not null default 0,
  mode_changes int not null default 0
);

create index if not exists sessions_user_at on public.sessions (user_id, started_at desc);

-- ---------------------------------------------------------------------------
-- daily_stats: daily rollup
-- ---------------------------------------------------------------------------
create table if not exists public.daily_stats (
  day              date primary key,
  sessions         int     not null default 0,
  users            int     not null default 0,
  pageviews        int     not null default 0,
  words            int     not null default 0,
  recordings       int     not null default 0,
  avg_session_secs numeric not null default 0,
  words_by_mode    jsonb   not null default '{}',
  words_by_lang    jsonb   not null default '{}'
);

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
alter table public.profiles    enable row level security;
alter table public.events      enable row level security;
alter table public.sessions    enable row level security;
alter table public.daily_stats enable row level security;

-- Users may read/update only their own profile. (Server uses the direct
-- postgres connection and bypasses RLS for writes/admin reads.)
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- events / sessions / daily_stats: no client-facing policies (deny-all for
-- anon & authenticated roles; only the owner connection can read/write).
