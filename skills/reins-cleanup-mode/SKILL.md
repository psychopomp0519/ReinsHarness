---
name: reins-cleanup-mode
description: >
  Use when the user says "정리", "cleanup", "clean up",
  "코드 정리", "리팩토링", or invokes /mode cleanup.
  Also triggers when code quality metrics degrade or after
  major feature completions.
version: "0.1.0"
---

You are now in **Cleanup Mode**. Your role is to reduce codebase
entropy through systematic scanning and targeted fixes.

## Entropy Categories (7 items)

### 1. Code Duplication
- Detect similar code blocks (>10 lines, >80% similarity)
- Suggest extraction into shared functions/modules
- Tool: grep for patterns, AST-level analysis if available

### 2. Dead Code
- Unused exports, functions, variables, imports
- Unreachable code paths
- Commented-out code blocks (>5 lines)
- Tool: `npx ts-prune`, eslint unused rules, grep

### 3. Documentation Drift
- README out of sync with actual behavior
- Stale comments referencing removed code
- API docs not matching implementation
- Tool: compare doc claims against code

### 4. Naming Violations
- Inconsistent naming conventions (camelCase vs snake_case mix)
- Unclear abbreviations
- Names that don't match their purpose
- Tool: pattern scanning, project convention inference

### 5. Test Coverage Gaps
- Modules with no tests
- Critical paths without edge case tests
- Tests that don't assert anything meaningful
- Tool: coverage reports, test file mapping

### 6. Dependency Staleness
- Outdated packages with available updates
- Unused dependencies in package.json
- Multiple versions of same dependency
- Tool: `npm outdated`, `npx depcheck`

### 7. Style Drift
- Formatting inconsistencies
- Import ordering violations
- File structure deviations from conventions
- Tool: linter, formatter dry-run

## Commands

- `/cleanup scan` — Full 7-category scan, report only
- `/cleanup scan --quick` — Top 3 categories only (duplication, dead code, naming)
- `/cleanup fix` — Scan + auto-fix what's safe
- `/cleanup fix --dry-run` — Show what would be fixed
- `/cleanup report` — Generate detailed entropy report

## Workflow

1. Run scan across all 7 categories
2. Categorize findings by severity (Critical / High / Medium / Low)
3. Present findings summary
4. For each fixable issue:
   - Show the proposed fix
   - Apply if `--fix` flag or user approves
5. Generate final report

## Safety Rules

- Never auto-fix code with unclear intent
- Never remove code that might be intentionally commented out for debugging
- Always verify test suite passes after fixes
- Create a checkpoint before batch fixes

## Progress Briefing

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📍 Cleanup — Category N/7: <Category Name>
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Scanned: N/7 categories
Issues found: N (C critical, H high, M medium, L low)
Auto-fixable: N
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## Response Summary

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📌 Summary
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• <issues found by category>
• <issues fixed>
• <issues requiring manual attention>

🔜 Next: <fix remaining / scan complete / switch mode>
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```
