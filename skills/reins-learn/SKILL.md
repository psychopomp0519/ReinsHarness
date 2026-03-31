---
name: reins-learn
description: >
  Use when the user says "학습",
  "/learn", "what did you learn", or wants to manage
  the .reins/learnings/ data.
allowed-tools: "Read, Bash"
---

Manage the Reins learning system.

## Commands

- `/learn show` — Show recent learnings
- `/learn errors` — Show error patterns from `.reins/learnings/errors.jsonl`
- `/learn patterns` — Show behavior patterns from `.reins/learnings/patterns.jsonl`
- `/learn preferences` — Show user preferences from `.reins/learnings/preferences.jsonl`
- `/learn promote <id>` — Promote a learning to a rule
- `/learn reset` — Clear all learnings (with confirmation)
- `/learn export` — Export learnings as JSON
