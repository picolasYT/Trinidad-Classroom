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
call npm run seed
endlocal
pause
