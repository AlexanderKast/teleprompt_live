const express = require('express');
const path    = require('path');

const app  = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.listen(PORT, () => {
  console.log(`FakeLive Pro corriendo en http://localhost:${PORT}`);
});


// ================================================
// === LIVECAKE EXPORT ===
// Requiere Node.js 18+ (fetch nativo) y los paquetes
// @supabase/supabase-js y sharp instalados.
// ================================================

let sharp, createClient;
try { sharp       = require('sharp'); }          catch (_) {}
try { ({ createClient } = require('@supabase/supabase-js')); } catch (_) {}

// Configuración en memoria (recibida desde el frontend)
let appConfig      = {};
let sbStorage      = null;
const avatarCache  = new Map();

// Mapeo país → etnicidad para Nanobanana
const ETHNICITY_MAP = {
  'Colombia':           'hispanic-latina',
  'Venezuela':          'hispanic-latina',
  'Ecuador':            'hispanic-latina',
  'Perú':               'hispanic-latina',
  'Bolivia':            'hispanic-latina',
  'México':             'hispanic-mexican',
  'Argentina':          'hispanic-southern',
  'Uruguay':            'hispanic-southern',
  'Chile':              'hispanic-southern',
  'España':             'european-spanish',
  'República Dominicana': 'afro-hispanic',
  'Cuba':               'afro-hispanic',
  'Puerto Rico':        'afro-hispanic'
};

// ── POST /api/config — recibe claves del frontend ─────────────
app.post('/api/config', (req, res) => {
  const { nanobananaKey, supabaseUrl, supabaseAnon, supabaseService } = req.body || {};
  if (nanobananaKey)   appConfig.nanobananaKey   = nanobananaKey;
  if (supabaseUrl)     appConfig.supabaseUrl     = supabaseUrl;
  if (supabaseAnon)    appConfig.supabaseAnon    = supabaseAnon;
  if (supabaseService) appConfig.supabaseService = supabaseService;

  // Reinicializar cliente Supabase con service role key
  if (createClient && appConfig.supabaseUrl && appConfig.supabaseService) {
    sbStorage = createClient(appConfig.supabaseUrl, appConfig.supabaseService);
  }
  res.json({ ok: true });
});

// ── GET /api/avatar-status — estado de configuración ─────────
app.get('/api/avatar-status', (req, res) => {
  res.json({
    configured: !!(appConfig.nanobananaKey || appConfig.supabaseService),
    nanobanana: !!appConfig.nanobananaKey,
    supabase:   !!(appConfig.supabaseUrl && appConfig.supabaseService)
  });
});

// ── POST /api/generate-avatar — genera y sube avatar ─────────
app.post('/api/generate-avatar', async (req, res) => {
  if (!sharp) return res.status(503).json({ error: 'sharp no instalado. Ejecuta: npm install' });

  const { username, country, gender = 'female' } = req.body || {};
  if (!username) return res.status(400).json({ error: 'username requerido' });

  // Caché en sesión
  if (avatarCache.has(username)) {
    return res.json({ url: avatarCache.get(username), username, cached: true });
  }

  const ethnicity = ETHNICITY_MAP[country] || 'hispanic-latina';
  const age       = Math.floor(Math.random() * 24) + 22; // 22–45
  let imageBuffer = null;

  // Intentar Nanobanana
  if (appConfig.nanobananaKey) {
    try {
      const r = await fetch(
        `https://api.nanobanana.io/v1/avatar/generate?style=realistic&gender=${gender}&age=${age}&ethnicity=${ethnicity}`,
        { headers: { Authorization: `Bearer ${appConfig.nanobananaKey}` }, signal: AbortSignal.timeout(8000) }
      );
      if (r.ok) imageBuffer = Buffer.from(await r.arrayBuffer());
    } catch (_) { /* fallback a DiceBear */ }
  }

  // Fallback: DiceBear personas
  if (!imageBuffer) {
    try {
      const seed = encodeURIComponent(username);
      const r = await fetch(
        `https://api.dicebear.com/7.x/personas/svg?seed=${seed}&backgroundColor=b6e3f4,c0aede,d1d4f9`,
        { signal: AbortSignal.timeout(6000) }
      );
      if (r.ok) imageBuffer = Buffer.from(await r.arrayBuffer());
    } catch (e) {
      return res.status(500).json({ error: 'No se pudo generar el avatar: ' + e.message });
    }
  }

  // Redimensionar a 200×200 JPEG calidad 70
  let jpegBuffer;
  try {
    jpegBuffer = await sharp(imageBuffer, { density: 150 })
      .resize(200, 200, { fit: 'cover', position: 'centre' })
      .jpeg({ quality: 70 })
      .toBuffer();
  } catch (e) {
    return res.status(500).json({ error: 'Error procesando imagen: ' + e.message });
  }

  // Subir a Supabase Storage
  let publicUrl = null;
  if (sbStorage) {
    const safe     = username.replace(/[^a-zA-Z0-9]/g, '_');
    const filePath = `avatars/${safe}_${Date.now()}.jpg`;
    try {
      await sbStorage.storage.createBucket('fakelive-avatars', { public: true }).catch(() => {});
      const { error: upErr } = await sbStorage.storage
        .from('fakelive-avatars')
        .upload(filePath, jpegBuffer, { contentType: 'image/jpeg', upsert: true });
      if (!upErr) {
        const { data } = sbStorage.storage.from('fakelive-avatars').getPublicUrl(filePath);
        publicUrl = data.publicUrl;
      }
    } catch (e) {
      console.warn('[Avatar] Supabase upload failed:', e.message);
    }
  }

  // Sin Supabase → DiceBear URL directamente (no requiere subida)
  if (!publicUrl) {
    publicUrl = `https://api.dicebear.com/7.x/personas/svg?seed=${encodeURIComponent(username)}`;
  }

  avatarCache.set(username, publicUrl);
  res.json({ url: publicUrl, username });
});

// ── POST /api/export-csv — genera y devuelve CSV ──────────────
app.post('/api/export-csv', (req, res) => {
  const { rows } = req.body || {};
  if (!rows || !rows.length) return res.status(400).json({ error: 'No hay filas' });

  const BOM    = '﻿';
  const header = 'Title\tContent\tTime\tImage';
  const lines  = rows.map(r =>
    [r.title, r.content, r.time, r.imageUrl || '']
      .map(v => String(v).replace(/\t|\n/g, ' '))
      .join('\t')
  );

  const csv       = BOM + header + '\n' + lines.join('\n');
  const ts        = new Date().toISOString().slice(0, 16).replace('T', '_').replace(':', '-');
  const country   = (rows[0]?.country || 'export').replace(/[^a-zA-Z]/g, '');

  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="livecake_${country}_${ts}.csv"`);
  res.send(csv);
});
