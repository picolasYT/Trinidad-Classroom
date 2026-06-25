@echo off
setlocal
title Trinidad Classroom - Instalacion
color 0B
set "ROOT_DIR=%~dp0"

call :check_requirements || goto end
call :prepare_all_dependencies || goto end

:menu
cls
echo ============================================================
echo                TRINIDAD CLASSROOM - MENU
echo ============================================================
echo.
echo Este asistente instala o inicia componentes segun el tipo de PC.
echo El servidor puede correr en una computadora vieja del colegio.
echo No hace falta pagar hosting.
echo.
echo 1. Instalar PC de alumno
echo 2. Instalar PC de profesor o directivo
echo 3. Instalar PC servidor local del aula
echo 4. Iniciar agente de alumno
echo 5. Iniciar panel de profesor
echo 6. Iniciar servidor local
echo 7. Registrar agente al inicio de Windows
echo 8. Ver ayuda rapida
echo 9. Reinstalar dependencias de todos los modulos
echo 0. Salir
echo.
set /p option=Selecciona una opcion: 

if "%option%"=="1" goto install_student
if "%option%"=="2" goto install_teacher
if "%option%"=="3" goto install_server
if "%option%"=="4" goto start_student
if "%option%"=="5" goto start_teacher
if "%option%"=="6" goto start_server
if "%option%"=="7" goto startup_agent
if "%option%"=="8" goto help
if "%option%"=="9" goto reinstall_all
if "%option%"=="0" goto end

echo.
echo Opcion invalida.
pause
goto menu

:install_student
cls
echo ============================================================
echo INSTALACION DE PC DE ALUMNO
echo ============================================================
echo.
echo Esta opcion instala el agente que usa el alumno.
echo El instalador te va a pedir:
echo - IP del servidor local
echo - puerto del servidor
echo - ID fijo de esta computadora
echo.
call "%~dp0scripts\install-agent.bat"
goto menu

:install_teacher
cls
echo ============================================================
echo INSTALACION DE PC DE PROFESOR O DIRECTIVO
echo ============================================================
echo.
echo Esta opcion instala el panel dashboard.
echo El instalador te va a pedir la IP del servidor local.
echo Luego podras abrirlo y administrar el aula.
echo.
call "%~dp0scripts\install-dashboard.bat"
goto menu

:install_server
cls
echo ============================================================
echo INSTALACION DE PC SERVIDOR LOCAL
echo ============================================================
echo.
echo Esta opcion instala el backend y crea la base inicial.
echo Puede usarse una computadora vieja del colegio.
echo Recomendacion:
echo - dejar esta PC conectada a la misma red del aula
echo - usar IP fija si es posible
echo.
call "%~dp0scripts\install-server.bat"
goto menu

:start_student
cls
echo Iniciando agente de alumno...
call "%~dp0scripts\start-agent.bat"
goto menu

:start_teacher
cls
echo Iniciando panel de profesor/directivo...
call "%~dp0scripts\start-dashboard.bat"
goto menu

:start_server
cls
echo Iniciando servidor local...
call "%~dp0scripts\start-server.bat"
goto menu

:startup_agent
cls
echo Registrando agente al inicio de Windows...
call "%~dp0scripts\register-agent-startup.bat"
goto menu

:reinstall_all
cls
echo ============================================================
echo REINSTALACION COMPLETA DE DEPENDENCIAS
echo ============================================================
echo.
call :install_module_dependencies "server" "Servidor local" force || goto menu
call :install_module_dependencies "dashboard" "Panel dashboard" force || goto menu
call :install_module_dependencies "agent" "Agente de alumno" force || goto menu
echo.
echo Todas las dependencias fueron reinstaladas.
pause
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
echo 3. Instalar el panel en la PC del profesor con la opcion 2.
echo 4. Instalar el agente en cada PC de alumno con la opcion 1.
echo 5. El instalador del agente pregunta IP del servidor e ID de la PC.
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
  echo ERROR: Node.js no esta instalado en esta computadora.
  echo Instala una version LTS de Node.js que incluya npm y vuelve a ejecutar este archivo.
  echo Descarga sugerida: https://nodejs.org/
  pause
  exit /b 1
)

where npm >nul 2>nul
if errorlevel 1 (
  echo.
  echo ERROR: npm no esta disponible en esta computadora.
  echo Reinstala Node.js con npm incluido y vuelve a intentar.
  pause
  exit /b 1
)

exit /b 0

:prepare_all_dependencies
cls
echo ============================================================
echo PREPARACION INICIAL DEL SISTEMA
echo ============================================================
echo.
echo Revisando dependencias de server, dashboard y agent...
echo.
call :install_module_dependencies "server" "Servidor local" || exit /b 1
call :install_module_dependencies "dashboard" "Panel dashboard" || exit /b 1
call :install_module_dependencies "agent" "Agente de alumno" || exit /b 1
echo.
echo Dependencias verificadas correctamente.
timeout /t 1 >nul
exit /b 0

:install_module_dependencies
set "MODULE_DIR=%~1"
set "MODULE_NAME=%~2"
set "FORCE_INSTALL=%~3"

if /I "%FORCE_INSTALL%"=="force" goto do_install
if exist "%ROOT_DIR%%MODULE_DIR%\node_modules" (
  echo [%MODULE_NAME%] Dependencias ya instaladas.
  exit /b 0
)

:do_install
echo [%MODULE_NAME%] Instalando dependencias...
pushd "%ROOT_DIR%%MODULE_DIR%"
call npm install
if errorlevel 1 (
  popd
  echo.
  echo ERROR: Fallo la instalacion de dependencias para %MODULE_NAME%.
  pause
  exit /b 1
)
popd
echo [%MODULE_NAME%] OK
exit /b 0

:end
endlocal
exit /b 0
