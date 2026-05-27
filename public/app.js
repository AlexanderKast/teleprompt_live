/* ================================================
   FakeLive Pro — app.js  (Stitch design edition)
   ================================================ */

'use strict';

// ------------------------------------------------
// CONSTANTES
// ------------------------------------------------

const LS_SCRIPT   = 'fakelive_script';
const LS_SETTINGS = 'fakelive_settings';

const SPEED_MUL = { slow: 0.75, normal: 1.0, fast: 1.5 };

const BLOCK_RE = /^(\d{1,2}):(\d{2})\s+\[(GUION|COMENTARIO|RESPONDER|ACCION|MOSTRAR|PAUSA)\]\s+([\s\S]+)/;

const DEMO_SCRIPT = `00:00 [GUION] ¡Buenas noches a todos! Bienvenidos a este live. Hoy les voy a contar cómo empecé mi negocio de dropshipping desde cero, sin inventario y sin necesidad de un gran capital.
00:12 [ACCION] Saludar a la cámara con la mano y sonreír
00:18 [GUION] Si es tu primera vez aquí, soy Alexander, emprendedor digital desde Bogotá, Colombia. Dale like al stream para que llegue a más personas y activa las notificaciones.
00:30 [COMENTARIO] Laura_Bogota: hola!! primera vez en tu live, te encontré en instagram
00:33 [RESPONDER] Bienvenida Laura! Espero que este live te cambie la perspectiva del negocio online 🙌
00:40 [GUION] Vamos a comenzar con lo básico. El dropshipping es un modelo de negocio donde vendes productos online sin comprar stock ni manejar envíos. El proveedor lo hace todo por ti.
00:58 [COMENTARIO] MiguelTech_CO: eso suena muy bien, ¿pero funciona de verdad?
01:01 [RESPONDER] Miguel, funciona perfectamente cuando sabes elegir buenos productos y proveedores. Eso es lo que vamos a ver hoy.
01:10 [GUION] El primer paso es encontrar un nicho rentable. No vendas de todo. Elige una categoría con demanda constante y sin tanta competencia directa.
01:25 [MOSTRAR] Mostrar pantalla con lista de nichos: mascotas, cocina, fitness, gadgets de oficina remota, bebés
01:40 [GUION] Yo comencé con accesorios para mascotas. Los dueños gastan mucho y los productos tienen bajo costo con alto margen de ganancia.
01:55 [COMENTARIO] JuanC_Cali: ¿cuánto dinero necesito para arrancar?
01:58 [RESPONDER] Juan, con menos de 200 dólares puedes empezar. Tienda online + publicidad inicial. Te explico los costos exactos más adelante.
02:07 [GUION] Para proveedores: AliExpress es el más popular para principiantes. También CJ Dropshipping y Spocket para envíos más rápidos a Estados Unidos.
02:22 [ACCION] Abrir nueva pestaña con AliExpress y mostrar cómo buscar productos
02:28 [GUION] Lo que buscan en un proveedor: envío en menos de 15 días, reseñas positivas, historial de ventas alto, y comunicación ágil cuando hay problemas.
02:42 [COMENTARIO] Sofia_Medellin: ¿cómo hago para que el cliente no vea que viene de China?
02:45 [RESPONDER] Sofía, hay proveedores con empaque sin marca propia —white label— y tú pones tu logo. Lo explico en detalle en mi programa.
02:55 [GUION] Shopify es la plataforma número uno para dropshipping. Tiene todas las integraciones y puedes tener una tienda profesional lista en menos de un día.
03:08 [MOSTRAR] Mostrar estructura de tienda Shopify: home, página de producto, carrito, checkout
03:18 [GUION] Los elementos clave del producto: fotos de calidad, descripción persuasiva que resuelve objeciones, precio competitivo, y política de devolución clara.
03:33 [COMENTARIO] Pedro_Armenia: ¿Shopify no es muy caro para cuando uno empieza?
03:36 [RESPONDER] Pedro, hay trial de 3 días gratis y luego 1 dólar al mes por 3 meses. La inversión más accesible para arrancar profesionalmente.
03:42 [GUION] El marketing es lo que más le gusta a todos. Sin tráfico no hay ventas. El canal más poderoso hoy para dropshipping en LATAM es Meta Ads —Facebook e Instagram.
03:58 [ACCION] Cambiar a presentación de slides sobre estrategia Meta Ads
04:03 [GUION] Mi estrategia: empiezo con 5 dólares al día probando diferentes creatividades. Un video corto de 15 a 30 segundos mostrando el producto en uso genera los mejores resultados.
04:18 [COMENTARIO] Andrea_Bogota: ¿cuánto dinero se puede ganar al mes con dropshipping?
04:21 [RESPONDER] Andrea, conozco personas desde 500 hasta más de 10.000 dólares mensuales. Los primeros meses son de aprendizaje e inversión.
04:28 [GUION] Mi primer mes generé 1.200 dólares en ventas con 300 de inversión en publicidad. El margen neto fue cerca del 25%, es decir 300 dólares de ganancia real.
04:43 [COMENTARIO] DiegoE_Barranquilla: ¿qué hago cuando el cliente quiere devolver?
04:46 [RESPONDER] Diego, reembolsas sin pedir el producto de vuelta —si el costo lo permite—, o coordinas con el proveedor. La mayoría opta por reembolso directo para conservar al cliente.
04:55 [GUION] Errores comunes: productos demasiado caros o competidos, no probar suficientes creatividades, y rendirse antes de encontrar el producto ganador.
05:08 [ACCION] Beber agua y hacer una pausa breve
05:13 [GUION] Para encontrar productos ganadores uso Minea y AdSpy. Te muestran qué anuncios están funcionando para otros vendedores ahora mismo, con todos los datos de engagement.
05:28 [COMENTARIO] Valentina_Cali: ¿tienes algún curso donde enseñes todo esto paso a paso?
05:31 [RESPONDER] Valentina, sí tengo un programa completo con mentoría. Escríbeme al DM con la palabra DROPSHIP y te mando la información.
05:38 [GUION] Antes de cerrar, tres puntos clave: uno, la elección del producto es el 80% del éxito. Dos, los datos ganan. Tres, trátalo como negocio desde el día uno.
05:52 [MOSTRAR] Mostrar diapositiva resumen con los tres puntos clave
05:57 [PAUSA] Pausa para leer comentarios finales — 15 segundos
06:02 [GUION] Muchísimas gracias por acompañarme. Si les aportó valor, compartan el video y síganme para más contenido de emprendimiento digital. ¡Hasta el próximo live!`;


// ------------------------------------------------
// ESTADO GLOBAL
// ------------------------------------------------

const state = {
  blocks:          [],
  currentIdx:      0,
  isPlaying:       false,
  startTime:       null,
  elapsedAtPause:  0,
  timerInterval:   null,
  overlayTimer:    null,
  visibleComments: [],
  settings: {
    fontSize:    'medium',
    speed:       'normal',
    commentMode: 'side'
  }
};


// ------------------------------------------------
// PARSER
// ------------------------------------------------

function parseScript(text) {
  const result = [];
  for (const raw of text.split('\n')) {
    const m = raw.trim().match(BLOCK_RE);
    if (!m) continue;
    const mins    = parseInt(m[1], 10);
    const secs    = parseInt(m[2], 10);
    const type    = m[3];
    const content = m[4].trim();
    const time    = mins * 60 + secs;
    const timeStr = `${String(mins).padStart(2,'0')}:${String(secs).padStart(2,'0')}`;
    let username  = null;
    let message   = content;
    if (type === 'COMENTARIO') {
      const ci = content.indexOf(':');
      if (ci > 0) { username = content.slice(0, ci).trim(); message = content.slice(ci + 1).trim(); }
    }
    result.push({ time, timeStr, type, content, username, message });
  }
  return result;
}


// ------------------------------------------------
// PERSISTENCIA
// ------------------------------------------------

function loadSettings() {
  try {
    const raw = localStorage.getItem(LS_SETTINGS);
    if (raw) Object.assign(state.settings, JSON.parse(raw));
  } catch (_) {}
}

function saveSettings() {
  localStorage.setItem(LS_SETTINGS, JSON.stringify(state.settings));
}

function loadScript() {
  const raw = localStorage.getItem(LS_SCRIPT);
  if (raw) document.getElementById('script-textarea').value = raw;
  refreshBlockCount();
}

function saveScript() {
  localStorage.setItem(LS_SCRIPT, document.getElementById('script-textarea').value);
  refreshBlockCount();
}

function refreshBlockCount() {
  const text  = document.getElementById('script-textarea').value;
  const count = parseScript(text).length;
  document.getElementById('block-count').textContent =
    count + (count === 1 ? ' bloque' : ' bloques');
}


// ------------------------------------------------
// SCREENS
// ------------------------------------------------

