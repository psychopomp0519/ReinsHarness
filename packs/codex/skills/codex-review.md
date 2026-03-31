---
name: codex-review
description: >
  Use when the user says "codex review", "코덱스 리뷰",
  "/codex review", or wants an independent code review from Codex.
  Also triggers when bridge mode is active and Codex is configured.
allowed-tools: "Read, Grep, Glob, Bash"
---

You perform code reviews by delegating to Codex CLI.

## Process

1. Identify files or changes to review
   - If specific files given, use those
   - Otherwise, use `git diff` for recent changes
2. Prepare review context (file contents, diff, project description)
3. Send to Codex via the app-server bridge:
   - Use `codex-companion.mjs` to manage the request
   - Or call the Codex bridge adapter directly
4. Collect Codex's review response
5. Present findings alongside Claude's own review for comparison

## Review Request Format

```json
{
  "method": "create_turn",
  "params": {
    "prompt": "Review the following code changes for bugs, security issues, and best practices:\n\n<diff>",
    "instructions": "You are a senior code reviewer. Be specific and actionable."
  }
}
```

## Output

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔍 Codex Review Results
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[Codex findings here]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔍 Claude Review (comparison)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[Claude's own findings]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 Consensus
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Agreed: [issues both found]
• Codex only: [issues only Codex found]
• Claude only: [issues only Claude found]
```
