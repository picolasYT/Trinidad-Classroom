@echo off
setlocal
cd /d "%~dp0..\agent"

set /p SERVER_IP=IP del servidor local [localhost]: 
if "%SERVER_IP%"=="" set "SERVER_IP=localhost"

set /p SERVER_PORT=Puerto del servidor [4000]: 
if "%SERVER_PORT%"=="" set "SERVER_PORT=4000"

set /p COMPUTER_ID=ID fijo de esta computadora [PC-001]: 
if "%COMPUTER_ID%"=="" set "COMPUTER_ID=PC-001"

(
echo SERVER_URL=http://%SERVER_IP%:%SERVER_PORT%
echo COMPUTER_ID=%COMPUTER_ID%
) > ".env"

echo agent\.env generado automaticamente.
call npm install
endlocal
pause