function showScreen(id) {
  document.querySelectorAll('.screen').forEach(el => el.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}


// ------------------------------------------------
// PLAYER — ARRANQUE / SALIDA
// ------------------------------------------------

function startPlayer() {
  const text = document.getElementById('script-textarea').value.trim();
  if (!text) { alert('El guión está vacío. Escribe algo o carga el demo primero.'); return; }
  const blocks = parseScript(text);
  if (!blocks.length) { alert('No se encontraron bloques válidos.\nFormato: MM:SS [TIPO] contenido'); return; }

  state.blocks          = blocks;
  state.currentIdx      = 0;
  state.isPlaying       = true;
  state.startTime       = Date.now();
  state.elapsedAtPause  = 0;
  state.visibleComments = [];

  applyFontSize();
  applyCommentMode();
  renderAllBlocks();
  renderCommentFeed();
  updateNowPlaying();
  updateStatusBar(0);
  syncPauseButton();
  showScreen('player-screen');
  startTick();
  setTimeout(scrollToActive, 100);
}

function exitPlayer() {
  stopTick();
  clearOverlayTimer();
  state.isPlaying = false;
  showScreen('editor-screen');
}


// ------------------------------------------------
// TIMER
// ------------------------------------------------

function startTick() {
  stopTick();
  state.timerInterval = setInterval(tick, 100);
}

function stopTick() {
  if (state.timerInterval) { clearInterval(state.timerInterval); state.timerInterval = null; }
}

function getElapsed() {
  if (!state.isPlaying) return state.elapsedAtPause;
  return state.elapsedAtPause + (Date.now() - state.startTime) / 1000;
}

function tick() {
  const elapsed     = getElapsed();
  const scriptTime  = elapsed * SPEED_MUL[state.settings.speed];

  updateTimerDisplay(elapsed);
  updateProgressFill(scriptTime);

  // Find which block should be active
  let newIdx = state.currentIdx;
  for (let i = 0; i < state.blocks.length; i++) {
    if (state.blocks[i].time <= scriptTime) newIdx = i;
  }
  if (newIdx === state.currentIdx) return;

  const prevIdx = state.currentIdx;
  state.currentIdx = newIdx;

  // Register comments for any skipped blocks
  for (let i = prevIdx + 1; i <= newIdx; i++) {
    const b = state.blocks[i];
    if (b.type === 'COMENTARIO') {
      const nextB = state.blocks[i + 1];
      pushComment(i, b, nextB && nextB.type === 'RESPONDER' ? nextB.content : null);
    }
  }

  // Bottom overlay
  const active = state.blocks[newIdx];
  if (active.type === 'COMENTARIO') {
    const mode = state.settings.commentMode;
    if (mode === 'bottom' || mode === 'both') showBottomOverlay(active);
  }

  renderBlockStates();
  scrollToActive();
  updateStatusBar(scriptTime);
  updateNowPlaying();
}

function pauseResume() {
  if (state.isPlaying) {
    state.elapsedAtPause = getElapsed();
    state.isPlaying = false;
    stopTick();
  } else {
    state.startTime = Date.now();
    state.isPlaying = true;
    startTick();
  }
  syncPauseButton();
}

function syncPauseButton() {
  const btn   = document.getElementById('btn-pause-resume');
  const icon  = btn.querySelector('.material-symbols-outlined');
  const label = btn.querySelector('.font-label-caps');
  if (state.isPlaying) {
    if (icon)  icon.textContent  = 'pause';
    if (label) label.textContent = 'Pausar';
    btn.classList.remove('is-paused');
  } else {
    if (icon)  icon.textContent  = 'play_arrow';
    if (label) label.textContent = 'Reanudar';
    btn.classList.add('is-paused');
  }
}

function jumpTo(idx) {
  if (idx < 0 || idx >= state.blocks.length) return;
  const block = state.blocks[idx];
  state.currentIdx     = idx;
  state.elapsedAtPause = block.time / SPEED_MUL[state.settings.speed];
  if (state.isPlaying) state.startTime = Date.now();

  // Rebuild visible comments up to this point
  state.visibleComments = [];
  for (let i = 0; i <= idx; i++) {
    const b = state.blocks[i];
    if (b.type === 'COMENTARIO') {
      const nextB = state.blocks[i + 1];
      state.visibleComments.push({
        blockIdx:  i,
        block:     b,
        replyHint: nextB && nextB.type === 'RESPONDER' ? nextB.content : null
      });
    }
  }

  renderBlockStates();
  renderCommentFeed();
  scrollToActive();
  updateStatusBar(block.time);
  updateNowPlaying();

  if (block.type === 'COMENTARIO') {
    const mode = state.settings.commentMode;
    if (mode === 'bottom' || mode === 'both') showBottomOverlay(block);
  }
}

function nextBlock() { if (state.currentIdx < state.blocks.length - 1) jumpTo(state.currentIdx + 1); }
function prevBlock() { if (state.currentIdx > 0) jumpTo(state.currentIdx - 1); }


// ------------------------------------------------
// RENDER — BLOCKS
// ------------------------------------------------

function renderAllBlocks() {
  const container = document.getElementById('blocks-container');
  container.innerHTML = '';
  container.className = 'flex-1 overflow-y-auto script-scroll-mask fsize-' + state.settings.fontSize;

  container.appendChild(makeSpacer());

  state.blocks.forEach((block, idx) => {
    const el = document.createElement('article');
    el.id        = `blk-${idx}`;
    el.dataset.idx = idx;
    el.className = `script-block type-${block.type.toLowerCase()}`;

    el.innerHTML = `
      <div style="width:72px;flex-shrink:0;display:flex;flex-direction:column;align-items:flex-end;padding-top:4px;">
        <span class="block-ts">${escHtml(block.timeStr)}</span>
      </div>
      <div style="flex:1;min-width:0;">
        <span class="block-tag">${escHtml(block.type)}</span>
        <p class="block-text">${escHtml(block.content)}</p>
      </div>`;

    container.appendChild(el);
  });

  container.appendChild(makeSpacer());
  renderBlockStates();
}

function makeSpacer() {
  const d = document.createElement('div');
  d.className = 'scroll-spacer';
  return d;
}

function renderBlockStates() {
  const cur = state.currentIdx;
  state.blocks.forEach((_, idx) => {
    const el = document.getElementById(`blk-${idx}`);
    if (!el) return;
    el.classList.remove('is-active', 'is-past', 'is-upcoming');
    if      (idx < cur)  el.classList.add('is-past');
    else if (idx === cur) el.classList.add('is-active');
    else                  el.classList.add('is-upcoming');
  });
}

function scrollToActive() {
  const el = document.getElementById(`blk-${state.currentIdx}`);
  if (!el) return;
  const c = document.getElementById('blocks-container');
  c.scrollTo({ top: el.offsetTop - c.clientHeight / 2 + el.clientHeight / 2, behavior: 'smooth' });
}


// ------------------------------------------------
// RENDER — COMMENTS
// ------------------------------------------------

function pushComment(blockIdx, block, replyHint) {
  if (state.visibleComments.some(c => c.blockIdx === blockIdx)) return;
  state.visibleComments.push({ blockIdx, block, replyHint });
  renderCommentFeed();
}

function renderCommentFeed() {
  const feed    = document.getElementById('comments-feed');
  const countEl = document.getElementById('comments-count');
  const total   = state.visibleComments.length;
  countEl.textContent = total;
  feed.innerHTML = '';

  state.visibleComments.forEach((item, i) => {
    const isLatest  = i === total - 1;
    const user      = item.block.username || 'Viewer';
    const msg       = item.block.message  || item.block.content;
    const initials  = user.slice(0, 2).toUpperCase();

    const card = document.createElement('div');
    card.className = 'comment-card rounded-lg border p-md ' + (
      isLatest
        ? 'bg-surface-container-high border-tertiary/40 shadow-[0_0_15px_rgba(0,228,117,0.2)]'
        : 'bg-surface-container border-white/5 opacity-60'
    );

    const replyHtml = item.replyHint
      ? `<div class="flex items-center gap-xs text-tertiary bg-tertiary/10 p-2 rounded mt-sm">
           <span class="material-symbols-outlined" style="font-size:14px;">chat_bubble</span>
           <span class="font-label-caps text-[10px]">${escHtml(item.replyHint)}</span>
         </div>`
      : '';

    card.innerHTML = `
      <div class="flex items-center justify-between mb-sm">
        <div class="flex items-center gap-sm">
          <div class="${isLatest ? 'w-7 h-7 bg-tertiary text-on-tertiary' : 'w-6 h-6 bg-surface-container-highest text-on-surface-variant'} rounded-full flex items-center justify-center text-[10px] font-bold">
            ${escHtml(initials)}
          </div>
          <span class="font-label-caps text-[11px] ${isLatest ? 'text-tertiary' : 'text-on-surface-variant'}">
            ${isLatest ? '@' : ''}${escHtml(user)}
          </span>
        </div>
        ${isLatest ? '<span class="text-[10px] text-on-surface-variant/50">Reciente</span>' : ''}
      </div>
      <p class="text-on-surface ${isLatest ? 'font-medium text-[14px]' : 'text-on-surface-variant text-[13px]'} leading-relaxed">
        ${escHtml(msg)}
      </p>
      ${replyHtml}
    `;

    feed.appendChild(card);
  });

  requestAnimationFrame(() => { feed.scrollTop = feed.scrollHeight; });
}


// ------------------------------------------------
// STATUS BAR / UI UPDATES
// ------------------------------------------------

function updateStatusBar(scriptTime) {
  const nextB = state.blocks[state.currentIdx + 1];
  const preview = nextB
    ? `[${nextB.type}] ${nextB.content.slice(0, 58)}${nextB.content.length > 58 ? '…' : ''}`
    : 'Fin del guión';
  document.getElementById('next-preview').textContent = preview;
}

function updateTimerDisplay(elapsed) {
  const m = Math.floor(elapsed / 60);
  const s = Math.floor(elapsed % 60);
  document.getElementById('live-timer').textContent =
    `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
}

function updateProgressFill(scriptTime) {
  const last = state.blocks[state.blocks.length - 1];
  if (!last || last.time === 0) return;
  const pct = Math.min(100, (scriptTime / last.time) * 100);
  document.getElementById('progress-fill').style.width = pct + '%';
}

function updateNowPlaying() {
  const b = state.blocks[state.currentIdx];
  document.getElementById('now-playing-text').textContent = b ? `[${b.type}] ${b.content}` : '—';
}


// ------------------------------------------------
// BOTTOM OVERLAY
// ------------------------------------------------

function showBottomOverlay(block) {
  clearOverlayTimer();
  document.getElementById('overlay-user').textContent = '@' + (block.username || 'viewer');
  document.getElementById('overlay-msg').textContent  = block.message || block.content;
  document.getElementById('bottom-overlay').classList.remove('hidden');
  state.overlayTimer = setTimeout(() => {
    document.getElementById('bottom-overlay').classList.add('hidden');
  }, 6000);
}

function clearOverlayTimer() {
  if (state.overlayTimer) { clearTimeout(state.overlayTimer); state.overlayTimer = null; }
}


// ------------------------------------------------
// SETTINGS
// ------------------------------------------------

function applyFontSize() {
  const c = document.getElementById('blocks-container');
  if (!c) return;
  c.classList.remove('fsize-small', 'fsize-medium', 'fsize-large', 'fsize-xlarge');
  c.classList.add('fsize-' + state.settings.fontSize);
}

function applyCommentMode() {
  const panel = document.getElementById('comments-panel');
  if (!panel) return;
  panel.style.display = state.settings.commentMode === 'bottom' ? 'none' : 'flex';
}

function applySettingsToUI() {
  const fs = document.getElementById('select-font-size');
  const sp = document.getElementById('select-speed');
  const cm = document.getElementById('select-comment-mode');
  if (fs) fs.value = state.settings.fontSize;
  if (sp) sp.value = state.settings.speed;
  if (cm) cm.value = state.settings.commentMode;
}


// ------------------------------------------------
// UTILS
// ------------------------------------------------

function escHtml(str) {
  return String(str)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;')
    .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}


// ------------------------------------------------
// EVENT LISTENERS
// ------------------------------------------------

function bindEvents() {
  const textarea = document.getElementById('script-textarea');
  textarea.addEventListener('input', saveScript);

  document.getElementById('btn-load-demo').addEventListener('click', () => {
    textarea.value = DEMO_SCRIPT;
    saveScript();
  });

  // Both start buttons trigger startPlayer
  document.getElementById('btn-start-live').addEventListener('click', startPlayer);
  const btn2 = document.getElementById('btn-start-live-2');
  if (btn2) btn2.addEventListener('click', startPlayer);

  // Settings selects
  document.getElementById('select-font-size').addEventListener('change', e => {
    state.settings.fontSize = e.target.value;
    saveSettings();
  });
  document.getElementById('select-speed').addEventListener('change', e => {
    state.settings.speed = e.target.value;
    saveSettings();
  });
  document.getElementById('select-comment-mode').addEventListener('change', e => {
    state.settings.commentMode = e.target.value;
    saveSettings();
  });

  // Player controls
  document.getElementById('btn-pause-resume').addEventListener('click', pauseResume);
  document.getElementById('btn-next-block').addEventListener('click',   nextBlock);
  document.getElementById('btn-prev-block').addEventListener('click',   prevBlock);
  document.getElementById('btn-exit').addEventListener('click',         exitPlayer);

  // Keyboard shortcuts (only active in player screen)
  document.addEventListener('keydown', e => {
    if (!document.getElementById('player-screen').classList.contains('active')) return;
    switch (e.key) {
      case ' ':          e.preventDefault(); pauseResume(); break;
      case 'ArrowRight': e.preventDefault(); nextBlock();   break;
      case 'ArrowLeft':  e.preventDefault(); prevBlock();   break;
      case 'Escape':                          exitPlayer();  break;
    }
  });
}


// ------------------------------------------------
// INIT
// ------------------------------------------------

function init() {
  loadSettings();
  applySettingsToUI();
  loadScript();
  bindEvents();
}

document.addEventListener('DOMContentLoaded', init);


// ================================================
// === SUPERPOWERS v2 ===
// ================================================

const LS_GEMINI_KEY = 'fakelive_gemini_key';

// ---- Gemini key helpers ----
function spGetGeminiKey() { return localStorage.getItem(LS_GEMINI_KEY) || ''; }
function spSaveGeminiKey(k) { localStorage.setItem(LS_GEMINI_KEY, k.trim()); }

// ---- Override parseScript to add EMOCION + COUNTDOWN ----
const SP_BLOCK_RE = /^(\d{1,2}):(\d{2})\s+\[(GUION|COMENTARIO|RESPONDER|ACCION|MOSTRAR|PAUSA|EMOCION|COUNTDOWN)\]\s+([\s\S]+)/;

window.parseScript = function(text) {
  const result = [];
  for (const raw of text.split('\n')) {
    const m = raw.trim().match(SP_BLOCK_RE);
    if (!m) continue;
    const mins    = parseInt(m[1], 10);
    const secs    = parseInt(m[2], 10);
    const type    = m[3];
    const content = m[4].trim();
    const time    = mins * 60 + secs;
    const timeStr = `${String(mins).padStart(2,'0')}:${String(secs).padStart(2,'0')}`;
    let username  = null;
    let message   = content;
    if (type === 'COMENTARIO') {
      const ci = content.indexOf(':');
      if (ci > 0) { username = content.slice(0, ci).trim(); message = content.slice(ci + 1).trim(); }
    }
    result.push({ time, timeStr, type, content, username, message });
  }
  return result;
};

// ---- Override renderBlockStates to hook active-block events ----
const _sp_origRBS = window.renderBlockStates;
let _sp_lastActiveIdx = -1;

window.renderBlockStates = function() {
  _sp_origRBS.call(this);
  if (!document.getElementById('player-screen').classList.contains('active')) {
    _sp_lastActiveIdx = -1;
    return;
  }
  const idx = state.currentIdx;
  if (idx !== _sp_lastActiveIdx) {
    _sp_lastActiveIdx = idx;
    spHandleActiveBlock(idx);
  }
};

// ---- Route to correct handler ----
function spHandleActiveBlock(idx) {
  const block = state.blocks[idx];
  if (!block) return;
  if (block.type === 'EMOCION')   spTriggerEmocion(block.content.trim().split(/\s+/)[0].toUpperCase());
  if (block.type === 'COUNTDOWN') spTriggerCountdown(parseInt(block.content.trim(), 10) || 5);
}

// ---- FEATURE 1: EMOCION overlay ----
const SP_EMOCION_MAP = {
  CELEBRAR:  { emoji:'🎉', css:'sp-celebrar',  dur:2500, label:'CELEBRAR'  },
  INTRIGA:   { emoji:'🔍', css:'sp-intriga',   dur:2500, label:'INTRIGA'   },
  URGENCIA:  { emoji:'🔴', css:'sp-urgencia',  dur:2500, label:'URGENCIA'  },
  SORPRESA:  { emoji:'😱', css:'sp-sorpresa',  dur:2500, label:'SORPRESA'  },
  ENERGIA:   { emoji:'⚡', css:'sp-energia',   dur:2500, label:'ENERGÍA'   },
  REFLEXION: { emoji:'🤔', css:'sp-reflexion', dur:4000, label:'REFLEXIÓN' },
  LLAMADA:   { emoji:'📢', css:'sp-llamada',   dur:2500, label:'LLAMADA'   }
};
let _sp_emocionTimer = null;

function spTriggerEmocion(emotion) {
  const cfg = SP_EMOCION_MAP[emotion];
  if (!cfg) return;
  const overlay = document.getElementById('emocion-overlay');
  if (!overlay) return;

  // Reset, then apply emotion class
  overlay.className = cfg.css;
  overlay.id = 'emocion-overlay';
  document.getElementById('emocion-emoji').textContent = cfg.emoji;
  document.getElementById('emocion-label').textContent = cfg.label;

  void overlay.offsetHeight; // force reflow for animation restart
  overlay.classList.add('sp-visible');

  if (_sp_emocionTimer) clearTimeout(_sp_emocionTimer);
  _sp_emocionTimer = setTimeout(() => {
    overlay.classList.remove('sp-visible');
    setTimeout(() => { overlay.className = ''; overlay.id = 'emocion-overlay'; }, 300);
  }, cfg.dur);
}

// ---- FEATURE 2: COUNTDOWN overlay ----
let _sp_cdInterval = null;

function spPlayTick(freq) {
  try {
    const ctx  = new (window.AudioContext || window.webkitAudioContext)();
    const osc  = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    osc.frequency.value = freq; osc.type = 'sine';
    gain.gain.setValueAtTime(0.28, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);
    osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.18);
    osc.onended = () => ctx.close();
  } catch (_) {}
}

function spTriggerCountdown(seconds) {
  if (_sp_cdInterval) clearInterval(_sp_cdInterval);
  const overlay = document.getElementById('countdown-overlay');
  const numEl   = document.getElementById('countdown-number');
  const lblEl   = document.getElementById('countdown-label');
  if (!overlay || !numEl) return;

  let remaining = seconds;
  overlay.classList.add('sp-visible');
  lblEl.textContent = 'Segundos restantes';

  function showNum(n) {
    numEl.style.animation = 'none';
    void numEl.offsetHeight;
    numEl.textContent = n;
    numEl.style.animation = 'sp-countdown-tick 1s ease forwards';
    spPlayTick(n <= 1 ? 880 : 440);
  }

  showNum(remaining);

  _sp_cdInterval = setInterval(() => {
    remaining--;
    if (remaining <= 0) {
      clearInterval(_sp_cdInterval); _sp_cdInterval = null;
      spPlayTick(880);
      setTimeout(() => overlay.classList.remove('sp-visible'), 800);
      return;
    }
    showNum(remaining);
  }, 1000);
}

// ---- FEATURE 4: Retention analysis (pure JS) ----
function spAnalyzeRetention(blocks) {
  const alerts = [];
  let guionStreak = 0;
  let streakStart = 0;

  for (let i = 0; i < blocks.length; i++) {
    const t = blocks[i].type;
    if (t === 'GUION') {
      if (guionStreak === 0) streakStart = i + 1;
      guionStreak++;
      if (guionStreak === 3) {
        alerts.push({ level:'warn', icon:'warning',
          title:'Bloque largo sin interacción',
          desc:`${guionStreak}+ bloques GUION consecutivos desde el bloque ${streakStart}. Añade COMENTARIO o ACCION.` });
      }
    } else {
      guionStreak = 0;
    }
  }

  // No ACCION in first half
  const half = blocks.slice(0, Math.max(1, Math.floor(blocks.length / 2)));
  if (blocks.length > 5 && !half.some(b => b.type === 'ACCION')) {
    alerts.push({ level:'warn', icon:'touch_app',
      title:'Sin ACCION en la primera mitad',
      desc:'Las acciones visuales mantienen el ritmo. Añade una en los primeros minutos.' });
  }

  // No COMENTARIO in first 2 min
  const first2 = blocks.filter(b => b.time <= 120);
  if (first2.length > 3 && !first2.some(b => b.type === 'COMENTARIO')) {
    alerts.push({ level:'danger', icon:'chat_bubble',
      title:'Sin interacción en los primeros 2 min',
      desc:'La retención cae drásticamente sin comentarios o respuestas al inicio del live.' });
  }

  // PAUSA not followed by COMENTARIO
  for (let i = 0; i < blocks.length - 1; i++) {
    const next = blocks[i + 1]?.type;
    if (blocks[i].type === 'PAUSA' && next !== 'COMENTARIO' && next !== 'RESPONDER') {
      alerts.push({ level:'info', icon:'info',
        title:'Pausa sin lectura de comentarios',
        desc:`Bloque ${i + 1}: PAUSA debería ir seguida de COMENTARIO para aprovechar el silencio.` });
    }
  }

  // GUION block too long
  blocks.forEach((b, i) => {
    if (b.type === 'GUION' && b.content.length > 190) {
      alerts.push({ level:'info', icon:'text_fields',
        title:'Texto muy largo',
        desc:`Bloque ${i + 1}: ${b.content.length} caracteres. Considera dividirlo en dos bloques.` });
    }
  });

  if (!alerts.length) {
    alerts.push({ level:'info', icon:'check_circle',
      title:'Guión en buen estado',
      desc:'No se detectaron problemas de retención significativos.' });
  }
  return alerts;
}

function spRenderRetentionPanel() {
  const list = document.getElementById('retention-alerts-list');
  if (!list || !state.blocks.length) return;
  const alerts = spAnalyzeRetention(state.blocks);
  const colorMap = { danger:'#ff3c5a', warn:'#eac32b', info:'#00e475' };
  list.innerHTML = alerts.map(a => `
    <div class="retention-alert level-${a.level}">
      <span class="material-symbols-outlined" style="font-size:15px;flex-shrink:0;color:${colorMap[a.level]};">${escHtml(a.icon)}</span>
      <div>
        <div style="font-size:11px;font-weight:700;color:#e4e1f0;margin-bottom:3px;">${escHtml(a.title)}</div>
        <div style="font-size:11px;color:rgba(228,225,240,0.52);line-height:1.45;">${escHtml(a.desc)}</div>
      </div>
    </div>`).join('');
}

// ---- Gemini API ----
async function spCallGemini(prompt) {
  const key = spGetGeminiKey();
  if (!key) throw new Error('Configura tu Gemini API Key en Ajustes del Prompter.');
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(key)}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Error HTTP ${res.status}`);
  }
  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || '(sin respuesta)';
}

