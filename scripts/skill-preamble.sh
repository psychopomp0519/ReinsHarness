#!/usr/bin/env bash
# Gathers runtime context for skill preambles (gstack pattern)
BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "unknown")
MODE=$(cat .reins/current-mode 2>/dev/null || echo "none")
LEARNINGS_COUNT=$(wc -l < .reins/learnings/errors.jsonl 2>/dev/null || echo "0")
PROGRESS=""
if [[ -f docs/progress.md ]]; then
  TOTAL=$(grep -c '^\- \[' docs/progress.md 2>/dev/null || echo "0")
  DONE=$(grep -c '^\- \[x\]' docs/progress.md 2>/dev/null || echo "0")
  PROGRESS="${DONE}/${TOTAL}"
fi
echo "Branch: $BRANCH | Mode: $MODE | Progress: $PROGRESS | Learnings: $LEARNINGS_COUNT"
