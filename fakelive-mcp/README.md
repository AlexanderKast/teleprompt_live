# 🎬 FakeLive Pro — MCP Server

Conecta **Claude** (y cualquier LLM compatible con MCP) directamente con **FakeLive Pro** para generar guiones de streaming de alta conversión con IA.

## ¿Qué hace?

Este servidor MCP expone **10 herramientas de IA** para crear lives profesionales:

| Herramienta | Para qué sirve |
|------------|----------------|
| `generar_guion_live` | Script completo en formato FakeLive (MM:SS [TIPO]) |
| `crear_gancho` | 3 variantes de apertura de máximo impacto |
| `crear_estructura_lanzamiento` | Plan de 3 lives, 7 días o webinar 90 min |
| `analizar_retencion` | Diagnostica tu script y sugiere mejoras |
| `generar_comentarios` | Batch de comentarios realistas de audiencia |
| `optimizar_momento_venta` | Secuencia de 8 pasos para cerrar en live |
| `crear_arco_emocional` | Mapa emocional del live minuto a minuto |
| `manejar_objeciones` | Tabla de objeciones + scripts de respuesta |
| `exportar_a_fakelive` | Envía el script al teleprompter local |
| `estado_servidor` | Verifica si FakeLive Pro está corriendo |

---

## Instalación rápida

### Requisitos
- Node.js 18+
- **Sin API key extra** — usa el LLM que ya tienes conectado (Claude, GPT-4, Gemini, etc.)
- FakeLive Pro corriendo en local (opcional, solo para exportar scripts)

### Paso 1: Instalar dependencias

```bash
cd fakelive-mcp
npm install
```

### Paso 2: Configurar en Claude Desktop

Edita el archivo de configuración de Claude Desktop:

**macOS/Linux:** `~/.claude/claude_desktop_config.json`  
**Windows:** `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "fakelive-pro": {
      "command": "node",
      "args": ["/RUTA/ABSOLUTA/A/fakelive-mcp/index.js"],
      "env": {
        "FAKELIVE_URL": "http://localhost:3000"
      }
    }
  }
}
```

> ⚠️ Reemplaza `/RUTA/ABSOLUTA/A/fakelive-mcp/index.js` con la ruta real en tu sistema.  
> ✅ No se necesita `ANTHROPIC_API_KEY` — el MCP usa el LLM que ya tienes conectado.

**Ejemplo Windows:**
```json
"args": ["C:\\Users\\TuUsuario\\Documents\\GitHub\\Teleprompter_live\\fakelive-mcp\\index.js"]
```

**Ejemplo Mac/Linux:**
```json
"args": ["/Users/tu-usuario/Teleprompter_live/fakelive-mcp/index.js"]
```

### Paso 3: Reiniciar Claude Desktop

Cierra y vuelve a abrir Claude Desktop. Las herramientas de FakeLive Pro aparecerán disponibles.

---

## Configurar en Claude Code (CLI)

En tu proyecto, edita `.claude/settings.json`:

```json
{
  "mcpServers": {
    "fakelive-pro": {
      "command": "node",
      "args": ["./fakelive-mcp/index.js"],
      "env": {
        "ANTHROPIC_API_KEY": "sk-ant-tu-api-key-aqui",
        "FAKELIVE_URL": "http://localhost:3000"
      }
    }
  }
}
```

---

## Variables de entorno

| Variable | Requerida | Descripción | Default |
|----------|-----------|-------------|---------|
| `FAKELIVE_URL` | No | URL del servidor FakeLive local | `http://localhost:3000` |

> **Sin API key de IA.** El MCP construye prompts optimizados y los devuelve al LLM host para que los ejecute. Una sola llamada, cero doble costo.

---

## Uso con otros LLMs

Este MCP sigue el estándar del protocolo MCP y es compatible con:

### OpenAI / GPT-4 (via MCP Bridge)
```bash
# Usar con openai-mcp-bridge
npx openai-mcp-bridge --server "node ./fakelive-mcp/index.js"
```

### Gemini (Google AI Studio)
Compatible via adaptador MCP estándar.

### Cursor, Windsurf, Zed
Agregar en la configuración de MCP servers del editor.

---

## Ejemplos de uso

Una vez conectado a Claude Desktop, puedes decirle:

```
"Genera un guión de live de 45 minutos para vender mi curso de email marketing 
a $197 USD para emprendedores colombianos"
```

```
"Crea 3 variantes de gancho para un live sobre cómo conseguir 
clientes en LinkedIn sin pagar publicidad"
```

```
"Analiza este script y dime qué partes van a perder la atención 
de la audiencia: [pegar script]"
```

```
"Diseña el plan de lanzamiento de 7 días para mi programa de 
mentoría de $997"
```

```
"Genera 30 comentarios de audiencia para la fase de venta de 
mi live de fitness"
```

---

## Estructura del proyecto

```
fakelive-mcp/
├── index.js        ← Servidor MCP principal (todas las herramientas)
├── prompts.js      ← Sistema de prompts y metodología de streaming
├── package.json    ← Dependencias
└── README.md       ← Esta guía
```

---

## Metodología incluida

El skill de IA integrado combina:

- **Sistema SPINE de retención**: Curva científica de retención para streaming
- **Neuroventas** (Jürgen Klarić): Cerebro reptiliano, FOMO, prueba social
- **8 Pasos de venta en live**: Del sueño al CTA con urgencia real
- **Estructuras de lanzamiento**: Semilla 3 lives, Challenge 7 días, Webinar 90 min  
- **Humanizador anti-IA**: Scripts que suenan naturales, no generados
- **Psicología LATAM**: Localización para Colombia, México, Venezuela, Argentina y más
- **Copywriting avanzado**: AIDA, PAS, StoryBrand adaptado a tiempo real

---

## Contribuir

Si agregas nuevas herramientas, el formato de respuesta siempre debe ser:
```js
return {
  content: [{ type: 'text', text: '...' }]
};
```

---

## Soporte

- **FakeLive Pro:** [Repositorio principal](https://github.com/AlexanderKast/Teleprompter_live)
- **Protocolo MCP:** [modelcontextprotocol.io](https://modelcontextprotocol.io)
- **Claude API:** [docs.anthropic.com](https://docs.anthropic.com)

---

*Desarrollado para FakeLive Pro — Teleprompter inteligente para lives de alta conversión*
