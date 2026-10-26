#!/bin/sh
set -eu
cd "$(dirname "$0")/.."
COMMIT="$(git rev-parse HEAD)"
docker build --progress=plain --target runtime --build-arg "GIT_COMMIT=$COMMIT" -t "test-project:$COMMIT" .
echo "Built test-project:$COMMIT"
