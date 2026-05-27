-- ============================================================
--  FakeLive Pro — lc_avatars
--  Ejecutar en: Supabase Dashboard → SQL Editor
--  Proyecto: https://ydpnzcspwlwfcxzizqct.supabase.co
-- ============================================================

-- ── 1. Tabla principal ────────────────────────────────────
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

CREATE INDEX IF NOT EXISTS lc_avatars_assign_idx
  ON public.lc_avatars (gender, age_group, country);

-- ── 2. RLS ───────────────────────────────────────────────
ALTER TABLE public.lc_avatars ENABLE ROW LEVEL SECURITY;

-- Cualquier usuario puede leer avatares (recurso público de plataforma)
CREATE POLICY "lc_avatars_public_select"
  ON public.lc_avatars
  FOR SELECT
  USING (true);

-- Cualquier usuario puede subir avatares (contribución pública)
CREATE POLICY "lc_avatars_public_insert"
  ON public.lc_avatars
  FOR INSERT
  WITH CHECK (true);

-- ── 3. Storage bucket ────────────────────────────────────
-- IMPORTANTE: crear el bucket manualmente en
-- Supabase Dashboard → Storage → New bucket
--   Name: fakelive-avatars
--   Public bucket: ✅ activado
-- Luego ejecutar estas políticas de storage:

INSERT INTO storage.buckets (id, name, public)
VALUES ('fakelive-avatars', 'fakelive-avatars', true)
ON CONFLICT (id) DO UPDATE SET public = true;

CREATE POLICY "fakelive_avatars_public_select"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'fakelive-avatars');

CREATE POLICY "fakelive_avatars_public_insert"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'fakelive-avatars');
