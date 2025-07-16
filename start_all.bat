@echo off
echo Starting full application stack...
echo.

echo Starting backend servers...
start "Backend Servers" cmd /k "cd backend && start_servers.bat"

echo Waiting for backend to start...
timeout /t 5 /nobreak > nul

echo Starting frontend...
start "Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo All servers are starting...
echo.
echo Access points:
echo   - Frontend: http://localhost:3000
echo   - FastAPI: http://localhost:8000
echo   - Django Admin: http://localhost:8001/admin
echo   - API Docs: http://localhost:8000/docs
echo.
echo Press any key to continue...
pause > nul
