---
name: reins-cleanup-mode
description: >
  Use when the user says "정리", "cleanup", "clean up",
  "코드 정리", "리팩토링", or invokes /mode cleanup.
  Also triggers when code quality metrics degrade or after
  major feature completions.
allowed-tools: "Read, Grep, Glob, Bash, Edit"
---

Reduce codebase entropy through systematic scanning and targeted fixes.

## Entropy Categories (7 items)

### 1. Code Duplication
- Detect similar code blocks (>10 lines, >80% similarity)
- Suggest extraction into shared functions/modules

### 2. Dead Code
- Unused exports, functions, variables, imports
- Unreachable code paths
- Commented-out code blocks (>5 lines)

### 3. Documentation Drift
- README out of sync with actual behavior
- Stale comments referencing removed code
- API docs not matching implementation

### 4. Naming Violations
- Inconsistent naming conventions (camelCase vs snake_case mix)
- Unclear abbreviations
- Names that don't match their purpose

### 5. Test Coverage Gaps
- Modules with no tests
- Critical paths without edge case tests
- Tests that don't assert anything meaningful

### 6. Dependency Staleness
- Outdated packages with available updates
- Unused dependencies in package.json
- Multiple versions of same dependency

### 7. Style Drift
- Formatting inconsistencies
- Import ordering violations
- File structure deviations from conventions

## Commands

- `/cleanup scan` — Full 7-category scan, report only
- `/cleanup scan --quick` — Top 3 categories only (duplication, dead code, naming)
- `/cleanup fix` — Scan + auto-fix what's safe
- `/cleanup fix --dry-run` — Show what would be fixed
- `/cleanup report` — Generate detailed entropy report

## Workflow

1. Run scan across all 7 categories
2. Report results as severity table:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[Cleanup] Entropy Scan
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
| Category | 이슈 수 | 자동수정 | 수동 |
|----------|---------|---------|------|
| 1 Duplication | 3 | 2 | 1 |
| 2 Dead Code | 5 | 5 | 0 |
| 3 Doc Drift | 2 | 0 | 2 |
| 4 Naming | 4 | 4 | 0 |
| 5 Coverage | 1 | 0 | 1 |
| 6 Deps | 3 | 3 | 0 |
| 7 Style | 2 | 2 | 0 |
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
합계: 20 이슈 (자동수정: 16, 수동: 4)
```

3. Present user selection for manual items:

```
수동 수정 필요 항목:
1. [dup] src/utils.ts:45 — extractData와 유사 함수 병합
2. [docs] README.md — API 섹션 업데이트 필요
3. [docs] src/api.ts:12 — 주석이 삭제된 코드 참조
4. [cover] src/auth.ts — 인증 플로우 테스트 없음

수정할 항목: 번호(1,2,3), all, 또는 none
```

4. Auto-fix selected items with progress counter:

```
- [1/16] [dead] src/old-handler.ts — 미사용 함수 제거
- [2/16] [naming] src/api.ts:getDATA → getData
```

5. Show before/after summary

## Safety Rules

- Never auto-fix code with unclear intent
- Never remove code that might be intentionally commented out for debugging
- Always verify test suite passes after fixes
- Create a checkpoint before batch fixes

## Handoff

When cleanup is done, suggest `/review` to verify changes.
