#!/bin/bash

# Event Planner Application Startup Script

echo "Starting Event Planner Application..."

# Kill any existing processes on ports 3000 and 5000
echo "Cleaning up existing processes..."
lsof -ti:5000 | xargs -r kill -9 2>/dev/null
lsof -ti:3000 | xargs -r kill -9 2>/dev/null

# Check if required files exist
if [ ! -f "backend/Pipfile" ]; then
    echo "Error: Backend Pipfile not found!"
    exit 1
fi

if [ ! -f "frontend/package.json" ]; then
    echo "Error: Frontend package.json not found!"
    exit 1
fi

# Start backend
echo "Starting backend server..."
cd backend
pipenv run python run.py &
BACKEND_PID=$!

# Wait a moment for backend to start
echo "Waiting for backend to initialize..."
sleep 5

# Check if backend is running
if ! curl -s http://localhost:5000/auth/login > /dev/null 2>&1; then
    echo "Warning: Backend may not be responding yet..."
fi

# Start frontend
echo "Starting frontend development server..."
cd ../frontend
npm run dev &
FRONTEND_PID=$!

echo "Application started!"
echo "Backend running on: http://localhost:5000"
echo "Frontend running on: http://localhost:3000"
echo ""
echo "Testing backend connection..."
if curl -s http://localhost:5000/auth/login > /dev/null 2>&1; then
    echo "✅ Backend is responding"
else
    echo "⚠️  Backend may not be ready yet"
fi
echo ""
echo "🚀 Access your application at: http://localhost:3000"
echo "📖 API documentation available at: http://localhost:5000"
echo "Press Ctrl+C to stop both servers"

# Function to cleanup on exit
cleanup() {
    echo "Stopping servers..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    lsof -ti:5000 | xargs -r kill -9 2>/dev/null
    lsof -ti:3000 | xargs -r kill -9 2>/dev/null
    exit
}

# Set trap to cleanup on script exit
trap cleanup SIGINT SIGTERM

# Wait for user to press Ctrl+C
wait
