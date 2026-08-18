#!/bin/bash
# health-check.sh — Cek status semua service

set -e

BASE_URL="${BASE_URL:-http://localhost}"

echo "=== CMND Analytics Health Check ==="
echo ""

check() {
  local name=$1
  local url=$2
  if curl -sf "$url" > /dev/null 2>&1; then
    echo "  ✅  $name — OK ($url)"
  else
    echo "  ❌  $name — FAIL ($url)"
  fi
}

check "Backend API"    "${BASE_URL}:5000/health"
check "Frontend"       "${BASE_URL}:3000"
check "Adminer (DB)"   "${BASE_URL}:8080"
check "Redis Commander" "${BASE_URL}:8081"

echo ""
echo "Docker containers:"
docker-compose ps 2>/dev/null || echo "  (docker-compose not available)"
