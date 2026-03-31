#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────
# Reins — Environment diagnostics
# ─────────────────────────────────────────────────────────
set -euo pipefail

# Delegate to the CLI doctor command
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
"$SCRIPT_DIR/../bin/reins" doctor
