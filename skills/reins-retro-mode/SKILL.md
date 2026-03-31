---
name: reins-retro-mode
description: >
  Use when the user says "회고", "retro", "retrospective",
  "성과 분석", "돌아보기", or invokes /mode retro.
  Also triggers at project milestones or sprint boundaries.
allowed-tools: "Read, Grep, Glob, Bash"
---

Analyze performance and extract actionable insights.

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
- `/retro <N>d` — Analyze last N days (e.g., `/retro 7d`, `/retro 14d`, `/retro 30d`)
- `/retro <N>h` — Analyze last N hours (e.g., `/retro 24h`)

## Time-Windowed Analysis

When a time argument is provided (e.g., `7d`, `24h`):
1. Parse the number and unit (d=days, h=hours)
2. For days: align to midnight — use `git log --since="<N> days ago 00:00"`
3. For hours: use `git log --since="<N> hours ago"`
4. Apply the same 5-category analysis to the filtered git log

## Persistent Retro History

Save each retro as a snapshot to `.reins/retros/retro-<YYYY-MM-DD>.json` containing:
- Date, time window, all computed metrics, top insights, action items

## Trend Comparison

When a previous retro snapshot exists:
1. Load the most recent `.reins/retros/retro-*.json`
2. Compare metrics and show deltas with directional arrows:
   - ↑ improved, ↓ regressed, → unchanged
3. Display as a Before/After table:

```
| Metric            | Previous | Current | Δ   |
|-------------------|----------|---------|-----|
| Commits           | 12       | 18      | ↑ +6 |
| Net LOC           | +340     | +280    | ↓ -60 |
| Focus score       | 72%      | 85%     | ↑ +13% |
```

## Work Session Detection

Identify coding sessions from commit timestamps:
- **Gap threshold**: 45 minutes between commits = new session boundary
- Categorize each session:
  - **deep**: 50+ minutes duration
  - **medium**: 20-50 minutes duration
  - **micro**: <20 minutes duration
- Report: session count, avg duration, category breakdown

## Focus Score

Calculate as: `% of commits in the most-changed directory`
- High focus (>70%): deep, concentrated work
- Medium focus (40-70%): moderate context switching
- Low focus (<40%): scattered across many areas

## Output

Generate a retro report using `templates/outputs/retro.md` format.
Include:
- Metrics table for each category
- Session analysis (count, types, avg duration)
- Focus score with interpretation
- Trend comparison (if previous snapshot exists)
- What went well (top 3)
- What could improve (top 3)
- Action items for next iteration

## Handoff

When retrospective is complete, suggest `/plan` for next iteration.
