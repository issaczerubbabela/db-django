#!/bin/bash

echo "🔍 Checking system health..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if containers are running
echo "📦 Checking containers..."
CONTAINERS=$(docker-compose ps --services --filter "status=running")
EXPECTED_SERVICES=("db" "backend" "fastapi" "frontend" "nginx")

for service in "${EXPECTED_SERVICES[@]}"; do
    if echo "$CONTAINERS" | grep -q "$service"; then
        echo -e "  ✅ $service: ${GREEN}Running${NC}"
    else
        echo -e "  ❌ $service: ${RED}Not running${NC}"
    fi
done

# Check service endpoints
echo -e "\n🌐 Checking endpoints..."

# Check nginx (main proxy)
if curl -s -o /dev/null -w "%{http_code}" http://localhost | grep -q "200\|301\|302"; then
    echo -e "  ✅ Nginx proxy: ${GREEN}Accessible${NC}"
else
    echo -e "  ❌ Nginx proxy: ${RED}Not accessible${NC}"
fi

# Check backend
if curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/admin/ | grep -q "200\|301\|302"; then
    echo -e "  ✅ Django backend: ${GREEN}Accessible${NC}"
else
    echo -e "  ❌ Django backend: ${RED}Not accessible${NC}"
fi

# Check FastAPI
if curl -s -o /dev/null -w "%{http_code}" http://localhost:8001/docs | grep -q "200"; then
    echo -e "  ✅ FastAPI: ${GREEN}Accessible${NC}"
else
    echo -e "  ❌ FastAPI: ${RED}Not accessible${NC}"
fi

# Check frontend
if curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 | grep -q "200"; then
    echo -e "  ✅ Frontend: ${GREEN}Accessible${NC}"
else
    echo -e "  ❌ Frontend: ${RED}Not accessible${NC}"
fi

# Check database
echo -e "\n🗄️  Checking database..."
DB_STATUS=$(docker-compose exec -T db pg_isready -U postgres 2>/dev/null)
if echo "$DB_STATUS" | grep -q "accepting connections"; then
    echo -e "  ✅ PostgreSQL: ${GREEN}Ready${NC}"
else
    echo -e "  ❌ PostgreSQL: ${RED}Not ready${NC}"
fi

# Check disk space
echo -e "\n💾 Checking disk space..."
DISK_USAGE=$(df -h . | awk 'NR==2{print $5}' | sed 's/%//')
if [ "$DISK_USAGE" -lt 80 ]; then
    echo -e "  ✅ Disk space: ${GREEN}${DISK_USAGE}% used${NC}"
elif [ "$DISK_USAGE" -lt 90 ]; then
    echo -e "  ⚠️  Disk space: ${YELLOW}${DISK_USAGE}% used${NC}"
else
    echo -e "  ❌ Disk space: ${RED}${DISK_USAGE}% used (Critical)${NC}"
fi

# Check memory usage
echo -e "\n🧠 Checking memory usage..."
if command -v free &> /dev/null; then
    MEM_USAGE=$(free | grep Mem | awk '{printf "%.0f", $3/$2 * 100.0}')
    if [ "$MEM_USAGE" -lt 80 ]; then
        echo -e "  ✅ Memory: ${GREEN}${MEM_USAGE}% used${NC}"
    elif [ "$MEM_USAGE" -lt 90 ]; then
        echo -e "  ⚠️  Memory: ${YELLOW}${MEM_USAGE}% used${NC}"
    else
        echo -e "  ❌ Memory: ${RED}${MEM_USAGE}% used (High)${NC}"
    fi
fi

echo -e "\n📊 Health check complete!"
echo -e "💡 Tip: Run 'docker-compose logs -f' to monitor live logs"
