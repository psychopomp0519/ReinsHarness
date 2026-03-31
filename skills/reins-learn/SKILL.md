---
name: reins-learn
description: >
  Use when the user says "학습",
  "/learn", "what did you learn", or wants to manage
  the .reins/learnings/ data.
allowed-tools: "Read, Bash, Grep, Glob"
---

Manage the Reins learning system.

## Learning Entry Schema

Each learning is a JSONL entry with the following structure:

```json
{
  "skill": "dev-mode",
  "type": "pattern | pitfall | preference | architecture | tool",
  "key": "short-identifier",
  "insight": "What was learned",
  "confidence": 7,
  "source": "observed | user-stated | inferred",
  "files": ["src/foo.ts", "lib/bar.ts"],
  "timestamp": "2026-03-31T12:00:00Z"
}
```

### Types

| Type | When to use |
|------|-------------|
| pattern | Recurring code/workflow pattern that works well |
| pitfall | Something that caused errors or wasted time |
| preference | User's style or tooling preference |
| architecture | Structural decision or constraint |
| tool | Tool usage tip, flag, or workaround |

### Sources

| Source | Meaning |
|--------|---------|
| observed | Detected from code, errors, or behavior during a task |
| user-stated | Explicitly told by the user |
| inferred | Derived from multiple observations |

## Commands

- `/learn show` — Show recent learnings
- `/learn errors` — Show error patterns from `.reins/learnings/errors.jsonl`
- `/learn patterns` — Show behavior patterns from `.reins/learnings/patterns.jsonl`
- `/learn preferences` — Show user preferences from `.reins/learnings/preferences.jsonl`
- `/learn promote <id>` — Promote a learning to a rule
- `/learn reset` — Clear all learnings (with confirmation)
- `/learn export` — Export learnings as JSON
- `/learn search <query>` — Search learnings by keyword across all JSONL files. Match against `key`, `insight`, `type`, and `files` fields. Show matching entries sorted by confidence (desc).
- `/learn add` — Manually add a learning. Prompt the user for: type, key, insight, confidence (1-10). Set source to `user-stated`. Append to the appropriate JSONL file.
- `/learn prune` — Check if files referenced in learnings still exist. Flag stale entries where files have been deleted or moved. Offer to remove or update them.
- `/learn stats` — Show summary statistics:
  - Total entries across all JSONL files
  - Unique keys
  - Breakdown by type (pattern/pitfall/preference/architecture/tool)
  - Breakdown by source (observed/user-stated/inferred)
  - Average confidence score

## Auto-Capture Rule

Every skill should capture learnings at completion. If you discovered something non-obvious during a task, record it via `/learn add` before finishing. Prioritize pitfalls and patterns that would save time on future tasks.
