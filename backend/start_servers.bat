@echo off
echo Starting Django and FastAPI servers...
echo.

echo Starting Django server on port 8001...
start "Django Server" python manage.py runserver 8001

echo Starting FastAPI server on port 8000...
start "FastAPI Server" python fastapi_app.py

echo.
echo Both servers are starting...
echo Django: http://localhost:8001
echo FastAPI: http://localhost:8000
echo API Documentation: http://localhost:8000/docs
echo.
echo Press any key to stop all servers...
pause > nul

echo Stopping servers...
taskkill /F /IM python.exe /T > nul 2>&1
echo Servers stopped.
