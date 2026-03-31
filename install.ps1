# ─────────────────────────────────────────────────────────
# Reins — Bootstrap Installer (Windows PowerShell)
# ─────────────────────────────────────────────────────────
$ErrorActionPreference = "Stop"

$REINS_VERSION = "0.1.0"
$REINS_REPO = "https://github.com/reins-ai/reins.git"
$REINS_INSTALL_DIR = if ($env:REINS_INSTALL_DIR) { $env:REINS_INSTALL_DIR } else { "$env:USERPROFILE\.reins" }

function Write-Header($msg) { Write-Host "`n── $msg ──" -ForegroundColor Cyan }
function Write-Ok($msg)     { Write-Host "[✓] $msg" -ForegroundColor Green }
function Write-Warn($msg)   { Write-Host "[!] $msg" -ForegroundColor Yellow }
function Write-Err($msg)    { Write-Host "[✗] $msg" -ForegroundColor Red }
function Write-Info($msg)   { Write-Host "[→] $msg" -ForegroundColor Blue }

# ── Phase 1: Node.js ──
Write-Header "Phase 1: Node.js"
if (Get-Command node -ErrorAction SilentlyContinue) {
    $nodeVersion = node --version
    Write-Ok "Node.js $nodeVersion found"
} else {
    Write-Info "Installing Node.js via winget..."
    winget install OpenJS.NodeJS.LTS --accept-package-agreements --accept-source-agreements
    Write-Ok "Node.js installed. Restart terminal if needed."
}

# ── Phase 2: Git ──
Write-Header "Phase 2: Git"
if (Get-Command git -ErrorAction SilentlyContinue) {
    Write-Ok "Git found"
} else {
    Write-Info "Installing Git via winget..."
    winget install Git.Git --accept-package-agreements --accept-source-agreements
    Write-Ok "Git installed. Restart terminal if needed."
}

# ── Phase 3: Claude Code ──
Write-Header "Phase 3: Claude Code"
if (Get-Command claude -ErrorAction SilentlyContinue) {
    Write-Ok "Claude Code already installed"
} else {
    Write-Info "Installing Claude Code..."
    npm install -g @anthropic-ai/claude-code
    Write-Ok "Claude Code installed"
    Write-Warn "Run 'claude' once to authenticate"
}

# ── Phase 4: Reins ──
Write-Header "Phase 4: Reins"
if (Test-Path $REINS_INSTALL_DIR) {
    Write-Warn "Existing installation found. Updating..."
    Set-Location $REINS_INSTALL_DIR
    git pull origin main
    npm install
    npm run build
} else {
    Write-Info "Cloning Reins..."
    git clone $REINS_REPO $REINS_INSTALL_DIR
    Set-Location $REINS_INSTALL_DIR
    npm install
    npm run build
}
Write-Ok "Reins installed at $REINS_INSTALL_DIR"

# ── Phase 5: PATH ──
Write-Header "Phase 5: PATH"
$binDir = "$REINS_INSTALL_DIR\bin"
$currentPath = [Environment]::GetEnvironmentVariable("PATH", "User")
if ($currentPath -notlike "*$binDir*") {
    [Environment]::SetEnvironmentVariable("PATH", "$binDir;$currentPath", "User")
    Write-Ok "Added $binDir to user PATH"
    Write-Warn "Restart terminal to apply PATH changes"
} else {
    Write-Ok "PATH already includes $binDir"
}

# ── Done ──
Write-Host ""
Write-Host "Installation complete!" -ForegroundColor Green
Write-Host ""
Write-Host "  Get started:  reins new my-project" -ForegroundColor Cyan
Write-Host "  Diagnostics:  reins doctor" -ForegroundColor Cyan
Write-Host "  Help:         reins --help" -ForegroundColor Cyan
Write-Host ""
