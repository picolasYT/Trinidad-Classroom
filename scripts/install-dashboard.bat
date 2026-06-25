@echo off
setlocal
cd /d "%~dp0..\dashboard"

set /p SERVER_IP=IP del servidor local [localhost]: 
if "%SERVER_IP%"=="" set "SERVER_IP=localhost"

set /p SERVER_PORT=Puerto del servidor [4000]: 
if "%SERVER_PORT%"=="" set "SERVER_PORT=4000"

(
echo VITE_API_URL=http://%SERVER_IP%:%SERVER_PORT%
) > ".env"

echo dashboard\.env generado automaticamente.
call npm install
if errorlevel 1 (
  echo Fallo la instalacion del dashboard.
  endlocal
  pause
  exit /b 1
)
endlocal
pause
