// ============================================================
//  FakeLive Pro — api/upload-avatar.js
//  Vercel Serverless Function
//  POST /api/upload-avatar
//  Requiere en Vercel Settings → Environment Variables:
//    SUPABASE_URL, SUPABASE_SERVICE_KEY
// ============================================================

const { createClient } = require('@supabase/supabase-js');

module.exports = async function handler(req, res) {
  // CORS permisivo (misma app, mismo dominio)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST')    return res.status(405).json({ error: 'Method not allowed' });

  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey  = process.env.SUPABASE_SERVICE_KEY;

  if (!supabaseUrl || !serviceKey) {
    return res.status(503).json({
      error: 'Supabase no configurado. Agrega SUPABASE_URL y SUPABASE_SERVICE_KEY en Vercel → Settings → Environment Variables.'
    });
  }

  const sb = createClient(supabaseUrl, serviceKey);

  const { imageBase64, gender, age_group, country } = req.body || {};

  if (!imageBase64) return res.status(400).json({ error: 'imageBase64 requerido' });
  if (!gender)      return res.status(400).json({ error: 'gender requerido' });
  if (!age_group)   return res.status(400).json({ error: 'age_group requerido' });
  if (!country)     return res.status(400).json({ error: 'country requerido' });

  const BUCKET   = 'fakelive-avatars';
  const safe     = country.replace(/[^a-zA-Z]/g, '');
  const filename = `avatars/${gender}_${age_group}_${safe}_${Date.now()}.jpg`;

  try {
    // Decodificar base64 (el frontend ya comprimió con Canvas API)
    const base64Data  = imageBase64.replace(/^data:image\/\w+;base64,/, '');
    const imageBuffer = Buffer.from(base64Data, 'base64');

    // Intentar sharp si está disponible (opcional — no requerido en Vercel)
    let finalBuffer = imageBuffer;
    try {
      const sharp = require('sharp');
      finalBuffer = await sharp(imageBuffer)
        .resize(200, 200, { fit: 'cover', position: 'centre' })
        .jpeg({ quality: 75 })
        .toBuffer();
    } catch (_) {
      // sharp no disponible en Vercel — usar buffer original (ya comprimido en frontend)
    }

    // Crear bucket si no existe (service role puede hacerlo)
    await sb.storage.createBucket(BUCKET, { public: true }).catch(() => {});

    // Subir al Storage
    const { error: uploadErr } = await sb.storage
      .from(BUCKET)
      .upload(filename, finalBuffer, { contentType: 'image/jpeg', upsert: true });
    if (uploadErr) throw new Error('Storage: ' + uploadErr.message);

    // URL pública
    const { data: urlData } = sb.storage.from(BUCKET).getPublicUrl(filename);
    const publicUrl = urlData?.publicUrl;
    if (!publicUrl) throw new Error('No se pudo obtener URL pública');

    // Insertar en lc_avatars (service role bypasea RLS)
    const { error: dbErr } = await sb.from('lc_avatars').insert({
      url: publicUrl, gender, age_group, country, style: 'photo'
    });
    if (dbErr) {
      if (dbErr.message?.includes('does not exist') || dbErr.message?.includes('relation')) {
        throw new Error('La tabla lc_avatars no existe. Ejecuta supabase/migrations/lc_avatars.sql en tu Supabase dashboard.');
      }
      throw new Error('DB: ' + dbErr.message);
    }

    console.log(`[UploadAvatar] ✅ ${gender}/${age_group}/${country} → ${publicUrl}`);
    return res.json({ ok: true, url: publicUrl });

  } catch (e) {
    console.error('[UploadAvatar] Error:', e.message);
    return res.status(500).json({ error: e.message });
  }
};
