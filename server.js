// ============================================================
//  FakeLive Pro — server.js
//  Node.js 18+ (fetch nativo)
//  Carga variables desde .env (desarrollo local)
//  En Vercel: configura las variables en el dashboard
// ============================================================

// Cargar .env en desarrollo local (no falla si no existe)
try { require('dotenv').config(); } catch (_) {}

const express = require('express');
const path    = require('path');

const app  = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// ── Inicializar Supabase con Service Role desde .env ──────────
let sharp, createClient;
try { sharp          = require('sharp'); }              catch (_) {}
try { ({ createClient } = require('@supabase/supabase-js')); } catch (_) {}

// Config desde env vars (seguro — nunca del frontend)
const ENV = {
  supabaseUrl:     process.env.SUPABASE_URL          || '',
  supabaseService: process.env.SUPABASE_SERVICE_KEY  || '',
  geminiKey:       process.env.GEMINI_API_KEY        || ''
};

// Cliente Supabase server-side (service role = permisos totales)
let sbStorage = null;
if (createClient && ENV.supabaseUrl && ENV.supabaseService) {
  sbStorage = createClient(ENV.supabaseUrl, ENV.supabaseService);
  console.log('[Supabase] Cliente server-side inicializado desde .env');
}

// Clave Gemini recibida del frontend (por usuario) — en memoria, no en DB
let geminiKeyFromFrontend = ENV.geminiKey || '';
const avatarCache = new Map();

// ── POST /api/config — recibe Gemini key del frontend ────────
// Solo acepta la clave Gemini (las claves Supabase vienen del .env)
app.post('/api/config', (req, res) => {
  const { nanobananaKey } = req.body || {};
  if (nanobananaKey) geminiKeyFromFrontend = nanobananaKey;
  res.json({ ok: true });
});

// ── GET /api/status — estado de configuración ─────────────────
app.get('/api/status', (req, res) => {
  res.json({
    supabase: !!sbStorage,
    gemini:   !!(geminiKeyFromFrontend),
    sharp:    !!sharp
  });
});

// ── POST /api/generate-avatar — genera y sube avatar con IA ──
app.post('/api/generate-avatar', async (req, res) => {
  if (!sharp) return res.status(503).json({ error: 'sharp no instalado. Ejecuta: npm install' });
  if (!sbStorage) return res.status(503).json({ error: 'Supabase no configurado. Agrega SUPABASE_SERVICE_KEY en .env' });

  const { username, country, gender = 'female' } = req.body || {};
  if (!username) return res.status(400).json({ error: 'username requerido' });

  if (avatarCache.has(username)) {
    return res.json({ url: avatarCache.get(username), username, cached: true });
  }

  const ETHNICITY_MAP = {
    'Colombia': 'Colombian Latin American', 'Venezuela': 'Venezuelan Latin American',
    'Ecuador': 'Ecuadorian Latin American', 'Perú': 'Peruvian Latin American',
    'Bolivia': 'Bolivian Latin American',   'México': 'Mexican Latin American',
    'Argentina': 'Argentine Latin American','Uruguay': 'Uruguayan Latin American',
    'Chile': 'Chilean Latin American',      'España': 'Spanish European',
    'República Dominicana': 'Dominican Caribbean', 'Cuba': 'Cuban Caribbean',
    'Puerto Rico': 'Puerto Rican Caribbean'
  };

  const ethnicDesc = ETHNICITY_MAP[country] || 'Latin American';
  const age        = Math.floor(Math.random() * 24) + 22;
  const genderWord = gender === 'male' ? 'man' : 'woman';
  let imageBuffer  = null;

  // Intentar Gemini Imagen 3
  const geminiKey = geminiKeyFromFrontend || ENV.geminiKey;
  if (geminiKey) {
    try {
      const prompt = `Professional headshot portrait photo, ${genderWord}, approximately ${age} years old, ${ethnicDesc} appearance, soft neutral background, natural lighting, realistic photography, LinkedIn style profile`;
      const r = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=${geminiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            instances:  [{ prompt }],
            parameters: { sampleCount: 1, aspectRatio: '1:1', personGeneration: 'allow_all' }
          }),
          signal: AbortSignal.timeout(25000)
        }
      );
      if (r.ok) {
        const data = await r.json();
        const b64  = data?.predictions?.[0]?.bytesBase64Encoded;
        if (b64) imageBuffer = Buffer.from(b64, 'base64');
      }
    } catch (e) { console.warn('[Avatar] Gemini Imagen falló:', e.message); }
  }

  // Fallback: DiceBear personas
  if (!imageBuffer) {
    try {
      const seed = encodeURIComponent(username);
      const r = await fetch(
        `https://api.dicebear.com/9.x/personas/svg?seed=${seed}`,
        { signal: AbortSignal.timeout(6000) }
      );
      if (r.ok) imageBuffer = Buffer.from(await r.arrayBuffer());
    } catch (e) {
      return res.status(500).json({ error: 'No se pudo generar el avatar: ' + e.message });
    }
  }

  // Redimensionar a 100×100 JPEG q65
  let jpegBuffer;
  try {
    jpegBuffer = await sharp(imageBuffer, { density: 72 })
      .resize(100, 100, { fit: 'cover', position: 'centre' })
      .jpeg({ quality: 65 })
      .toBuffer();
  } catch (e) {
    return res.status(500).json({ error: 'Error procesando imagen: ' + e.message });
  }

  // Subir a Supabase Storage (service role)
  let publicUrl = null;
  const BUCKET = 'fakelive-avatars';
  try {
    await sbStorage.storage.createBucket(BUCKET, { public: true }).catch(() => {});
    const safe     = username.replace(/[^a-zA-Z0-9]/g, '_');
    const filePath = `avatars/${safe}_${Date.now()}.jpg`;
    const { error: upErr } = await sbStorage.storage
      .from(BUCKET)
      .upload(filePath, jpegBuffer, { contentType: 'image/jpeg', upsert: true });
    if (!upErr) {
      const { data } = sbStorage.storage.from(BUCKET).getPublicUrl(filePath);
      publicUrl = data.publicUrl;
    }
  } catch (e) {
    console.warn('[Avatar] Supabase upload failed:', e.message);
  }

  if (!publicUrl) {
    publicUrl = `https://api.dicebear.com/9.x/personas/svg?seed=${encodeURIComponent(username)}`;
  }

  avatarCache.set(username, publicUrl);
  res.json({ url: publicUrl, username });
});

