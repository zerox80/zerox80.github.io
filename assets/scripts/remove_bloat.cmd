@echo off
setlocal
set "SCRIPT_DIR=%~dp0"

rem Detect flags to decide if admin is required (mirrors PS logic)
set "APPLY=0"
set "CURRONLY=0"
set "PROVONLY=0"
for /f "delims=" %%A in ('cmd /c echo %*') do set "ARGS=%%~A"
echo %ARGS% | findstr /I /C:"-Apply" >nul && set "APPLY=1"
echo %ARGS% | findstr /I /C:"-CurrentUserOnly" >nul && set "CURRONLY=1"
echo %ARGS% | findstr /I /C:"-ProvisionedOnly" >nul && set "PROVONLY=1"

set "NEED_ADMIN=0"
if "%APPLY%"=="1" (
  if "%CURRONLY%"=="1" (
    if "%PROVONLY%"=="1" (
      set "NEED_ADMIN=1"
    ) else (
      set "NEED_ADMIN=0"
    )
  ) else (
    set "NEED_ADMIN=1"
  )
)

if "%NEED_ADMIN%"=="1" (
  net session >nul 2>&1
  if %errorlevel% NEQ 0 (
    echo Erfrage Administratorrechte...
    powershell -NoProfile -ExecutionPolicy Bypass -Command "Start-Process -FilePath 'cmd.exe' -Verb RunAs -ArgumentList '/c', '""%~f0"" %*'"
    exit /b
  )
)

powershell -NoProfile -ExecutionPolicy Bypass -Command "Unblock-File -Path '%SCRIPT_DIR%remove_bloat.ps1' 2>$null"
powershell -NoProfile -ExecutionPolicy Bypass -File "%SCRIPT_DIR%remove_bloat.ps1" %*

echo.
pause

