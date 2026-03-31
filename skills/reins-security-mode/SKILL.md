---
name: reins-security-mode
description: >
  Use when the user invokes /mode security or says "보안 검토",
  "security audit", "보안 점검", "취약점 분석".
  This mode requires explicit invocation — it will not auto-trigger.
allowed-tools: "Read, Grep, Glob, Bash"
disable-model-invocation: true
---

Perform a comprehensive security audit through 6 verification layers.

<HARD-GATE>
NEVER auto-fix security vulnerabilities without user approval.
Present findings and wait for explicit confirmation before making changes.
</HARD-GATE>

## 6-Layer Security Verification

### Layer 1: Secret Detection

Scan for exposed secrets:
- API keys, tokens, passwords in source code
- .env files committed to git
- Hardcoded credentials in config files
- Base64-encoded secrets

### Layer 2: Dependency CVEs

Check for known vulnerabilities using the project's dependency audit tools (e.g., `npm audit`, `pip-audit`, `cargo audit`).

### Layer 3: SAST (Static Application Security Testing)

Check against CWE Top 25. Check the reference file at reference/cwe-top-25.md in this skill's directory.
- Injection (SQL, command, XSS)
- Buffer overflow / out-of-bounds
- Authentication/authorization flaws
- Cryptographic issues
- Race conditions

#### Concrete CWE Grep Patterns

Use these regex patterns during SAST scans:

**SQL Injection (CWE-89):**
- String concatenation in queries: `SELECT.*\+|INSERT.*\+|UPDATE.*\+|DELETE.*\+`
- Template literals in queries: `` `SELECT.*\$\{` ``
- Unsanitized input in query builders

**XSS (CWE-79):**
- `innerHTML\s*=`
- `document\.write\(`
- `dangerouslySetInnerHTML` without a sanitization call (e.g., DOMPurify) nearby
- `v-html=` (Vue), `[innerHTML]=` (Angular)

**Command Injection (CWE-78):**
- `exec\(` / `execSync\(` with string concatenation or template literals
- `system\(` with user-controlled input
- `child_process` spawn/exec using `req\.|argv|params|query`

**Path Traversal (CWE-22):**
- `req\.params` or `req\.query` used inside `fs\.readFile|fs\.writeFile|fs\.access`
- `\.\.\/` sequences in user-controlled paths
- Missing `path.resolve` / `path.normalize` before file access

### Layer 4: STRIDE Threat Modeling

Apply STRIDE model (see reference/stride-model.md):
- **S**poofing — Can identity be faked?
- **T**ampering — Can data be modified?
- **R**epudiation — Can actions be denied?
- **I**nformation Disclosure — Can data leak?
- **D**enial of Service — Can service be disrupted?
- **E**levation of Privilege — Can permissions be escalated?

### Layer 5: DAST (Dynamic Application Security Testing)

If browser testing is available:
- XSS injection testing
- CSRF token validation
- Authentication bypass attempts
- Session management audit

If not available: output "Layer 5: Skipped (no browser testing configured)"

### Layer 6: Infrastructure Security

Check deployment configuration:
- Docker: privileged mode, exposed ports, base image
- CORS configuration
- CSP headers
- TLS/SSL configuration
- Kubernetes: RBAC, network policies, secrets management

## Pre-commit Gate

Before suggesting or creating a commit, run the following checks automatically:

1. **Layer 1 (Secrets):** Scan all staged files for exposed secrets, API keys, tokens, passwords.
2. **Layer 3 (SAST/CWE):** Run the concrete CWE grep patterns above against staged changes.

**Severity-based actions:**

| Severity | Action |
|----------|--------|
| Critical | **Block commit suggestion.** Do not proceed until the finding is resolved. |
| High | Warn the user prominently but allow commit if acknowledged. |
| Medium | Output informational note; do not block. |

A finding is **Critical** if it matches:
- Exposed secrets (hardcoded API keys, passwords, private keys in source)
- SQL injection or command injection with direct user input

A finding is **High** if it matches:
- XSS patterns (innerHTML, document.write) with unsanitized data
- Path traversal with user-controlled input

All other CWE pattern matches are **Medium**.

## Commands

- `/security scan` — Full 6-layer audit
- `/security scan --quick` — Layers 1-2 only (fast)
- `/security secrets` — Secret detection only
- `/security deps` — Dependency CVE only
- `/security threat-model` — STRIDE analysis only
- `/security report` — Generate security report
- `/security fix` — Auto-fix where safe

## Severity Levels

| Level | Definition |
|-------|-----------|
| Critical | Actively exploitable, immediate fix required |
| High | Exploitable with effort, fix within 24 hours |
| Medium | Potential vulnerability, fix within 1 week |
| Low | Best practice violation, fix when convenient |

## Handoff

When vulnerabilities found, suggest `/dev` to fix them.
