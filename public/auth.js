// ============================================================
//  FakeLive Pro — auth.js
//  === SUPABASE v4 — Autenticación + Sincronización ===
// ============================================================

// ────────────────────────────────────────────────────────────
//  CONFIGURACIÓN — reemplaza con los valores de tu proyecto
//  Dashboard Supabase → Settings → API
// ────────────────────────────────────────────────────────────
const SB_URL  = 'YOUR_SUPABASE_PROJECT_URL';  // https://xxxx.supabase.co
const SB_ANON = 'YOUR_SUPABASE_ANON_KEY';     // clave anon pública (segura para exponer)

// ────────────────────────────────────────────────────────────
//  CLIENTE
// ────────────────────────────────────────────────────────────
let sbClient   = null;
let _sbSession = null;
const _sbDebounce = {};

function sbClientInit() {
  if (!window.supabase) {
    console.warn('[SB] SDK de Supabase no cargado');
    return;
  }
  if (SB_URL === 'YOUR_SUPABASE_PROJECT_URL') {
    console.warn('[SB] Configura SB_URL y SB_ANON en auth.js');
    // Modo offline: mostrar app sin auth
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
//  PANTALLA DE AUTH
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

function sbSetAuthLoading(btnId, loading, label) {
  const btn = document.getElementById(btnId);
  if (!btn) return;
  btn.disabled = loading;
  btn.textContent = loading ? 'Enviando...' : label;
}

// ── Tabs email / teléfono ─────────────────────────────────
function sbInitAuthTabs() {
  document.querySelectorAll('.auth-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('auth-tab-active'));
      document.querySelectorAll('.auth-tab-content').forEach(c => { c.style.display = 'none'; });
      tab.classList.add('auth-tab-active');
      const content = document.getElementById('auth-tab-' + tab.dataset.tab);
      if (content) content.style.display = '';
      sbSetAuthError('');
    });
  });
}

// ── Email — magic link ────────────────────────────────────
async function sbSendMagicLink() {
  if (!sbClient) return;
  const input = document.getElementById('auth-email-input');
  const email = input?.value?.trim();
  if (!email || !email.includes('@')) { sbSetAuthError('Ingresa un correo válido'); return; }

  sbSetAuthLoading('btn-send-magic-link', true);
  sbSetAuthError('');

  const redirectTo = window.location.origin + window.location.pathname;
  try {
    const { error } = await sbClient.auth.signInWithOtp({ email, options: { emailRedirectTo: redirectTo } });
    if (error) throw error;
    document.getElementById('auth-email-form').style.display = 'none';
    document.getElementById('auth-email-sent').style.display = '';
  } catch (e) {
    sbSetAuthError(e.message || 'Error enviando el enlace');
    sbSetAuthLoading('btn-send-magic-link', false, '✉️ Enviar enlace mágico');
  }
}

// ── Teléfono — OTP SMS ────────────────────────────────────
let _sbPhoneForOtp = '';

async function sbSendPhoneOtp() {
  if (!sbClient) return;
  const phone = document.getElementById('auth-phone-input')?.value?.trim();
  if (!phone || phone.length < 8) { sbSetAuthError('Ingresa tu número con código de país (+57...)'); return; }

  sbSetAuthLoading('btn-send-phone-otp', true);
  sbSetAuthError('');

  try {
    const { error } = await sbClient.auth.signInWithOtp({ phone });
    if (error) throw error;
    _sbPhoneForOtp = phone;
    document.getElementById('auth-phone-form').style.display = 'none';
    document.getElementById('auth-otp-form').style.display  = '';
  } catch (e) {
    sbSetAuthError(e.message || 'Error enviando el SMS');
    sbSetAuthLoading('btn-send-phone-otp', false, '📲 Enviar código SMS');
  }
}

