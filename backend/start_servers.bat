@echo off
echo Starting Django and FastAPI servers...
echo.

echo Starting Django server on port 8000...
start "Django Server" ../.venv/Scripts/python.exe manage.py runserver

echo Starting FastAPI server on port 8001...
start "FastAPI Server" ../.venv/Scripts/python.exe fastapi_app.py

echo.
echo Both servers are starting...
echo Django: http://localhost:8000
echo FastAPI: http://localhost:8001
echo API Documentation: http://localhost:8001/docs
echo.
echo Press any key to stop all servers...
pause > nul

echo Stopping servers...
taskkill /F /IM python.exe /T > nul 2>&1
echo Servers stopped.
