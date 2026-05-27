@echo off
chcp 65001 >nul
echo.
echo  ========================================
echo   FakeLive Pro — Instalador MCP + Skill
echo  ========================================
echo.

:: ── Verificar Node.js ──────────────────────────────────────────────
node --version >nul 2>&1
if errorlevel 1 (
    echo  [ERROR] Node.js no esta instalado.
    echo  Descargalo en: https://nodejs.org
    pause
    exit /b 1
)
for /f "tokens=*" %%i in ('node --version') do set NODE_VER=%%i
echo  [OK] Node.js %NODE_VER% detectado

:: ── Instalar dependencias npm ───────────────────────────────────────
echo.
echo  Instalando dependencias...
cd /d "%~dp0"
call npm install --silent
if errorlevel 1 (
    echo  [ERROR] Fallo npm install. Revisa tu conexion a internet.
    pause
    exit /b 1
)
echo  [OK] Dependencias instaladas

:: ── Ruta absoluta del servidor MCP ─────────────────────────────────
set MCP_PATH=%~dp0index.js
set MCP_PATH=%MCP_PATH:\=\\%

:: ── Localizar claude_desktop_config.json ───────────────────────────
set CONFIG_FILE=%APPDATA%\Claude\claude_desktop_config.json

if not exist "%APPDATA%\Claude\" (
    echo.
    echo  [AVISO] No se encontro Claude Desktop en %APPDATA%\Claude\
    echo  Asegurate de tener Claude Desktop instalado:
    echo  https://claude.ai/download
    echo.
    goto INSTRUCCIONES_MANUALES
)

:: ── Verificar si ya tiene el MCP instalado ──────────────────────────
if exist "%CONFIG_FILE%" (
    findstr /i "fakelive-pro" "%CONFIG_FILE%" >nul 2>&1
    if not errorlevel 1 (
        echo.
        echo  [OK] FakeLive Pro MCP ya estaba instalado.
        goto INSTALAR_SKILL
    )
)

:: ── Hacer backup del config actual ─────────────────────────────────
if exist "%CONFIG_FILE%" (
    copy "%CONFIG_FILE%" "%CONFIG_FILE%.backup" >nul
    echo  [OK] Backup guardado en claude_desktop_config.json.backup
)

:: ── Usar PowerShell para editar el JSON correctamente ──────────────
echo.
echo  Configurando MCP en Claude Desktop...

powershell -NoProfile -ExecutionPolicy Bypass -Command ^
    "$configPath = '%CONFIG_FILE%'; ^
     $mcpPath = '%MCP_PATH%'; ^
     if (Test-Path $configPath) { ^
         $json = Get-Content $configPath -Raw | ConvertFrom-Json; ^
     } else { ^
         $json = [PSCustomObject]@{ mcpServers = [PSCustomObject]@{} }; ^
     } ^
     if (-not $json.mcpServers) { ^
         $json | Add-Member -NotePropertyName mcpServers -NotePropertyValue ([PSCustomObject]@{}); ^
     } ^
     $nuevoMcp = [PSCustomObject]@{ ^
         command = 'node'; ^
         args = @($mcpPath); ^
         env = [PSCustomObject]@{ FAKELIVE_URL = 'http://localhost:3000' } ^
     }; ^
     $json.mcpServers | Add-Member -NotePropertyName 'fakelive-pro' -NotePropertyValue $nuevoMcp -Force; ^
     $json | ConvertTo-Json -Depth 10 | Set-Content $configPath -Encoding UTF8; ^
     Write-Host '[OK] MCP agregado correctamente'"

if errorlevel 1 (
    echo  [ERROR] No se pudo editar automaticamente el config.
    goto INSTRUCCIONES_MANUALES
)

:: ── Instalar Skill en Claude Code ──────────────────────────────────
:INSTALAR_SKILL
echo.
echo  Instalando skill en Claude Code...

set SKILL_DIR=%USERPROFILE%\.claude\skills\fakelive-streaming-master
if not exist "%SKILL_DIR%" mkdir "%SKILL_DIR%"

set SKILL_SRC=%~dp0..\fakelive-mcp-skill\SKILL.md
set SKILL_BUNDLED=%~dp0SKILL.md

:: Copiar el skill si existe en el paquete
if exist "%SKILL_BUNDLED%" (
    copy "%SKILL_BUNDLED%" "%SKILL_DIR%\SKILL.md" >nul
    echo  [OK] Skill instalado en %SKILL_DIR%
) else (
    echo  [AVISO] Archivo SKILL.md no encontrado en el paquete.
    echo          El skill se puede instalar manualmente mas tarde.
)

:: ── Resumen final ───────────────────────────────────────────────────
echo.
echo  ========================================
echo   Instalacion completada
echo  ========================================
echo.
echo   MCP:   Configurado en Claude Desktop
echo   Skill: Instalado en Claude Code
echo.
echo   PASO FINAL: Cierra y vuelve a abrir Claude Desktop
echo   Las 10 herramientas de FakeLive Pro estaran disponibles.
echo.
echo   Para usar:
echo   "Genera un guion de live de 45 min para vender mi curso de
echo    email marketing a $197 para emprendedores colombianos"
echo.
pause
exit /b 0

:: ── Instrucciones manuales ──────────────────────────────────────────
:INSTRUCCIONES_MANUALES
echo.
echo  ========================================
echo   Configuracion manual
echo  ========================================
echo.
echo  Edita este archivo:
echo  %APPDATA%\Claude\claude_desktop_config.json
echo.
echo  Agrega esto dentro de "mcpServers":
echo.
echo    "fakelive-pro": {
echo      "command": "node",
echo      "args": ["%MCP_PATH%"],
echo      "env": { "FAKELIVE_URL": "http://localhost:3000" }
echo    }
echo.
pause
exit /b 0
