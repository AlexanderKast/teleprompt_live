// ============================================================
//  FakeLive Pro — auth.js
//  === SUPABASE v4 — Autenticación + Sincronización ===
// ============================================================

// ────────────────────────────────────────────────────────────
//  CONFIGURACIÓN — reemplaza con los valores de tu proyecto
//  Dashboard Supabase → Settings → API
// ────────────────────────────────────────────────────────────
const SB_URL  = 'YOUR_SUPABASE_PROJECT_URL';  // https://xxxx.supabase.co
const SB_ANON = 'YOUR_SUPABASE_ANON_KEY';     // clave anon pública (segura de exponer)

// ────────────────────────────────────────────────────────────
//  CLIENTE
// ────────────────────────────────────────────────────────────
let sbClient   = null;
let _sbSession = null;
const _sbDebounce = {};

function sbClientInit() {
  if (!window.supabase) { console.warn('[SB] SDK de Supabase no cargado'); return; }
  if (SB_URL === 'YOUR_SUPABASE_PROJECT_URL') {
    console.warn('[SB] Configura SB_URL y SB_ANON en auth.js → modo offline activo');
    return;
  }
  try {
    sbClient = window.supabase.createClient(SB_URL, SB_ANON, {
      auth: { persistSession: true, autoRefreshToken: true }
    });
  } catch (e) {
    console.error('[SB] Error inicializando cliente:', e);
  }
}

// ────────────────────────────────────────────────────────────
//  SHOW / HIDE AUTH SCREEN
// ────────────────────────────────────────────────────────────
function sbShowAuth() {
  const el = document.getElementById('auth-screen');
  if (el) el.classList.add('auth-visible');
}
function sbHideAuth() {
  const el = document.getElementById('auth-screen');
  if (el) el.classList.remove('auth-visible');
}
function sbSetAuthError(msg) {
  const el = document.getElementById('auth-error');
  if (!el) return;
  el.textContent = msg;
  el.style.display = msg ? 'block' : 'none';
}

// ────────────────────────────────────────────────────────────
//  MODO LOGIN  (solo correo → magic link)
// ────────────────────────────────────────────────────────────
async function sbSendMagicLink() {
  if (!sbClient) return;
  const email = document.getElementById('auth-email-input')?.value?.trim();
  if (!email || !email.includes('@')) { sbSetAuthError('Ingresa un correo electrónico válido'); return; }

  const btn = document.getElementById('btn-send-magic-link');
  btn.disabled = true;
  btn.textContent = 'Enviando...';
  sbSetAuthError('');

  try {
    const { error } = await sbClient.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin + window.location.pathname }
    });
    if (error) throw error;
    sbShowConfirmation();
  } catch (e) {
    sbSetAuthError(e.message || 'Error al enviar el enlace. Intenta de nuevo.');
    btn.disabled = false;
    btn.textContent = '✉️ Enviar enlace de acceso';
  }
}

// ────────────────────────────────────────────────────────────
//  MODO REGISTRO  (Nombre + WhatsApp + Correo → magic link)
// ────────────────────────────────────────────────────────────
async function sbSendRegister() {
  if (!sbClient) return;
  const name     = document.getElementById('auth-name-input')?.value?.trim();
  const whatsapp = document.getElementById('auth-whatsapp-input')?.value?.trim();
  const email    = document.getElementById('auth-register-email-input')?.value?.trim();

  if (!name)                       { sbSetAuthError('Ingresa tu nombre'); return; }
  if (!email || !email.includes('@')) { sbSetAuthError('Ingresa un correo válido'); return; }

  const btn = document.getElementById('btn-send-register');
  btn.disabled = true;
  btn.textContent = 'Enviando...';
  sbSetAuthError('');

  // Guardar temporalmente para crear el perfil al volver del magic link
  localStorage.setItem('_sb_pending_profile', JSON.stringify({ nombre: name, whatsapp }));

  try {
    const { error } = await sbClient.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: window.location.origin + window.location.pathname,
        data: { display_name: name, whatsapp }   // guardado en user_metadata de Supabase
      }
    });
    if (error) throw error;
    sbShowConfirmation();
  } catch (e) {
    sbSetAuthError(e.message || 'Error al crear la cuenta. Intenta de nuevo.');
    btn.disabled = false;
    btn.textContent = '🚀 Crear cuenta';
  }
}