// ── POST /api/upload-avatar — sube imagen + inserta en lc_avatars ──
// Recibe: { imageBase64, mimeType, gender, age_group, country }
// Usa service role → no necesita RLS INSERT ni políticas de Storage
app.post('/api/upload-avatar', async (req, res) => {
  if (!sbStorage) return res.status(503).json({ error: 'Supabase no configurado en el servidor. Agrega SUPABASE_SERVICE_KEY en .env' });

  const { imageBase64, mimeType = 'image/jpeg', gender, age_group, country } = req.body || {};

  if (!imageBase64) return res.status(400).json({ error: 'imageBase64 requerido' });
  if (!gender)      return res.status(400).json({ error: 'gender requerido' });
  if (!age_group)   return res.status(400).json({ error: 'age_group requerido' });
  if (!country)     return res.status(400).json({ error: 'country requerido' });

  const BUCKET = 'fakelive-avatars';
  const safe   = country.replace(/[^a-zA-Z]/g, '');
  const filename = `avatars/${gender}_${age_group}_${safe}_${Date.now()}.jpg`;

  try {
    // Decodificar base64
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');
    let imageBuffer  = Buffer.from(base64Data, 'base64');

    // Redimensionar con sharp si está disponible (100×100 final para DB)
    if (sharp) {
      imageBuffer = await sharp(imageBuffer)
        .resize(200, 200, { fit: 'cover', position: 'centre' })
        .jpeg({ quality: 75 })
        .toBuffer();
    }

    // Crear bucket si no existe (service role puede hacerlo)
    await sbStorage.storage.createBucket(BUCKET, { public: true }).catch(() => {});

    // Subir al Storage
    const { error: uploadErr } = await sbStorage.storage
      .from(BUCKET)
      .upload(filename, imageBuffer, { contentType: 'image/jpeg', upsert: true });
    if (uploadErr) throw new Error('Storage: ' + uploadErr.message);

    // URL pública
    const { data: urlData } = sbStorage.storage.from(BUCKET).getPublicUrl(filename);
    const publicUrl = urlData?.publicUrl;
    if (!publicUrl) throw new Error('No se pudo obtener URL pública');

    // Insertar en lc_avatars (service role bypasea RLS)
    const { error: dbErr } = await sbStorage.from('lc_avatars').insert({
      url: publicUrl, gender, age_group, country, style: 'photo'
    });
    if (dbErr) {
      // Si la tabla no existe, dar instrucciones claras
      if (dbErr.message.includes('does not exist') || dbErr.message.includes('relation')) {
        throw new Error('La tabla lc_avatars no existe. Ejecuta supabase/migrations/lc_avatars.sql en tu Supabase dashboard.');
      }
      throw new Error('DB: ' + dbErr.message);
    }

    console.log(`[UploadAvatar] ✅ ${gender}/${age_group}/${country} → ${publicUrl}`);
    res.json({ ok: true, url: publicUrl });

  } catch (e) {
    console.error('[UploadAvatar] Error:', e.message);
    res.status(500).json({ error: e.message });
  }
});

// ── POST /api/export-csv — genera CSV comma-delimited ─────────
app.post('/api/export-csv', (req, res) => {
  const { rows } = req.body || {};
  if (!rows || !rows.length) return res.status(400).json({ error: 'No hay filas' });

  const quote  = v => `"${String(v).replace(/"/g, '""')}"`;
  const BOM    = '﻿';
  const header = '"Title","Content","Time","Image"';
  const lines  = rows.map(r =>
    [r.title, r.content, r.time, r.imageUrl || ''].map(quote).join(',')
  );

  const csv     = BOM + header + '\n' + lines.join('\n');
  const ts      = new Date().toISOString().slice(0, 16).replace('T', '_').replace(':', '-');
  const country = (rows[0]?.country || 'export').replace(/[^a-zA-Z]/g, '');

  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="livecake_${country}_${ts}.csv"`);
  res.send(csv);
});

app.listen(PORT, () => {
  console.log(`\n🚀 FakeLive Pro corriendo en http://localhost:${PORT}`);
  console.log(`   Supabase: ${sbStorage ? '✅ conectado' : '⚠️  configura SUPABASE_SERVICE_KEY en .env'}`);
  console.log(`   Gemini:   ${ENV.geminiKey ? '✅ clave en .env' : '— cada usuario ingresa la suya en la app'}\n`);
});
