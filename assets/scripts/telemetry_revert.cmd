@echo off
setlocal
set "SCRIPT_DIR=%~dp0"

:: Elevate if not admin
net session >nul 2>&1
if %errorlevel% NEQ 0 (
  echo Erfrage Administratorrechte...
  powershell -NoProfile -ExecutionPolicy Bypass -Command "Start-Process -FilePath 'cmd.exe' -Verb RunAs -ArgumentList '/c', '""%~f0"" %*'"
  exit /b
)

powershell -NoProfile -ExecutionPolicy Bypass -Command "Unblock-File -Path '%SCRIPT_DIR%telemetry_revert.ps1' 2>$null"
powershell -NoProfile -ExecutionPolicy Bypass -File "%SCRIPT_DIR%telemetry_revert.ps1" %*

echo.
pause
