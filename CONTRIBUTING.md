# Contributing to Reins

Thank you for your interest in contributing to Reins!

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/reins.git`
3. Install dependencies: `npm install`
4. Build: `npm run build:all`
5. Run diagnostics: `bin/reins doctor`

## Development

### Project Structure

- `core/` — TypeScript core engine
- `skills/` — Mode and utility skills (Markdown)
- `agents/` — Agent definitions (Markdown)
- `hooks/` — Automation hooks (TypeScript)
- `packs/` — Domain packs
- `templates/` — Output templates

### Building

```bash
npm run build          # Build TypeScript core
npm run build:hooks    # Build hooks
npm run build:all      # Build everything
```

### Creating a Pack

```bash
bin/reins pack create my-pack
```

This creates a template at `packs/my-pack/` with:
- `PACK.yaml` — Pack metadata
- `skills/` — Pack-specific skills
- `agents/` — Pack-specific agents

### Pack Structure

```yaml
# PACK.yaml
name: my-pack
version: "1.0.0"
description: "What this pack does"
author: "Your Name"
keywords: [relevant, keywords]
skills:
  - skill-name-1
  - skill-name-2
agents:
  - agent-name-1
```

### Skill Frontmatter Standard

```yaml
---
name: pack-name-skill-name     # lowercase + hyphens
description: >                  # 3rd person, what + when trigger
  Does X. Use when the user says "A" or needs to B.
version: "1.0.0"
---
```

## Code Style

- TypeScript: strict mode, ES2022 target
- Markdown skills: follow frontmatter standard
- Naming: `lowercase-with-hyphens`
- Token budget: SKILL.md body ≤ 2,000 tokens

## Pull Requests

1. Create a feature branch
2. Make your changes
3. Ensure `npm run build:all` passes
4. Submit a PR with clear description

## Reporting Issues

Use GitHub Issues with:
- Clear title
- Steps to reproduce
- Expected vs. actual behavior
- Reins version (`reins --version`)
