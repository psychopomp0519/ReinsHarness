#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────
# Reins StatusLine — Claude Code status bar widget
# ─────────────────────────────────────────────────────────
# Input: JSON from stdin (Claude Code statusLine protocol)
# Output: Formatted status string to stdout
#
# Ref: ccstatusline (sirmalloc/ccstatusline) StatusJSON schema
# Fields: session_id, model, context_window{}, cost{}, rate_limits{}, workspace{}

set -euo pipefail

# Read JSON input from stdin
INPUT="$(cat)"

# ── Extract fields using actual Claude Code statusLine JSON schema ──
# context_window: { context_window_size, total_input_tokens, total_output_tokens,
#                   current_usage, used_percentage, remaining_percentage }
CTX_PCT=$(echo "$INPUT" | jq -r '.context_window.used_percentage // 0' | cut -d. -f1)

# cost: { total_cost_usd, total_duration_ms, total_api_duration_ms,
#          total_lines_added, total_lines_removed }
COST=$(echo "$INPUT" | jq -r '.cost.total_cost_usd // 0' | xargs printf "%.2f")
DURATION_MS=$(echo "$INPUT" | jq -r '.cost.total_duration_ms // 0')
DURATION_S=$((DURATION_MS / 1000))

# model: string or { id, display_name }
MODEL=$(echo "$INPUT" | jq -r 'if .model | type == "object" then .model.display_name // .model.id else .model // "unknown" end')

# rate_limits: { five_hour: { used_percentage, resets_at }, seven_day: { used_percentage, resets_at } }
RATE_5H=$(echo "$INPUT" | jq -r '.rate_limits.five_hour.used_percentage // empty' 2>/dev/null || echo "")
RATE_7D=$(echo "$INPUT" | jq -r '.rate_limits.seven_day.used_percentage // empty' 2>/dev/null || echo "")

# ── Context percentage + color ──
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
MODE_FILE=".reins/current-mode"
if [[ -f "$MODE_FILE" ]]; then
  CURRENT_MODE=$(cat "$MODE_FILE" 2>/dev/null || echo "none")
else
  CURRENT_MODE="none"
fi

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

# Rate limit warning (show if >70%)
if [[ -n "$RATE_5H" ]]; then
  RATE_5H_INT=$(echo "$RATE_5H" | cut -d. -f1)
  if [[ "$RATE_5H_INT" -ge 70 ]]; then
    OUTPUT+=" | ⚠️ rate ${RATE_5H_INT}%"
  fi
fi

if [[ -n "$BRANCH" ]]; then
  OUTPUT+=" | 🔀 ${BRANCH}"
fi

if [[ -n "$PACK" ]]; then
  OUTPUT+=" | 📦 ${PACK}"
fi

echo "$OUTPUT"
