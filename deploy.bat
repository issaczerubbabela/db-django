@echo off
echo ==========================================
echo  Deploying Automation Database to Production
echo ==========================================
echo.

REM Check if .env exists
if not exist .env (
    echo ❌ .env file not found. Please run setup-production.bat first.
    pause
    exit /b 1
)

echo 🛑 Stopping existing containers...
docker-compose down

echo 🧹 Cleaning up old images...
docker system prune -f

echo 🏗️  Building containers...
docker-compose build --no-cache

echo 🚀 Starting services...
docker-compose up -d

echo ⏳ Waiting for services to start...
timeout /t 30 /nobreak >nul

echo 🗄️  Running database migrations...
docker-compose exec backend python manage.py migrate --settings=automation_db.settings_production

echo 📊 Collecting static files...
docker-compose exec backend python manage.py collectstatic --noinput --settings=automation_db.settings_production

echo 🔍 Setting up full-text search...
docker-compose exec backend python manage.py setup_fts --settings=automation_db.settings_production

echo ✅ Deployment complete!
echo.
echo 🌐 Access points:
echo    - Application: http://localhost
echo    - Django Admin: http://localhost/admin/
echo    - API Documentation: http://localhost/fastapi/docs
echo.
echo 📊 Monitor with:
echo    docker-compose logs -f
echo.
echo 🛑 Stop with:
echo    docker-compose down
pause
