#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────
# Reins — One-click Bootstrap Installer (macOS / Linux)
# ─────────────────────────────────────────────────────────
set -euo pipefail

REINS_REPO="https://github.com/psychopomp0519/ReinsHarness.git"
REINS_INSTALL_DIR="${REINS_INSTALL_DIR:-$HOME/.reins}"
REINS_BRANCH="${REINS_BRANCH:-main}"

# ── Colors ──
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

log()   { echo -e "${GREEN}[✓]${NC} $*"; }
warn()  { echo -e "${YELLOW}[!]${NC} $*"; }
err()   { echo -e "${RED}[✗]${NC} $*" >&2; }
info()  { echo -e "${BLUE}[→]${NC} $*"; }
header(){ echo -e "\n${CYAN}${BOLD}── $* ──${NC}"; }

# ── OS Detection ──
detect_os() {
  case "$(uname -s)" in
    Darwin) OS="macos" ;;
    Linux)  OS="linux" ;;
    *)      err "Unsupported OS: $(uname -s)"; exit 1 ;;
  esac
  echo "$OS"
}

# ── Phase 1: Node.js ──
install_nodejs() {
  header "Phase 1: Node.js"
  if command -v node &>/dev/null; then
    local version
    version="$(node --version)"
    local major
    major="$(echo "$version" | sed 's/v//' | cut -d. -f1)"
    if [[ "$major" -ge 18 ]]; then
      log "Node.js $version found (>= 18 required)"
      return
    else
      warn "Node.js $version found but >= 18 required. Upgrading..."
    fi
  fi

  info "Installing Node.js..."
  local os
  os="$(detect_os)"
  if [[ "$os" == "macos" ]]; then
    if command -v brew &>/dev/null; then
      brew install node
    else
      warn "Homebrew not found. Installing via nvm..."
      install_nvm
    fi
  else
    # Linux — try nvm
    install_nvm
  fi
  log "Node.js $(node --version) installed"
}