// ---- FEATURE 3: Generate AI comments ----
async function spGenerateComments() {
  const topic = document.getElementById('ai-topic-input')?.value?.trim();
  if (!topic) { alert('Escribe el tema del live primero.'); return; }

  const btn = document.getElementById('btn-generate-comments');
  const origHtml = btn.innerHTML;
  btn.disabled = true;
  btn.innerHTML = '<span class="material-symbols-outlined animate-blink text-[17px]">hourglass_empty</span> Generando...';

  const prompt = `Eres asistente de un live streamer colombiano. Genera 8 comentarios realistas de espectadores de Instagram Live sobre el tema: "${topic}".

Formato exacto, un par por línea:
MM:SS [COMENTARIO] NombreUsuario_CO: pregunta o reacción breve del espectador
MM:SS [RESPONDER] respuesta del streamer al comentario anterior

Reglas:
- Español colombiano informal
- Nombres con sufijo _CO, _Bta, _Med, _Cali o similar
- Variedad: preguntas, dudas, entusiasmo, experiencias
- Tiempos entre 00:20 y 05:30, ordenados y espaciados
- Cada COMENTARIO va seguido inmediatamente de su RESPONDER
- Máx 15 palabras por comentario, máx 18 por respuesta
Solo el bloque de texto, sin explicaciones ni encabezados.`;

  try {
    const result = await spCallGemini(prompt);
    document.getElementById('ai-comments-result').value = result;
    document.getElementById('ai-comments-output').style.display = '';
  } catch (e) {
    alert('Error Gemini: ' + e.message);
  } finally {
    btn.disabled = false;
    btn.innerHTML = origHtml;
  }
}

// ---- FEATURE 5: Analyze script with AI ----
async function spAnalyzeScript() {
  const scriptText = document.getElementById('script-textarea')?.value?.trim();
  if (!scriptText) { alert('El guión está vacío.'); return; }

  const modal   = document.getElementById('ai-modal');
  const loading = document.getElementById('ai-modal-loading');
  const result  = document.getElementById('ai-modal-result');

  modal.classList.add('sp-visible');
  loading.style.display = 'block';
  result.textContent = '';

  const prompt = `Eres experto en lives de Instagram y TikTok. Analiza este guión de teleprompter y genera un reporte claro en español.

GUIÓN:
${scriptText}

Responde con estas secciones:

## 📊 Resumen General
Duración, bloques por tipo, ritmo.

## ✅ Fortalezas
3-4 puntos positivos del guión.

## ⚠️ Riesgos de Retención
3-4 problemas o momentos de pérdida de audiencia.

## 💡 Sugerencias Concretas
3-4 mejoras con ejemplos de bloques corregidos.

## 🎯 Score de Retención: X/10
Una oración de justificación.

Sé directo, específico y usa lenguaje de streamer hispano.`;

  try {
    const text = await spCallGemini(prompt);
    loading.style.display = 'none';
    result.textContent = text;
  } catch(e) {
    loading.style.display = 'none';
    result.textContent = '⚠️ Error: ' + e.message;
  }
}

// ---- SUPERPOWERS event bindings ----
function spBindEvents() {
  // Gemini key
  const keyInput = document.getElementById('gemini-key-input');
  if (keyInput) {
    keyInput.value = spGetGeminiKey();
    keyInput.addEventListener('change', () => spSaveGeminiKey(keyInput.value));
    keyInput.addEventListener('blur',   () => spSaveGeminiKey(keyInput.value));
  }

  // AI card toggle
  document.getElementById('btn-toggle-ai-card')?.addEventListener('click', () => {
    const body    = document.getElementById('ai-comment-body');
    const chevron = document.getElementById('ai-card-chevron');
    if (!body) return;
    const isHidden = body.style.display === 'none';
    body.style.display    = isHidden ? '' : 'none';
    if (chevron) chevron.textContent = isHidden ? 'expand_less' : 'expand_more';
  });

  // Generate comments
  document.getElementById('btn-generate-comments')?.addEventListener('click', spGenerateComments);

  // Insert comments into script
  document.getElementById('btn-insert-comments')?.addEventListener('click', () => {
    const generated = document.getElementById('ai-comments-result')?.value?.trim();
    if (!generated) return;
    const ta = document.getElementById('script-textarea');
    ta.value = (ta.value.trim() ? ta.value.trim() + '\n' : '') + generated;
    saveScript();
    document.getElementById('ai-comments-output').style.display = 'none';
    document.getElementById('ai-topic-input').value = '';
  });

  // Analyze script
  document.getElementById('btn-analyze-script')?.addEventListener('click', spAnalyzeScript);

  // AI modal close
  document.getElementById('btn-close-ai-modal')?.addEventListener('click', () => {
    document.getElementById('ai-modal')?.classList.remove('sp-visible');
  });
  document.getElementById('ai-modal')?.addEventListener('click', e => {
    if (e.target.id === 'ai-modal') e.target.classList.remove('sp-visible');
  });

  // Retention toggle
  document.getElementById('btn-retention-toggle')?.addEventListener('click', () => {
    const panel = document.getElementById('retention-panel');
    if (!panel) return;
    if (panel.classList.contains('sp-hidden')) {
      spRenderRetentionPanel();
      panel.classList.remove('sp-hidden');
    } else {
      panel.classList.add('sp-hidden');
    }
  });
}

document.addEventListener('DOMContentLoaded', spBindEvents);

// === SIDEBAR v3 ===

