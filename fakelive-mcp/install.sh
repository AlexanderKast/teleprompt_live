#!/bin/bash
# FakeLive Pro — Instalador MCP + Skill (Mac / Linux)

set -e

CYAN='\033[0;36m'
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo ""
echo -e "${CYAN}========================================${NC}"
echo -e "${CYAN}  FakeLive Pro — Instalador MCP + Skill ${NC}"
echo -e "${CYAN}========================================${NC}"
echo ""

# ── Verificar Node.js ──────────────────────────────────────────────
if ! command -v node &> /dev/null; then
    echo -e "${RED}[ERROR]${NC} Node.js no está instalado."
    echo "  Instálalo en: https://nodejs.org"
    exit 1
fi
NODE_VER=$(node --version)
echo -e "${GREEN}[OK]${NC} Node.js $NODE_VER detectado"

# ── Instalar dependencias npm ──────────────────────────────────────
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
echo ""
echo "Instalando dependencias..."
cd "$SCRIPT_DIR"
npm install --silent
echo -e "${GREEN}[OK]${NC} Dependencias instaladas"

# ── Ruta absoluta del servidor MCP ─────────────────────────────────
MCP_PATH="$SCRIPT_DIR/index.js"

# ── Localizar claude_desktop_config.json ───────────────────────────
if [[ "$OSTYPE" == "darwin"* ]]; then
    CONFIG_DIR="$HOME/Library/Application Support/Claude"
else
    CONFIG_DIR="$HOME/.config/Claude"
fi
CONFIG_FILE="$CONFIG_DIR/claude_desktop_config.json"

# ── Instalar Skill en Claude Code ──────────────────────────────────
echo ""
echo "Instalando skill en Claude Code..."
SKILL_DIR="$HOME/.claude/skills/fakelive-streaming-master"
mkdir -p "$SKILL_DIR"

if [ -f "$SCRIPT_DIR/SKILL.md" ]; then
    cp "$SCRIPT_DIR/SKILL.md" "$SKILL_DIR/SKILL.md"
    echo -e "${GREEN}[OK]${NC} Skill instalado en $SKILL_DIR"
else
    echo -e "${YELLOW}[AVISO]${NC} SKILL.md no encontrado — skill no instalado"
fi

# ── Configurar Claude Desktop ──────────────────────────────────────
echo ""
if [ ! -d "$CONFIG_DIR" ]; then
    echo -e "${YELLOW}[AVISO]${NC} Claude Desktop no encontrado en $CONFIG_DIR"
    echo "  Instálalo en: https://claude.ai/download"
    goto_manual=1
else
    # Verificar si ya está instalado
    if [ -f "$CONFIG_FILE" ] && grep -q "fakelive-pro" "$CONFIG_FILE" 2>/dev/null; then
        echo -e "${GREEN}[OK]${NC} FakeLive Pro MCP ya estaba configurado."
        goto_manual=0
    else
        # Backup
        [ -f "$CONFIG_FILE" ] && cp "$CONFIG_FILE" "$CONFIG_FILE.backup" && \
            echo -e "${GREEN}[OK]${NC} Backup guardado: claude_desktop_config.json.backup"

        # Crear config si no existe
        if [ ! -f "$CONFIG_FILE" ]; then
            mkdir -p "$CONFIG_DIR"
            echo '{"mcpServers":{}}' > "$CONFIG_FILE"
        fi

        echo "Configurando MCP en Claude Desktop..."

        # Usar Python (disponible en Mac/Linux por defecto) para editar el JSON
        python3 - "$CONFIG_FILE" "$MCP_PATH" << 'PYEOF'
import json, sys

config_path = sys.argv[1]
mcp_path = sys.argv[2]

with open(config_path, 'r', encoding='utf-8') as f:
    config = json.load(f)

if 'mcpServers' not in config:
    config['mcpServers'] = {}

config['mcpServers']['fakelive-pro'] = {
    'command': 'node',
    'args': [mcp_path],
    'env': {'FAKELIVE_URL': 'http://localhost:3000'}
}

with open(config_path, 'w', encoding='utf-8') as f:
    json.dump(config, f, indent=2, ensure_ascii=False)

print('[OK] MCP agregado correctamente')
PYEOF

        if [ $? -eq 0 ]; then
            goto_manual=0
        else
            goto_manual=1
        fi
    fi
fi

# ── Resultado ──────────────────────────────────────────────────────
echo ""
echo -e "${CYAN}========================================${NC}"
if [ "${goto_manual:-0}" -eq 0 ]; then
    echo -e "${GREEN}  Instalación completada ✓${NC}"
    echo -e "${CYAN}========================================${NC}"
    echo ""
    echo "  MCP:   Configurado en Claude Desktop"
    echo "  Skill: Instalado en Claude Code"
    echo ""
    echo -e "${YELLOW}  PASO FINAL:${NC} Cierra y vuelve a abrir Claude Desktop"
    echo "  Las 10 herramientas de FakeLive Pro estarán listas."
else
    echo -e "${YELLOW}  Configuración manual requerida${NC}"
    echo -e "${CYAN}========================================${NC}"
    echo ""
    echo "  Edita: $CONFIG_FILE"
    echo ""
    echo '  Agrega dentro de "mcpServers":'
    echo "    \"fakelive-pro\": {"
    echo "      \"command\": \"node\","
    echo "      \"args\": [\"$MCP_PATH\"],"
    echo "      \"env\": { \"FAKELIVE_URL\": \"http://localhost:3000\" }"
    echo "    }"
fi
echo ""
