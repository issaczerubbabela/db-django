#!/bin/bash
echo "Starting Django and FastAPI servers..."
echo

echo "Starting Django server on port 8001..."
python manage.py runserver 8001 &
DJANGO_PID=$!

echo "Starting FastAPI server on port 8000..."
python fastapi_app.py &
FASTAPI_PID=$!

echo
echo "Both servers are running..."
echo "Django: http://localhost:8001"
echo "FastAPI: http://localhost:8000"
echo "API Documentation: http://localhost:8000/docs"
echo
echo "Press Ctrl+C to stop all servers..."

# Function to cleanup on exit
cleanup() {
    echo "Stopping servers..."
    kill $DJANGO_PID $FASTAPI_PID 2>/dev/null
    echo "Servers stopped."
    exit 0
}

# Trap Ctrl+C and cleanup
trap cleanup SIGINT
trap cleanup SIGTERM

# Wait for servers to finish
wait
