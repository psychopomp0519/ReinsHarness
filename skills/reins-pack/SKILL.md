---
name: reins-pack
description: >
  Use when the user says "팩 설치", "pack install", "팩 목록",
  "/pack list", "/pack install <name>", or needs to manage
  domain-specific functionality extensions.
allowed-tools: "Read, Bash"
---

Manage Reins domain packs.

## Commands

### `/pack list` — List Packs

Show all available packs with install status.

### `/pack install <name>` — Install Pack

1. Verify pack exists in registry
2. Copy pack to `.reins/packs/<name>/`
3. Register skills and agents
4. Announce installed capabilities

### `/pack remove <name>` — Remove Pack

1. Confirm with user
2. Remove from `.reins/packs/<name>/`
3. Unregister skills and agents
4. Announce removal

### `/pack info <name>` — Pack Details

Show pack metadata, skills, agents, and dependencies.

### `/pack create <name>` — Create Pack Template

Generate scaffolding:
```
packs/<name>/
├── PACK.yaml
├── skills/
├── agents/
└── README.md
```

### `/pack search <query>` — Search Packs

Search available packs by keyword.

## PACK.yaml Schema

```yaml
name: ui-design
version: "1.0.0"
description: "UI/UX design quality tools"
author: "Reins Team"
keywords: [ui, design, accessibility, frontend]
dependencies: []
modes:
  - name: design-review
    file: modes/design-review.yaml
skills:
  - ui-design-audit
  - ui-accessibility-check
  - ui-component-review
agents:
  - ui-critic
  - ux-researcher
```
