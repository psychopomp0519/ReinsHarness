#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────
# Reins StatusLine — Claude Code status bar widget
# ─────────────────────────────────────────────────────────
# Input: JSON from stdin (Claude Code statusLine protocol)
# Output: Formatted status string to stdout

set -euo pipefail

# Read JSON input from stdin
INPUT="$(cat)"

# ── Extract fields from Claude Code statusLine JSON ──
# Available fields: session_id, model, context_used, context_total, cost, duration
CONTEXT_USED=$(echo "$INPUT" | jq -r '.context_used // 0')
CONTEXT_TOTAL=$(echo "$INPUT" | jq -r '.context_total // 1')
COST=$(echo "$INPUT" | jq -r '.cost // "0.00"')
DURATION_S=$(echo "$INPUT" | jq -r '.duration // 0')

# ── Context percentage + color ──
if [[ "$CONTEXT_TOTAL" -gt 0 ]]; then
  CTX_PCT=$((CONTEXT_USED * 100 / CONTEXT_TOTAL))
else
  CTX_PCT=0
fi

if [[ $CTX_PCT -lt 50 ]]; then
  CTX_ICON="🟢"
elif [[ $CTX_PCT -lt 80 ]]; then
  CTX_ICON="🟡"
else
  CTX_ICON="🔴"
fi

# ── Duration formatting ──
if [[ "$DURATION_S" -ge 3600 ]]; then
  DURATION="$((DURATION_S / 3600))h$((DURATION_S % 3600 / 60))m"
elif [[ "$DURATION_S" -ge 60 ]]; then
  DURATION="$((DURATION_S / 60))m"
else
  DURATION="${DURATION_S}s"
fi

# ── Mode detection ──
# Read current mode from .reins/current-mode if it exists
MODE_FILE=".reins/current-mode"
if [[ -f "$MODE_FILE" ]]; then
  CURRENT_MODE=$(cat "$MODE_FILE" 2>/dev/null || echo "none")
else
  CURRENT_MODE="none"
fi

# Mode icon mapping
case "$CURRENT_MODE" in
  plan)     MODE_ICON="📋" ;;
  dev)      MODE_ICON="🔨" ;;
  review)   MODE_ICON="🔍" ;;
  discuss)  MODE_ICON="💬" ;;
  cleanup)  MODE_ICON="🧹" ;;
  security) MODE_ICON="🔒" ;;
  retro)    MODE_ICON="📊" ;;
  deploy)   MODE_ICON="🚀" ;;
  bridge)   MODE_ICON="🌐" ;;
  *)        MODE_ICON="⚡" ;;
esac

# ── Progress detection ──
PROGRESS=""
PROGRESS_FILE="docs/progress.md"
if [[ -f "$PROGRESS_FILE" ]]; then
  TOTAL=$(grep -c '^\- \[' "$PROGRESS_FILE" 2>/dev/null || echo "0")
  DONE=$(grep -c '^\- \[x\]' "$PROGRESS_FILE" 2>/dev/null || echo "0")
  if [[ "$TOTAL" -gt 0 ]]; then
    PCT=$((DONE * 100 / TOTAL))
    # Build progress bar (10 segments)
    FILLED=$((PCT / 10))
    EMPTY=$((10 - FILLED))
    BAR=""
    for ((i = 0; i < FILLED; i++)); do BAR+="█"; done
    for ((i = 0; i < EMPTY; i++)); do BAR+="░"; done
    PROGRESS="${BAR} ${PCT}% (${DONE}/${TOTAL})"
  fi
fi

# ── Git branch ──
BRANCH=""
if command -v git &>/dev/null; then
  BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "")
fi

# ── Active pack ──
PACK=""
PACK_FILE=".reins/active-pack"
if [[ -f "$PACK_FILE" ]]; then
  PACK=$(cat "$PACK_FILE" 2>/dev/null || echo "")
fi

# ── Build output ──
OUTPUT="${MODE_ICON} ${CURRENT_MODE^}"

if [[ -n "$PROGRESS" ]]; then
  OUTPUT+=" | ${PROGRESS}"
fi

OUTPUT+=" | ${CTX_ICON} ${CTX_PCT}% ctx"
OUTPUT+=" | 💰 \$${COST}"
OUTPUT+=" | ⏱ ${DURATION}"

if [[ -n "$BRANCH" ]]; then
  OUTPUT+=" | 🔀 ${BRANCH}"
fi

if [[ -n "$PACK" ]]; then
  OUTPUT+=" | 📦 ${PACK}"
fi

echo "$OUTPUT"
