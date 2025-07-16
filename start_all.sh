#!/bin/bash
echo "Starting full application stack..."
echo

echo "Starting backend servers..."
cd backend
chmod +x start_servers.sh
./start_servers.sh &
BACKEND_PID=$!
cd ..

echo "Waiting for backend to start..."
sleep 5

echo "Starting frontend..."
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo
echo "All servers are starting..."
echo
echo "Access points:"
echo "  - Frontend: http://localhost:3000"
echo "  - FastAPI: http://localhost:8000"
echo "  - Django Admin: http://localhost:8001/admin"
echo "  - API Docs: http://localhost:8000/docs"
echo
echo "Press Ctrl+C to stop all servers..."

# Function to cleanup on exit
cleanup() {
    echo "Stopping all servers..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    pkill -f "python" 2>/dev/null
    pkill -f "node" 2>/dev/null
    echo "All servers stopped."
    exit 0
}

# Trap Ctrl+C and cleanup
trap cleanup SIGINT
trap cleanup SIGTERM

# Wait for servers to finish
wait
