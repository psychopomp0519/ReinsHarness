---
name: reins-mode
description: >
  Switches between Reins modes, shows current mode status,
  and displays mode transition history.
  Use when the user says "모드 전환", "switch mode",
  "/mode plan", "/mode dev", "/mode review", "/mode status",
  "/mode history", or any "/mode <name>" command.
version: "0.1.0"
---

You manage mode transitions for the Reins harness.

## Commands

### `/mode <name>` — Switch Mode

Switch to the specified mode. Available modes:

| Mode | Name | Auto | Manual Only |
|------|------|------|-------------|
| 📋 Plan | plan | ✅ | |
| 🔨 Dev | dev | ✅ | |
| 🔍 Review | review | ✅ | |
| 💬 Discuss | discuss | ✅ | |
| 🧹 Cleanup | cleanup | ✅ | |
| 🔒 Security | security | | ✅ |
| 📊 Retro | retro | ✅ | |
| 🚀 Deploy | deploy | | ✅ |
| 🌐 Bridge | bridge | | ✅ |

On mode switch:
1. Save current state to `docs/progress.md`
2. Record transition in `.reins/mode-history.jsonl`
3. Write new mode to `.reins/current-mode`
4. Load the target mode's SKILL.md
5. Announce the switch with mode icon and description

### `/mode status` — Current Status

Show:
- Current active mode (with icon)
- Progress summary from `docs/progress.md`
- Session elapsed time
- Active pack (if any)

### `/mode history` — Transition History

Show recent mode transitions from `.reins/mode-history.jsonl`:

```
Time       | From    → To      | Reason
───────────┼─────────┼─────────┼──────────
14:30:22   | plan    → dev     | Plan approved
14:52:10   | dev     → review  | Phase 1 checkpoint
15:01:45   | review  → dev     | Issues fixed
```

## Transition Rules

Automatic transitions (suggested, not forced):
- Plan approved → suggest Dev mode
- Dev checkpoint → suggest Review mode
- Review all-pass → suggest Dev mode (next phase) or completion
- Dev all-complete → suggest Review mode (final)
