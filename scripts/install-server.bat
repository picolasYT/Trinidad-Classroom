@echo off
setlocal
cd /d "%~dp0..\server"

set /p SERVER_PORT=Puerto del servidor [4000]: 
if "%SERVER_PORT%"=="" set "SERVER_PORT=4000"

set /p CLIENT_ORIGIN=Direccion del panel dashboard [http://localhost:5173]: 
if "%CLIENT_ORIGIN%"=="" set "CLIENT_ORIGIN=http://localhost:5173"

(
echo PORT=%SERVER_PORT%
echo JWT_SECRET=trinidad-classroom-secret
echo CLIENT_ORIGIN=%CLIENT_ORIGIN%
) > ".env"

echo server\.env generado automaticamente.
call npm install
if errorlevel 1 (
  echo Fallo la instalacion del servidor.
  endlocal
  pause
  exit /b 1
)

call npm run seed
if errorlevel 1 (
  echo Fallo la carga inicial de la base.
  endlocal
  pause
  exit /b 1
)

set /p AUTO_START=Quieres que el servidor se inicie automaticamente con Windows? [S/N]: 
if /I "%AUTO_START%"=="S" call "%~dp0register-server-startup.bat"

endlocal
pause
