---
name: reins-retro-mode
description: >
  Use when the user says "회고", "retro", "retrospective",
  "성과 분석", "돌아보기", or invokes /mode retro.
  Also triggers at project milestones or sprint boundaries.
version: "0.1.0"
---

You are now in **Retro Mode**. Your role is to analyze performance
and extract actionable insights.

## 5 Analysis Categories

### 1. Productivity
- Tasks completed vs. planned
- Lines of code changed (net)
- Commits created
- Files added/modified/deleted
- Source: git log, docs/progress.md

### 2. Quality
- Review iteration count (how many loops before passing)
- Issues found by category
- Issues auto-fixed vs. manual
- Test coverage changes
- Source: review mode history, test reports

### 3. Efficiency
- Context window usage over time
- Token cost breakdown by mode
- Mode switch frequency and patterns
- Time spent per mode
- Source: statusLine data, mode history

### 4. Learning
- Error patterns detected (from .reins/learnings/)
- Recurring mistakes
- Rules promoted from learnings
- New patterns established
- Source: .reins/learnings/*.jsonl

### 5. Security
- Vulnerabilities found (by severity)
- Security debt introduced vs. resolved
- Dependency health changes
- Source: security mode reports

## Commands

- `/retro session` — Analyze current session
- `/retro project` — Analyze full project history
- `/retro weekly` — Last 7 days summary
- `/retro compare <a> <b>` — Compare two time periods

## Output

Generate a retro report using `templates/outputs/retro.md` format.
Include:
- Metrics table for each category
- What went well (top 3)
- What could improve (top 3)
- Action items for next iteration

## Response Summary

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📌 Summary
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• <key productivity metrics>
• <key quality insights>
• <top action item>

🔜 Next: <implement action items / plan next iteration>
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```
