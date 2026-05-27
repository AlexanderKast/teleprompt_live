#!/usr/bin/env node
// ============================================================
//  FakeLive Pro — scripts/generate-avatars.js
//  Script ONE-TIME para generar 50 avatares piloto con
//  Gemini Imagen 3, subirlos a Supabase Storage e insertar
//  metadatos en la tabla lc_avatars.
//
//  Requisitos:
//    npm install @supabase/supabase-js sharp
//
//  Uso:
//    GEMINI_KEY=AIza... SUPABASE_URL=https://xxx.supabase.co \
//    SUPABASE_SERVICE_KEY=eyJ... node scripts/generate-avatars.js
//
//  Opcional (para re-ejecuciones parciales):
//    SKIP_EXISTING=true  → salta uploads si ya existe la fila
// ============================================================

const sharp         = require('sharp');
const { createClient } = require('@supabase/supabase-js');

const GEMINI_KEY         = process.env.GEMINI_KEY;
const SUPABASE_URL       = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
const SKIP_EXISTING      = process.env.SKIP_EXISTING === 'true';
const BUCKET             = 'fakelive-avatars';
const CONCURRENCY        = 2; // llamadas simultáneas a Gemini Imagen

if (!GEMINI_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Variables de entorno requeridas: GEMINI_KEY, SUPABASE_URL, SUPABASE_SERVICE_KEY');
  process.exit(1);
}

const sb = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// ── Descripción étnica por país ───────────────────────────
const ETHNICITY_MAP = {
  'Colombia':    'Colombian Latin American',
  'México':      'Mexican Latin American',
  'Venezuela':   'Venezuelan Latin American',
  'Ecuador':     'Ecuadorian Latin American',
  'Argentina':   'Argentine Latin American',
  'Otro':        'Latin American'
};

// ── Distribución de 50 avatares ───────────────────────────
// Formato: [country, gender, age_group, count]
const DISTRIBUTION = [
  // Colombia: 20 avatares
  ['Colombia', 'female', 'young',  4],
  ['Colombia', 'female', 'adult',  4],
  ['Colombia', 'female', 'middle', 2],
  ['Colombia', 'male',   'young',  4],
  ['Colombia', 'male',   'adult',  4],
  ['Colombia', 'male',   'middle', 2],
  // México: 8 avatares
  ['México',   'female', 'young',  2],
  ['México',   'female', 'adult',  2],
  ['México',   'male',   'young',  2],
  ['México',   'male',   'adult',  2],
  // Venezuela: 4 avatares
  ['Venezuela','female', 'adult',  2],
  ['Venezuela','male',   'adult',  2],
  // Ecuador: 4 avatares
  ['Ecuador',  'female', 'young',  2],
  ['Ecuador',  'male',   'young',  2],
  // Argentina: 4 avatares
  ['Argentina','female', 'adult',  2],
  ['Argentina','male',   'adult',  2],
  // Genérico: 10 avatares
  ['Otro',     'female', 'young',  2],
  ['Otro',     'female', 'adult',  2],
  ['Otro',     'female', 'middle', 1],
  ['Otro',     'male',   'young',  2],
  ['Otro',     'male',   'adult',  2],
  ['Otro',     'male',   'middle', 1],
];

// Expandir distribución a una lista plana de tareas
const AGE_RANGES = { young: [22, 28], adult: [29, 38], middle: [39, 45] };
function randAge(group) {
  const [min, max] = AGE_RANGES[group];
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const tasks = [];
let taskId = 1;
for (const [country, gender, ageGroup, count] of DISTRIBUTION) {
  for (let i = 0; i < count; i++) {
    tasks.push({ id: taskId++, country, gender, age_group: ageGroup, age_hint: randAge(ageGroup) });
  }
}
console.log(`📋 ${tasks.length} avatares a generar`);

// ── Generar imagen con Gemini Imagen 3 ────────────────────
async function generateWithGemini(task) {
  const ethnicity = ETHNICITY_MAP[task.country] || 'Latin American';
  const genderWord = task.gender === 'female' ? 'woman' : 'man';
  const prompt = `Professional headshot portrait photo, ${genderWord}, approximately ${task.age_hint} years old, ${ethnicity} appearance, soft neutral background, natural lighting, realistic photography, LinkedIn style profile`;

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=${GEMINI_KEY}`,
    {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({
        instances:  [{ prompt }],
        parameters: { sampleCount: 1, aspectRatio: '1:1', personGeneration: 'allow_all' }
      }),
      signal: AbortSignal.timeout(30000)
    }
  );
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gemini HTTP ${res.status}: ${err.slice(0, 200)}`);
  }
  const data = await res.json();
  const b64  = data?.predictions?.[0]?.bytesBase64Encoded;
  if (!b64) throw new Error('Gemini no devolvió imagen');
  return Buffer.from(b64, 'base64');
}

