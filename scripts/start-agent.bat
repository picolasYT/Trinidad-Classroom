@echo off
<<<<<<< HEAD
cd /d "%~dp0"
wscript.exe "%~dp0start-agent-hidden.vbs"
exit /b 0
=======
cd /d "%~dp0..\agent"
call npm start
>>>>>>> 39f41b15146c102a681405ff4b60321dc94c3eab