// ────────────────────────────────────────────────────────────
//  ESTADOS DE PANTALLA
// ────────────────────────────────────────────────────────────
function sbShowConfirmation() {
  document.getElementById('auth-mode-login')?.style    && (document.getElementById('auth-mode-login').style.display = 'none');
  document.getElementById('auth-mode-register')?.style && (document.getElementById('auth-mode-register').style.display = 'none');
  document.getElementById('auth-email-sent').style.display = '';
  sbSetAuthError('');
}

function sbShowLogin() {
  document.getElementById('auth-mode-login').style.display    = '';
  document.getElementById('auth-mode-register').style.display = 'none';
  document.getElementById('auth-email-sent').style.display    = 'none';
  sbSetAuthError('');
}

function sbShowRegister() {
  document.getElementById('auth-mode-login').style.display    = 'none';
  document.getElementById('auth-mode-register').style.display = '';
  document.getElementById('auth-email-sent').style.display    = 'none';
  sbSetAuthError('');
}

// ────────────────────────────────────────────────────────────
//  TARJETA DE USUARIO (sidebar)
// ────────────────────────────────────────────────────────────
function sbSetUserCard(user) {
  const card = document.getElementById('sb-user-card');
  const info = document.getElementById('sb-user-info-text');
  if (!card) return;
  if (info) {
    const id = user.email || user.phone || 'usuario';
    info.textContent = id.length > 22 ? id.slice(0, 20) + '…' : id;
  }
  card.style.display = 'flex';
}
function sbClearUserCard() {
  const card = document.getElementById('sb-user-card');
  if (card) card.style.display = 'none';
}

// ────────────────────────────────────────────────────────────
//  CERRAR SESIÓN
// ────────────────────────────────────────────────────────────
window.sbSignOut = async function () {
  if (!sbClient) return;
  await sbClient.auth.signOut();
};

