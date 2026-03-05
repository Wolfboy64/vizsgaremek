@echo off
title CyberNest indito

echo =====================================
echo CyberNest projekt inditasa
echo =====================================
echo.

cd /d %~dp0

echo [1/4] Node verzio ellenorzese...
node -v
if %errorlevel% neq 0 (
    echo HIBA: A Node.js nincs telepitve!
    pause
    exit
)

echo.
echo [2/4] Csomagok telepitese...
call npm install

echo.
echo [3/4] Backend + Frontend inditasa...
start "CyberNest Server" cmd /k "npm run dev"

echo.
echo [4/4] Bongeszo megnyitasa...
timeout /t 1 >nul
start http://localhost:5173

echo.
echo Minden elinditva.
pause