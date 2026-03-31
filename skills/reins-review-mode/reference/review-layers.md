# Review Mode — Layer Details

## Layer 1: Static Analysis

### Commands by Language

| Language | Command | Fallback |
|----------|---------|----------|
| TypeScript | `npx eslint . --ext .ts,.tsx` | `npx tsc --noEmit` |
| JavaScript | `npx eslint . --ext .js,.jsx` | — |
| Python | `ruff check .` | `flake8 .` |
| Go | `golangci-lint run` | `go vet ./...` |
| Rust | `cargo clippy` | `cargo check` |

### What to Check
- Unused variables and imports
- Unreachable code
- Formatting inconsistencies
- Deprecated API usage

## Layer 2: Test Execution

### Discovery
1. Check `package.json` scripts for `test` command
2. Look for test directories: `tests/`, `__tests__/`, `*_test.*`
3. Run discovered test suite

### Metrics
- Total tests run
- Pass / fail / skip counts
- Coverage percentage (if available)

## Layer 3: Plan Compliance

### Process
1. Load `docs/plans/PLAN-*.md`
2. For each completed Task, verify its Acceptance Criteria
3. Flag criteria that are stated but unverifiable
4. Flag implemented features not in the plan (scope creep)

## Layer 4: AI Code Review

### Focus Areas
- **Logic**: Off-by-one errors, null checks, race conditions
- **Error Handling**: Unhandled exceptions, missing error paths
- **Performance**: N+1 queries, unnecessary allocations, blocking I/O
- **Security**: Input validation, injection vectors, auth checks
- **Clarity**: Confusing naming, overly complex logic, missing context

### Output Format
Each issue:
```
[SEVERITY] file:line — description
  Suggestion: how to fix
```

Severity: Critical > High > Medium > Low

## Layer 5: Architecture Fitness

### Checks
1. **Circular Dependencies**: Use import graph analysis
2. **Layer Violations**: UI → Service → Data (no skipping)
3. **Naming Consistency**: Check against project conventions
4. **File Organization**: Files in correct directories
5. **API Surface**: No accidental exports

## Layer 6: Browser Verification (ui-design pack)

### Prerequisites
- ui-design pack installed and active
- Browser testing tool available (Playwright/Puppeteer)

### Checks
- Visual diff against baseline screenshots
- Responsive breakpoints (mobile, tablet, desktop)
- Interactive elements respond correctly

## Layer 7: Design Verification (ui-design pack)

### Prerequisites
- ui-design pack installed and active

### Checks
- Nielsen's 10 Usability Heuristics scoring
- Anti-pattern detection (from pack's anti-patterns.md)
- WCAG 2.1 AA accessibility audit
- Color contrast ratios
- Focus management
