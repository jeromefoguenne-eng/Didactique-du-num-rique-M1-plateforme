@echo off
title Didactique du Numerique M1 - Auto-Sync & Dev
cd /d "%~dp0"
echo =====================================================================
echo    PLATEFORME DIDACTIQUE DU NUMERIQUE M1 - HECh / FWB
echo =====================================================================
echo.
echo [1/3] Synchronisation avec GitHub (git pull)...
git -c http.sslVerify=false pull origin main
echo.
echo [2/3] Verification des dependances node_modules...
if not exist node_modules (
    echo [INFO] Premier lancement detecte. Installation des dependances npm...
    npm install --no-audit --no-fund
)
echo.
echo [3/3] Lancement du serveur VitePress et ouverture du navigateur...
start http://localhost:5173
npm run docs:dev
pause
