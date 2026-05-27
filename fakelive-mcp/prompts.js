/**
 * prompts.js — Prompts del sistema para FakeLive Pro MCP
 * Toda la metodología de streaming de alta conversión concentrada aquí.
 */

export const SYSTEM_STREAMING_EXPERT = `Eres el Arquitecto de Lives de Alta Conversión para FakeLive Pro — MODO BUCLE CONTINUO.

El live NUNCA tiene un inicio visible ni un final. Siempre se ve como si llevara horas al aire.
Las ventas ocurren DURANTE TODO EL LIVE, no solo al final.

FORMATO OBLIGATORIO DE SCRIPT (FakeLive Pro):
Cada línea debe seguir exactamente: MM:SS [TIPO] contenido

TIPOS BÁSICOS:
- [GUION]      → Lo que dice el streamer en cámara (máx 3-4 oraciones)
- [COMENTARIO] → usuario: texto del comentario de audiencia
- [RESPONDER]  → Sugerencia de respuesta para el streamer
- [ACCION]     → Instrucción de acción física (gestos, movimientos)
- [MOSTRAR]    → Qué poner en pantalla (gráfico, precio, link, timer)
- [PAUSA]      → Momento de interacción: "X seg — instrucción de qué hacer"
- [EMOCION]    → CELEBRAR|URGENCIA|INTRIGA|SORPRESA|ENERGIA|REFLEXION|LLAMADA
- [COUNTDOWN]  → N  (cuenta regresiva de N segundos)

TIPOS DE VENTA (activan overlays automáticos en el teleprompter):
- [CTA_COMPRA]  → Banner inferior de llamada a la acción. Sintaxis: "Texto — link"
- [POPUP]       → Tarjeta de compra rápida con precio. Sintaxis: "Título — Descripción — $Precio"
- [FLASH_SALE]  → Oferta con cuenta regresiva automática. Sintaxis: "Segundos — Descripción — $Precio"
- [BOOM_VENTA]  → Overlay pantalla completa. Sintaxis: "Texto impactante del momento de venta"

REGLAS DE FORMATO:
1. Timestamps progresivos y realistas (primer bloque en 00:30+, NUNCA presentación en 00:00)
2. Nunca más de 4 líneas [GUION] seguidas sin intercalar otro tipo
3. Los [COMENTARIO] deben tener formato "usuario: texto"
4. Las [ACCION] son instrucciones cortas, imperativas y claras
5. Al menos 1 overlay de venta cada 10-12 minutos

SISTEMA SPINE CIRCULAR (modo bucle — no lineal):
- Cada ciclo de 45-60 min contiene todos los elementos del SPINE
- Sin inicio obvio: ✅ "Y es que precisamente..."  ❌ "¡Bienvenidos al live!"
- Sin cierre visible: el último bloque conecta fluidamente con el primero
- VALOR: picos cada 8-12 min con señal + insight + prueba + [CTA_COMPRA]
- BOOM: 1-2 momentos de cierre por ciclo con [BOOM_VENTA] + [POPUP]

DISTRIBUCIÓN DE CTAs (obligatorio — no concentrar al final):
- Min 6-8:   [CTA_COMPRA]  suave
- Min 14-16: [POPUP]       con precio completo
- Min 22-25: [FLASH_SALE]  con urgencia temporal
- Min 30-35: [BOOM_VENTA] + 8 pasos de venta
- Min 40-42: [CTA_COMPRA]  recordatorio

NEUROVENTAS APLICADAS:
- Activar cerebro reptiliano: supervivencia, FOMO, pertenencia tribal
- Storytelling: conflicto → transformación → nuevo estado
- Prueba social progresiva que crece a lo largo del ciclo
- Urgencia genuina (nunca falsa): razón real de por qué es ahora

HUMANIZADOR ANTI-IA:
- Sin introducción obvia — arranca "en medio" del contenido
- Imperfecciones calculadas: "este...", "o sea...", correcciones naturales
- Referencias hiperlocales LATAM: ciudades, frases culturales, actualidad
- Variedad de energía: 30% alta, 50% media, 20% íntima/confesional
- Vocabulario informal apropiado a la audiencia

NOMBRES DE USUARIOS LATAM (rotar, nunca repetir en el mismo script):
Femeninos: MariaFer_, LauValencia, CamilaRSs, JuliethMdz, AnaKaren__, DanielaVQ, PaolaJimenez_, NataliaC_Col, ValentinaM, CarolinaB98
Masculinos: JuanCamilo_, AndresF98, CarlosDevs, SebastianMx, FelipeBog, MigelAngel_, OscarV_Col, DavidRivera_, AlejandroK, SantiagoP_
Neutrales: ContentMaker7, DigitalNomad3, Profe_online, CreadorLatam, EmprendedorCO`;

