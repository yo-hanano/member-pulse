#!/usr/bin/env bash
set -euo pipefail

cd /workspace

CODEX_TEMPLATE="/workspace/.devcontainer/codex-config.toml.template"
CODEX_CONFIG_DIR="/workspace/.codex"
CODEX_CONFIG_FILE="${CODEX_CONFIG_DIR}/config.toml"
if [ -f "${CODEX_TEMPLATE}" ] && [ ! -e "${CODEX_CONFIG_FILE}" ] && [ ! -f "${CODEX_CONFIG_DIR}" ]; then
  mkdir -p "${CODEX_CONFIG_DIR}"
  cp "${CODEX_TEMPLATE}" "${CODEX_CONFIG_FILE}"
fi

if ! command -v mise >/dev/null 2>&1; then
  echo "mise not found during postCreate" >&2
  exit 1
fi

export PATH="${HOME}/.local/share/mise/shims:${HOME}/.local/bin:${PATH}"
export MISE_RUBY_GITHUB_ATTESTATIONS="${MISE_RUBY_GITHUB_ATTESTATIONS:-false}"

# GitHub API レート制限を避けるため、利用可能ならトークンを mise/aqua に引き渡す
if [ -n "${GH_TOKEN:-}" ] && [ -z "${GITHUB_TOKEN:-}" ]; then
  export GITHUB_TOKEN="${GH_TOKEN}"
fi
if [ -n "${GITHUB_TOKEN:-}" ] && [ -z "${GH_TOKEN:-}" ]; then
  export GH_TOKEN="${GITHUB_TOKEN}"
fi

if [ -f "/workspace/mise.toml" ]; then
  if grep -qE '^[[:space:]]*python[[:space:]]*=' /workspace/mise.toml; then
    mise install python
  fi
  if grep -qE '^[[:space:]]*node[[:space:]]*=' /workspace/mise.toml; then
    mise install node
  fi
  if ! mise install; then
    cat >&2 <<'EOF'
mise install failed during postCreate.
The container will remain usable, but some CLI tools may be missing.

Typical cause:
- GitHub API rate limiting on unauthenticated requests

Suggested recovery:
- Rebuild/reopen after exporting GH_TOKEN or GITHUB_TOKEN to the devcontainer
- Or rerun `mise install` later after GitHub authentication is available
EOF
  fi
fi

if command -v corepack >/dev/null 2>&1; then
  corepack enable
fi

CHROME_CACHE_DIR="/workspace/.cache/puppeteer"
CHROME_LINK_DIR="${CHROME_CACHE_DIR}/chrome"
CHROME_LINK_PATH="${CHROME_LINK_DIR}/chrome"
LATEST_CHROME_BIN="$(find "${CHROME_LINK_DIR}" -type f -path '*/chrome-linux64/chrome' 2>/dev/null | sort -V | tail -n 1 || true)"
if [ -z "${LATEST_CHROME_BIN}" ] && command -v npx >/dev/null 2>&1; then
  npx -y @puppeteer/browsers install chrome@stable --path "${CHROME_CACHE_DIR}"
  LATEST_CHROME_BIN="$(find "${CHROME_LINK_DIR}" -type f -path '*/chrome-linux64/chrome' 2>/dev/null | sort -V | tail -n 1 || true)"
fi
if [ -n "${LATEST_CHROME_BIN}" ]; then
  mkdir -p "${CHROME_LINK_DIR}"
  ln -sfn "${LATEST_CHROME_BIN}" "${CHROME_LINK_PATH}"
elif command -v chromium >/dev/null 2>&1; then
  mkdir -p "${CHROME_LINK_DIR}"
  ln -sfn "$(command -v chromium)" "${CHROME_LINK_PATH}"
fi
