# FakeLive Pro — Teleprompter para Lives

Simula lives profesionales con guión sincronizado, comentarios falsos de audiencia y cues de acción, todo en pantalla completa.

## Instalación en 3 pasos

**1. Instala las dependencias:**
```
npm install
```

**2. Inicia el servidor:**
```
node server.js
```

**3. Abre tu navegador en:**
```
http://localhost:3000
```

---

## Formato del guión

Cada línea sigue este formato exacto:
```
MM:SS [TIPO] contenido
```

| Tipo | Color | Uso |
|------|-------|-----|
| `[GUION]` | Blanco | Texto principal que leerás en cámara |
| `[COMENTARIO]` | Verde | Comentario de audiencia (formato: `Usuario: mensaje`) |
| `[RESPONDER]` | Verde claro | Hint de cómo responder al comentario anterior |
| `[ACCION]` | Amarillo | Acción física que debes realizar |
| `[MOSTRAR]` | Naranja | Contenido visual a mostrar en pantalla |
| `[PAUSA]` | Rojo | Pausa en el guión |

### Ejemplo:
```
00:00 [GUION] Bienvenidos a este live. Hoy hablaremos de dropshipping.
00:20 [COMENTARIO] Carlos_Medellin: ¿cuánto se puede ganar al mes?
00:23 [RESPONDER] Carlos, depende del producto y tu estrategia...
00:30 [ACCION] Mostrar pantalla con los números
00:45 [MOSTRAR] Mostrar imagen de resultados del mes
01:00 [PAUSA] Leer comentarios — 10 segundos
```

---

## Controles durante el live

| Tecla | Acción |
|-------|--------|
| `Espacio` | Pausar / Reanudar |
| `→` | Siguiente bloque |
| `←` | Bloque anterior |
| `Escape` | Salir al editor |

---

## Notas

- El guión se guarda automáticamente en el navegador (localStorage)
- Al abrir la app, el último guión se carga automáticamente
- Usa "Cargar Demo" para ver un guión de ejemplo completo (6 minutos sobre dropshipping)