// ── Redimensionar a 100×100 JPEG q65 ─────────────────────
async function resizeImage(buffer) {
  return sharp(buffer, { density: 72 })
    .resize(100, 100, { fit: 'cover', position: 'centre' })
    .jpeg({ quality: 65 })
    .toBuffer();
}

// ── Subir a Supabase Storage ──────────────────────────────
async function uploadToStorage(jpegBuffer, filename) {
  // Asegurar que el bucket existe
  await sb.storage.createBucket(BUCKET, { public: true }).catch(() => {});

  const { error } = await sb.storage
    .from(BUCKET)
    .upload(filename, jpegBuffer, { contentType: 'image/jpeg', upsert: true });
  if (error) throw new Error('Storage upload: ' + error.message);

  const { data } = sb.storage.from(BUCKET).getPublicUrl(filename);
  return data.publicUrl;
}

// ── Procesar una tarea ────────────────────────────────────
async function processTask(task) {
  const label = `[${task.id}/${tasks.length}] ${task.gender}/${task.age_group}/${task.country}`;

  if (SKIP_EXISTING) {
    const { data } = await sb
      .from('lc_avatars')
      .select('id')
      .eq('gender',    task.gender)
      .eq('age_group', task.age_group)
      .eq('country',   task.country)
      .limit(1);
    if (data && data.length > 0) {
      console.log(`⏭  ${label} — ya existe, omitiendo`);
      return;
    }
  }

  console.log(`⏳ ${label} — generando...`);

  // 1. Generar imagen
  let rawBuffer;
  try {
    rawBuffer = await generateWithGemini(task);
  } catch (e) {
    console.warn(`⚠️  ${label} — Gemini falló: ${e.message}`);
    return;
  }

  // 2. Redimensionar
  let jpegBuffer;
  try {
    jpegBuffer = await resizeImage(rawBuffer);
  } catch (e) {
    console.warn(`⚠️  ${label} — resize falló: ${e.message}`);
    return;
  }

  // 3. Subir
  const filename = `avatars/${task.gender}_${task.age_group}_${task.country.replace(/[^a-zA-Z]/g,'')}_${Date.now()}_${task.id}.jpg`;
  let publicUrl;
  try {
    publicUrl = await uploadToStorage(jpegBuffer, filename);
  } catch (e) {
    console.warn(`⚠️  ${label} — upload falló: ${e.message}`);
    return;
  }

  // 4. Insertar en lc_avatars
  const { error: dbErr } = await sb.from('lc_avatars').insert({
    url:       publicUrl,
    gender:    task.gender,
    age_group: task.age_group,
    country:   task.country,
    age_hint:  task.age_hint,
    style:     'photo'
  });
  if (dbErr) {
    console.warn(`⚠️  ${label} — DB insert falló: ${dbErr.message}`);
    return;
  }

  console.log(`✅ ${label} — listo: ${publicUrl}`);
}

// ── Ejecutar con concurrencia limitada ────────────────────
async function runAll() {
  console.log(`\n🚀 Iniciando generación de ${tasks.length} avatares...\n`);
  let i = 0;
  async function next() {
    if (i >= tasks.length) return;
    const task = tasks[i++];
    await processTask(task);
    await next();
  }
  const workers = Array.from({ length: CONCURRENCY }, () => next());
  await Promise.all(workers);
  console.log('\n🎉 Proceso completado. Verifica la tabla lc_avatars en Supabase.');
}

runAll().catch(e => { console.error('Error fatal:', e); process.exit(1); });
