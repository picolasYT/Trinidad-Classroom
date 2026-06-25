@echo off
setlocal
title Trinidad Classroom - Instalacion
color 0B
set "ROOT_DIR=%~dp0"

call :check_requirements || goto end

:menu
cls
echo ============================================================
echo                TRINIDAD CLASSROOM - MENU
echo ============================================================
echo.
echo Elige el tipo de computadora que quieres preparar.
echo El servidor puede correr en una PC vieja del colegio.
echo No hace falta pagar hosting.
echo.
echo 1. Profesor - instalar panel dashboard
echo 2. Alumno - instalar agente e inicio automatico
echo 3. Servidor - instalar servidor local del aula
echo 4. Help - informacion de instalacion
echo 0. Salir
echo.
set /p option=Selecciona una opcion: 

if "%option%"=="1" goto install_teacher
if "%option%"=="2" goto install_student
if "%option%"=="3" goto install_server
if "%option%"=="4" goto help
if "%option%"=="0" goto end

echo.
echo Opcion invalida.
pause
goto menu

:install_teacher
cls
echo ============================================================
echo INSTALACION DE PC DE PROFESOR O DIRECTIVO
echo ============================================================
echo.
echo Esta opcion instala el panel dashboard del profesor.
echo El instalador te va a pedir la IP del servidor local.
echo.
call "%ROOT_DIR%scripts\install-dashboard.bat"
goto menu

:install_student
cls
echo ============================================================
echo INSTALACION DE PC DE ALUMNO
echo ============================================================
echo.
echo Esta opcion instala el agente del alumno.
echo Tambien lo registra para que arranque solo con Windows.
echo El instalador te va a pedir:
echo - IP del servidor local
echo - puerto del servidor
echo - ID fijo de esta computadora
echo.
call "%ROOT_DIR%scripts\install-agent.bat"
goto menu

:install_server
cls
echo ============================================================
echo INSTALACION DE PC SERVIDOR LOCAL
echo ============================================================
echo.
echo Esta opcion instala el backend y crea la base inicial.
echo Puede usarse una computadora vieja del colegio.
echo Puede registrarse para arrancar solo con Windows.
echo Recomendacion:
echo - dejar esta PC conectada a la misma red del aula
echo - usar IP fija si es posible
echo.
call "%ROOT_DIR%scripts\install-server.bat"
goto menu

:help
cls
echo ============================================================
echo AYUDA RAPIDA
echo ============================================================
echo.
echo Flujo recomendado para un aula:
echo.
echo 1. Elegir una computadora vieja como servidor local.
echo 2. Instalar ahi la opcion 3.
echo 3. Instalar el panel en la PC del profesor con la opcion 1.
echo 4. Instalar el agente en cada PC de alumno con la opcion 2.
echo 5. El instalador del agente pregunta IP del servidor e ID de la PC.
echo 6. El agente queda configurado para iniciar solo con Windows.
echo.
echo Login inicial del panel:
echo - usuario: admin
echo - clave: trinidad@2026
echo.
echo Importante:
echo - el servidor no necesita hosting externo
echo - funciona en la red local del colegio
echo - luego conviene cambiar la clave admin
echo.
pause
goto menu

:check_requirements
where node >nul 2>nul
if errorlevel 1 (
  echo.
  echo Node.js no esta instalado en esta computadora.
  set /p INSTALL_NODE=Quieres instalar Node.js LTS automaticamente con winget? [S/N]: 
  if /I not "%INSTALL_NODE%"=="S" exit /b 1
  call :install_nodejs
  exit /b 1
)

where npm >nul 2>nul
if errorlevel 1 (
  echo.
  echo npm no esta disponible en esta computadora.
  echo Reinstala Node.js con npm incluido y vuelve a intentar.
  pause
  exit /b 1
)

exit /b 0

:install_nodejs
where winget >nul 2>nul
if errorlevel 1 (
  echo.
  echo No se encontro winget en esta computadora.
  echo Instala Node.js LTS manualmente desde https://nodejs.org/
  pause
  exit /b 1
)

echo.
echo Instalando Node.js LTS. Puede tardar unos minutos...
winget install OpenJS.NodeJS.LTS --accept-package-agreements --accept-source-agreements
if errorlevel 1 (
  echo.
  echo Fallo la instalacion automatica de Node.js.
  echo Intenta instalarlo manualmente desde https://nodejs.org/
  pause
  exit /b 1
)

echo.
echo Node.js fue instalado. Cierra y vuelve a abrir este instalador.
pause
exit /b 0

:end
endlocal
exit /b 0
