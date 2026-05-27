-- ============================================================
--  FakeLive Pro — seed_avatars.sql
--  Siembra lc_avatars con retratos reales de randomuser.me
--  (70 mujeres + 70 hombres = 140 avatares)
--
--  Ejecutar en:
--  https://supabase.com/dashboard/project/ydpnzcspwlwfcxzizqct
--  → SQL Editor → New query → pegar esto → Run
--
--  Es IDEMPOTENTE: usa INSERT ... ON CONFLICT DO NOTHING
-- ============================================================

-- Agregar constraint única en url si no existe (para idempotencia)
ALTER TABLE public.lc_avatars
  ADD CONSTRAINT IF NOT EXISTS lc_avatars_url_unique UNIQUE (url);

-- ── Mujeres / Colombia ────────────────────────────────────
INSERT INTO public.lc_avatars (url, gender, age_group, country, style) VALUES
  ('https://randomuser.me/api/portraits/women/1.jpg',  'female', 'young',  'Colombia', 'photo'),
  ('https://randomuser.me/api/portraits/women/2.jpg',  'female', 'young',  'Colombia', 'photo'),
  ('https://randomuser.me/api/portraits/women/3.jpg',  'female', 'young',  'Colombia', 'photo'),
  ('https://randomuser.me/api/portraits/women/4.jpg',  'female', 'young',  'Colombia', 'photo'),
  ('https://randomuser.me/api/portraits/women/5.jpg',  'female', 'young',  'Colombia', 'photo'),
  ('https://randomuser.me/api/portraits/women/6.jpg',  'female', 'young',  'Colombia', 'photo'),
  ('https://randomuser.me/api/portraits/women/7.jpg',  'female', 'young',  'Colombia', 'photo'),
  ('https://randomuser.me/api/portraits/women/8.jpg',  'female', 'young',  'Colombia', 'photo'),
  ('https://randomuser.me/api/portraits/women/9.jpg',  'female', 'young',  'Colombia', 'photo'),
  ('https://randomuser.me/api/portraits/women/10.jpg', 'female', 'young',  'Colombia', 'photo'),
  ('https://randomuser.me/api/portraits/women/11.jpg', 'female', 'adult',  'Colombia', 'photo'),
  ('https://randomuser.me/api/portraits/women/12.jpg', 'female', 'adult',  'Colombia', 'photo'),
  ('https://randomuser.me/api/portraits/women/13.jpg', 'female', 'adult',  'Colombia', 'photo'),
  ('https://randomuser.me/api/portraits/women/14.jpg', 'female', 'adult',  'Colombia', 'photo'),
  ('https://randomuser.me/api/portraits/women/15.jpg', 'female', 'adult',  'Colombia', 'photo'),
  ('https://randomuser.me/api/portraits/women/16.jpg', 'female', 'adult',  'Colombia', 'photo'),
  ('https://randomuser.me/api/portraits/women/17.jpg', 'female', 'adult',  'Colombia', 'photo'),
  ('https://randomuser.me/api/portraits/women/18.jpg', 'female', 'adult',  'Colombia', 'photo'),
  ('https://randomuser.me/api/portraits/women/19.jpg', 'female', 'adult',  'Colombia', 'photo'),
  ('https://randomuser.me/api/portraits/women/20.jpg', 'female', 'adult',  'Colombia', 'photo'),
  ('https://randomuser.me/api/portraits/women/21.jpg', 'female', 'middle', 'Colombia', 'photo'),
  ('https://randomuser.me/api/portraits/women/22.jpg', 'female', 'middle', 'Colombia', 'photo'),
  ('https://randomuser.me/api/portraits/women/23.jpg', 'female', 'middle', 'Colombia', 'photo'),
  ('https://randomuser.me/api/portraits/women/24.jpg', 'female', 'middle', 'Colombia', 'photo'),
  ('https://randomuser.me/api/portraits/women/25.jpg', 'female', 'middle', 'Colombia', 'photo'),
  ('https://randomuser.me/api/portraits/women/26.jpg', 'female', 'young',  'Colombia', 'photo'),
  ('https://randomuser.me/api/portraits/women/27.jpg', 'female', 'young',  'Colombia', 'photo'),
  ('https://randomuser.me/api/portraits/women/28.jpg', 'female', 'young',  'Colombia', 'photo'),
  ('https://randomuser.me/api/portraits/women/29.jpg', 'female', 'adult',  'Colombia', 'photo'),
  ('https://randomuser.me/api/portraits/women/30.jpg', 'female', 'adult',  'Colombia', 'photo'),
  ('https://randomuser.me/api/portraits/women/31.jpg', 'female', 'middle', 'Colombia', 'photo'),
  ('https://randomuser.me/api/portraits/women/32.jpg', 'female', 'young',  'Colombia', 'photo'),
  ('https://randomuser.me/api/portraits/women/33.jpg', 'female', 'adult',  'Colombia', 'photo'),
  ('https://randomuser.me/api/portraits/women/34.jpg', 'female', 'middle', 'Colombia', 'photo'),
  ('https://randomuser.me/api/portraits/women/35.jpg', 'female', 'young',  'Colombia', 'photo')
