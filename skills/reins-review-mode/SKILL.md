---
name: reins-review-mode
description: >
  Use when the user says "검토해줘",
  "리뷰", "review", "check quality", or invokes /mode review.
  Also triggers automatically at plan checkpoints or after
  dev mode task failures.
allowed-tools: "Read, Grep, Glob, Bash"
---

Verify code quality through 7 verification layers, iterating until zero issues remain.

## Verification Layers

### Layer 1: Static Analysis

Run project linters and static analysis tools:
- `npm run lint` / `eslint` / `ruff` / `clippy`
- Check for unused imports, dead code, formatting issues

### Layer 2: Test Execution

Run the full test suite:
- Unit tests
- Integration tests
- Check coverage if configured

### Layer 3: Plan Compliance

Compare implementation against the plan:
- Read `docs/plans/PLAN-*.md`
- Verify each Task's Acceptance Criteria is met
- Flag any deviations from the plan

### Layer 4: AI Code Review

Use the Agent tool to spawn a code review subagent with the prompt: 'Review the following code for logic errors, edge cases, error handling, performance, and clarity.'

### Layer 5: Architecture Fitness

Check structural integrity:
- No circular dependencies
- Layer separation respected
- Consistent naming conventions
- File organization follows project patterns
- Public API surface is intentional

### Layer 6: Browser Verification (conditional)

**Only when ui-design pack is installed and a browser testing tool is available.**
If not available: output "Layer 6: Skipped (ui-design pack not installed or no browser tool)"

When active, use diff-based test plan generation:
1. Run `git diff HEAD` to identify UI-related changes
2. Generate a step-by-step browser test plan targeting changed UI behavior
3. If expect-cli is available: run `npx expect-cli --target unstaged -y`
4. If Playwright MCP is available: execute test steps via Playwright
5. If neither: describe manual verification steps for the user

Each test step should verify:
- Changed components render correctly
- Interactive elements respond to user input
- Responsive breakpoints work (mobile, tablet, desktop)
- No visual regressions in surrounding components

### Layer 7: Design Verification (conditional)

**Only when ui-design pack is installed.**
If not available: output "Layer 7: Skipped (ui-design pack not installed)"

When active:
1. Invoke the `ui-design-audit` skill for Nielsen heuristic scoring (/40) + technical audit (/20)
2. Check against anti-patterns list (especially AI slop patterns)
3. Minimum passing score: 28/40 Nielsen + 14/20 technical
4. Priority issues (P0-P1) must be resolved before passing

## Iteration Protocol

```
Run Layer 1 → Layer 5 (or 7 if packs active)
    ↓
Issues found?
├─ Yes → Fix issues → Restart from Layer 1
│        (max 5 iterations)
└─ No  → Review Passed
```

After each iteration, report:

```
-- Review Iteration N/5 ----------
Layer 1 (Static):       pass
Layer 2 (Tests):        pass (24/24)
Layer 3 (Plan):         1 issue
Layer 4 (AI Review):    pass
Layer 5 (Architecture): pass
Layer 6 (Browser):      skipped
Layer 7 (Design):       skipped
----------------------------------
Issues: 1 remaining → fixing...
```

### Max Iterations Reached

After 5 iterations with issues still present:

```
Review incomplete after 5 iterations.
Remaining issues require user intervention:
1. <issue description>
2. <issue description>

Please address these manually, then run /mode review again.
```

## Handoff

- When all layers pass (review complete): suggest `/dev` to continue next phase, or `/deploy` if all phases done.
- When issues found that need fixing: suggest `/dev` to fix, then re-run `/review`.
- When issues need discussion: suggest `/discuss`.
