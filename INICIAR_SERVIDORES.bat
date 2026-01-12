@echo off
title PHD Class Manager - Iniciando Servidores
echo.
echo ============================================
echo   PHD CLASS MANAGER
echo   Iniciando Backend e Frontend...
echo ============================================
echo.

REM Inicia o Backend em uma nova janela do PowerShell
start "PHD Backend - Porta 3000" cmd /k "cd backend && npm start"

REM Aguarda 3 segundos para o backend iniciar
timeout /t 3 /nobreak >nul

REM Inicia o Frontend em uma nova janela do PowerShell
start "PHD Frontend - Porta 5173" cmd /k "cd frontend && npm run dev"

echo.
echo ============================================
echo   Servidores iniciados!
echo.
echo   Backend:  http://localhost:3000
echo   Frontend: http://localhost:5173
echo.
echo   Aguarde as janelas abrirem...
echo ============================================
echo.
timeout /t 5 /nobreak
exit
