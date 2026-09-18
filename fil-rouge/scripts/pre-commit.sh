#!/bin/sh
# Hook pre-commit : scan de secrets et lint sur les fichiers indexés. Installé par npm run hooks:install.
set -e
echo "[pre-commit] scan de secrets (gitleaks)"
if command -v gitleaks >/dev/null 2>&1; then
  gitleaks protect --staged --redact --no-banner
else
  echo "  gitleaks non installé : https://github.com/gitleaks/gitleaks#installing (bloquant en CI)"
fi
FICHIERS=$(git diff --cached --name-only --diff-filter=ACM | grep -E '^frontend/.*\.(ts|tsx)$' || true)
if [ -n "$FICHIERS" ]; then
  echo "[pre-commit] eslint sur $(echo "$FICHIERS" | wc -l) fichier(s)"
  (cd frontend && npx eslint $(echo "$FICHIERS" | sed 's#^frontend/##'))
fi
