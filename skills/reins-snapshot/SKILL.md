---
name: reins-snapshot
description: >
  Use when the user says "스냅샷", "snapshot", "/snapshot save",
  or wants to create a restore point.
version: "0.1.0"
---

You manage project snapshots.

## Commands

- `/snapshot save [name]` — Create a named snapshot
- `/snapshot restore <name>` — Restore a snapshot
- `/snapshot list` — List all snapshots
- `/snapshot compare <a> <b>` — Compare two snapshots
- `/snapshot delete <name>` — Delete a snapshot

## Implementation

Snapshots use git tags with `reins-snapshot-` prefix.
