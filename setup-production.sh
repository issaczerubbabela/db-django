#!/bin/bash

echo "=========================================="
echo " Production Deployment Setup"
echo "=========================================="
echo

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

echo "✅ Docker and Docker Compose are installed"

# Check if .env file exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp .env.example .env
    echo "⚠️  Please edit .env file with your production values before running deploy.sh"
    echo "   Key values to change:"
    echo "   - SECRET_KEY"
    echo "   - DB_PASSWORD"
    echo "   - DOMAIN_NAME"
    exit 1
fi

echo "✅ Environment file found"

# Create necessary directories
echo "📁 Creating necessary directories..."
mkdir -p logs
mkdir -p ssl
mkdir -p backend/staticfiles
mkdir -p backend/media

echo "🔧 Setting up backend..."
cd backend

# Install production dependencies
pip install -r requirements-production.txt

# Run migrations
echo "🗄️  Running database migrations..."
python manage.py migrate --settings=automation_db.settings_production

# Create superuser if needed
echo "👤 Creating superuser (skip if already exists)..."
python manage.py createsuperuser --settings=automation_db.settings_production || true

# Setup full-text search
echo "🔍 Setting up full-text search..."
python manage.py setup_fts --settings=automation_db.settings_production

cd ..

echo "🚀 Setup complete! Next steps:"
echo "1. Edit .env file with your production values"
echo "2. Run: ./deploy.sh"
echo "3. Your application will be available at http://localhost"