async function sbVerifyPhoneOtp() {
  if (!sbClient) return;
  const token = document.getElementById('auth-otp-input')?.value?.trim();
  if (!token || token.length < 6) { sbSetAuthError('Ingresa el código de 6 dígitos'); return; }

  sbSetAuthLoading('btn-verify-otp', true);
  sbSetAuthError('');

  try {
    const { error } = await sbClient.auth.verifyOtp({ phone: _sbPhoneForOtp, token, type: 'sms' });
    if (error) throw error;
    // onAuthStateChange manejará el login
  } catch (e) {
    sbSetAuthError(e.message || 'Código incorrecto. Intenta de nuevo.');
    sbSetAuthLoading('btn-verify-otp', false, '✓ Verificar código');
  }
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
  const uid = _sbSession.user.id;

  try {
    // 1. Settings / Metadata / Profile
    const { data: row } = await sbClient
      .from('user_settings')
      .select('settings, metadata, profile')
      .eq('user_id', uid)
      .maybeSingle();

    if (row) {
      if (row.settings && Object.keys(row.settings).length) {
        let current = {};
        try { current = JSON.parse(localStorage.getItem('fakelive_stream') || '{}'); } catch (_) {}
        const streamKey = current['stream-key']; // conservar la stream key local (no se sincroniza)
        const merged    = Object.assign({}, current, row.settings);
        if (streamKey !== undefined) merged['stream-key'] = streamKey;
        localStorage.setItem('fakelive_stream', JSON.stringify(merged));
      }
      if (row.metadata && Object.keys(row.metadata).length)
        localStorage.setItem('fakelive_metadata', JSON.stringify(row.metadata));
      if (row.profile && Object.keys(row.profile).length)
        localStorage.setItem('fakelive_profile', JSON.stringify(row.profile));
    }

    // 2. Guiones guardados
    const { data: scripts } = await sbClient
      .from('scripts')
      .select('name, content, duration, created_at')
      .eq('user_id', uid);

    if (scripts && scripts.length) {
      scripts.forEach(s => {
        const safe = s.name.replace(/[^a-zA-Z0-9_\-\s]/g, '').replace(/\s+/g, '_');
        localStorage.setItem('fakelive_saved_' + safe, JSON.stringify({
          name:      s.name,
          content:   s.content,
          duration:  s.duration || 0,
          createdAt: new Date(s.created_at).getTime()
        }));
      });
    }

    // 3. Historial de sesiones (últimas 20)
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

    // Re-renderizar secciones del sidebar si ya están inicializadas
    if (typeof sbRenderSavedScripts === 'function') sbRenderSavedScripts();
    if (typeof sbRenderSessions    === 'function') sbRenderSessions();
    if (typeof sbLoadMetadata      === 'function') sbLoadMetadata();
    if (typeof sbLoadProfile       === 'function') sbLoadProfile();
    if (typeof sbLoadStreamSettings === 'function') {
      sbLoadStreamSettings();
      if (typeof sbApplyStreamSettings === 'function') sbApplyStreamSettings();
    }

    if (typeof showToast === 'function') showToast('Datos sincronizados ✓', 'success');
  } catch (e) {
    console.error('[SB] Error cargando datos:', e);
    if (typeof showToast === 'function') showToast('Error al cargar desde la nube', 'error');
  }
}

// ────────────────────────────────────────────────────────────
//  SINCRONIZACIÓN — localStorage → Supabase (debounced 1.5s)
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
    console.error('[SB] Error sincronizando [' + type + ']:', e.message);
  }
}

// ────────────────────────────────────────────────────────────
//  LISTENER DE ESTADO DE AUTH
// ────────────────────────────────────────────────────────────
function sbInitAuthListener() {
  if (!sbClient) {
    // Sin configuración de Supabase: ocultar pantalla de auth y continuar offline
    sbHideAuth();
    return;
  }

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
  sbInitAuthTabs();

  // Magic link
  document.getElementById('btn-send-magic-link')
    ?.addEventListener('click', sbSendMagicLink);
  document.getElementById('auth-email-input')
    ?.addEventListener('keydown', e => { if (e.key === 'Enter') sbSendMagicLink(); });
  document.getElementById('btn-email-back')
    ?.addEventListener('click', () => {
      document.getElementById('auth-email-sent').style.display = 'none';
      document.getElementById('auth-email-form').style.display = '';
    });

  // OTP teléfono
  document.getElementById('btn-send-phone-otp')
    ?.addEventListener('click', sbSendPhoneOtp);
  document.getElementById('auth-phone-input')
    ?.addEventListener('keydown', e => { if (e.key === 'Enter') sbSendPhoneOtp(); });
  document.getElementById('btn-verify-otp')
    ?.addEventListener('click', sbVerifyPhoneOtp);
  document.getElementById('auth-otp-input')
    ?.addEventListener('keydown', e => { if (e.key === 'Enter') sbVerifyPhoneOtp(); });
  document.getElementById('btn-phone-back')
    ?.addEventListener('click', () => {
      document.getElementById('auth-otp-form').style.display  = 'none';
      document.getElementById('auth-phone-form').style.display = '';
      _sbPhoneForOtp = '';
    });

  // Saltar login (modo offline)
  document.getElementById('btn-skip-auth')
    ?.addEventListener('click', sbHideAuth);

  // Cerrar sesión
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
