-- ============================================================
--  FakeLive Pro — Supabase Schema
--  Ejecutar en: Dashboard → SQL Editor → New Query
-- ============================================================

-- ── TABLE: user_settings ─────────────────────────────────────
-- Una fila por usuario; guarda settings, metadata y profile
-- como JSONB. NUNCA se guarda el stream key ni la API key de Gemini.
create table if not exists public.user_settings (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  settings   jsonb not null default '{}',
  metadata   jsonb not null default '{}',
  profile    jsonb not null default '{}',
  updated_at timestamptz not null default now()
);

-- ── TABLE: scripts ───────────────────────────────────────────
-- Guiones guardados por usuario (un registro por guion).
-- La restricción unique(user_id, name) permite upsert por nombre.
create table if not exists public.scripts (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  name       text not null,
  content    text not null default '',
  duration   integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, name)
);

-- ── TABLE: sessions ──────────────────────────────────────────
-- Historial de sesiones de live por usuario (máx. 20 en app).
create table if not exists public.sessions (
  id                   uuid primary key default gen_random_uuid(),
  user_id              uuid not null references auth.users(id) on delete cascade,
  date                 timestamptz not null,
  duration             integer not null default 0,
  completion_percent   integer not null default 0,
  comments_triggered   integer not null default 0,
  emotions_triggered   integer not null default 0,
  countdowns_triggered integer not null default 0,
  created_at           timestamptz not null default now()
);

-- ── INDEXES ──────────────────────────────────────────────────
create index if not exists scripts_user_id_idx      on public.scripts(user_id);
create index if not exists sessions_user_id_idx     on public.sessions(user_id);
create index if not exists sessions_user_date_idx   on public.sessions(user_id, date desc);

-- ── ROW LEVEL SECURITY ───────────────────────────────────────
alter table public.user_settings enable row level security;
alter table public.scripts       enable row level security;
alter table public.sessions      enable row level security;

-- Cada usuario solo puede ver y escribir sus propios datos
create policy "user_settings: solo propietario"
  on public.user_settings for all
  using      (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "scripts: solo propietario"
  on public.scripts for all
  using      (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "sessions: solo propietario"
  on public.sessions for all
  using      (auth.uid() = user_id)
  with check (auth.uid() = user_id);
