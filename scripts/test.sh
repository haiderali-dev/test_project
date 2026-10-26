#!/bin/sh
set -eu
cd "$(dirname "$0")/.."
case "${1:-}" in
  backend) TARGET=backend-tests ;;
  frontend) TARGET=frontend-tests ;;
  *) echo "Usage: sh scripts/test.sh backend|frontend" >&2; exit 2 ;;
esac
docker build --progress=plain --target "$TARGET" .
