---
name: reins-merge
description: >
  Use when the user says "병합", "merge", "/reins merge",
  or wants to integrate an external plugin or harness.
version: "0.1.0"
---

You manage external source merging for Reins.

## Commands

- `/reins merge <source>` — Analyze and merge external source
- `/reins merge --from-plugin <name>` — Merge from installed plugin
- `/reins merge --from-github <url>` — Merge from GitHub repository
- `/reins merge --level coexist|wrap|convert` — Specify merge level
- `/reins merge list` — Show merged sources
- `/reins merge update` — Update all merged sources
- `/reins merge remove <source>` — Remove a merged source

## Merge Levels

| Level | Description | Effort |
|-------|------------|--------|
| Coexist | Install as-is, Reins recognizes and calls it | Low |
| Wrap | Wrap as Reins pack with unified commands | Medium |
| Convert | Rewrite as native Reins skills | High |

## Workflow

1. Analyze source structure (skills, agents, hooks, config)
2. Suggest appropriate merge level
3. On approval, execute merge
4. Register in `.reins/merged/registry.json`
5. Test integration
