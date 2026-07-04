#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKEND_DIR="$ROOT_DIR/backend"
FRONTEND_DIR="$ROOT_DIR/frontend"

if ! command -v docker >/dev/null 2>&1; then
  echo "docker is required but was not found"
  exit 1
fi

if ! docker compose version >/dev/null 2>&1; then
  echo "docker compose is required but was not found"
  exit 1
fi

if ! command -v npm >/dev/null 2>&1; then
  echo "npm is required but was not found"
  exit 1
fi

if [ ! -f "$BACKEND_DIR/.env" ]; then
  cp "$BACKEND_DIR/.env.example" "$BACKEND_DIR/.env"
  echo "created backend/.env from backend/.env.example"
  echo "set OPENROUTER_API_KEY in backend/.env before using real AI generation"
fi

cleanup() {
  if [ -n "${FRONTEND_PID:-}" ] && kill -0 "$FRONTEND_PID" >/dev/null 2>&1; then
    kill "$FRONTEND_PID" >/dev/null 2>&1 || true
  fi
}
trap cleanup EXIT INT TERM

echo "starting backend docker stack..."
(cd "$BACKEND_DIR" && docker compose up -d --build)

echo "waiting for backend health..."
for _ in $(seq 1 60); do
  if curl -fsS http://localhost:4000/health >/dev/null 2>&1; then
    break
  fi
  sleep 1
done

if ! curl -fsS http://localhost:4000/health >/dev/null 2>&1; then
  echo "backend did not become healthy at http://localhost:4000/health"
  echo "backend logs: cd backend && docker compose logs backend"
  exit 1
fi

if [ ! -d "$FRONTEND_DIR/node_modules" ]; then
  echo "installing frontend dependencies..."
  (cd "$FRONTEND_DIR" && npm install)
fi

if curl -fsS http://localhost:3000 >/dev/null 2>&1; then
  FRONTEND_PID=""
  FRONTEND_ALREADY_RUNNING=1
else
  FRONTEND_ALREADY_RUNNING=0
  echo "starting frontend dev server..."
  (cd "$FRONTEND_DIR" && BACKEND_URL="${BACKEND_URL:-http://localhost:4000}" npm run dev -- --hostname 0.0.0.0) &
  FRONTEND_PID=$!
fi

echo ""
echo "Feedstudio is running:"
echo "  frontend: http://localhost:3000"
echo "  backend:  http://localhost:4000"
echo "  docs:     http://localhost:4000/docs"
echo "  minio:    http://localhost:9001 (feedstudio / feedstudio-secret)"
echo ""
echo "Press Ctrl+C to stop the frontend dev server. Docker services stay running."
echo "Stop Docker services with: cd backend && docker compose down"

if [ "$FRONTEND_ALREADY_RUNNING" = "1" ]; then
  echo "frontend was already running on port 3000; leaving it untouched"
else
  wait "$FRONTEND_PID"
fi