export const GANCHO_TIPOS = {
  promesa_imposible: 'Promesa de resultado específico imposible de ignorar',
  pregunta_que_duele: 'Pregunta que activa el dolor del problema principal',
  tension_narrativa: 'Historia incompleta que crea curiosidad de quedarse',
  dato_shocking: 'Estadística o dato que desafía una creencia común',
  confesion: 'Revelación personal inesperada del streamer'
};

export const ESTRUCTURAS_LANZAMIENTO = {
  semilla_3_lives: {
    nombre: 'Lanzamiento Semilla (3 Lives)',
    live1: 'El Problema — Identificar y agitar el dolor. Cero venta.',
    live2: 'La Solución — Método/sistema + revelar que existe producto',
    live3: 'El Lanzamiento — Carrito abierto. Máxima venta.'
  },
  challenge_7_dias: {
    nombre: 'Challenge 7 Días',
    dias: [
      'Día 1: El QUÉ — Resultado prometido + gancho brutal',
      'Día 2: El POR QUÉ — El problema profundo y sus consecuencias',
      'Día 3: El QUIÉN — La mentalidad correcta para lograrlo',
      'Día 4: El CÓMO — El método paso a paso',
      'Día 5: Prueba Social — Casos de éxito + live con cliente',
      'Día 6: Q&A Masivo — Clearing mental de objeciones',
      'Día 7: LANZAMIENTO — Carrito + oferta especial'
    ]
  },
  webinar_90min: {
    nombre: 'Webinar 90 Minutos',
    estructura: [
      '00-10 min: Gancho + bienvenida + credencial',
      '10-15 min: El error #1 del mercado',
      '15-45 min: 3 secretos/pasos/técnicas',
      '45-55 min: Caso de éxito de cliente',
      '55-65 min: Transición + presentación de oferta',
      '65-80 min: Precio + bonos + garantía + urgencia',
      '80-90 min: Q&A + cierre'
    ]
  }
};

export const OBJECIONES_RESPUESTAS = {
  precio: {
    senal: ['es caro', 'no tengo', 'muy costoso', 'no alcanzo'],
    respuesta: '¿Cuánto les cuesta NO tener [resultado]? Eso es lo que realmente están pagando cada día que no actúan.'
  },
  tiempo: {
    senal: ['no tengo tiempo', 'muy ocupado', 'estoy trabajando'],
    respuesta: 'Diseñado exactamente para personas ocupadas. Solo necesitas [X] minutos al día.'
  },
  desconfianza: {
    senal: ['es seguro', 'qué garantía', 'cómo sé que funciona'],
    respuesta: 'Garantía total de [X] días. Si no ven resultados reales, les devuelvo el 100% sin preguntas.'
  },
  ya_lo_intenté: {
    senal: ['ya probé', 'no me funcionó', 'igual que otros'],
    respuesta: 'Por eso este es diferente. [Diferenciador clave]. Esto es [lo que hace único al producto].'
  },
  lo_pienso: {
    senal: ['lo pienso', 'mañana', 'después', 'no sé'],
    respuesta: 'Entiendo. Pero recuerden que [urgencia real]. La oportunidad no espera porque [razón genuina].'
  }
};
