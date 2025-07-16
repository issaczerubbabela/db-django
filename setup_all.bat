@echo off
echo ========================================
echo  Automation Database Setup (Django + FastAPI + React)
echo ========================================
echo.

echo Step 1: Setting up Backend (Django + FastAPI)
echo.
cd backend
call setup.bat
cd ..

echo.
echo Step 2: Setting up Frontend (React + Next.js)
echo.
cd frontend
echo Installing frontend dependencies...
npm install
cd ..

echo.
echo ========================================
echo  Setup Complete!
echo ========================================
echo.
echo To start the application:
echo   1. Backend: cd backend && start_servers.bat
echo   2. Frontend: cd frontend && npm run dev
echo.
echo Or use the quick start script:
echo   start_all.bat
echo.
echo Access points:
echo   - Frontend: http://localhost:3000
echo   - FastAPI: http://localhost:8000
echo   - Django Admin: http://localhost:8001/admin
echo   - API Docs: http://localhost:8000/docs
echo.
pause
