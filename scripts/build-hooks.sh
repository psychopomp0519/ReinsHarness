#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────
# Build hooks: TypeScript → JavaScript
# ─────────────────────────────────────────────────────────
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REINS_HOME="$(cd "$SCRIPT_DIR/.." && pwd)"
HOOKS_DIR="$REINS_HOME/hooks"
DIST_DIR="$HOOKS_DIR/dist"

mkdir -p "$DIST_DIR"

echo "Building hooks..."

# Compile each hook individually with inline tsconfig
for hook in "$HOOKS_DIR"/*.ts; do
  if [[ -f "$hook" ]]; then
    name="$(basename "$hook" .ts)"
    echo "  Compiling: $name.ts → dist/$name.js"
    npx tsc \
      --target ES2022 \
      --module NodeNext \
      --moduleResolution NodeNext \
      --esModuleInterop true \
      --strict true \
      --outDir "$DIST_DIR" \
      --rootDir "$HOOKS_DIR" \
      "$hook" 2>&1 || {
        echo "  ⚠️  Failed to compile $name.ts"
      }
  fi
done

echo "Hooks build complete: $(ls -1 "$DIST_DIR"/*.js 2>/dev/null | wc -l) hooks compiled"
