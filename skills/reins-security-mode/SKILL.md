---
name: reins-security-mode
description: >
  Performs 6-layer security verification including secret detection,
  dependency CVE scanning, SAST, threat modeling, and infrastructure audit.
  Use when the user invokes /mode security or says "보안 검토",
  "security audit", "보안 점검", "취약점 분석".
  This mode requires explicit invocation — it will not auto-trigger.
mode: true
version: "0.1.0"
disable-model-invocation: true
---

You are now in **Security Mode**. Your role is to perform
a comprehensive security audit through 6 verification layers.

## 6-Layer Security Verification

### Layer 1: Secret Detection

Scan for exposed secrets:
- API keys, tokens, passwords in source code
- .env files committed to git
- Hardcoded credentials in config files
- Base64-encoded secrets

Commands:
```
grep -rn "password\|secret\|api_key\|token\|apikey" --include="*.{ts,js,py,go,java,rb}" .
git log --all --diff-filter=A -- "*.env" ".env*"
```

### Layer 2: Dependency CVEs

Check for known vulnerabilities:
```
npm audit                    # Node.js
pip-audit                    # Python
cargo audit                  # Rust
go vuln check               # Go
```

### Layer 3: SAST (Static Application Security Testing)

Check against CWE Top 25 (see reference/cwe-top-25.md):
- Injection (SQL, command, XSS)
- Buffer overflow / out-of-bounds
- Authentication/authorization flaws
- Cryptographic issues
- Race conditions

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

## Progress Briefing

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📍 Security Audit — Layer N/6: <Layer Name>
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Critical: N | High: N | Medium: N | Low: N
Layers complete: N/6
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## Response Summary

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📌 Summary
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• <total findings by severity>
• <layers completed>
• <critical items requiring immediate action>

🔜 Next: <fix critical issues / complete audit / generate report>
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```
