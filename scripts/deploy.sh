#!/bin/sh
set -eu
cd "$(dirname "$0")/.."
if [ "${1:-}" != staging ]; then
  echo "Only staging deployment is supported" >&2
  exit 2
fi
COMMIT="$(git rev-parse HEAD)"
IMAGE="test-project:$COMMIT"
CONTAINER=test-project-staging
docker image inspect "$IMAGE" >/dev/null
if [ -n "$(docker ps -aq --filter "name=^${CONTAINER}$")" ]; then
  docker rm -f "$CONTAINER" >/dev/null
fi
docker run -d --name "$CONTAINER" --restart unless-stopped   --label app=test-project --label environment=staging   -p 127.0.0.1:9003:8080 -e DEPLOY_ENV=staging -e "GIT_COMMIT=$COMMIT" "$IMAGE"
i=0
while [ "$i" -lt 45 ]; do
  STATUS="$(docker inspect --format '{{.State.Health.Status}}' "$CONTAINER")"
  if [ "$STATUS" = healthy ]; then
    docker exec "$CONTAINER" node scripts/smoke-test.js
    echo "Staging ready at http://localhost:9003 (commit $COMMIT)"
    exit 0
  fi
  if [ "$(docker inspect --format '{{.State.Running}}' "$CONTAINER")" != true ]; then
    break
  fi
  i=$((i + 1))
  sleep 2
done
docker logs --tail 80 "$CONTAINER" >&2
echo "Staging did not become healthy" >&2
exit 1