const LS_METADATA  = 'fakelive_metadata';
const LS_PROFILE   = 'fakelive_profile';
const LS_STREAM    = 'fakelive_stream';
const LS_SESSIONS  = 'fakelive_sessions';

// ── Toast system ──────────────────────────────────────────────
(function createToastContainer() {
  const c = document.createElement('div');
  c.id = 'toast-container';
  document.body.appendChild(c);
})();

function showToast(message, type = 'success') {
  const colors = { success: '#00c853', error: '#ff1744', info: '#2979ff' };
  const c = document.getElementById('toast-container');
  if (!c) return;
  // Max 3 toasts
  while (c.children.length >= 3) c.removeChild(c.firstChild);
  const t = document.createElement('div');
  t.className = 'sb-toast';
  t.style.background = colors[type] || colors.success;
  t.textContent = message;
  c.appendChild(t);
  requestAnimationFrame(() => requestAnimationFrame(() => t.classList.add('sb-toast-show')));
  setTimeout(() => {
    t.classList.remove('sb-toast-show');
    setTimeout(() => t.remove(), 300);
  }, 2500);
}

// ── Section navigation ─────────────────────────────────────────
function sbNavTo(section) {
  document.querySelectorAll('.content-section').forEach(el => el.classList.remove('sb-section-active'));
  document.querySelectorAll('.sb-nav-item').forEach(el => el.classList.remove('sb-nav-active'));
  const sec = document.getElementById('section-' + section);
  if (sec) sec.classList.add('sb-section-active');
  document.querySelector(`.sb-nav-item[data-section="${section}"]`)?.classList.add('sb-nav-active');
  // Lazy-load section data
  if (section === 'metadata')  { sbLoadMetadata(); sbLoadProfile(); }
  if (section === 'settings')  { sbLoadStreamSettings(); sbLoadApiKeys(); }
  if (section === 'historial') { sbRenderSavedScripts(); sbRenderSessions(); }
}

// ── Override exitPlayer to save session & show sidebar ─────────
const _sb_origExitPlayer = window.exitPlayer;
window.exitPlayer = function() {
  sbSaveSession();
  document.getElementById('app-sidebar').style.display = '';
  document.getElementById('sb-live-badge').classList.remove('sb-badge-visible');
  _sb_origExitPlayer.call(this);
};

// Override startPlayer to hide sidebar & show badge
const _sb_origStartPlayer = window.startPlayer;
window.startPlayer = function() {
  // Insert closing phrase if set
  sbInsertClosingPhrase();
  _sb_origStartPlayer.call(this);
  document.getElementById('app-sidebar').style.display = 'none';
  document.getElementById('sb-live-badge').classList.add('sb-badge-visible');
};

function sbInsertClosingPhrase() {
  const cierre = document.getElementById('profile-cierre')?.value?.trim();
  if (!cierre) return;
  const ta = document.getElementById('script-textarea');
  const lines = ta.value.trim().split('\n');
  // Find last timestamp
  let lastTime = '00:00';
  for (const line of lines) {
    const m = line.match(/^(\d{1,2}:\d{2})/);
    if (m) lastTime = m[1];
  }
  // Add 10 seconds to last time
  const parts = lastTime.split(':');
  let totalSecs = parseInt(parts[0],10)*60 + parseInt(parts[1],10) + 10;
  const mm = String(Math.floor(totalSecs/60)).padStart(2,'0');
  const ss = String(totalSecs%60).padStart(2,'0');
  const newLine = `${mm}:${ss} [GUION] ${cierre}`;
  // Only insert if not already there
  if (!ta.value.includes(cierre)) {
    ta.value = ta.value.trim() + '\n' + newLine;
    saveScript();
  }
}

// ── Session recording ──────────────────────────────────────────
function sbSaveSession() {
  if (!state.blocks.length) return;
  const elapsed = getElapsed();
  const commentCount = state.blocks.filter(b => b.type === 'COMENTARIO' && state.blocks.indexOf(b) <= state.currentIdx).length;
  const emotionCount = state.blocks.filter(b => b.type === 'EMOCION' && state.blocks.indexOf(b) <= state.currentIdx).length;
  const cdCount      = state.blocks.filter(b => b.type === 'COUNTDOWN' && state.blocks.indexOf(b) <= state.currentIdx).length;

  const session = {
    id: Date.now(),
    date: new Date().toISOString(),
    scriptName: 'Sin nombre',
    duration: Math.round(elapsed),
    blocksCompleted: state.currentIdx,
    totalBlocks: state.blocks.length,
    commentsTriggered: commentCount,
    emotionsTriggered: emotionCount,
    countdownsTriggered: cdCount,
    completionPercent: Math.round((state.currentIdx / state.blocks.length) * 100)
  };
  let sessions = [];
  try { sessions = JSON.parse(localStorage.getItem(LS_SESSIONS) || '[]'); } catch(_) {}
  sessions.unshift(session);
  if (sessions.length > 20) sessions = sessions.slice(0, 20);
  localStorage.setItem(LS_SESSIONS, JSON.stringify(sessions));
}

// ── Auto-pause on [PAUSA] (settings toggle) ───────────────────
const _sb_origTick = window.tick;
window.tick = function() {
  _sb_origTick.call(this);
  const autoPause = document.getElementById('setting-auto-pause')?.checked;
  if (autoPause && state.isPlaying) {
    const b = state.blocks[state.currentIdx];
    if (b && b.type === 'PAUSA' && state.isPlaying) pauseResume();
  }
};

// ── SECTION 1: PROMPTER extra ─────────────────────────────────
function sbSaveScriptAs() {
  const name = prompt('Nombre para el guión:');
  if (!name || !name.trim()) return;
  const safeName = name.trim().replace(/[^a-zA-Z0-9_\-\s]/g, '').replace(/\s+/g, '_');
  const text = document.getElementById('script-textarea').value.trim();
  if (!text) { showToast('El guión está vacío', 'error'); return; }
  const blocks = window.parseScript(text);
  const lastBlock = blocks[blocks.length - 1];
  const duration = lastBlock ? lastBlock.time : 0;
  const data = { name: name.trim(), content: text, createdAt: Date.now(), duration };
  localStorage.setItem('fakelive_saved_' + safeName, JSON.stringify(data));
  showToast(`Guión guardado: ${name.trim()}`, 'success');
}

// ── SECTION 2: METADATA ───────────────────────────────────────
function sbLoadMetadata() {
  try {
    const d = JSON.parse(localStorage.getItem(LS_METADATA) || '{}');
    if (d.titulo)    { document.getElementById('meta-titulo').value    = d.titulo; sbUpdateTituloCount(); }
    if (d.desc)      document.getElementById('meta-desc').value      = d.desc;
    if (d.hashtags)  document.getElementById('meta-hashtags').value  = d.hashtags;
    if (d.categoria) document.getElementById('meta-categoria').value = d.categoria;
    if (d.idioma)    document.getElementById('meta-idioma').value    = d.idioma;
    if (d.platforms) {
      document.getElementById('meta-plat-youtube').checked   = !!d.platforms.youtube;
      document.getElementById('meta-plat-tiktok').checked    = !!d.platforms.tiktok;
      document.getElementById('meta-plat-instagram').checked = !!d.platforms.instagram;
      document.getElementById('meta-plat-facebook').checked  = !!d.platforms.facebook;
    }
  } catch(_) {}
}

function sbSaveMetadata() {
  const d = {
    titulo:    document.getElementById('meta-titulo')?.value    || '',
    desc:      document.getElementById('meta-desc')?.value      || '',
    hashtags:  document.getElementById('meta-hashtags')?.value  || '',
    categoria: document.getElementById('meta-categoria')?.value || '',
    idioma:    document.getElementById('meta-idioma')?.value    || '',
    platforms: {
      youtube:   document.getElementById('meta-plat-youtube')?.checked,
      tiktok:    document.getElementById('meta-plat-tiktok')?.checked,
      instagram: document.getElementById('meta-plat-instagram')?.checked,
      facebook:  document.getElementById('meta-plat-facebook')?.checked
    }
  };
  localStorage.setItem(LS_METADATA, JSON.stringify(d));
}

function sbUpdateTituloCount() {
  const el = document.getElementById('meta-titulo');
  const ct = document.getElementById('meta-titulo-count');
  if (el && ct) ct.textContent = `${el.value.length}/100`;
}

function sbLoadProfile() {
  try {
    const d = JSON.parse(localStorage.getItem(LS_PROFILE) || '{}');
    const fields = ['nombre','nicho','instagram','tiktok','whatsapp','cierre'];
    fields.forEach(f => { const el = document.getElementById('profile-'+f); if (el && d[f]) el.value = d[f]; });
  } catch(_) {}
}

function sbSaveProfile() {
  const fields = ['nombre','nicho','instagram','tiktok','whatsapp','cierre'];
  const d = {};
  fields.forEach(f => { d[f] = document.getElementById('profile-'+f)?.value || ''; });
  localStorage.setItem(LS_PROFILE, JSON.stringify(d));
}

async function sbGenDesc() {
  const titulo = document.getElementById('meta-titulo')?.value?.trim() || 'este live';
  const topic  = document.getElementById('ai-topic-input')?.value?.trim() || titulo;
  const btn = document.getElementById('btn-gen-desc');
  btn.disabled = true;
  try {
    const result = await spCallGemini(`Genera una descripción optimizada para un live de Instagram/YouTube titulado: "${titulo}" sobre ${topic}. Máximo 200 palabras. Incluye emojis relevantes. Termina con un CTA. Solo la descripción, sin explicaciones ni encabezados.`);
    document.getElementById('meta-desc').value = result;
    sbSaveMetadata();
    showToast('Descripción generada ✨');
  } catch(e) {
    showToast('Error: ' + e.message, 'error');
    if (e.message.includes('API Key')) sbNavTo('settings');
  } finally { btn.disabled = false; }
}

async function sbGenHashtags() {
  const titulo = document.getElementById('meta-titulo')?.value?.trim() || 'negocios digitales';
  const btn = document.getElementById('btn-gen-hashtags');
  btn.disabled = true;
  try {
    const result = await spCallGemini(`Dame 20 hashtags optimizados para un live de Instagram/TikTok sobre: "${titulo}". Mezcla hashtags grandes, medianos y de nicho. Formato: #hashtag separados por espacio. Solo los hashtags, sin explicaciones.`);
    document.getElementById('meta-hashtags').value = result.trim();
    sbSaveMetadata();
    showToast('Hashtags generados ✨');
  } catch(e) {
    showToast('Error: ' + e.message, 'error');
    if (e.message.includes('API Key')) sbNavTo('settings');
  } finally { btn.disabled = false; }
}

function sbCopyYoutube() {
  const titulo   = document.getElementById('meta-titulo')?.value?.trim()   || '';
  const desc     = document.getElementById('meta-desc')?.value?.trim()     || '';
  const hashtags = document.getElementById('meta-hashtags')?.value?.trim() || '';
  const text = document.getElementById('script-textarea')?.value || '';
  const blocks = window.parseScript(text);
  const timestamps = blocks
    .filter(b => b.type === 'GUION')
    .map(b => `${b.timeStr} — ${b.content.slice(0, 60)}${b.content.length > 60 ? '…' : ''}`)
    .join('\n');
  const copy = [titulo, '', desc, '', '📌 TIMESTAMPS', timestamps || '(sin bloques GUION)', '', hashtags]
    .filter(l => l !== undefined).join('\n');
  navigator.clipboard.writeText(copy).then(() => showToast('¡Copiado al portapapeles! ✅'));
}

function sbCopyTikTok() {
  const titulo   = document.getElementById('meta-titulo')?.value?.trim()   || '';
  const desc     = document.getElementById('meta-desc')?.value?.trim()     || '';
  const hashtags = document.getElementById('meta-hashtags')?.value?.trim() || '';
  const shortDesc = desc.length > 150 ? desc.slice(0, 150) + '...' : desc;
  const shortHash = hashtags.split(/\s+/).filter(h => h.startsWith('#')).slice(0, 10).join(' ');
  const copy = [titulo + ' 🔥', shortDesc, shortHash].filter(Boolean).join('\n');
  navigator.clipboard.writeText(copy).then(() => showToast('¡Copiado al portapapeles! ✅'));
}

