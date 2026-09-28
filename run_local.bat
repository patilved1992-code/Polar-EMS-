@echo off
title POLAR-EMS Launcher
echo ===================================================
echo     POLAR-EMS: Smart Polar Energy Management
echo ===================================================
echo.
echo Starting Backend API (FastAPI) on port 8000...
start "POLAR-EMS Backend (FastAPI)" cmd /k "cd /d %~dp0backend && .\venv\Scripts\python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload"

echo Starting Frontend UI (Vite) on port 5173...
start "POLAR-EMS Frontend (Vite)" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo ===================================================
echo Both services are launching!
echo Frontend: http://127.0.0.1:5173
echo Backend API Docs: http://127.0.0.1:8000/docs
echo ===================================================
timeout /t 3 >nul
start http://127.0.0.1:5173
