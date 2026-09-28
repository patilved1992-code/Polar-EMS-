#!/usr/bin/env bash
# POLAR-EMS Linux/macOS Launcher

echo "==================================================="
echo "    POLAR-EMS: Smart Polar Energy Management"
echo "==================================================="
echo ""

# Get script directory
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"

# Start Backend
echo "Starting Backend API (FastAPI) on port 8000..."
cd "$DIR/backend"
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
    ./venv/bin/pip install -r requirements.txt
fi
./venv/bin/python3 -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload &
BACKEND_PID=$!

# Start Frontend
echo "Starting Frontend UI (Vite) on port 5173..."
cd "$DIR/frontend"
if [ ! -d "node_modules" ]; then
    echo "Installing frontend dependencies..."
    npm install
fi
npm run dev &
FRONTEND_PID=$!

echo ""
echo "==================================================="
echo "Both services are running!"
echo "Frontend: http://127.0.0.1:5173"
echo "Backend API Docs: http://127.0.0.1:8000/docs"
echo "Press Ctrl+C to terminate both servers."
echo "==================================================="

trap "kill $BACKEND_PID $FRONTEND_PID; exit" INT TERM
wait
