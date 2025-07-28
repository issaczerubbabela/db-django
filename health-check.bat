@echo off
echo 🔍 Checking system health...

echo 📦 Checking containers...
docker-compose ps

echo.
echo 🌐 Checking endpoints...

echo Checking main application...
curl -s -o nul -w "%%{http_code}" http://localhost | findstr "200 301 302" >nul
if %errorlevel% equ 0 (
    echo   ✅ Main application: Accessible
) else (
    echo   ❌ Main application: Not accessible
)

echo Checking Django admin...
curl -s -o nul -w "%%{http_code}" http://localhost:8000/admin/ | findstr "200 301 302" >nul
if %errorlevel% equ 0 (
    echo   ✅ Django admin: Accessible
) else (
    echo   ❌ Django admin: Not accessible
)

echo Checking FastAPI docs...
curl -s -o nul -w "%%{http_code}" http://localhost:8001/docs | findstr "200" >nul
if %errorlevel% equ 0 (
    echo   ✅ FastAPI: Accessible
) else (
    echo   ❌ FastAPI: Not accessible
)

echo.
echo 🗄️  Checking database...
docker-compose exec -T db pg_isready -U postgres >nul 2>&1
if %errorlevel% equ 0 (
    echo   ✅ PostgreSQL: Ready
) else (
    echo   ❌ PostgreSQL: Not ready
)

echo.
echo 📊 Health check complete!
echo 💡 Tip: Run 'docker-compose logs -f' to monitor live logs
pause