// ── SECTION 3: STREAM SETTINGS ────────────────────────────────
const OBS_SUGGESTIONS = {
  'YouTube Live':   'Scene recomendada en OBS: Fuente de pantalla completa + Webcam esquina inferior izquierda 200x200px + Chroma key si tienes fondo verde.',
  'Instagram Live': 'Scene recomendada: Cuadrado 1:1 o vertical 9:16. Agrega tu logo como overlay en esquina superior. Activa el micrófono exclusivo.',
  'TikTok Live':    'Scene recomendada: Formato vertical 9:16 — Recorta la captura a 1080x1920. Webcam centrada arriba. Baja el bitrate a 2500kbps.',
  'Facebook Live':  'Scene recomendada: 16:9 a 1280×720 mínimo. Agrega título del live como text overlay. Usa fuente de audio de escritorio + micro.',
  'Otro':           'Configura OBS según las especificaciones de tu plataforma. Bitrate recomendado: 2500-6000kbps para 720p/1080p.'
};

function sbLoadStreamSettings() {
  try {
    const d = JSON.parse(localStorage.getItem(LS_STREAM) || '{}');
    if (d.mirror     !== undefined) document.getElementById('setting-mirror').checked        = d.mirror;
    if (d.noComments !== undefined) document.getElementById('setting-no-comments').checked   = d.noComments;
    if (d.autoPause  !== undefined) document.getElementById('setting-auto-pause').checked    = d.autoPause;
    if (d.shortcuts  !== undefined) document.getElementById('setting-show-shortcuts').checked = d.shortcuts;
    if (d.playerBg)  {
      document.getElementById('setting-player-bg').value = d.playerBg;
      document.getElementById('setting-player-bg-label').textContent = d.playerBg;
    }
    if (d.platform)    document.getElementById('setting-platform').value    = d.platform;
    if (d.streamKey)   document.getElementById('setting-stream-key').value  = d.streamKey;
    if (d.serverUrl)   document.getElementById('setting-server-url').value  = d.serverUrl;
    if (d.resolution)  document.getElementById('setting-resolution').value  = d.resolution;
    if (d.speedSlider) {
      const sl = document.getElementById('speed-slider');
      if (sl) { sl.value = d.speedSlider; document.getElementById('speed-slider-label').textContent = parseFloat(d.speedSlider).toFixed(1) + 'x'; }
    }
    sbUpdateObsSuggestion();
    sbApplyStreamSettings();
  } catch(_) {}
}

function sbSaveStreamSettings() {
  const d = {
    mirror:      document.getElementById('setting-mirror')?.checked,
    noComments:  document.getElementById('setting-no-comments')?.checked,
    autoPause:   document.getElementById('setting-auto-pause')?.checked,
    shortcuts:   document.getElementById('setting-show-shortcuts')?.checked,
    playerBg:    document.getElementById('setting-player-bg')?.value,
    platform:    document.getElementById('setting-platform')?.value,
    streamKey:   document.getElementById('setting-stream-key')?.value,
    serverUrl:   document.getElementById('setting-server-url')?.value,
    resolution:  document.getElementById('setting-resolution')?.value,
    speedSlider: document.getElementById('speed-slider')?.value
  };
  localStorage.setItem(LS_STREAM, JSON.stringify(d));
  sbApplyStreamSettings();
}

function sbApplyStreamSettings() {
  const mirror = document.getElementById('setting-mirror')?.checked;
  document.getElementById('player-screen')?.classList.toggle('sb-mirror', !!mirror);
  const noComments = document.getElementById('setting-no-comments')?.checked;
  if (noComments) state.settings.commentMode = 'bottom';
  const bg = document.getElementById('setting-player-bg')?.value;
  if (bg) {
    const ps = document.getElementById('player-screen');
    if (ps) ps.style.background = bg;
    const bc = document.getElementById('blocks-container');
    if (bc) bc.style.background = bg;
  }
  // Speed slider → select-speed
  const sliderVal = parseFloat(document.getElementById('speed-slider')?.value || '1');
  const speedPreset = sliderVal < 0.9 ? 'slow' : sliderVal < 1.3 ? 'normal' : 'fast';
  const ss = document.getElementById('select-speed');
  if (ss && ss.value !== speedPreset) { ss.value = speedPreset; state.settings.speed = speedPreset; }
  // Font size segmented → select-font-size
  const activeSegVal = document.querySelector('#segmented-fontsize .sb-seg-active')?.dataset?.val;
  if (activeSegVal) {
    const sf = document.getElementById('select-font-size');
    if (sf && sf.value !== activeSegVal) { sf.value = activeSegVal; state.settings.fontSize = activeSegVal; }
  }
}

function sbUpdateObsSuggestion() {
  const platform = document.getElementById('setting-platform')?.value || 'Instagram Live';
  const el = document.getElementById('obs-suggestion');
  if (el) el.value = OBS_SUGGESTIONS[platform] || OBS_SUGGESTIONS['Otro'];
}

function sbLoadApiKeys() {
  const el = document.getElementById('gemini-key-input');
  if (el) el.value = spGetGeminiKey();
}

async function sbTestGemini() {
  const btn = document.getElementById('btn-test-gemini');
  const res = document.getElementById('gemini-test-result');
  btn.disabled = true;
  btn.textContent = 'Probando...';
  res.style.display = 'none';
  try {
    await spCallGemini('Responde solo con: OK');
    res.style.display = 'block';
    res.style.background = 'rgba(0,200,83,0.12)';
    res.style.color = '#00e475';
    res.style.border = '1px solid rgba(0,200,83,0.3)';
    res.textContent = '✅ Conexión exitosa';
    showToast('Gemini API conectado ✅');
  } catch(e) {
    res.style.display = 'block';
    res.style.background = 'rgba(255,23,68,0.1)';
    res.style.color = '#ff5166';
    res.style.border = '1px solid rgba(255,23,68,0.25)';
    res.textContent = '❌ Error: ' + e.message;
  } finally {
    btn.disabled = false;
    btn.textContent = '🧪 Probar conexión';
  }
}

// ── SECTION 4: HISTORIAL ──────────────────────────────────────
function sbRenderSavedScripts() {
  const container = document.getElementById('saved-scripts-list');
  if (!container) return;
  const keys = Object.keys(localStorage).filter(k => k.startsWith('fakelive_saved_'));
  if (!keys.length) {
    container.innerHTML = `<div class="hist-empty"><span class="hist-empty-icon">📂</span><span>Aún no tienes guiones guardados.<br>Crea uno en Prompter y guárdalo.</span></div>`;
    return;
  }
  container.innerHTML = '';
  keys.sort((a,b) => {
    try { return (JSON.parse(localStorage.getItem(b)).createdAt||0) - (JSON.parse(localStorage.getItem(a)).createdAt||0); } catch(_) { return 0; }
  }).forEach(key => {
    let data;
    try { data = JSON.parse(localStorage.getItem(key)); } catch(_) { return; }
    const blocks = window.parseScript(data.content || '');
    const guionCount     = blocks.filter(b => b.type === 'GUION').length;
    const comentCount    = blocks.filter(b => b.type === 'COMENTARIO').length;
    const accionCount    = blocks.filter(b => b.type === 'ACCION').length;
    const durationMin    = Math.round((data.duration || 0) / 60);
    const created        = data.createdAt ? new Date(data.createdAt).toLocaleString('es-CO', { day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit' }) : '—';
    const card = document.createElement('div');
    card.className = 'hist-script-card';
    card.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:6px;">
        <span style="font-size:14px;font-weight:700;color:#e4e1f0;">${escHtml(data.name || 'Sin nombre')}</span>
        <span style="font-size:11px;color:rgba(228,225,240,0.4);">${durationMin} min</span>
      </div>
      <div style="font-size:11px;color:rgba(228,225,240,0.4);margin-bottom:8px;">${escHtml(created)}</div>
      <div style="font-size:11px;color:rgba(228,225,240,0.55);margin-bottom:10px;">
        ${guionCount} guion · ${comentCount} comentarios · ${accionCount} acciones
      </div>
      <div style="display:flex;gap:6px;">
        <button class="sb-btn-secondary" style="flex:1;height:30px;font-size:11px;" onclick="sbLoadSavedScript('${escHtml(key)}')">📂 Cargar</button>
        <button class="sb-btn-secondary" style="flex:1;height:30px;font-size:11px;" onclick="sbDuplicateScript('${escHtml(key)}')">📋 Duplicar</button>
        <button class="sb-btn-secondary" style="flex:1;height:30px;font-size:11px;color:#ff5166;" onclick="sbDeleteScript(this,'${escHtml(key)}','${escHtml(data.name||'')}')">🗑️ Eliminar</button>
      </div>
      <div class="sb-confirm-delete" id="confirm-${escHtml(key)}" style="display:none;margin-top:8px;padding:8px;background:rgba(255,23,68,0.1);border-radius:6px;font-size:12px;color:#ffb4ab;display:flex;align-items:center;gap:8px;">
        ¿Eliminar "${escHtml(data.name||'')}"?
        <button onclick="sbConfirmDelete('${escHtml(key)}')" style="background:#ff3c5a;border:none;color:#fff;padding:3px 10px;border-radius:4px;cursor:pointer;font-size:11px;">Sí</button>
        <button onclick="document.getElementById('confirm-${escHtml(key)}').style.display='none'" style="background:rgba(255,255,255,0.1);border:none;color:#e4e1f0;padding:3px 10px;border-radius:4px;cursor:pointer;font-size:11px;">No</button>
      </div>`;
    // Hide the confirm div initially (it was rendered with display:flex above, override)
    card.querySelector('.sb-confirm-delete').style.display = 'none';
    container.appendChild(card);
  });
}

function sbLoadSavedScript(key) {
  try {
    const data = JSON.parse(localStorage.getItem(key));
    document.getElementById('script-textarea').value = data.content;
    saveScript();
    sbNavTo('prompter');
    showToast(`Guión cargado: ${data.name}`, 'success');
  } catch(_) { showToast('Error al cargar el guión', 'error'); }
}

function sbDuplicateScript(key) {
  try {
    const data = JSON.parse(localStorage.getItem(key));
    const newName = data.name + ' — copia';
    const safeName = newName.replace(/[^a-zA-Z0-9_\-\s]/g, '').replace(/\s+/g, '_');
    localStorage.setItem('fakelive_saved_' + safeName, JSON.stringify({ ...data, name: newName, createdAt: Date.now() }));
    sbRenderSavedScripts();
    showToast(`Duplicado: ${newName}`);
  } catch(_) {}
}

function sbDeleteScript(btn, key, name) {
  const confirmDiv = document.getElementById('confirm-' + key);
  if (confirmDiv) confirmDiv.style.display = 'flex';
}

function sbConfirmDelete(key) {
  localStorage.removeItem(key);
  sbRenderSavedScripts();
  showToast('Guión eliminado', 'info');
}

function sbRenderSessions() {
  const container = document.getElementById('sessions-list');
  if (!container) return;
  let sessions = [];
  try { sessions = JSON.parse(localStorage.getItem(LS_SESSIONS) || '[]'); } catch(_) {}
  if (!sessions.length) {
    container.innerHTML = `<div class="hist-empty"><span class="hist-empty-icon">🎬</span><span>Aún no tienes sesiones grabadas.<br>Cuando inicies y salgas del player, aparecerán aquí.</span></div>`;
    return;
  }
  container.innerHTML = '';
  sessions.forEach(s => {
    const date = new Date(s.date);
    const dateStr = date.toLocaleDateString('es-CO', { weekday:'long', day:'numeric', month:'short' }) +
      ' · ' + date.toLocaleTimeString('es-CO', { hour:'2-digit', minute:'2-digit' });
    const mins = Math.floor(s.duration / 60);
    const secs = s.duration % 60;
    const badge = s.completionPercent >= 90
      ? `<span style="background:rgba(0,228,117,0.15);color:#00e475;font-size:10px;font-weight:700;padding:2px 8px;border-radius:10px;">Completado ✓</span>`
      : s.completionPercent < 50
      ? `<span style="background:rgba(234,195,43,0.15);color:#eac32b;font-size:10px;font-weight:700;padding:2px 8px;border-radius:10px;">Incompleto</span>`
      : '';
    const card = document.createElement('div');
    card.className = 'hist-session-card';
    card.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">
        <span style="font-size:12px;font-weight:600;color:rgba(228,225,240,0.8);text-transform:capitalize;">${escHtml(dateStr)}</span>
        ${badge}
      </div>
      <div style="font-size:11px;color:rgba(228,225,240,0.45);margin-bottom:6px;">Duración: ${mins} min ${secs} seg</div>
      <div class="sess-progress-bar"><div class="sess-progress-fill" style="width:${s.completionPercent}%"></div></div>
      <div style="display:flex;justify-content:space-between;align-items:center;margin-top:4px;">
        <span style="font-size:11px;color:rgba(228,225,240,0.5);">${s.completionPercent}% completado</span>
        <span style="font-size:11px;color:rgba(228,225,240,0.45);">💬 ${s.commentsTriggered||0} · 🎭 ${s.emotionsTriggered||0} · ⏱ ${s.countdownsTriggered||0}</span>
      </div>`;
    container.appendChild(card);
  });
}

// ── Accordion logic (Ayuda) ────────────────────────────────────
function sbInitAccordions() {
  document.querySelectorAll('.sb-acc-hdr').forEach(btn => {
    btn.addEventListener('click', () => {
      const accId  = btn.dataset.acc;
      const body   = document.getElementById(accId);
      const isOpen = btn.classList.contains('sb-acc-open');
      // Close all
      document.querySelectorAll('.sb-acc-hdr').forEach(b => {
        b.classList.remove('sb-acc-open');
        b.querySelector('.sb-acc-chevron').textContent = 'expand_more';
      });
      document.querySelectorAll('.sb-acc-body').forEach(b => b.style.display = 'none');
      // Open clicked if was closed
      if (!isOpen && body) {
        body.style.display = '';
        btn.classList.add('sb-acc-open');
        btn.querySelector('.sb-acc-chevron').textContent = 'expand_less';
      }
    });
  });
  // Default open: acc1
  const acc1Body = document.getElementById('acc1');
  if (acc1Body) acc1Body.style.display = '';
}

// ── Fullscreen F key ──────────────────────────────────────────
document.addEventListener('keydown', e => {
  if (e.key === 'f' || e.key === 'F') {
    if (document.getElementById('player-screen').classList.contains('active')) {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
      } else {
        document.exitFullscreen().catch(() => {});
      }
    }
  }
});

// ── SIDEBAR v3 event bindings ─────────────────────────────────
function sbBindAll() {

  // Toast container
  if (!document.getElementById('toast-container')) {
    const c = document.createElement('div'); c.id = 'toast-container'; document.body.appendChild(c);
  }

  // Sidebar nav
  document.querySelectorAll('.sb-nav-item').forEach(item => {
    item.addEventListener('click', () => sbNavTo(item.dataset.section));
  });

  // Sidebar + header Start Live buttons
  document.getElementById('btn-start-live-sb')?.addEventListener('click', startPlayer);

  // Save As
  document.getElementById('btn-save-as')?.addEventListener('click', sbSaveScriptAs);

  // ── Metadata ──
  document.getElementById('meta-titulo')?.addEventListener('input', () => { sbUpdateTituloCount(); sbSaveMetadata(); });
  ['meta-desc','meta-hashtags','meta-categoria','meta-idioma'].forEach(id => {
    document.getElementById(id)?.addEventListener('input', sbSaveMetadata);
    document.getElementById(id)?.addEventListener('change', sbSaveMetadata);
  });
  ['meta-plat-youtube','meta-plat-tiktok','meta-plat-instagram','meta-plat-facebook'].forEach(id => {
    document.getElementById(id)?.addEventListener('change', sbSaveMetadata);
  });
  document.getElementById('btn-gen-desc')?.addEventListener('click', sbGenDesc);
  document.getElementById('btn-gen-hashtags')?.addEventListener('click', sbGenHashtags);
  document.getElementById('btn-copy-youtube')?.addEventListener('click', sbCopyYoutube);
  document.getElementById('btn-copy-tiktok')?.addEventListener('click', sbCopyTikTok);

  // ── Profile ──
  ['nombre','nicho','instagram','tiktok','whatsapp','cierre'].forEach(f => {
    document.getElementById('profile-'+f)?.addEventListener('input', sbSaveProfile);
  });

  // ── Settings ──
  const settingIds = ['setting-mirror','setting-no-comments','setting-auto-pause','setting-show-shortcuts'];
  settingIds.forEach(id => document.getElementById(id)?.addEventListener('change', sbSaveStreamSettings));

  document.getElementById('setting-player-bg')?.addEventListener('input', e => {
    document.getElementById('setting-player-bg-label').textContent = e.target.value;
    sbSaveStreamSettings();
  });
  document.getElementById('setting-platform')?.addEventListener('change', () => { sbUpdateObsSuggestion(); sbSaveStreamSettings(); });
  ['setting-stream-key','setting-server-url','setting-resolution'].forEach(id => {
    document.getElementById(id)?.addEventListener('input', sbSaveStreamSettings);
    document.getElementById(id)?.addEventListener('change', sbSaveStreamSettings);
  });

  // Speed slider
  document.getElementById('speed-slider')?.addEventListener('input', e => {
    document.getElementById('speed-slider-label').textContent = parseFloat(e.target.value).toFixed(1) + 'x';
    sbSaveStreamSettings();
  });

  // Font size segmented control
  document.querySelectorAll('#segmented-fontsize .sb-seg-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#segmented-fontsize .sb-seg-btn').forEach(b => b.classList.remove('sb-seg-active'));
      btn.classList.add('sb-seg-active');
      const sf = document.getElementById('select-font-size');
      if (sf) { sf.value = btn.dataset.val; sf.dispatchEvent(new Event('change')); }
      sbSaveStreamSettings();
    });
  });

  // Stream key show/hide
  document.getElementById('btn-toggle-stream-key')?.addEventListener('click', () => {
    const inp = document.getElementById('setting-stream-key');
    const eye = document.getElementById('stream-key-eye');
    if (!inp) return;
    const isPassword = inp.type === 'password';
    inp.type = isPassword ? 'text' : 'password';
    if (eye) eye.textContent = isPassword ? 'visibility_off' : 'visibility';
  });

  // Test Gemini
  document.getElementById('btn-test-gemini')?.addEventListener('click', sbTestGemini);

  // Accordions
  sbInitAccordions();

  // Apply persisted stream settings on startup (mirror mode, bg color, etc.)
  try { sbLoadStreamSettings(); } catch(_) {}
}

