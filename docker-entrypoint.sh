#!/bin/sh
set -e

echo "=== Starting Vibe Backend Server ==="
echo "PORT: ${PORT:-8080}"
echo "ENV: ${ENV:-production}"
echo "DATABASE_URL: [configured]"
echo "REDIS_URL: [configured]"
echo "====================================="

exec /server "$@"
