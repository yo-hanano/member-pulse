#!/usr/bin/env bash
set -euo pipefail

VAULT_ADDR=${VAULT_ADDR:-http://vault:8200}
VAULT_TOKEN=${VAULT_TOKEN:-root}
VAULT_TRANSIT_KEY=${VAULT_TRANSIT_KEY:-jwt-rsa}
PROFILE_ENV_FILE=${PROFILE_ENV_FILE:-/workspace/profiles/local.env}

if [ -f "${PROFILE_ENV_FILE}" ]; then
  echo "Loading local profile env from ${PROFILE_ENV_FILE}..."
  set -a
  # shellcheck disable=SC1090
  . "${PROFILE_ENV_FILE}"
  set +a
fi

FRONTEND_PORT=${FRONTEND_PORT:-5173}
BFF_PORT=${BFF_PORT:-3000}
QUARKUS_HTTP_PORT=${QUARKUS_HTTP_PORT:-8080}
VITE_BFF_BASE_URL=${VITE_BFF_BASE_URL:-http://localhost:${BFF_PORT}}
MP_JWT_VERIFY_PUBLICKEY_LOCATION=${MP_JWT_VERIFY_PUBLICKEY_LOCATION:-${VITE_BFF_BASE_URL}/.well-known/jwks.json}
APP_FRONTEND_BASE_URL=${APP_FRONTEND_BASE_URL:-http://localhost:${FRONTEND_PORT}}
BACKEND_GRAPHQL_URL=${BACKEND_GRAPHQL_URL:-http://localhost:${QUARKUS_HTTP_PORT}/graphql}
BACKEND_BASE_URL=${BACKEND_BASE_URL:-http://localhost:${QUARKUS_HTTP_PORT}}
POSTGRES_HOST=${POSTGRES_HOST:-postgres}
POSTGRES_PORT=${POSTGRES_PORT:-5432}
POSTGRES_USER=${POSTGRES_USER:-postgres}
POSTGRES_PASSWORD=${POSTGRES_PASSWORD:-postgres}
APP_DATABASE_NAME=${APP_DATABASE_NAME:-member_pulse_dev}

if command -v psql >/dev/null 2>&1; then
  echo "Waiting for PostgreSQL at ${POSTGRES_HOST}:${POSTGRES_PORT}..."
  for i in $(seq 1 30); do
    if PGPASSWORD="${POSTGRES_PASSWORD}" psql -h "${POSTGRES_HOST}" -p "${POSTGRES_PORT}" -U "${POSTGRES_USER}" -d postgres -c "select 1" >/dev/null 2>&1; then
      break
    fi
    if [ "${i}" -eq 30 ]; then
      echo "PostgreSQL did not become ready within timeout" >&2
      exit 1
    fi
    sleep 1
  done

  if PGPASSWORD="${POSTGRES_PASSWORD}" psql -h "${POSTGRES_HOST}" -p "${POSTGRES_PORT}" -U "${POSTGRES_USER}" -d postgres -tAc "select 1 from pg_database where datname = '${APP_DATABASE_NAME}'" | grep -q 1; then
    echo "Database '${APP_DATABASE_NAME}' already exists"
  else
    echo "Creating database '${APP_DATABASE_NAME}'..."
    PGPASSWORD="${POSTGRES_PASSWORD}" createdb -h "${POSTGRES_HOST}" -p "${POSTGRES_PORT}" -U "${POSTGRES_USER}" "${APP_DATABASE_NAME}"
  fi
fi

if ! command -v vault >/dev/null 2>&1; then
  exit 0
fi

echo "Waiting for Vault at ${VAULT_ADDR}..."
for i in $(seq 1 30); do
  if VAULT_ADDR="${VAULT_ADDR}" vault status >/dev/null 2>&1; then
    break
  fi
  if [ "${i}" -eq 30 ]; then
    echo "Vault did not become ready within timeout" >&2
    exit 1
  fi
  sleep 1
done

echo "Configuring Vault transit engine..."
if VAULT_ADDR="${VAULT_ADDR}" VAULT_TOKEN="${VAULT_TOKEN}" vault secrets list -format=json | grep -q '"transit/"'; then
  echo "transit secrets engine already enabled"
else
  VAULT_ADDR="${VAULT_ADDR}" VAULT_TOKEN="${VAULT_TOKEN}" vault secrets enable transit
fi

if VAULT_ADDR="${VAULT_ADDR}" VAULT_TOKEN="${VAULT_TOKEN}" vault read -format=json "transit/keys/${VAULT_TRANSIT_KEY}" >/dev/null 2>&1; then
  echo "transit key '${VAULT_TRANSIT_KEY}' already exists"
else
  VAULT_ADDR="${VAULT_ADDR}" VAULT_TOKEN="${VAULT_TOKEN}" vault write -f "transit/keys/${VAULT_TRANSIT_KEY}" type=rsa-2048
fi

echo "Seeding KV secrets for local development..."
VAULT_ADDR="${VAULT_ADDR}" VAULT_TOKEN="${VAULT_TOKEN}" vault kv put secret/api \
  quarkus.datasource.username="company_user" \
  quarkus.datasource.password="company_user" \
  quarkus.datasource.jdbc.url="jdbc:postgresql://${POSTGRES_HOST}:${POSTGRES_PORT}/${APP_DATABASE_NAME}" \
  quarkus.redis.hosts="redis://redis:6379" \
  mp.jwt.verify.publickey.location="${MP_JWT_VERIFY_PUBLICKEY_LOCATION}"

VAULT_ADDR="${VAULT_ADDR}" VAULT_TOKEN="${VAULT_TOKEN}" vault kv put secret/edge \
  SESSION_SECRET="f3b2779e38c6f9fa1290cfbf845d2e57d4a9d1059515fa902dd2728cebf680ab" \
  BACKEND_GRAPHQL_URL="${BACKEND_GRAPHQL_URL}" \
  BACKEND_BASE_URL="${BACKEND_BASE_URL}" \
  DATABASE_URL="postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${POSTGRES_HOST}:${POSTGRES_PORT}/${APP_DATABASE_NAME}" \
  REDIS_URL="redis://redis:6379" \
  COOKIE_SECURE="false" \
  SESSION_COOKIE_NAME="__bff_session" \
  SESSION_TTL_SECONDS="604800" \
  CORS_ORIGIN="${APP_FRONTEND_BASE_URL}" \
  JWT_ISSUER="cxi-system.com" \
  VAULT_TRANSIT_KEY="${VAULT_TRANSIT_KEY}" \
  BFF_PORT="${BFF_PORT}" \
  NODE_ENV="development"
