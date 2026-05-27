-- ============================================================
--  FakeLive Pro — lc_avatars
--
--  Ejecutar en:
--  https://supabase.com/dashboard/project/ydpnzcspwlwfcxzizqct
--  → SQL Editor → New query → pegar esto → Run
--
--  Es IDEMPOTENTE: seguro de re-ejecutar aunque la tabla/política ya existan.
--  Las subidas de avatares las hace el servidor con service_role
--  (no se necesitan políticas de INSERT aquí).
-- ============================================================

-- ── Tabla principal ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.lc_avatars (
  id         UUID         DEFAULT gen_random_uuid() PRIMARY KEY,
  url        TEXT         NOT NULL,
  gender     TEXT         NOT NULL CHECK (gender    IN ('female', 'male')),
  age_group  TEXT         NOT NULL CHECK (age_group IN ('young', 'adult', 'middle')),
  country    TEXT         NOT NULL DEFAULT 'Colombia',
  age_hint   INTEGER,
  style      TEXT         NOT NULL DEFAULT 'photo',
  created_at TIMESTAMPTZ  DEFAULT now()
);

-- Índice para queries de asignación por género, edad, país
CREATE INDEX IF NOT EXISTS lc_avatars_assign_idx
  ON public.lc_avatars (gender, age_group, country);

-- ── RLS ───────────────────────────────────────────────────
ALTER TABLE public.lc_avatars ENABLE ROW LEVEL SECURITY;

-- Lectura pública — cualquier visitante puede ver los avatares
-- (DROP IF EXISTS hace la migración idempotente)
DROP POLICY IF EXISTS "lc_avatars_public_select" ON public.lc_avatars;
CREATE POLICY "lc_avatars_public_select"
  ON public.lc_avatars
  FOR SELECT
  USING (true);

-- Las escrituras (INSERT/UPDATE/DELETE) las hace el servidor
-- con service_role key (bypass de RLS). No se necesita política adicional.
