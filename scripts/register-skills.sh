#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────
# Register Reins skills and agents with Claude Code
# Creates symlinks in ~/.claude/skills/ and ~/.claude/agents/
# ─────────────────────────────────────────────────────────
set -euo pipefail

REINS_HOME="${REINS_HOME:-$(cd "$(dirname "$0")/.." && pwd)}"
CLAUDE_DIR="${HOME}/.claude"
SKILLS_DIR="${CLAUDE_DIR}/skills"
AGENTS_DIR="${CLAUDE_DIR}/agents"

GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}Registering Reins skills with Claude Code...${NC}"

# ── Create directories ──
mkdir -p "$SKILLS_DIR" "$AGENTS_DIR"

# ── Register built-in skills ──
skill_count=0
for skill_dir in "$REINS_HOME"/skills/*/; do
  if [[ -f "${skill_dir}SKILL.md" ]]; then
    skill_name="$(basename "$skill_dir")"
    target="$SKILLS_DIR/$skill_name"
    if [[ -L "$target" ]]; then
      rm "$target"
    fi
    ln -sf "$skill_dir" "$target"
    skill_count=$((skill_count + 1))
  fi
done
echo -e "${GREEN}  ✓ ${skill_count} skills registered${NC}"

# ── Register agents ──
agent_count=0
for agent_file in "$REINS_HOME"/agents/*.md; do
  if [[ -f "$agent_file" ]]; then
    agent_name="$(basename "$agent_file")"
    target="$AGENTS_DIR/$agent_name"
    if [[ -L "$target" ]]; then
      rm "$target"
    fi
    ln -sf "$agent_file" "$target"
    agent_count=$((agent_count + 1))
  fi
done
echo -e "${GREEN}  ✓ ${agent_count} agents registered${NC}"

# ── Register pack skills ──
pack_skill_count=0
for pack_dir in "$REINS_HOME"/packs/*/; do
  pack_name="$(basename "$pack_dir")"
  # Pack skills (flat .md files)
  if [[ -d "${pack_dir}skills" ]]; then
    for skill_file in "${pack_dir}skills/"*.md; do
      if [[ -f "$skill_file" ]]; then
        skill_name="$(basename "$skill_file" .md)"
        skill_target_dir="$SKILLS_DIR/$skill_name"
        mkdir -p "$skill_target_dir"
        ln -sf "$skill_file" "$skill_target_dir/SKILL.md"
        pack_skill_count=$((pack_skill_count + 1))
      fi
    done
    # Pack skills (directory with SKILL.md)
    for skill_subdir in "${pack_dir}skills/"/*/; do
      if [[ -f "${skill_subdir}SKILL.md" ]]; then
        skill_name="$(basename "$skill_subdir")"
        target="$SKILLS_DIR/$skill_name"
        if [[ -L "$target" ]]; then
          rm "$target"
        fi
        ln -sf "$skill_subdir" "$target"
        pack_skill_count=$((pack_skill_count + 1))
      fi
    done
  fi
  # Pack agents
  if [[ -d "${pack_dir}agents" ]]; then
    for agent_file in "${pack_dir}agents/"*.md; do
      if [[ -f "$agent_file" ]]; then
        agent_name="$(basename "$agent_file")"
        ln -sf "$agent_file" "$AGENTS_DIR/$agent_name"
      fi
    done
  fi
done
if [[ $pack_skill_count -gt 0 ]]; then
  echo -e "${GREEN}  ✓ ${pack_skill_count} pack skills registered${NC}"
fi

echo -e "${GREEN}Done. Skills available in next Claude Code session.${NC}"