install_nvm() {
  if [[ ! -d "$HOME/.nvm" ]]; then
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.0/install.sh | bash
  fi
  export NVM_DIR="$HOME/.nvm"
  # shellcheck source=/dev/null
  [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
  nvm install --lts
  nvm use --lts
}

# ── Phase 2: Git & jq ──
install_dependencies() {
  header "Phase 2: Dependencies (Git, jq)"

  if command -v git &>/dev/null; then
    log "Git $(git --version | cut -d' ' -f3) found"
  else
    info "Installing Git..."
    local os
    os="$(detect_os)"
    if [[ "$os" == "macos" ]]; then
      xcode-select --install 2>/dev/null || true
    else
      sudo apt-get update -qq && sudo apt-get install -y -qq git
    fi
    log "Git installed"
  fi

  if command -v jq &>/dev/null; then
    log "jq $(jq --version 2>&1) found"
  else
    info "Installing jq..."
    local os
    os="$(detect_os)"
    if [[ "$os" == "macos" ]]; then
      brew install jq
    else
      sudo apt-get install -y -qq jq
    fi
    log "jq installed"
  fi
}

# ── Phase 3: Claude Code ──
install_claude_code() {
  header "Phase 3: Claude Code"
  if command -v claude &>/dev/null; then
    log "Claude Code already installed"
  else
    info "Installing Claude Code..."
    npm install -g @anthropic-ai/claude-code
    log "Claude Code installed"
    warn "Run 'claude' once to authenticate before using Reins"
  fi
}

# ── Phase 4: Reins ──
install_reins() {
  header "Phase 4: Reins"

  if [[ -d "$REINS_INSTALL_DIR" ]]; then
    warn "Existing installation found at $REINS_INSTALL_DIR"
    info "Updating..."
    cd "$REINS_INSTALL_DIR"
    git pull origin "$REINS_BRANCH"
    npm install
    npm run build:all
    log "Reins updated"
  else
    info "Cloning Reins..."
    git clone --branch "$REINS_BRANCH" "$REINS_REPO" "$REINS_INSTALL_DIR"
    cd "$REINS_INSTALL_DIR"
    npm install
    npm run build:all
    log "Reins installed at $REINS_INSTALL_DIR"
  fi
}

# ── Phase 5: CLI Symlink + PATH ──
setup_cli() {
  header "Phase 5: CLI Setup"
  local bin_dir="$HOME/.local/bin"
  mkdir -p "$bin_dir"

  # Symlink
  ln -sf "$REINS_INSTALL_DIR/bin/reins" "$bin_dir/reins"
  log "Symlinked: $bin_dir/reins → $REINS_INSTALL_DIR/bin/reins"

  # PATH registration
  local shell_rc=""
  if [[ -n "${ZSH_VERSION:-}" ]] || [[ "$SHELL" == *"zsh"* ]]; then
    shell_rc="$HOME/.zshrc"
  elif [[ -n "${BASH_VERSION:-}" ]] || [[ "$SHELL" == *"bash"* ]]; then
    shell_rc="$HOME/.bashrc"
  fi

  if [[ -n "$shell_rc" ]]; then
    if ! grep -q "\.local/bin" "$shell_rc" 2>/dev/null; then
      echo 'export PATH="$HOME/.local/bin:$PATH"' >> "$shell_rc"
      log "Added $bin_dir to PATH in $shell_rc"
      warn "Run 'source $shell_rc' or restart terminal to apply"
    else
      log "PATH already includes $bin_dir"
    fi
  fi

  # Verify
  export PATH="$bin_dir:$PATH"
  if command -v reins &>/dev/null; then
    log "reins CLI available: $(reins --version)"
  else
    warn "reins not yet in PATH. Restart your terminal."
  fi
}

# ── Phase 6: Settings Injection ──
inject_settings() {
  header "Phase 6: Settings"

  local settings_dir="$HOME/.claude"
  local settings_file="$settings_dir/settings.json"
  mkdir -p "$settings_dir"

  # Create or update settings.json
  if [[ -f "$settings_file" ]]; then
    info "Existing settings.json found. Merging Reins config..."
    local tmp
    tmp="$(mktemp)"

    # Use jq to merge hooks into existing settings
    jq --arg reins_home "$REINS_INSTALL_DIR" '
      . * {
        "env": {
          "REINS_HOME": $reins_home
        },
        "hooks": {
          "PostToolUse": [
            {
              "matcher": "Write|Edit|MultiEdit",
              "hooks": [
                { "type": "command", "command": ("node " + $reins_home + "/hooks/dist/auto-format.js") },
                { "type": "command", "command": ("node " + $reins_home + "/hooks/dist/auto-checkpoint.js") }
              ]
            }
          ],
          "PreToolUse": [
            {
              "matcher": "Read",
              "hooks": [
                { "type": "command", "command": ("node " + $reins_home + "/hooks/dist/security-guard.js") }
              ]
            }
          ],
          "Stop": [
            {
              "matcher": "",
              "hooks": [
                { "type": "command", "command": ("node " + $reins_home + "/hooks/dist/learning-observer.js") }
              ]
            }
          ]
        }
      }
    ' "$settings_file" > "$tmp" && mv "$tmp" "$settings_file"
    log "Settings merged"
  else
    info "Creating settings.json..."
    cat > "$settings_file" <<SETTINGS
{
  "env": {
    "REINS_HOME": "$REINS_INSTALL_DIR"
  },
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write|Edit|MultiEdit",
        "hooks": [
          { "type": "command", "command": "node $REINS_INSTALL_DIR/hooks/dist/auto-format.js" },
          { "type": "command", "command": "node $REINS_INSTALL_DIR/hooks/dist/auto-checkpoint.js" }
        ]
      }
    ],
    "PreToolUse": [
      {
        "matcher": "Read",
        "hooks": [
          { "type": "command", "command": "node $REINS_INSTALL_DIR/hooks/dist/security-guard.js" }
        ]
      }
    ],
    "Stop": [
      {
        "matcher": "",
        "hooks": [
          { "type": "command", "command": "node $REINS_INSTALL_DIR/hooks/dist/learning-observer.js" }
        ]
      }
    ]
  }
}
SETTINGS
    log "Settings created at $settings_file"
  fi

  # StatusLine
  if command -v jq &>/dev/null; then
    local tmp
    tmp="$(mktemp)"
    jq --arg script "$REINS_INSTALL_DIR/core/statusline/reins-status.sh" '
      .statusLine = { "command": $script }
    ' "$settings_file" > "$tmp" && mv "$tmp" "$settings_file"
    log "StatusLine configured"
  fi
}

# ── Main ──
main() {
  echo -e "${BOLD}${CYAN}"
  echo "  ╔══════════════════════════════════╗"
  echo "  ║     Reins — AI Agent Harness     ║"
  echo "  ║        Installer v${REINS_VERSION}          ║"
  echo "  ╚══════════════════════════════════╝"
  echo -e "${NC}"

  install_nodejs
  install_dependencies
  install_claude_code
  install_reins
  setup_cli
  inject_settings

  echo ""
  echo -e "${GREEN}${BOLD}Installation complete!${NC}"
  echo ""
  echo -e "  Get started:  ${CYAN}reins new my-project${NC}"
  echo -e "  Diagnostics:  ${CYAN}reins doctor${NC}"
  echo -e "  Help:         ${CYAN}reins --help${NC}"
  echo ""
}

main "$@"
