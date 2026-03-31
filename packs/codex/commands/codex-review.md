---
description: "Request a code review from Codex CLI"
argument-hint: "[file-or-path]"
allowed-tools: "Read, Grep, Glob, Bash"
---

Run a code review using Codex. If a file or path is given, review that.
Otherwise, review the current git diff.

Steps:
1. Determine review scope (argument or `git diff`)
2. Gather code context
3. Send to Codex bridge for review
4. Present Codex findings alongside Claude's own analysis