document.addEventListener('DOMContentLoaded', sbBindAll);

// ---- Syntax reference for new block types (not executed) ----
// MM:SS [EMOCION] CELEBRAR
// MM:SS [EMOCION] URGENCIA
// MM:SS [EMOCION] INTRIGA
// MM:SS [EMOCION] SORPRESA
// MM:SS [EMOCION] ENERGIA
// MM:SS [EMOCION] REFLEXION
// MM:SS [EMOCION] LLAMADA
// MM:SS [COUNTDOWN] 5      ← countdown de 5 segundos

// ================================================
// === SUPABASE v4 — Sync hooks ===
// Parches no-destructivos: se enganchan a las funciones de
// SIDEBAR v3 para agregar sincronización con Supabase.
// Seguridad: stream-key y gemini-key NUNCA se sincronizan.
// ================================================
(function sbSyncHooks() {

  // ── Helper: arma el payload de settings (sin datos sensibles) ──
  function _settingsPayload() {
    let stream = {};
    try { stream = JSON.parse(localStorage.getItem(LS_STREAM) || '{}'); } catch (_) {}
    // Excluir stream-key (RTMP key — dato sensible, solo local)
    const { 'stream-key': _excluded } = stream;
    const safeSettings = Object.assign({}, stream);
    delete safeSettings['stream-key'];

    let metadata = {}, profile = {};
    try { metadata = JSON.parse(localStorage.getItem(LS_METADATA) || '{}'); } catch (_) {}
    try { profile  = JSON.parse(localStorage.getItem(LS_PROFILE)  || '{}'); } catch (_) {}
    return { settings: safeSettings, metadata, profile };
  }

  function _syncSettings() {
    window.sbSync && window.sbSync('settings', _settingsPayload());
  }

  // ── Patch sbSaveMetadata ──────────────────────────────────────
  const _oMeta = sbSaveMetadata;
  sbSaveMetadata = function () { _oMeta.apply(this, arguments); _syncSettings(); };

  // ── Patch sbSaveProfile ───────────────────────────────────────
  const _oProfile = sbSaveProfile;
  sbSaveProfile = function () { _oProfile.apply(this, arguments); _syncSettings(); };

  // ── Patch sbSaveStreamSettings ────────────────────────────────
  const _oStream = sbSaveStreamSettings;
  sbSaveStreamSettings = function () { _oStream.apply(this, arguments); _syncSettings(); };

  // ── Patch sbSaveScriptAs ──────────────────────────────────────
  const _oSaveAs = sbSaveScriptAs;
  sbSaveScriptAs = function () {
    _oSaveAs.apply(this, arguments);
    if (!window.sbSync) return;
    // Encontrar el guion más reciente recién guardado
    const keys = Object.keys(localStorage).filter(k => k.startsWith('fakelive_saved_'));
    const newest = keys.sort((a, b) => {
      try {
        return JSON.parse(localStorage.getItem(b)).createdAt
             - JSON.parse(localStorage.getItem(a)).createdAt;
      } catch (_) { return 0; }
    })[0];
    if (newest) {
      try { window.sbSync('script_save', JSON.parse(localStorage.getItem(newest))); } catch (_) {}
    }
  };

  // ── Patch sbSaveSession ───────────────────────────────────────
  const _oSession = sbSaveSession;
  sbSaveSession = function () {
    _oSession.apply(this, arguments);
    if (!window.sbSync) return;
    try {
      const sessions = JSON.parse(localStorage.getItem(LS_SESSIONS) || '[]');
      if (sessions.length) window.sbSync('session', sessions[0]);
    } catch (_) {}
  };

  // ── Patch sbConfirmDelete ─────────────────────────────────────
  const _oDelete = sbConfirmDelete;
  sbConfirmDelete = function (key) {
    let name;
    try { name = JSON.parse(localStorage.getItem(key)).name; } catch (_) {}
    _oDelete.apply(this, [key]);
    if (name && window.sbSync) window.sbSync('script_delete', { name });
  };

  // ── Patch sbDuplicateScript ───────────────────────────────────
  const _oDuplicate = sbDuplicateScript;
  sbDuplicateScript = function (key) {
    let originalName;
    try { originalName = JSON.parse(localStorage.getItem(key)).name; } catch (_) {}
    _oDuplicate.apply(this, [key]);
    if (!window.sbSync || !originalName) return;
    const newName = originalName + ' — copia';
    const safe    = newName.replace(/[^a-zA-Z0-9_\-\s]/g, '').replace(/\s+/g, '_');
    try { window.sbSync('script_save', JSON.parse(localStorage.getItem('fakelive_saved_' + safe))); } catch (_) {}
  };

})();


// ================================================
// === LIVECAKE EXPORT ===
// ================================================

// ── Bases de nombres por país ─────────────────────────────
const LC_NAMES = {
  Colombia: {
    female: ['Ana María','Valentina','Camila','Isabella','Sofía','Mariana','Daniela','Natalia','Paola','Andrea','Mónica','Juliana','Viviana','Alejandra','Catalina','Melissa','Luisa','Diana','Carolina','Adriana','Yesenia','Gloria','Lorena','Marcela','Xiomara','Yulieth','Leidy','Tatiana','Manuela','Lina'],
    male:   ['Carlos','Andrés','Juan','Santiago','Sebastián','David','Felipe','Daniel','Camilo','Alejandro','Jorge','Hernán','Wilson','Édgar','Mauricio','Iván','Jhon','Ferney','Javier','Óscar','Darío','Ricardo','Fabio','Luis','Mario','Rodrigo','Giovanni','Yeison','Cristian','Esteban'],
    last:   ['García','Martínez','López','González','Rodríguez','Pérez','Hernández','Vargas','Castro','Ruiz','Moreno','Díaz','Suárez','Torres','Ramírez','Sánchez','Reyes','Gómez','Jiménez','Medina','Rincón','Ospina','Cardona','Arias','Peña','Castaño','Montoya','Cárdenas','Zapata','Muñoz']
  },
  México: {
    female: ['María','Guadalupe','Fernanda','Valeria','Paulina','Karla','Verónica','Leticia','Griselda','Esperanza','Rocío','Angélica','Brenda','Liliana','Erika','Mayra','Itzel','Yolanda','Miriam','Claudia'],
    male:   ['José','Miguel','Alejandro','Jesús','Juan','Francisco','Roberto','Armando','Arturo','Rafael','Héctor','Gerardo','Rogelio','Alfredo','Sergio','Ernesto','Jaime','Marco','Ramón','Víctor'],
    last:   ['González','Hernández','García','Martínez','López','Rodríguez','Pérez','Sánchez','Ramírez','Cruz','Flores','Torres','Reyes','Rivera','Morales','Jiménez','Mendoza','Álvarez','Romero','Chávez']
  },
  Venezuela: {
    female: ['María','Gabriela','Andreína','Milagros','Yolanda','Adriana','Karina','Yajaira','Génesis','Verónica','Mariangel','Liseth','Yorgelys','Dayana','Roxana'],
    male:   ['José','Luís','Carlos','Jesús','Rafael','Reinaldo','Yonathan','Wilfredo','Ángel','Johanner','Oswaldo','Gilberto','Evelio','Freddy','Leandro'],
    last:   ['González','Pérez','Rodríguez','García','Hernández','López','Martínez','Sánchez','Díaz','Ramírez','Flores','Torres','Reyes','Morales','Jiménez']
  },
  Ecuador: {
    female: ['Valeria','Gabriela','Fernanda','Daniela','Johanna','Verónica','Tatiana','Priscila','Lorena','Nataly','Adriana','Estefanía','Cristina','Mónica','Patricia'],
    male:   ['Carlos','Santiago','Diego','Andrés','Javier','Patricio','Mauricio','Cristóbal','Esteban','Xavier','Gonzalo','Ramiro','Bolívar','Lenin','Rodrigo'],
    last:   ['García','Pérez','Rodríguez','González','López','Martínez','Hernández','Torres','Sánchez','Ramírez','Castro','Vargas','Mora','Espinoza','Andrade']
  },
  Argentina: {
    female: ['María','Florencia','Valentina','Lucía','Camila','Martina','Agustina','Sofía','Julieta','Rocío','Micaela','Celeste','Milagros','Emilia','Romina'],
    male:   ['Matías','Facundo','Rodrigo','Gastón','Leandro','Ezequiel','Ignacio','Tomás','Agustín','Federico','Nicolás','Ramiro','Sebastián','Germán','Maximiliano'],
    last:   ['González','Fernández','Rodríguez','López','Martínez','García','Pérez','Sánchez','Romero','Díaz','Torres','Álvarez','Ruiz','Ramírez','Flores']
  }
};
LC_NAMES.Chile          = LC_NAMES.Argentina;
LC_NAMES['República Dominicana'] = LC_NAMES.Venezuela;
LC_NAMES.Cuba           = LC_NAMES.Venezuela;
LC_NAMES.Perú           = LC_NAMES.Ecuador;
LC_NAMES.España         = LC_NAMES.Argentina;
LC_NAMES.Otro           = LC_NAMES.Colombia;