// ────────────────────────────────────────────────────────────
//  CARGAR DATOS DESDE SUPABASE (al iniciar sesión)
// ────────────────────────────────────────────────────────────
async function sbLoadFromCloud() {
  if (!sbClient || !_sbSession) return;
  const uid  = _sbSession.user.id;
  const meta = _sbSession.user.user_metadata || {};

  try {
    // ── ¿Usuario nuevo? Crear perfil automáticamente ──────────
    const { data: existingRow } = await sbClient
      .from('user_settings')
      .select('user_id')
      .eq('user_id', uid)
      .maybeSingle();

    if (!existingRow) {
      // Recuperar datos de registro (metadata de Supabase o localStorage temporal)
      let pending = {};
      try { pending = JSON.parse(localStorage.getItem('_sb_pending_profile') || '{}'); } catch (_) {}
      const nombre   = meta.display_name || pending.nombre   || '';
      const whatsapp = meta.whatsapp     || pending.whatsapp || '';

      if (nombre) {
        // Pre-poblar perfil en Supabase
        await sbClient.from('user_settings').upsert({
          user_id:  uid,
          profile:  { nombre, whatsapp },
          settings: {},
          metadata: {},
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' });

        // Reflejar en localStorage
        localStorage.setItem('fakelive_profile', JSON.stringify({ nombre, whatsapp }));
        localStorage.removeItem('_sb_pending_profile');

        // Actualizar el campo de perfil en el sidebar si ya está renderizado
        const el = document.getElementById('profile-nombre');
        if (el) { el.value = nombre; }
        const elW = document.getElementById('profile-whatsapp');
        if (elW) { elW.value = whatsapp; }

        if (typeof showToast === 'function') showToast(`Bienvenido/a, ${nombre} 👋`, 'success');
      }
    }

    // ── Cargar settings / metadata / profile ─────────────────
    const { data: row } = await sbClient
      .from('user_settings')
      .select('settings, metadata, profile')
      .eq('user_id', uid)
      .maybeSingle();

    if (row) {
      if (row.settings && Object.keys(row.settings).length) {
        let current = {};
        try { current = JSON.parse(localStorage.getItem('fakelive_stream') || '{}'); } catch (_) {}
        const streamKey = current['stream-key'];           // conservar stream key local
        const merged    = Object.assign({}, current, row.settings);
        if (streamKey !== undefined) merged['stream-key'] = streamKey;
        localStorage.setItem('fakelive_stream', JSON.stringify(merged));
      }
      if (row.metadata && Object.keys(row.metadata).length)
        localStorage.setItem('fakelive_metadata', JSON.stringify(row.metadata));
      if (row.profile && Object.keys(row.profile).length)
        localStorage.setItem('fakelive_profile', JSON.stringify(row.profile));
    }

    // ── Cargar guiones guardados ──────────────────────────────
    const { data: scripts } = await sbClient
      .from('scripts')
      .select('name, content, duration, created_at')
      .eq('user_id', uid);

    if (scripts && scripts.length) {
      scripts.forEach(s => {
        const safe = s.name.replace(/[^a-zA-Z0-9_\-\s]/g, '').replace(/\s+/g, '_');
        localStorage.setItem('fakelive_saved_' + safe, JSON.stringify({
          name: s.name, content: s.content,
          duration: s.duration || 0,
          createdAt: new Date(s.created_at).getTime()
        }));
      });
    }

    // ── Cargar historial de sesiones ──────────────────────────
    const { data: sessions } = await sbClient
      .from('sessions')
      .select('date, duration, completion_percent, comments_triggered, emotions_triggered, countdowns_triggered')
      .eq('user_id', uid)
      .order('date', { ascending: false })
      .limit(20);

    if (sessions && sessions.length) {
      localStorage.setItem('fakelive_sessions', JSON.stringify(
        sessions.map(s => ({
          date:                new Date(s.date).getTime(),
          duration:            s.duration,
          completionPercent:   s.completion_percent,
          commentsTriggered:   s.comments_triggered,
          emotionsTriggered:   s.emotions_triggered,
          countdownsTriggered: s.countdowns_triggered
        }))
      ));
    }

    // ── Re-renderizar sidebar ─────────────────────────────────
    if (typeof sbRenderSavedScripts  === 'function') sbRenderSavedScripts();
    if (typeof sbRenderSessions      === 'function') sbRenderSessions();
    if (typeof sbLoadMetadata        === 'function') sbLoadMetadata();
    if (typeof sbLoadProfile         === 'function') sbLoadProfile();
    if (typeof sbLoadStreamSettings  === 'function') {
      sbLoadStreamSettings();
      if (typeof sbApplyStreamSettings === 'function') sbApplyStreamSettings();
    }

    if (!existingRow && !meta.display_name) {
      // Usuario nuevo sin nombre: toast genérico
      if (typeof showToast === 'function') showToast('Sesión iniciada ✓', 'success');
    } else if (existingRow) {
      if (typeof showToast === 'function') showToast('Datos sincronizados ✓', 'success');
    }
  } catch (e) {
    console.error('[SB] Error cargando datos:', e);
    if (typeof showToast === 'function') showToast('Error al cargar desde la nube', 'error');
  }
}

// ────────────────────────────────────────────────────────────
//  SINCRONIZACIÓN  localStorage → Supabase (debounced 1.5s)
// ────────────────────────────────────────────────────────────
window.sbSync = function (type, payload) {
  if (!sbClient || !_sbSession) return;
  clearTimeout(_sbDebounce[type]);
  _sbDebounce[type] = setTimeout(() => _sbDoSync(type, payload), 1500);
};

async function _sbDoSync(type, payload) {
  if (!sbClient || !_sbSession) return;
  const uid = _sbSession.user.id;
  try {
    if (type === 'settings') {
      await sbClient.from('user_settings').upsert({
        user_id:    uid,
        settings:   payload.settings || {},
        metadata:   payload.metadata || {},
        profile:    payload.profile  || {},
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id' });

    } else if (type === 'script_save') {
      await sbClient.from('scripts').upsert({
        user_id:    uid,
        name:       payload.name,
        content:    payload.content     || '',
        duration:   payload.duration    || 0,
        created_at: new Date(payload.createdAt || Date.now()).toISOString(),
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id,name' });

    } else if (type === 'script_delete') {
      await sbClient.from('scripts')
        .delete()
        .eq('user_id', uid)
        .eq('name', payload.name);

    } else if (type === 'session') {
      await sbClient.from('sessions').insert({
        user_id:              uid,
        date:                 new Date(payload.date).toISOString(),
        duration:             payload.duration             || 0,
        completion_percent:   payload.completionPercent    || 0,
        comments_triggered:   payload.commentsTriggered    || 0,
        emotions_triggered:   payload.emotionsTriggered    || 0,
        countdowns_triggered: payload.countdownsTriggered  || 0
      });
    }
  } catch (e) {
    console.error('[SB] Sync error [' + type + ']:', e.message);
  }
}

// ────────────────────────────────────────────────────────────
//  LISTENER DE ESTADO DE AUTH
// ────────────────────────────────────────────────────────────
function sbInitAuthListener() {
  if (!sbClient) { sbHideAuth(); return; } // sin configurar → modo offline directo

  sbClient.auth.onAuthStateChange(async (event, session) => {
    _sbSession = session;
    if (session) {
      sbHideAuth();
      sbSetUserCard(session.user);
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        await sbLoadFromCloud();
      }
    } else {
      sbClearUserCard();
      sbShowAuth();
      sbShowLogin(); // siempre volver al modo login al cerrar sesión
    }
  });

  // Verificar sesión existente al cargar la página
  sbClient.auth.getSession().then(({ data: { session } }) => {
    if (!session) sbShowAuth();
  });
}

// ────────────────────────────────────────────────────────────
//  BINDINGS DE EVENTOS
// ────────────────────────────────────────────────────────────
function sbBindAuthEvents() {
  // ── Modo Login ────────────────────────────────────────────
  document.getElementById('btn-send-magic-link')
    ?.addEventListener('click', sbSendMagicLink);
  document.getElementById('auth-email-input')
    ?.addEventListener('keydown', e => { if (e.key === 'Enter') sbSendMagicLink(); });

  // Ir a Registro
  document.getElementById('btn-go-register')
    ?.addEventListener('click', sbShowRegister);

  // ── Modo Registro ─────────────────────────────────────────
  document.getElementById('btn-send-register')
    ?.addEventListener('click', sbSendRegister);
  document.getElementById('auth-register-email-input')
    ?.addEventListener('keydown', e => { if (e.key === 'Enter') sbSendRegister(); });

  // Ir a Login
  document.getElementById('btn-go-login')
    ?.addEventListener('click', sbShowLogin);

  // ── Confirmación ─────────────────────────────────────────
  document.getElementById('btn-email-back')
    ?.addEventListener('click', sbShowLogin);

  // ── Saltar login ──────────────────────────────────────────
  document.getElementById('btn-skip-auth')
    ?.addEventListener('click', sbHideAuth);

  // ── Cerrar sesión ─────────────────────────────────────────
  document.getElementById('btn-sb-signout')
    ?.addEventListener('click', () => window.sbSignOut());
}

// ────────────────────────────────────────────────────────────
//  INIT
// ────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  sbClientInit();
  sbBindAuthEvents();
  sbInitAuthListener();
});
