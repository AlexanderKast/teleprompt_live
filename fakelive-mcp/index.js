#!/usr/bin/env node
/**
 * FakeLive Pro — Servidor MCP
 *
 * ARQUITECTURA CORRECTA:
 * El MCP NO llama a ninguna API de IA por su cuenta.
 * Cada herramienta construye un prompt ultra-estructurado y lo devuelve
 * como texto. Claude (o cualquier LLM conectado) lo ejecuta directamente.
 *
 * Ventajas:
 *  ✅ Sin ANTHROPIC_API_KEY — usa el LLM que ya tienes conectado
 *  ✅ Compatible con Claude, GPT-4, Gemini, Ollama, etc.
 *  ✅ Sin costo extra — una sola llamada por herramienta
 *  ✅ Instalación de 30 segundos
 *
 * Herramientas:
 *  1. generar_guion_live        — Script completo en formato FakeLive
 *  2. crear_gancho              — 3 variantes de apertura de impacto
 *  3. crear_estructura_lanzamiento — Plan de 3, 7 días o webinar
 *  4. analizar_retencion        — Diagnóstico con score + mejoras
 *  5. generar_comentarios       — Batch de comentarios realistas
 *  6. optimizar_momento_venta   — 8 pasos de cierre en live
 *  7. crear_arco_emocional      — Mapa emocional minuto a minuto
 *  8. manejar_objeciones        — Tabla de objeciones + scripts
 *  9. exportar_a_fakelive       — Envía script al teleprompter local
 * 10. estado_servidor           — Verifica si FakeLive Pro corre
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListPromptsRequestSchema,
  GetPromptRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

// ─── Configuración ─────────────────────────────────────────────────────────
const FAKELIVE_URL = process.env.FAKELIVE_URL || 'http://localhost:3000';

// ─── Sistema de prompts (metodología completa de streaming) ───────────────
const METODOLOGIA = `
ERES EL ARQUITECTO DE LIVES DE ALTA CONVERSIÓN para FakeLive Pro — MODO BUCLE CONTINUO.

El live NUNCA tiene un inicio visible ni un final. Siempre se ve como si llevara horas al aire.
Las ventas ocurren DURANTE TODO EL LIVE, no solo al final.

━━━ FORMATO OBLIGATORIO ━━━
Cada línea del script DEBE seguir exactamente: MM:SS [TIPO] contenido

TIPOS BÁSICOS:
  [GUION]      → Lo que dice el streamer (máx 3-4 oraciones por bloque)
  [COMENTARIO] → usuario: texto del comentario de audiencia
  [RESPONDER]  → Sugerencia de respuesta para el streamer
  [ACCION]     → Instrucción física corta e imperativa
  [MOSTRAR]    → Qué poner en pantalla (gráfico, precio, link, timer)
  [PAUSA]      → "X seg — instrucción de qué hacer"
  [EMOCION]    → CELEBRAR|URGENCIA|INTRIGA|SORPRESA|ENERGIA|REFLEXION|LLAMADA
  [COUNTDOWN]  → N  (cuenta regresiva de N segundos)

TIPOS DE VENTA (overlays automáticos en el teleprompter):
  [CTA_COMPRA]  → Banner inferior de CTA  — Sintaxis: "Texto — link (opcional)"
  [POPUP]       → Tarjeta de compra rápida — Sintaxis: "Título — Descripción — $Precio"
  [FLASH_SALE]  → Oferta con countdown     — Sintaxis: "Segundos — Descripción — $Precio"
  [BOOM_VENTA]  → Pantalla completa venta  — Sintaxis: "Texto impactante"

━━━ SISTEMA SPINE CIRCULAR (modo bucle) ━━━
  En modo bucle SPINE no es lineal — se repite en cada ciclo de 45-60 min:
  GANCHO MEDIO (sin presentación) → Promesa de lo que viene en 10 min
  VALOR (picos cada 8-12 min)     → señal + insight + prueba + [CTA_COMPRA]
  BOOM (1-2 veces por ciclo)      → [BOOM_VENTA] + [POPUP] con precio
  REACTIVACIÓN (cada 10-12 min)   → Pregunta de chat + [FLASH_SALE] sorpresa
  PUENTE (al final del ciclo)     → Conexión fluida al inicio del siguiente ciclo

━━━ DISTRIBUCIÓN DE CTAs ━━━
  Nunca más de 10 min consecutivos sin una invitación a comprar:
  · Min 6-8:   [CTA_COMPRA]  (suave — "por si les interesa")
  · Min 14-16: [POPUP]       (media — oferta completa con precio)
  · Min 22-25: [FLASH_SALE]  (alta — urgencia temporal de 60-90 seg)
  · Min 30-35: [BOOM_VENTA] + [POPUP]  (máxima — momento de cierre)
  · Min 40-42: [CTA_COMPRA]  (recordatorio)

━━━ NEUROVENTAS ━━━
  · Activar cerebro reptiliano: supervivencia, FOMO, pertenencia tribal
  · Storytelling: conflicto → transformación → nuevo estado
  · Prueba social progresiva: crecer hacia el cierre
  · Urgencia genuina (nunca falsa): razón real de por qué es ahora

━━━ HUMANIZADOR ━━━
  · Sin inicio obvio: el script arranca "en medio" de contenido valioso
    ✅ "Y precisamente por eso es que..."  ❌ "¡Bienvenidos al live!"
  · Sin cierre visible: el último bloque conecta fluidamente con el primero
  · Imperfecciones calculadas: "este...", "o sea...", correcciones naturales
  · Referencias hiperlocales: ciudades, frases culturales, actualidad LATAM
  · Variedad de energía: 30% alta, 50% media, 20% íntima/confesional

━━━ NOMBRES DE USUARIOS LATAM ━━━
  Femeninos: MariaFer_, LauValencia, CamilaRSs, JuliethMdz, AnaKaren__, DanielaVQ,
             PaolaJimenez_, NataliaC_Col, ValentinaM, CarolinaB98
  Masculinos: JuanCamilo_, AndresF98, CarlosDevs, SebastianMx, FelipeBog,
              MigelAngel_, OscarV_Col, DavidRivera_, AlejandroK, SantiagoP_
  Neutrales:  ContentMaker7, DigitalNomad3, Profe_online, CreadorLatam

━━━ REGLAS DE FORMATO ━━━
  1. Timestamps progresivos y realistas (primer bloque en 00:30+, nunca presentación en 00:00)
  2. Nunca más de 4 líneas [GUION] seguidas sin intercalar otro tipo
  3. [COMENTARIO] formato: "usuario: texto"
  4. Comentarios cada 2-3 minutos
  5. Mínimo 3 [ACCION] y 2 [MOSTRAR] por script
  6. Al menos 1 overlay de venta cada 10-12 minutos
  7. El script termina en un bloque que conecta sin fricciones con el primero
`;

// ─── Helpers de construcción de prompts ───────────────────────────────────

function construirPromptGuion(args) {
  const {
    tema, objetivo = 'venta', duracion_minutos = 45,
    producto = '', precio = '', audiencia = 'emprendedores LATAM',
    pais_principal = 'Colombia', tono = 'amigo_de_confianza',
    puntos_valor = [], garantia = '',
  } = args;

  const minVenta = Math.floor(duracion_minutos * 0.75);
  const tonosMap = {
    amigo_de_confianza: 'cercano, informal, como contarle algo a un amigo de confianza',
    experto_formal: 'autoridad experta, estructurado, datos y resultados',
    coach_motivacional: 'energético, inspirador, llama a la acción emocional',
    mentor_cercano: 'sabio, compasivo, experiencia compartida sin ego',
  };

  const ctaCalendario = objetivo === 'venta' ? `
DISTRIBUCIÓN DE CTAs DE VENTA (obligatorio):
  · Min ${Math.round(duracion_minutos * 0.13)}: [CTA_COMPRA] suave — "por si les interesa"
  · Min ${Math.round(duracion_minutos * 0.30)}: [POPUP] con precio y descripción del producto
  · Min ${Math.round(duracion_minutos * 0.48)}: [FLASH_SALE] 90 seg — oferta con urgencia real
  · Min ${Math.round(duracion_minutos * 0.65)}: [BOOM_VENTA] — inicio del momento de cierre (8 pasos)
  · Min ${Math.round(duracion_minutos * 0.85)}: [CTA_COMPRA] — recordatorio final` : '';

  return `${METODOLOGIA}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
GENERA AHORA el guión completo de live en MODO BUCLE con estas especificaciones:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

TEMA: ${tema}
OBJETIVO: ${objetivo}
DURACIÓN DEL CICLO: ${duracion_minutos} minutos (el script se repite en bucle sin fin)
PRODUCTO A VENDER: ${producto || 'No hay venta directa (live educativo/comunidad)'}
PRECIO: ${precio || 'N/A'}
AUDIENCIA: ${audiencia}
PAÍS PRINCIPAL: ${pais_principal}
TONO: ${tonosMap[tono] || tono}
GARANTÍA: ${garantia || 'No especificada'}
${puntos_valor.length > 0 ? `\nPUNTOS DE VALOR A ENSEÑAR:\n${puntos_valor.map((p, i) => `  ${i + 1}. ${p}`).join('\n')}` : ''}
${ctaCalendario}

INSTRUCCIONES CRÍTICAS — MODO BUCLE:
1. El script NUNCA empieza con "¡Bienvenidos!" ni presentaciones — arranca "en medio" del tema
   ✅ "Y es que precisamente..."   ❌ "¡Hola a todos los que están entrando!"
2. El último bloque debe conectar fluidamente con el primero (sin que se note la costura del bucle)
3. La venta NO está solo al final — CTAs distribuidos a lo largo de TODO el ciclo
4. ${objetivo === 'venta' ? `Momento de cierre principal al minuto ${minVenta} (8 pasos completos)` : 'Sin venta directa — valor y comunidad a lo largo de todo el ciclo'}
5. Comentarios de audiencia cada 2-3 minutos (variados, con nombres LATAM de ${pais_principal})
6. Cada pico de valor: señal → insight → prueba → aplicación → [CTA_COMPRA] o [POPUP]
7. Mínimo 3 [ACCION] y 2 [MOSTRAR] estratégicos
8. [PAUSA] de interacción cada 10-12 minutos
9. [EMOCION] y [COUNTDOWN] para momentos de alta tensión emocional
10. Humanizar: imperfecciones calculadas, referencias locales a ${pais_principal}
11. Al final del script, agregar: "— PUNTO DE REINICIO DEL BUCLE —" como comentario

Genera el script completo del ciclo en formato FakeLive Pro, listo para el modo bucle.`;
}

function construirPromptGancho(args) {
  const { tema, audiencia = 'emprendedores LATAM', tipo_gancho = 'todos', producto_a_revelar = '' } = args;
  const tipos = {
    promesa_imposible: 'PROMESA IMPOSIBLE DE IGNORAR: resultado específico y concreto que detiene el scroll',
    pregunta_que_duele: 'PREGUNTA QUE ACTIVA EL DOLOR: toca el problema más profundo de la audiencia',
    tension_narrativa: 'TENSIÓN NARRATIVA: historia incompleta que obliga a quedarse para saber el final',
    dato_shocking: 'DATO SHOCKING: estadística o dato que desafía una creencia instalada',
    confesion: 'CONFESIÓN INESPERADA: revelación personal que humaniza y genera curiosidad',
  };

  const variantes = tipo_gancho === 'todos'
    ? Object.entries(tipos).slice(0, 3).map(([k, v], i) => `VARIANTE ${String.fromCharCode(65 + i)} — ${v}`).join('\n')
    : `VARIANTE ÚNICA — ${tipos[tipo_gancho] || tipo_gancho}`;

  return `${METODOLOGIA}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
GENERA ${tipo_gancho === 'todos' ? '3 VARIANTES DE GANCHO' : 'UN GANCHO'} DE APERTURA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

TEMA: ${tema}
AUDIENCIA: ${audiencia}
${producto_a_revelar ? `TEASER AL CIERRE: mencionar que habrá algo especial sobre "${producto_a_revelar}"` : ''}

${variantes}

PARA CADA VARIANTE:
· Duración: 60-90 segundos exactos
· Script en formato FakeLive (00:00 → 01:30)
· 2-3 comentarios de audiencia llegando (emocionados, con ciudades)
· 1-2 [ACCION] de apertura (contacto visual, señalar, gesticular)
· Loop de curiosidad al final: razón explícita para quedarse hasta el minuto X
· El nombre del streamer NO aparece en los primeros 30 segundos

Genera todas las variantes listas para copiar al teleprompter.`;
}

function construirPromptLanzamiento(args) {
  const { producto, precio = '', tipo = 'semilla_3_lives', audiencia = 'emprendedores LATAM', fecha_inicio = '', generar_scripts = false } = args;

  const estructuras = {
    semilla_3_lives: {
      nombre: 'Lanzamiento Semilla — 3 Lives',
      sesiones: [
        'Live 1 (Día -7): EL PROBLEMA — Identificar y agitar el dolor. Cero venta.',
        'Live 2 (Día -3): LA SOLUCIÓN — Método/sistema + revelar que existe algo especial.',
        'Live 3 (Día 0): EL LANZAMIENTO — Carrito abierto. Máxima venta. 90-120 min.',
      ],
    },
    challenge_7_dias: {
      nombre: 'Challenge 7 Días',
      sesiones: [
        'Día 1: El QUÉ — Resultado prometido + gancho brutal',
        'Día 2: El POR QUÉ — El problema profundo y sus consecuencias',
        'Día 3: El QUIÉN — La mentalidad correcta para lograrlo',
        'Día 4: El CÓMO — El método paso a paso',
        'Día 5: Prueba Social — Casos de éxito + live con cliente real',
        'Día 6: Q&A Masivo — Clearing mental de objeciones',
        'Día 7: LANZAMIENTO — Carrito + oferta especial de 24h',
      ],
    },
    webinar_90min: {
      nombre: 'Webinar de Lanzamiento — 90 Minutos',
      sesiones: [
        '0-10 min: Gancho + bienvenida + credencial (sin nombre primero)',
        '10-15 min: El error #1 que comete tu audiencia',
        '15-45 min: 3 secretos/pasos/técnicas (el núcleo de valor)',
        '45-55 min: Caso de éxito de cliente real',
        '55-65 min: Transición + presentación de oferta',
        '65-80 min: Precio + bonos + garantía + urgencia real',
        '80-90 min: Q&A + cierre final',
      ],
    },
  };

  const est = estructuras[tipo] || estructuras.semilla_3_lives;

  return `${METODOLOGIA}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DISEÑA ESTRUCTURA DE LANZAMIENTO: ${est.nombre}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PRODUCTO: ${producto}
PRECIO: ${precio || 'A revelar en el lanzamiento'}
AUDIENCIA: ${audiencia}
FECHA INICIO: ${fecha_inicio || 'A definir'}

ESTRUCTURA BASE:
${est.sesiones.map((s, i) => `  ${i + 1}. ${s}`).join('\n')}

PARA CADA SESIÓN genera:
  ① Objetivo específico y cómo medirlo (KPI)
  ② Estructura de tiempo detallada (% por sección)
  ③ Top 3 puntos de contenido
  ④ CTA exacto al cierre (qué hacer, dónde ir, cómo)
  ⑤ Qué sembrar para la siguiente sesión
  ${generar_scripts ? '⑥ Script de apertura (primeros 5 min en formato FakeLive)' : ''}

ADICIONAL:
· Secuencia de mensajes/emails entre sesiones (qué enviar y cuándo)
· Cómo crear urgencia progresiva de sesión a sesión
· Plan B si alguna sesión no convierte bien
· Métricas de éxito para todo el lanzamiento

Formato claro organizado por sesión con títulos y emojis para facilitar lectura.`;
}

function construirPromptAnalisis(args) {
  const { script, objetivo = 'venta', duracion_minutos = 45 } = args;
  return `${METODOLOGIA}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ANALIZA ESTE SCRIPT DE LIVE Y DA FEEDBACK DETALLADO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

OBJETIVO DEL LIVE: ${objetivo}
DURACIÓN PREVISTA: ${duracion_minutos} minutos

SCRIPT A ANALIZAR:
${script}

ENTREGA EL ANÁLISIS CON ESTA ESTRUCTURA:

## 📊 SCORES (califica del 1 al 10 con justificación de 1 línea)
  · Retención esperada: X/10
  · Potencial de venta: X/10
  · Humanización: X/10
  · Estructura SPINE: X/10
  · SCORE TOTAL: X/10

## 🔍 DIAGNÓSTICO POR FASES
Para Gancho / Valor / Puente / Venta / Cierre:
  → Estado: FUERTE / DÉBIL / FALTANTE
  → Problema específico detectado (con timestamp exacto)

## 🚨 TOP 5 MEJORAS CRÍTICAS (orden de impacto)
Para cada una:
  · PROBLEMA: qué está mal
  · SOLUCIÓN: qué cambiar
  · VERSIÓN MEJORADA: fragmento reescrito en formato FakeLive

## 💬 COMENTARIOS FALTANTES
Qué tipo de comentarios de audiencia faltan y dónde insertarlos (con timestamp)

## ⚠️ PUNTOS DE CAÍDA DE RETENCIÓN
Qué momentos van a hacer que la gente abandone el live y exactamente por qué

## ✅ RECOMENDACIÓN FINAL
Los 2 cambios más urgentes antes de salir en vivo.`;
}

function construirPromptComentarios(args) {
  const { contexto, cantidad = 20, fase = 'mixto', pais = 'Colombia', incluir_objeciones = true, producto = '' } = args;

  const distribucion = incluir_objeciones
    ? '30% entusiasmo/llegada | 25% validación | 20% preguntas relevantes | 15% objeciones manejables | 10% prueba social'
    : '35% entusiasmo/llegada | 30% validación | 25% preguntas relevantes | 10% prueba social';

  return `${METODOLOGIA}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
GENERA ${cantidad} COMENTARIOS DE AUDIENCIA REALISTAS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CONTEXTO DEL LIVE: ${contexto}
FASE: ${fase}
PAÍS PRINCIPAL: ${pais}
${producto ? `PRODUCTO EN VENTA: ${producto}` : ''}

DISTRIBUCIÓN: ${distribucion}

REGLAS:
· Formato exacto: XX:XX [COMENTARIO] usuario: texto
· Nombres variados de LATAM (no repetir)
· Emojis naturales (no excesivos, máx 2-3 por comentario)
· Ciudades mezcladas: Bogotá, Medellín, Cali, México DF, Lima, Caracas, Santiago, Buenos Aires
· Español informal pero correcto según el país
· Las objeciones deben ser manejables, no agresivas
· Los de prueba social: alguien que ya compró o ya vio resultados
· Variar la longitud: algunos cortos (1-3 palabras + emojis), otros más elaborados

Genera los ${cantidad} comentarios con timestamps realistas y progresivos,
listos para copiar y pegar directamente en el script de FakeLive.`;
}

function construirPromptVenta(args) {
  const {
    producto, precio, beneficios = [], bonos = [],
    garantia = '', urgencia = '', audiencia = 'emprendedores LATAM',
    timestamp_inicio = '30:00',
  } = args;

  return `${METODOLOGIA}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
GENERA LA SECUENCIA DE VENTA DE 8 PASOS EN FORMATO FAKELIVE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PRODUCTO: ${producto}
PRECIO: ${precio}
BENEFICIOS PRINCIPALES: ${beneficios.length > 0 ? beneficios.join(' | ') : 'Definir los 5 beneficios más importantes'}
BONOS: ${bonos.length > 0 ? bonos.join(' | ') : 'Sin bonos especificados'}
GARANTÍA: ${garantia || 'A definir (recomendado: 30 días completos)'}
URGENCIA REAL: ${urgencia || 'Cupos limitados o precio especial solo por el live'}
AUDIENCIA: ${audiencia}
TIMESTAMP DE INICIO: ${timestamp_inicio}

GENERA EN FORMATO FAKELIVE los 8 pasos:

PASO 1 — EL SUEÑO (30 seg): Hacer soñar con el resultado
PASO 2 — EL OBSTÁCULO (30 seg): El problema que les impide llegar
PASO 3 — LA SOLUCIÓN (60 seg): Presentar el producto como la respuesta natural
PASO 4 — LOS COMPONENTES (90 seg): Beneficios uno a uno + [MOSTRAR] gráfico
PASO 5 — EL VALOR APILADO (30 seg): Comparar vs. precio individual + [MOSTRAR] tabla
PASO 6 — EL PRECIO (30 seg): Revelarlo con pausa estratégica antes y después
PASO 7 — LA URGENCIA (30 seg): Razón genuina de por qué es ahora + [MOSTRAR] timer/cupos
PASO 8 — EL CTA (30 seg): Instrucción específica + [PAUSA] para leer chat de compradores

INCLUIR durante la secuencia:
· 5-6 comentarios estratégicos (interés, precio, "ya compré!", objeción manejable)
· [RESPONDER] para las señales de objeción del chat
· [MOSTRAR] en los momentos de precio y urgencia
· Duración total del momento de venta: 8-10 minutos

El texto debe sonar como lo diría un humano, no como una presentación de ventas formal.`;
}

function construirPromptArco(args) {
  const { tema, duracion_minutos = 45, objetivo_emocional = 'decisión confiada de compra', nivel_energia_base = 'medio' } = args;
  return `${METODOLOGIA}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DISEÑA EL MAPA DE ARCO EMOCIONAL DEL LIVE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

TEMA: ${tema}
DURACIÓN: ${duracion_minutos} minutos
OBJETIVO EMOCIONAL FINAL: ${objetivo_emocional}
ENERGÍA NATURAL DEL PRESENTADOR: ${nivel_energia_base}

GENERA:

## 🗺️ MAPA EMOCIONAL (tabla visual)
Columnas: Minuto | Emoción Target Audiencia | Técnica a usar | Nivel Energía | Tipo Comentario
Una fila cada 3-5 minutos

## 🔄 TRANSICIONES CLAVE
Las 5 transiciones más importantes y EXACTAMENTE cómo ejecutarlas en palabras

## ⚡ GUÍA DE ENERGÍA
· Cuándo SUBIR (voz, ritmo, gestos específicos)
· Cuándo BAJAR (momentos íntimos o de venta directa)
· Las 3 señales de que la audiencia está perdiendo el engagement

## 🔔 TÉCNICAS DE REACTIVACIÓN (para usar cada 10-12 min)
Tres técnicas completas con el script exacto de cada una:
  1. Interrupción de patrón
  2. Pregunta de activación del chat
  3. Promesa de bonus sorpresa

## 🎭 ESTADOS POR FASE
Qué debe sentir la audiencia en: Apertura / Pico 1 / Pico 2 / Transición / Venta / Cierre

## 🆘 FRASES DE RESCATE
5 frases exactas para cuando detectas que el chat se enfría o la energía cae.`;
}

function construirPromptObjeciones(args) {
  const { producto, precio = '', objeciones_especificas = [], garantia = '', resultado_principal = '' } = args;

  const objecionesBase = [
    { nombre: 'PRECIO', senal: '"está muy caro", "no tengo", "muy costoso"' },
    { nombre: 'TIEMPO', senal: '"no tengo tiempo", "muy ocupado", "trabajo todo el día"' },
    { nombre: 'DESCONFIANZA', senal: '"es seguro?", "qué garantía", "cómo sé que funciona"' },
    { nombre: 'YA LO INTENTÉ', senal: '"ya probé cosas así", "no me funcionó antes"' },
    { nombre: 'LO PIENSO', senal: '"lo pienso", "mañana lo veo", "después"' },
  ];

  return `${METODOLOGIA}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
GENERA TABLA COMPLETA DE MANEJO DE OBJECIONES EN LIVE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PRODUCTO: ${producto}
PRECIO: ${precio || 'A especificar'}
RESULTADO PRINCIPAL: ${resultado_principal || 'El resultado principal del producto'}
GARANTÍA: ${garantia || 'A definir (recomendado: 30 días con devolución total)'}

OBJECIONES A CUBRIR:
${objecionesBase.map(o => `· ${o.nombre}: señales en chat → ${o.senal}`).join('\n')}
${objeciones_especificas.length > 0 ? '\nOBJECIONES ESPECÍFICAS ADICIONALES:\n' + objeciones_especificas.map(o => `· ${o}`).join('\n') : ''}

PARA CADA OBJECIÓN, ENTREGA:

### OBJECIÓN: [Nombre]
**Señales en el chat:** palabras o frases que la delatan
**Script completo en formato FakeLive:**
\`\`\`
XX:XX [RESPONDER] cómo detectarla y qué hacer
XX:XX [GUION] respuesta exacta de 30-45 segundos
XX:XX [COMENTARIO] usuario: comentario positivo de contrapeso
\`\`\`
**Reencuadre mental:** una frase poderosa que cambia la perspectiva
**Error común:** qué NO hacer al responder esta objeción

AL FINAL INCLUIR:
## PROTOCOLO DE CHAT DURANTE LA VENTA
· Cómo leer el chat sin perder el hilo del guión
· Cuándo responder objeciones en voz alta vs. ignorarlas
· Cómo usar los comentarios positivos como prueba social en tiempo real`;
}

// ─── Helper: verificar FakeLive ─────────────────────────────────────────────
async function verificarFakelive(urlBase) {
  try {
    const res = await fetch(`${urlBase}/api/status`, {
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return { online: false };
    const data = await res.json();
    return { online: true, ...data };
  } catch {
    return { online: false };
  }
}

// ─── Definición de herramientas ──────────────────────────────────────────────
const TOOLS = [
  {
    name: 'generar_guion_live',
    description:
      'Genera un prompt optimizado para que el LLM cree un guión completo de live/streaming ' +
      'en formato FakeLive Pro (MM:SS [TIPO]). Aplica Sistema SPINE de retención, neuroventas, ' +
      '8 pasos de venta y humanizador anti-IA. No requiere API key propia.',
    inputSchema: {
      type: 'object',
      properties: {
        tema: { type: 'string', description: 'Tema principal del live' },
        objetivo: {
          type: 'string',
          enum: ['venta', 'educacion', 'comunidad', 'lanzamiento', 'awareness'],
          description: 'Objetivo principal del live',
          default: 'venta',
        },
        duracion_minutos: {
          type: 'number',
          description: 'Duración total en minutos',
          default: 45,
          minimum: 15,
          maximum: 180,
        },
        producto: { type: 'string', description: 'Nombre y descripción del producto a vender' },
        precio: { type: 'string', description: 'Precio (ej: "197 USD", "$450.000 COP")' },
        audiencia: { type: 'string', description: 'Audiencia objetivo', default: 'emprendedores LATAM' },
        pais_principal: { type: 'string', description: 'País de la audiencia para localización', default: 'Colombia' },
        tono: {
          type: 'string',
          enum: ['amigo_de_confianza', 'experto_formal', 'coach_motivacional', 'mentor_cercano'],
          default: 'amigo_de_confianza',
        },
        puntos_valor: {
          type: 'array',
          items: { type: 'string' },
          description: 'Lista de 3-5 puntos de valor/secretos que enseñará el live',
        },
        garantia: { type: 'string', description: 'Descripción de la garantía ofrecida' },
      },
      required: ['tema'],
    },
  },
  {
    name: 'crear_gancho',
    description:
      'Genera el prompt para crear 3 variantes de gancho de apertura (primeros 60-90 seg). ' +
      'Tipos: promesa imposible, pregunta que duele, tensión narrativa.',
    inputSchema: {
      type: 'object',
      properties: {
        tema: { type: 'string', description: 'Tema del live' },
        audiencia: { type: 'string', default: 'emprendedores LATAM' },
        tipo_gancho: {
          type: 'string',
          enum: ['promesa_imposible', 'pregunta_que_duele', 'tension_narrativa', 'dato_shocking', 'confesion', 'todos'],
          default: 'todos',
        },
        producto_a_revelar: { type: 'string', description: 'Teaser de algo especial al final del gancho' },
      },
      required: ['tema'],
    },
  },
  {
    name: 'crear_estructura_lanzamiento',
    description:
      'Genera el plan de lanzamiento completo para 3 lives (semilla), 7 días (challenge) o webinar 90 min.',
    inputSchema: {
      type: 'object',
      properties: {
        producto: { type: 'string', description: 'Producto o servicio a lanzar' },
        precio: { type: 'string' },
        tipo: {
          type: 'string',
          enum: ['semilla_3_lives', 'challenge_7_dias', 'webinar_90min'],
          default: 'semilla_3_lives',
        },
        audiencia: { type: 'string', default: 'emprendedores LATAM' },
        fecha_inicio: { type: 'string' },
        generar_scripts: {
          type: 'boolean',
          description: 'Si true, incluye script de apertura de 5 min para cada sesión',
          default: false,
        },
      },
      required: ['producto'],
    },
  },
  {
    name: 'analizar_retencion',
    description:
      'Analiza un script existente: score de retención/venta/humanización, puntos de caída, ' +
      'y entrega TOP 5 mejoras con versiones reescritas en formato FakeLive.',
    inputSchema: {
      type: 'object',
      properties: {
        script: { type: 'string', description: 'Script completo en formato FakeLive o texto libre' },
        objetivo: {
          type: 'string',
          enum: ['venta', 'educacion', 'comunidad', 'lanzamiento'],
          default: 'venta',
        },
        duracion_minutos: { type: 'number', default: 45 },
      },
      required: ['script'],
    },
  },
  {
    name: 'generar_comentarios',
    description:
      'Genera un batch de comentarios de audiencia realistas y estratégicos en formato FakeLive.',
    inputSchema: {
      type: 'object',
      properties: {
        contexto: { type: 'string', description: 'Sobre qué trata el live o la sección' },
        cantidad: { type: 'number', default: 20, minimum: 5, maximum: 50 },
        fase: {
          type: 'string',
          enum: ['apertura', 'contenido', 'venta', 'cierre', 'mixto'],
          default: 'mixto',
        },
        pais: { type: 'string', default: 'Colombia' },
        incluir_objeciones: { type: 'boolean', default: true },
        producto: { type: 'string' },
      },
      required: ['contexto'],
    },
  },
  {
    name: 'optimizar_momento_venta',
    description:
      'Genera la secuencia de venta de 8 pasos completa en formato FakeLive: ' +
      'sueño, obstáculo, solución, componentes, valor, precio, urgencia y CTA.',
    inputSchema: {
      type: 'object',
      properties: {
        producto: { type: 'string' },
        precio: { type: 'string' },
        beneficios: { type: 'array', items: { type: 'string' } },
        bonos: { type: 'array', items: { type: 'string' } },
        garantia: { type: 'string' },
        urgencia: { type: 'string' },
        audiencia: { type: 'string', default: 'emprendedores LATAM' },
        timestamp_inicio: { type: 'string', default: '30:00' },
      },
      required: ['producto', 'precio'],
    },
  },
  {
    name: 'crear_arco_emocional',
    description:
      'Diseña el mapa emocional del live: qué siente la audiencia en cada momento, ' +
      'técnicas de engagement, guía de energía y frases de rescate.',
    inputSchema: {
      type: 'object',
      properties: {
        tema: { type: 'string' },
        duracion_minutos: { type: 'number', default: 45 },
        objetivo_emocional: { type: 'string', default: 'decisión confiada de compra' },
        nivel_energia_base: {
          type: 'string',
          enum: ['alto', 'medio', 'bajo_intimo'],
          default: 'medio',
        },
      },
      required: ['tema'],
    },
  },
  {
    name: 'manejar_objeciones',
    description:
      'Genera tabla completa de objeciones + scripts de respuesta en formato FakeLive. ' +
      'Cubre: precio, tiempo, desconfianza, "ya lo intenté", "lo pienso" + objeciones específicas.',
    inputSchema: {
      type: 'object',
      properties: {
        producto: { type: 'string' },
        precio: { type: 'string' },
        objeciones_especificas: { type: 'array', items: { type: 'string' } },
        garantia: { type: 'string' },
        resultado_principal: { type: 'string' },
      },
      required: ['producto'],
    },
  },
  {
    name: 'exportar_a_fakelive',
    description:
      'Prepara el script para cargarlo en FakeLive Pro y verifica que el servidor esté corriendo.',
    inputSchema: {
      type: 'object',
      properties: {
        script: { type: 'string', description: 'Script completo en formato FakeLive' },
        titulo: { type: 'string', default: 'Mi Live' },
        fakelive_url: { type: 'string', description: 'URL del servidor FakeLive local' },
      },
      required: ['script'],
    },
  },
  {
    name: 'estado_servidor',
    description: 'Verifica si FakeLive Pro está corriendo y qué servicios tiene disponibles.',
    inputSchema: {
      type: 'object',
      properties: {
        fakelive_url: { type: 'string' },
      },
    },
  },
];

// ─── Prompts del MCP ─────────────────────────────────────────────────────────
const PROMPTS = [
  {
    name: 'live_de_ventas',
    description: 'Template completo para un live de ventas de producto digital',
    arguments: [
      { name: 'producto', description: 'Nombre del producto', required: true },
      { name: 'precio', description: 'Precio de venta', required: true },
      { name: 'duracion', description: 'Duración en minutos', required: false },
    ],
  },
  {
    name: 'live_educativo',
    description: 'Template para live educativo de alta retención sin venta directa',
    arguments: [
      { name: 'tema', description: 'Tema del live', required: true },
      { name: 'audiencia', description: 'Audiencia objetivo', required: false },
    ],
  },
  {
    name: 'lanzamiento_7_dias',
    description: 'Plan completo de lanzamiento en live de 7 días',
    arguments: [
      { name: 'producto', description: 'Producto a lanzar', required: true },
      { name: 'precio', description: 'Precio del producto', required: true },
    ],
  },
];

// ─── Ejecutar herramientas ─────────────────────────────────────────────────
async function ejecutarHerramienta(name, args) {
  // Herramientas que construyen prompts para que el LLM los ejecute
  const constructores = {
    generar_guion_live: construirPromptGuion,
    crear_gancho: construirPromptGancho,
    crear_estructura_lanzamiento: construirPromptLanzamiento,
    analizar_retencion: construirPromptAnalisis,
    generar_comentarios: construirPromptComentarios,
    optimizar_momento_venta: construirPromptVenta,
    crear_arco_emocional: construirPromptArco,
    manejar_objeciones: construirPromptObjeciones,
  };

  if (constructores[name]) {
    const prompt = constructores[name](args);
    return {
      content: [{ type: 'text', text: prompt }],
    };
  }

  // Herramientas que interactúan con el servidor FakeLive
  if (name === 'estado_servidor') {
    const urlBase = args.fakelive_url || FAKELIVE_URL;
    const estado = await verificarFakelive(urlBase);
    if (!estado.online) {
      return {
        content: [{
          type: 'text',
          text: `❌ **FakeLive Pro OFFLINE** en \`${urlBase}\`\n\n` +
                `Para iniciarlo:\n\`\`\`\ncd /ruta/a/Teleprompter_live\nnpm start\n\`\`\``,
        }],
      };
    }
    return {
      content: [{
        type: 'text',
        text: `✅ **FakeLive Pro ONLINE** en \`${urlBase}\`\n\n` +
              `| Servicio | Estado |\n|---|---|\n` +
              `| Supabase | ${estado.supabase ? '✅ Conectado' : '❌ No configurado'} |\n` +
              `| Gemini AI | ${estado.gemini ? '✅ Disponible' : '⚠️ No configurado (usa DiceBear)'} |\n` +
              `| Sharp | ${estado.sharp ? '✅ Disponible' : '❌ No instalado'} |`,
      }],
    };
  }

  if (name === 'exportar_a_fakelive') {
    const urlBase = args.fakelive_url || FAKELIVE_URL;
    const estado = await verificarFakelive(urlBase);
    const { script = '', titulo = 'Mi Live' } = args;
    const lineas = script.split('\n').filter(l => l.trim());
    const maxTS = lineas
      .map(l => { const m = l.match(/^(\d+):(\d+)/); return m ? parseInt(m[1]) * 60 + parseInt(m[2]) : 0; })
      .reduce((a, b) => Math.max(a, b), 0);
    const dur = `${Math.floor(maxTS / 60)}:${String(maxTS % 60).padStart(2, '0')}`;

    if (!estado.online) {
      return {
        content: [{
          type: 'text',
          text: `⚠️ FakeLive Pro no está corriendo en \`${urlBase}\`\n\n` +
                `**Script listo** (${lineas.length} líneas, ~${dur} min). ` +
                `Inicia FakeLive con \`npm start\` y luego cópialo al editor.\n\n` +
                `\`\`\`\n${script}\n\`\`\``,
        }],
      };
    }
    return {
      content: [{
        type: 'text',
        text: `✅ **FakeLive Pro detectado** | Supabase: ${estado.supabase ? '✅' : '❌'} | Gemini: ${estado.gemini ? '✅' : '⚠️'}\n\n` +
              `**Script:** ${titulo} | ${lineas.length} líneas | ~${dur} min\n\n` +
              `**Cómo cargarlo:**\n` +
              `1. Abre \`${urlBase}\` en tu navegador\n` +
              `2. Copia el script de abajo y pégalo en el editor de FakeLive\n` +
              `3. Presiona **Cargar** — listo el teleprompter 🚀\n\n` +
              `\`\`\`\n${script}\n\`\`\``,
      }],
    };
  }

  throw new Error(`Herramienta desconocida: ${name}`);
}

// ─── Prompts handlers ──────────────────────────────────────────────────────
function getPromptContent(name, args = {}) {
  const prompts = {
    live_de_ventas: `${construirPromptGuion({
      tema: `Live de ventas de "${args.producto}"`,
      objetivo: 'venta',
      duracion_minutos: parseInt(args.duracion || '45'),
      producto: args.producto,
      precio: args.precio,
    })}`,
    live_educativo: `${construirPromptGuion({
      tema: args.tema || 'Tema a definir',
      objetivo: 'educacion',
      audiencia: args.audiencia || 'emprendedores LATAM',
    })}`,
    lanzamiento_7_dias: `${construirPromptLanzamiento({
      producto: args.producto,
      precio: args.precio,
      tipo: 'challenge_7_dias',
      generar_scripts: true,
    })}`,
  };

  const content = prompts[name];
  if (!content) throw new Error(`Prompt desconocido: ${name}`);

  return {
    messages: [{
      role: 'user',
      content: { type: 'text', text: content },
    }],
  };
}

// ─── Servidor MCP ──────────────────────────────────────────────────────────
const server = new Server(
  { name: 'fakelive-pro', version: '1.0.0' },
  { capabilities: { tools: {}, prompts: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools: TOOLS }));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  try {
    return await ejecutarHerramienta(name, args || {});
  } catch (err) {
    return {
      content: [{ type: 'text', text: `❌ Error en ${name}: ${err.message}` }],
      isError: true,
    };
  }
});

server.setRequestHandler(ListPromptsRequestSchema, async () => ({ prompts: PROMPTS }));

server.setRequestHandler(GetPromptRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  return getPromptContent(name, args || {});
});

// ─── Arranque ──────────────────────────────────────────────────────────────
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  process.stderr.write(
    `\n🎬 FakeLive Pro MCP v1.0.0 — Listo\n` +
    `   FakeLive URL : ${FAKELIVE_URL}\n` +
    `   API key extra: ❌ No requerida (usa el LLM conectado)\n` +
    `   Herramientas : ${TOOLS.length} disponibles\n\n`
  );
}

main().catch((err) => {
  process.stderr.write(`Error fatal: ${err.message}\n`);
  process.exit(1);
});
