#!/usr/bin/env bash
set -euo pipefail

BFF_URL="${BFF_URL:-http://localhost:3000}"
EMAIL="${EMAIL:-tester@cxi-system.com}"
PASSWORD="${PASSWORD:-ntw8ngd8TGK9wjt@twu}"
COMPANY_CODE="${COMPANY_CODE:-dev}"
COOKIE_JAR="${COOKIE_JAR:-/tmp/bff.cookies}"

echo "[1/4] login"
curl -sS -i -c "$COOKIE_JAR" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"${EMAIL}\",\"password\":\"${PASSWORD}\",\"companyCode\":\"${COMPANY_CODE}\"}" \
  "${BFF_URL}/auth/login" | sed -n '1,10p'

echo "[2/4] me"
curl -sS -i -b "$COOKIE_JAR" \
  "${BFF_URL}/auth/me" | sed -n '1,10p'

echo "[3/4] graphql"
curl -sS -i -b "$COOKIE_JAR" \
  -H "Content-Type: application/json" \
  -d '{"query":"{ __typename }"}' \
  "${BFF_URL}/graphql" | sed -n '1,10p'

echo "[4/4] jwks"
curl -sS -i "${BFF_URL}/.well-known/jwks.json" | sed -n '1,10p'
