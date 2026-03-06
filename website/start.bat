@echo off
title CyberNest inditasa

echo =====================================
echo CyberNest projekt inditasa
echo =====================================
echo.

cd /d %~dp0

REM XAMPP mappa helye
set XAMPP_PATH=C:\xampp

echo [1/6] Apache inditasa...
start "" /b "%XAMPP_PATH%\apache_start.bat"

echo [2/6] MySQL inditasa...
start "" /b "%XAMPP_PATH%\mysql_start.bat"

echo.
echo [3/6] Node verzio ellenorzese...
node -v
if %errorlevel% neq 0 (
    echo HIBA: A Node.js nincs telepitve!
    pause
    exit
)

echo.
echo [4/6] Csomagok telepitese...
call npm install

echo.
echo [5/6] Backend + Frontend inditasa...
start "CyberNest Server" cmd /k "npm run dev"

echo.
echo [6/6] Bongeszo megnyitasa...
timeout /t 3 >nul
start http://localhost:5173

echo.
echo Minden elinditva.
pause