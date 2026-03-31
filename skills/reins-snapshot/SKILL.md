---
name: reins-snapshot
description: >
  Use when the user says "스냅샷", "snapshot", "/snapshot save",
  or wants to create a restore point.
allowed-tools: "Read, Bash"
---

Manage project snapshots using git tags with `reins-snapshot-` prefix.

## Commands

- `/snapshot save [name]` — Create a named snapshot (`git tag reins-snapshot-<name>`)
- `/snapshot restore <name>` — Restore a snapshot (`git checkout reins-snapshot-<name>`)
- `/snapshot list` — List all snapshots (`git tag -l 'reins-snapshot-*'`)
- `/snapshot compare <a> <b>` — Compare two snapshots (`git diff reins-snapshot-<a>..reins-snapshot-<b>`)
- `/snapshot delete <name>` — Delete a snapshot (`git tag -d reins-snapshot-<name>`)