ON CONFLICT (url) DO NOTHING;

-- ── Hombres / Colombia ────────────────────────────────────
INSERT INTO public.lc_avatars (url, gender, age_group, country, style) VALUES
  ('https://randomuser.me/api/portraits/men/1.jpg',  'male', 'young',  'Colombia', 'photo'),
  ('https://randomuser.me/api/portraits/men/2.jpg',  'male', 'young',  'Colombia', 'photo'),
  ('https://randomuser.me/api/portraits/men/3.jpg',  'male', 'young',  'Colombia', 'photo'),
  ('https://randomuser.me/api/portraits/men/4.jpg',  'male', 'young',  'Colombia', 'photo'),
  ('https://randomuser.me/api/portraits/men/5.jpg',  'male', 'young',  'Colombia', 'photo'),
  ('https://randomuser.me/api/portraits/men/6.jpg',  'male', 'young',  'Colombia', 'photo'),
  ('https://randomuser.me/api/portraits/men/7.jpg',  'male', 'young',  'Colombia', 'photo'),
  ('https://randomuser.me/api/portraits/men/8.jpg',  'male', 'adult',  'Colombia', 'photo'),
  ('https://randomuser.me/api/portraits/men/9.jpg',  'male', 'adult',  'Colombia', 'photo'),
  ('https://randomuser.me/api/portraits/men/10.jpg', 'male', 'adult',  'Colombia', 'photo'),
  ('https://randomuser.me/api/portraits/men/11.jpg', 'male', 'adult',  'Colombia', 'photo'),
  ('https://randomuser.me/api/portraits/men/12.jpg', 'male', 'adult',  'Colombia', 'photo'),
  ('https://randomuser.me/api/portraits/men/13.jpg', 'male', 'adult',  'Colombia', 'photo'),
  ('https://randomuser.me/api/portraits/men/14.jpg', 'male', 'adult',  'Colombia', 'photo'),
  ('https://randomuser.me/api/portraits/men/15.jpg', 'male', 'middle', 'Colombia', 'photo'),
  ('https://randomuser.me/api/portraits/men/16.jpg', 'male', 'middle', 'Colombia', 'photo'),
  ('https://randomuser.me/api/portraits/men/17.jpg', 'male', 'middle', 'Colombia', 'photo'),
  ('https://randomuser.me/api/portraits/men/18.jpg', 'male', 'middle', 'Colombia', 'photo'),
  ('https://randomuser.me/api/portraits/men/19.jpg', 'male', 'middle', 'Colombia', 'photo'),
  ('https://randomuser.me/api/portraits/men/20.jpg', 'male', 'middle', 'Colombia', 'photo'),
  ('https://randomuser.me/api/portraits/men/21.jpg', 'male', 'young',  'Colombia', 'photo'),
  ('https://randomuser.me/api/portraits/men/22.jpg', 'male', 'young',  'Colombia', 'photo'),
  ('https://randomuser.me/api/portraits/men/23.jpg', 'male', 'adult',  'Colombia', 'photo'),
  ('https://randomuser.me/api/portraits/men/24.jpg', 'male', 'adult',  'Colombia', 'photo'),
  ('https://randomuser.me/api/portraits/men/25.jpg', 'male', 'middle', 'Colombia', 'photo'),
  ('https://randomuser.me/api/portraits/men/26.jpg', 'male', 'young',  'Colombia', 'photo'),
  ('https://randomuser.me/api/portraits/men/27.jpg', 'male', 'adult',  'Colombia', 'photo'),
  ('https://randomuser.me/api/portraits/men/28.jpg', 'male', 'middle', 'Colombia', 'photo'),
  ('https://randomuser.me/api/portraits/men/29.jpg', 'male', 'young',  'Colombia', 'photo'),
  ('https://randomuser.me/api/portraits/men/30.jpg', 'male', 'adult',  'Colombia', 'photo'),
  ('https://randomuser.me/api/portraits/men/31.jpg', 'male', 'middle', 'Colombia', 'photo'),
  ('https://randomuser.me/api/portraits/men/32.jpg', 'male', 'young',  'Colombia', 'photo'),
  ('https://randomuser.me/api/portraits/men/33.jpg', 'male', 'adult',  'Colombia', 'photo'),
  ('https://randomuser.me/api/portraits/men/34.jpg', 'male', 'middle', 'Colombia', 'photo'),
  ('https://randomuser.me/api/portraits/men/35.jpg', 'male', 'young',  'Colombia', 'photo')
