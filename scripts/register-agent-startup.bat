@echo off
<<<<<<< HEAD
setlocal
=======
>>>>>>> 39f41b15146c102a681405ff4b60321dc94c3eab
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
<<<<<<< HEAD
endlocal
exit /b 0
=======
pause
>>>>>>> 39f41b15146c102a681405ff4b60321dc94c3eab
