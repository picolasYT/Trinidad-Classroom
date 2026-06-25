@echo off
setlocal
set "STARTUP=%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup"
set "TARGET=%~dp0start-server-hidden.vbs"
set "SHORTCUT=%STARTUP%\Trinidad Classroom Server.url"

(
echo [InternetShortcut]
echo URL=file:///%TARGET:\=/%
echo IconIndex=0
echo IconFile=%SystemRoot%\System32\SHELL32.dll
) > "%SHORTCUT%"

echo Servidor agregado al inicio de Windows.
endlocal
exit /b 0
