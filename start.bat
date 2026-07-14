@echo off
chcp 65001 >nul
cd /d "%~dp0"
if not exist node_modules (
  echo Устанавливаю зависимости...
  call npm install
)
echo.
echo ============================================
echo   HR AI Pro запускается...
echo   Откройте в браузере: http://localhost:3000
echo   Логин: demo@hraipro.io  /  demo1234
echo ============================================
echo.
node server.js
pause
