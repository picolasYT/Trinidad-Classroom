@echo off
set "STARTUP=%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup"
set "TARGET=%~dp0start-agent.bat"
set "SHORTCUT=%STARTUP%\Trinidad Classroom Agent.url"

(
echo [InternetShortcut]
echo URL=file:///%TARGET:\=/%
echo IconIndex=0
echo IconFile=%SystemRoot%\System32\SHELL32.dll
) > "%SHORTCUT%"

echo Agente agregado al inicio de Windows.
pause
