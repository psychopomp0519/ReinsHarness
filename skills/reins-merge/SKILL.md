---
name: reins-merge
description: >
  Use when the user says "병합", "merge", "/reins merge",
  or wants to integrate an external plugin or harness.
allowed-tools: "Read, Bash"
---

Manage external source merging for Reins.

## Commands

- `/reins merge <source>` — Analyze and merge external source
- `/reins merge --from-github <url>` — Clone and merge from GitHub
- `/reins merge --level coexist|wrap|convert` — Specify merge level
- `/reins merge list` — Show merged sources from `.reins/merged/registry.json`
- `/reins merge remove <source>` — Remove a merged source

## Merge Levels

| Level | Description | Effort |
|-------|------------|--------|
| coexist | Install as-is, Reins recognizes and calls it | Low |
| wrap | Wrap as Reins pack with unified commands | Medium |
| convert | Rewrite as native Reins skills | High |

## Workflow

1. Analyze source structure (skills, agents, hooks, config)
2. Suggest appropriate merge level
3. On approval, execute merge
4. Register in `.reins/merged/registry.json`
