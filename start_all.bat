@echo off
echo Starting full application stack...
echo.

echo Checking and setting up virtual environment...
if not exist ".venv" (
    echo Creating virtual environment...
    python -m venv .venv
    echo Virtual environment created.
) else (
    echo Virtual environment already exists.
)

echo Activating virtual environment...
call .venv\Scripts\activate.bat

echo Installing/updating backend dependencies...
cd backend
pip install -r requirements.txt
cd ..
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
echo   - Django: http://localhost:8000
echo   - FastAPI: http://localhost:8001
echo   - Django Admin: http://localhost:8000/admin
echo   - API Docs: http://localhost:8001/docs
echo.
echo Press any key to continue...
pause > nul
