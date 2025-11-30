#!/usr/bin/env bash
set -euo pipefail
cd /home/ubuntu/studyflow || { echo "Diretório /home/ubuntu/studyflow não existe"; exit 1; }

# Lê DOCKER_IMAGE do .env, se definido
if [ -f .env ]; then
  export $(grep -E '^\s*DOCKER_IMAGE=' .env | sed 's/ *= */=/g')
fi

if [ -z "${DOCKER_IMAGE:-}" ]; then
  echo "Variável DOCKER_IMAGE não está definida. Defina DOCKER_IMAGE no .env ou no secret DOCKER_IMAGE."
else
  echo "Pulling image ${DOCKER_IMAGE}"
  docker pull "${DOCKER_IMAGE}" || echo "pull falhou (talvez a imagem não exista ainda)"
fi

echo "Subindo containers (docker compose up -d)"
docker compose -f docker-compose.prod.yml up -d --remove-orphans

echo "Executando migrations"
docker compose -f docker-compose.prod.yml exec -T web python manage.py migrate --noinput || echo "migrate falhou"

echo "Collectstatic"
docker compose -f docker-compose.prod.yml exec -T web python manage.py collectstatic --noinput || echo "collectstatic falhou"

echo "Deploy finalizado"