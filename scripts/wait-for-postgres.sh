#!/bin/bash
# wait-for-postgres.sh

set -e

host="$1"
port="$2"
shift 2
cmd="$@"

# Max wait time in seconds
max_wait=60
waited=0

echo "Waiting for PostgreSQL at $host:$port to be ready..."

# 最初に20秒待機してコンテナが起動するのを待つ
sleep 5
echo "Initial wait completed, checking connection..."

until PGPASSWORD=postgres psql -h "$host" -p "$port" -U postgres -d postgres_api -c "SELECT 1" > /dev/null 2>&1; do
  waited=$((waited + 1))
  if [ "$waited" -gt "$max_wait" ]; then
    echo "Error: PostgreSQL did not become available within $max_wait seconds"
    echo "Checking container status:"
    docker ps -a | grep postgres
    echo "Checking container logs:"
    docker logs $(docker ps -q --filter name=postgres)
    exit 1
  fi
  echo "PostgreSQL is unavailable - sleeping (retry $waited/$max_wait)"
  sleep 2
done

echo "PostgreSQL is up - executing command"
exec $cmd