// ── Ciudades por país ─────────────────────────────────────
const LC_CITIES = {
  Colombia:  ['Medellín','Bogotá','Cali','Barranquilla','Cartagena','Pereira','Manizales','Bucaramanga','Armenia','Ibagué'],
  México:    ['Ciudad de México','Guadalajara','Monterrey','Puebla','Tijuana','Cancún','Mérida','León','Querétaro','Veracruz'],
  Venezuela: ['Caracas','Maracaibo','Valencia','Barquisimeto','Maracay','Maturín'],
  Ecuador:   ['Quito','Guayaquil','Cuenca','Machala','Ambato','Portoviejo'],
  Argentina: ['Buenos Aires','Córdoba','Rosario','Mendoza','Tucumán','La Plata'],
  Chile:     ['Santiago','Valparaíso','Concepción','La Serena','Antofagasta'],
  Otro:      ['Bogotá','Medellín','Cali','CDMX','Lima']
};
['Perú','República Dominicana','Cuba','España'].forEach(c => LC_CITIES[c] = LC_CITIES.Otro);

// ── Pools de comentarios ──────────────────────────────────
const LC_FILLER = [
  'Estoy desde [CITY]','Saludos!','Eres muy linda','Gracias por toda esta información de valor',
  'Me encantan tus tips','No sabía que eso lo podía hacer','Wuao!','Hola!','Estoy en el live',
  'Explicas muy bien','Soy seguidora tuya hace rato','Te sigo desde hace poco y me gusta tu contenido',
  'Yo quiero aprender eso','Me encanta tu energía','¡Siempre aprendo algo contigo!',
  'Qué claridad para explicar, gracias','Te admiro muchísimo','Estoy lista para tomar acción',
  '¡Qué buena información!','Compartiendo con mis amigos'
];
const LC_TESTIMONIAL = [
  'Ya compré, recomendado 100%','Sí funciona','Ya compré y estoy feliz con el resultado',
  'Un servicio muy completo','Aprendí muchísimo','Nunca pensé que fuera tan fácil, gracias',
  'Esto sí funciona, no es teoría, son pasos reales','Mi mentalidad cambió completamente',
  'Literalmente me abriste los ojos','Lo mejor que he invertido este año',
  'Entré sin saber nada y ahora ya estoy viendo resultados','Tu energía y claridad no tienen comparación',
  'Pensé que esto era muy difícil, ahora sé que también es para mí',
  'No es solo un producto, es un cambio de mentalidad','Salí motivada y con plan de acción claro'
];
const LC_FAQ = [
  '¿Cuánto cuesta?','¿Tienen garantía?','¿Cómo hago para comprar?','¿Funciona para Colombia?',
  '¿Tienen envíos a toda Colombia?','¿Cuánto tarda el envío?','¿Puedo pagar con Nequi?',
  '¿Tienen página web?','¿Es seguro comprar aquí?','¿Qué métodos de pago aceptan?',
  '¿Tienen descuentos?','¿Hay stock disponible?','¿Hacen devoluciones?',
  '¿Puedo comprar por WhatsApp?','¿Cuándo es el próximo live?','¿Venden al por mayor?'
];
const LC_INTEREST = [
  '¿Dónde puedo conseguir más información?','¿Cómo puedo empezar?',
  '¿Esto aplica para alguien sin experiencia?','¿Con cuánto dinero puedo empezar?',
  '¿Cuánto tiempo toma ver resultados?','¿Necesito conocimientos previos?',
  '¿Tienen algún curso o capacitación?','¿Puedo hacer esto desde casa?',
  '¿Funciona para cualquier persona?','¿Me pueden asesorar personalmente?'
];

// ── Estado del módulo ─────────────────────────────────────
const LS_LC = 'fakelive_livecake';
let _lcComments   = [];   // lista generada actual
let _lcAvatarMap  = {};   // username → url
let _lcNamesSeeds = {};   // username → assigned display name (para regenerar solo nombres)

// ── Helpers ───────────────────────────────────────────────
function lcRand(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

function lcPickName(country, gender, usedRecent) {
  const db = LC_NAMES[country] || LC_NAMES.Colombia;
  const pool = gender === 'female' ? db.female : db.male;
  let first;
  let tries = 0;
  do { first = lcRand(pool); tries++; } while (usedRecent.includes(first) && tries < 20);
  const last = lcRand(db.last);
  return { display: `${first} ${last[0]}.`, gender };
}

function lcFormatTime(totalSec, format) {
  if (format === 'mmss') {
    const m = String(Math.floor(totalSec / 60)).padStart(2, '0');
    const s = String(totalSec % 60).padStart(2, '0');
    return `${m}:${s}`;
  }
  if (format === 'hace_min') {
    const m = Math.max(1, Math.floor(totalSec / 60));
    return `Hace ${m} minuto${m === 1 ? '' : 's'}`;
  }
  if (format === 'mixto') {
    if (totalSec < 60) return `Hace ${Math.max(1, totalSec)} segundo${totalSec === 1 ? '' : 's'}`;
    const m = Math.floor(totalSec / 60);
    return `Hace ${m} minuto${m === 1 ? '' : 's'}`;
  }
  // hace_seg (default)
  if (totalSec < 60) return `Hace ${Math.max(1, totalSec)} segundo${totalSec === 1 ? '' : 's'}`;
  const m = Math.floor(totalSec / 60);
  return `Hace ${m} minuto${m === 1 ? '' : 's'}`;
}

function lcGetConfig() {
  return {
    country:    document.getElementById('lc-country')?.value     || 'Colombia',
    timeFormat: document.getElementById('lc-time-format')?.value || 'hace_seg'
  };
}

function lcSaveConfig() {
  try { localStorage.setItem(LS_LC, JSON.stringify(lcGetConfig())); } catch (_) {}
}

function lcLoadConfig() {
  let cfg = {};
  try { cfg = JSON.parse(localStorage.getItem(LS_LC) || '{}'); } catch (_) {}
  if (cfg.country)    { const el = document.getElementById('lc-country');     if (el) el.value = cfg.country; }
  if (cfg.timeFormat) { const el = document.getElementById('lc-time-format'); if (el) el.value = cfg.timeFormat; }
}

// ── Leer comentarios SOLO del guion (fuente única) ────────
// Lee todos los bloques [COMENTARIO] del textarea y los devuelve
// con su username y mensaje originales, sin generación aleatoria.
function lcReadScriptComments() {
  const cfg = lcGetConfig();
  const fmt = cfg.timeFormat;
  const ta  = document.getElementById('script-textarea');
  if (!ta || !ta.value.trim()) return [];

  // Usa window.parseScript (override en SUPERPOWERS que soporta todos los tipos)
  const allBlocks = window.parseScript(ta.value);
  const result    = [];

  allBlocks.forEach(b => {
    if (b.type !== 'COMENTARIO') return;
    // username = lo que está antes del primer ':'
    const username = (b.username || '').trim() || 'Usuario';
    // message = lo que está después del ':'
    const text     = (b.message  || b.content || '').trim();
    // Heurística de género por terminación del nombre
    const gender   = /[aeiouáéíóúü]$/i.test(username) ? 'female' : 'male';
    result.push({
      sec:      b.time,
      timeStr:  lcFormatTime(b.time, fmt),
      type:     'scripted',
      username,
      text,
      gender
    });
  });

  return result; // ya ordenados por tiempo (el guion está cronológico)
}

// ── Renderizar preview ───────────────────────────────────
function lcRenderPreview() {
  _lcComments = lcReadScriptComments();

  const container = document.getElementById('lc-preview-table');
  const countEl   = document.getElementById('lc-preview-count');
  const statsEl   = document.getElementById('lc-preview-stats');
  const warnEl    = document.getElementById('lc-preview-warning');
  const okEl      = document.getElementById('lc-preview-ok');
  if (!container) return;

  const total = _lcComments.length;
  if (countEl) countEl.textContent = `${total} comentario${total !== 1 ? 's' : ''}`;

  if (total === 0) {
    container.innerHTML = '<p style="color:rgba(228,225,240,0.35);font-size:12px;text-align:center;padding:16px 0;">No se encontraron bloques [COMENTARIO] en el guion.<br>Escribe tu guion en la pestaña <strong>Prompter</strong> primero.</p>';
    if (statsEl) statsEl.textContent = '';
    if (warnEl)  warnEl.style.display = 'none';
    if (okEl)    okEl.style.display   = 'none';
    return;
  }

  // Tabla (máx 15 filas)
  const preview = _lcComments.slice(0, 15);
  let html = '<table><thead><tr><th>Avatar</th><th>Usuario</th><th>Comentario</th><th>Tiempo</th></tr></thead><tbody>';
  preview.forEach(c => {
    const text      = c.text.length > 55 ? c.text.slice(0, 54) + '…' : c.text;
    const avatarUrl = _lcAvatarMap[c.username];
    const imgHtml   = avatarUrl
      ? `<div class="lc-avatar-circle"><img src="${avatarUrl}" alt="" style="width:100%;height:100%;object-fit:cover;border-radius:50%;"/></div>`
      : `<div class="lc-avatar-circle" style="background:rgba(255,179,181,0.15);display:flex;align-items:center;justify-content:center;font-size:11px;color:rgba(228,225,240,0.3);">?</div>`;
    html += `<tr>
      <td>${imgHtml}</td>
      <td style="white-space:nowrap;font-weight:600;color:#ffb3b5;">${escHtml(c.username)}</td>
      <td style="color:rgba(228,225,240,0.65);">${escHtml(text)}</td>
      <td style="white-space:nowrap;color:rgba(228,225,240,0.4);font-family:'JetBrains Mono',monospace;font-size:11px;">${escHtml(c.timeStr)}</td>
    </tr>`;
  });
  html += '</tbody></table>';
  if (total > 15) html += `<div class="lc-preview-more">... y ${total - 15} comentarios más</div>`;
  container.innerHTML = html;

  if (statsEl) statsEl.textContent = `📝 ${total} comentario${total !== 1 ? 's' : ''} del guion`;
  if (warnEl) { warnEl.style.display = total < 5  ? '' : 'none'; warnEl.textContent  = '⚠️ Pocos comentarios. Agrega más bloques [COMENTARIO] a tu guion.'; }
  if (okEl)   { okEl.style.display   = total >= 5 ? '' : 'none'; okEl.textContent    = `✅ ${total} comentarios listos para exportar.`; }

  lcSaveConfig();
}

// ── Actualizar status chips ───────────────────────────────
async function lcUpdateStatus() {
  const nanoEl = document.getElementById('lc-chip-nano');
  const sbEl   = document.getElementById('lc-chip-sb');
  try {
    const r = await fetch('/api/avatar-status');
    if (!r.ok) throw new Error('backend unavailable');
    const s = await r.json();
    if (nanoEl) {
      nanoEl.className   = 'lc-chip ' + (s.nanobanana ? 'lc-chip-ok' : 'lc-chip-warn');
      nanoEl.textContent = s.nanobanana ? '🟢 Gemini Imagen: activo' : '🟡 Sin Gemini key: modo DiceBear';
    }
    if (sbEl) {
      sbEl.className   = 'lc-chip ' + (s.supabase ? 'lc-chip-ok' : 'lc-chip-warn');
      sbEl.textContent = s.supabase ? '🟢 Supabase Storage: activo' : '🟡 Sin Supabase: avatares temporales';
    }
  } catch (_) {
    if (nanoEl) { nanoEl.className = 'lc-chip lc-chip-warn'; nanoEl.textContent = '🟡 Servidor local: no activo'; }
    if (sbEl)   { sbEl.className   = 'lc-chip lc-chip-warn'; sbEl.textContent   = '🟡 Avatares: DiceBear (gratis)'; }
  }
}

// ── Enviar configuración al servidor ─────────────────────
// La Gemini key se usa tanto para IA de texto como para Gemini Imagen 3 (avatares)
function lcSendConfigToServer() {
  const nano   = localStorage.getItem('fakelive_gemini_key')       || ''; // misma clave que Gemini
  const sbUrl  = localStorage.getItem('fakelive_supabase_url')     || '';
  const sbAnon = localStorage.getItem('fakelive_supabase_anon')    || '';
  const sbSvc  = localStorage.getItem('fakelive_supabase_service') || '';
  if (!nano && !sbUrl) return;
  fetch('/api/config', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nanobananaKey: nano, supabaseUrl: sbUrl, supabaseAnon: sbAnon, supabaseService: sbSvc })
  }).catch(() => {}); // falla silenciosamente en Vercel
}

