-- ============================================================
--  FakeLive Pro — lc_avatars
--  Tabla de avatares pre-generados para LiveCake Export
--  Ejecutar en: Supabase → SQL Editor
-- ============================================================

CREATE TABLE IF NOT EXISTS public.lc_avatars (
  id         UUID         DEFAULT gen_random_uuid() PRIMARY KEY,
  url        TEXT         NOT NULL,                    -- URL pública en Supabase Storage
  gender     TEXT         NOT NULL CHECK (gender     IN ('female', 'male', 'neutral')),
  age_group  TEXT         NOT NULL CHECK (age_group  IN ('young', 'adult', 'middle')),
  country    TEXT         NOT NULL DEFAULT 'Colombia',
  age_hint   INTEGER,                                  -- edad exacta usada en el prompt
  style      TEXT         NOT NULL DEFAULT 'photo',   -- 'photo' | 'avatar' | 'character'
  created_at TIMESTAMPTZ  DEFAULT now()
);

-- Índice para queries de asignación automática
CREATE INDEX IF NOT EXISTS lc_avatars_assign_idx
  ON public.lc_avatars (gender, age_group, country);

-- ── RLS ──────────────────────────────────────────────────
ALTER TABLE public.lc_avatars ENABLE ROW LEVEL SECURITY;

-- SELECT público — los avatares son un recurso de la plataforma
CREATE POLICY "lc_avatars_public_select"
  ON public.lc_avatars
  FOR SELECT
  USING (true);

-- Solo service_role puede insertar/actualizar/eliminar
CREATE POLICY "lc_avatars_service_write"
  ON public.lc_avatars
  FOR ALL
  USING (auth.role() = 'service_role');
