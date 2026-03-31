#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────
# Reins — Initial setup for a project
# Run this in a project directory to initialize Reins.
# ─────────────────────────────────────────────────────────
set -euo pipefail

echo "Initializing Reins in $(pwd)..."

# Create project-local Reins directories
mkdir -p .reins/learnings .reins/merged docs/plans

# Initialize state
echo "null" > .reins/current-mode
echo '{"currentMode":null,"lastTransition":null,"progress":null}' > .reins/state.json
echo '[]' > .reins/merged/registry.json

# Create initial progress file
if [[ ! -f docs/progress.md ]]; then
  cat > docs/progress.md <<'EOF'
# Progress

> Plan: (none) | Mode: (none) | Updated: $(date +%Y-%m-%d)

## Tasks

(No plan loaded yet. Use /mode plan to create one.)
EOF
fi

echo "✅ Reins initialized. Use 'reins new <session>' to start."