// ── Generar avatares ──────────────────────────────────────
async function lcGenerateAvatars() {
  const btn      = document.getElementById('btn-lc-avatars');
  const progWrap = document.getElementById('lc-avatar-progress');
  const progFill = document.getElementById('lc-progress-fill');
  const progLbl  = document.getElementById('lc-progress-label');
  const doneEl   = document.getElementById('lc-avatar-done');

  if (!_lcComments.length) { showToast('Primero configura el export', 'error'); return; }

  btn.disabled = true;
  progWrap.style.display = '';
  doneEl.style.display   = 'none';

  const cfg     = lcGetConfig();
  const unique  = [...new Set(_lcComments.map(c => c.username))];
  const total   = unique.length;
  let done      = 0;

  const doOne = async (username) => {
    // Si ya tiene avatar, saltar
    if (_lcAvatarMap[username]) { done++; return; }

    const c      = _lcComments.find(x => x.username === username);
    const gender = c?.gender || 'female';

    try {
      const r = await fetch('/api/generate-avatar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, country: cfg.country, gender })
      });
      if (r.ok) {
        const d = await r.json();
        _lcAvatarMap[username] = d.url;
      }
    } catch (_) {
      // Fallback directo a DiceBear (funciona sin backend)
      _lcAvatarMap[username] = `https://api.dicebear.com/7.x/personas/svg?seed=${encodeURIComponent(username)}`;
    }

    done++;
    const pct = Math.round((done / total) * 100);
    if (progFill) progFill.style.width = pct + '%';
    if (progLbl)  progLbl.textContent  = `Generando... ${done} de ${total}`;

    // Actualizar preview en tiempo real
    lcRenderPreviewAvatars();
  };

  // Máx 3 concurrentes
  const chunks = [];
  for (let i = 0; i < unique.length; i += 3) chunks.push(unique.slice(i, i + 3));
  for (const chunk of chunks) await Promise.all(chunk.map(doOne));

  progWrap.style.display = 'none';
  doneEl.style.display   = '';
  doneEl.textContent     = `✅ ${total} avatares listos`;
  btn.disabled = false;

  lcShowStep2();
  showToast(`${total} avatares generados ✓`, 'success');
}

// Actualiza solo las imágenes del preview sin regenerar todo
function lcRenderPreviewAvatars() {
  document.querySelectorAll('.lc-avatar-circle').forEach((el, i) => {
    const c = _lcComments[i];
    if (!c) return;
    const url = _lcAvatarMap[c.username];
    if (url && !el.querySelector('img')) {
      el.innerHTML = `<img src="${url}" alt="" style="width:100%;height:100%;object-fit:cover;border-radius:50%;"/>`;
    }
  });
}

// ── Mostrar step 2 (CSV preview) ─────────────────────────
function lcShowStep2() {
  const step2 = document.getElementById('lc-step-2');
  const step3 = document.getElementById('lc-step-3');
  if (step2) step2.style.display = '';
  if (step3) step3.style.display = '';

  // Mostrar primeras 5 filas del CSV
  const el = document.getElementById('lc-csv-preview');
  if (!el || !_lcComments.length) return;
  const rows = [['Title','Content','Time','Image']];
  _lcComments.slice(0, 5).forEach(c => {
    rows.push([c.username, c.text, c.timeStr, _lcAvatarMap[c.username] || '']);
  });
  el.textContent = rows.map(r => r.join('\t')).join('\n');
}

// ── Descargar CSV ─────────────────────────────────────────
async function lcDownloadCSV() {
  if (!_lcComments.length) { showToast('Genera los comentarios primero', 'error'); return; }
  const cfg  = lcGetConfig();
  const rows = _lcComments.map(c => ({
    title:    c.username,
    content:  c.text,
    time:     c.timeStr,
    imageUrl: _lcAvatarMap[c.username] || '',
    country:  cfg.country
  }));

  const ts = new Date().toISOString().slice(0, 16).replace('T', '_').replace(/:/g, '-');
  const filename = `livecake_${cfg.country.replace(/[^a-zA-Z]/g,'')}_${ts}.csv`;

  try {
    const r = await fetch('/api/export-csv', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rows })
    });
    if (r.ok) {
      const blob = await r.blob();
      const url  = URL.createObjectURL(blob);
      const a    = Object.assign(document.createElement('a'), { href: url, download: filename });
      document.body.appendChild(a); a.click(); a.remove();
      URL.revokeObjectURL(url);
      showToast(`CSV descargado — ${rows.length} comentarios ✓`, 'success');
      return;
    }
  } catch (_) { /* backend no disponible, generar client-side */ }

  // Fallback: generar CSV en el navegador
  const BOM    = '﻿';
  const header = 'Title\tContent\tTime\tImage';
  const lines  = rows.map(r =>
    [r.title, r.content, r.time, r.imageUrl]
      .map(v => String(v).replace(/\t|\n/g, ' '))
      .join('\t')
  );
  const csv  = BOM + header + '\n' + lines.join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const a    = Object.assign(document.createElement('a'), { href: url, download: filename });
  document.body.appendChild(a); a.click(); a.remove();
  URL.revokeObjectURL(url);
  showToast(`CSV descargado — ${rows.length} comentarios ✓`, 'success');
}

// ── Copiar como texto ─────────────────────────────────────
function lcCopyTSV() {
  if (!_lcComments.length) { showToast('Genera los comentarios primero', 'error'); return; }
  const header = 'Title\tContent\tTime\tImage';
  const lines  = _lcComments.map(c =>
    [c.username, c.text, c.timeStr, _lcAvatarMap[c.username] || ''].join('\t')
  );
  navigator.clipboard.writeText(header + '\n' + lines.join('\n'))
    .then(() => showToast('Copiado al portapapeles ✓'))
    .catch(() => showToast('Error al copiar', 'error'));
}

// ── Probar Supabase ───────────────────────────────────────
async function lcTestSupabase() {
  const btn = document.getElementById('btn-test-supabase-lc');
  const res = document.getElementById('supabase-lc-test-result');
  btn.disabled = true;
  btn.textContent = 'Probando...';
  res.style.display = 'none';
  // Enviar config primero
  lcSendConfigToServer();
  await new Promise(r => setTimeout(r, 800));
  try {
    const r = await fetch('/api/avatar-status');
    const s = r.ok ? await r.json() : { supabase: false };
    res.style.display = 'block';
    if (s.supabase) {
      res.style.background = 'rgba(0,200,83,0.12)'; res.style.color = '#00e475'; res.style.border = '1px solid rgba(0,200,83,0.3)';
      res.textContent = '✅ Supabase conectado correctamente';
    } else {
      res.style.background = 'rgba(234,195,43,0.1)'; res.style.color = '#eac32b'; res.style.border = '1px solid rgba(234,195,43,0.2)';
      res.textContent = '🟡 Supabase no configurado — modo DiceBear activo';
    }
  } catch (_) {
    res.style.display = 'block';
    res.style.background = 'rgba(255,23,68,0.1)'; res.style.color = '#ff5166'; res.style.border = '1px solid rgba(255,23,68,0.25)';
    res.textContent = '🟡 Servidor local no activo — en Vercel se usa DiceBear automáticamente';
  } finally {
    btn.disabled = false; btn.textContent = '🧪 Probar Supabase';
  }
}

// ── Cargar/guardar API keys de LiveCake (solo Supabase Storage) ──
// La Gemini key se gestiona en sbLoadStreamSettings / sbSaveStreamSettings
function lcLoadApiKeys() {
  const el2 = document.getElementById('lc-supabase-url');
  const el3 = document.getElementById('lc-supabase-anon');
  const el4 = document.getElementById('lc-supabase-service');
  if (el2) el2.value = localStorage.getItem('fakelive_supabase_url')      || '';
  if (el3) el3.value = localStorage.getItem('fakelive_supabase_anon')     || '';
  if (el4) el4.value = localStorage.getItem('fakelive_supabase_service')  || '';
}

function lcSaveApiKeys() {
  const url  = document.getElementById('lc-supabase-url')?.value?.trim();
  const anon = document.getElementById('lc-supabase-anon')?.value?.trim();
  const svc  = document.getElementById('lc-supabase-service')?.value?.trim();
  if (url  !== undefined) localStorage.setItem('fakelive_supabase_url',     url);
  if (anon !== undefined) localStorage.setItem('fakelive_supabase_anon',    anon);
  if (svc  !== undefined) localStorage.setItem('fakelive_supabase_service', svc);
  lcSendConfigToServer();
}

// ── Entrada a la sección ──────────────────────────────────
function lcOnEnter() {
  lcLoadConfig();
  lcAutoDetectDuration();
  lcSendConfigToServer(); // envía la Gemini key (y Supabase si está) al servidor
  lcRenderPreview();
  lcUpdateStatus();
}

// ── Parche sbNavTo para lazy-load ─────────────────────────
const _lcOrigNavTo = sbNavTo;
sbNavTo = function (section) {
  _lcOrigNavTo.apply(this, [section]);
  if (section === 'livecake') lcOnEnter();
  if (section === 'settings') lcLoadApiKeys();
};

// ── Bindings ─────────────────────────────────────────────
function lcBindAll() {
  // Config changes → re-render preview
  ['lc-country','lc-time-format'].forEach(id => {
    document.getElementById(id)?.addEventListener('change', lcRenderPreview);
  });

  // Botón refrescar (re-lee el guion)
  document.getElementById('btn-lc-regenerate')?.addEventListener('click', lcRenderPreview);

  document.getElementById('btn-lc-avatars')?.addEventListener('click',  lcGenerateAvatars);
  document.getElementById('btn-lc-download')?.addEventListener('click', lcDownloadCSV);
  document.getElementById('btn-lc-copy')?.addEventListener('click',     lcCopyTSV);
  document.getElementById('btn-test-supabase-lc')?.addEventListener('click', lcTestSupabase);

  // Guardar Supabase keys al cambiar (Gemini key se gestiona en sbSaveStreamSettings)
  ['lc-supabase-url','lc-supabase-anon','lc-supabase-service'].forEach(id => {
    document.getElementById(id)?.addEventListener('change', lcSaveApiKeys);
    document.getElementById(id)?.addEventListener('blur',   lcSaveApiKeys);
  });

  // Cuando se guarda la Gemini key, re-enviar config al servidor (para avatares)
  document.getElementById('gemini-key-input')?.addEventListener('change', lcSendConfigToServer);
  document.getElementById('gemini-key-input')?.addEventListener('blur',   lcSendConfigToServer);
}

document.addEventListener('DOMContentLoaded', () => {
  lcBindAll();
  lcLoadApiKeys();
  lcSendConfigToServer();
});