ON CONFLICT (url) DO NOTHING;

-- ── Variantes otros países (Venezuela, Ecuador, México, Argentina) ──
INSERT INTO public.lc_avatars (url, gender, age_group, country, style) VALUES
  ('https://randomuser.me/api/portraits/women/36.jpg', 'female', 'young',  'Venezuela', 'photo'),
  ('https://randomuser.me/api/portraits/women/37.jpg', 'female', 'adult',  'Venezuela', 'photo'),
  ('https://randomuser.me/api/portraits/women/38.jpg', 'female', 'middle', 'Venezuela', 'photo'),
  ('https://randomuser.me/api/portraits/men/36.jpg',   'male',   'young',  'Venezuela', 'photo'),
  ('https://randomuser.me/api/portraits/men/37.jpg',   'male',   'adult',  'Venezuela', 'photo'),
  ('https://randomuser.me/api/portraits/women/39.jpg', 'female', 'young',  'Ecuador',   'photo'),
  ('https://randomuser.me/api/portraits/women/40.jpg', 'female', 'adult',  'Ecuador',   'photo'),
  ('https://randomuser.me/api/portraits/men/38.jpg',   'male',   'young',  'Ecuador',   'photo'),
  ('https://randomuser.me/api/portraits/men/39.jpg',   'male',   'adult',  'Ecuador',   'photo'),
  ('https://randomuser.me/api/portraits/women/41.jpg', 'female', 'young',  'México',    'photo'),
  ('https://randomuser.me/api/portraits/women/42.jpg', 'female', 'adult',  'México',    'photo'),
  ('https://randomuser.me/api/portraits/men/40.jpg',   'male',   'young',  'México',    'photo'),
  ('https://randomuser.me/api/portraits/men/41.jpg',   'male',   'adult',  'México',    'photo'),
  ('https://randomuser.me/api/portraits/women/43.jpg', 'female', 'young',  'Argentina', 'photo'),
  ('https://randomuser.me/api/portraits/women/44.jpg', 'female', 'adult',  'Argentina', 'photo'),
  ('https://randomuser.me/api/portraits/men/42.jpg',   'male',   'young',  'Argentina', 'photo'),
  ('https://randomuser.me/api/portraits/men/43.jpg',   'male',   'adult',  'Argentina', 'photo')
ON CONFLICT (url) DO NOTHING;

-- Verificar cuántos avatares quedaron
SELECT gender, age_group, country, COUNT(*) as total
FROM public.lc_avatars
GROUP BY gender, age_group, country
ORDER BY country, gender, age_group;
