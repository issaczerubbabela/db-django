@echo off
echo ==========================================
echo  Production Deployment Setup
echo ==========================================
echo.

REM Check if Docker is installed
docker --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker is not installed. Please install Docker first.
    pause
    exit /b 1
)

docker-compose --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker Compose is not installed. Please install Docker Compose first.
    pause
    exit /b 1
)

echo ✅ Docker and Docker Compose are installed

REM Check if .env file exists
if not exist .env (
    echo 📝 Creating .env file from template...
    copy .env.example .env
    echo ⚠️  Please edit .env file with your production values before running deploy.bat
    echo    Key values to change:
    echo    - SECRET_KEY
    echo    - DB_PASSWORD
    echo    - DOMAIN_NAME
    pause
    exit /b 1
)

echo ✅ Environment file found

REM Create necessary directories
echo 📁 Creating necessary directories...
if not exist logs mkdir logs
if not exist ssl mkdir ssl
if not exist backend\staticfiles mkdir backend\staticfiles
if not exist backend\media mkdir backend\media

echo 🔧 Setting up backend...
cd backend

REM Install production dependencies
pip install -r requirements-production.txt

REM Run migrations
echo 🗄️  Running database migrations...
python manage.py migrate --settings=automation_db.settings_production

REM Create superuser if needed
echo 👤 Creating superuser (skip if already exists)...
python manage.py createsuperuser --settings=automation_db.settings_production

REM Setup full-text search
echo 🔍 Setting up full-text search...
python manage.py setup_fts --settings=automation_db.settings_production

cd ..

echo 🚀 Setup complete! Next steps:
echo 1. Edit .env file with your production values
echo 2. Run: deploy.bat
echo 3. Your application will be available at http://localhost
pause
