# Dev Mode — Verification Checklist

Each item must pass after every Task completion.

## 1. Lint

Run the project's configured linter:
- JavaScript/TypeScript: `npx eslint <changed-files>` or `npm run lint`
- Python: `ruff check <changed-files>` or `flake8`
- Go: `golangci-lint run`
- Rust: `cargo clippy`

**Pass condition**: No new warnings or errors introduced by this Task.

## 2. Type Check

Run the project's type checker:
- TypeScript: `npx tsc --noEmit`
- Python: `mypy <changed-files>` or `pyright`

**Pass condition**: No new type errors.

## 3. Tests

Run tests relevant to the changed code:
- Unit tests for modified modules
- Integration tests if API/interface changed

**Pass condition**: All tests pass. No regressions.

## 4. Acceptance Criteria

Check the specific criteria listed in the Task definition from the plan.
Each criterion must be verifiable — run it, check output, confirm.

**Pass condition**: All stated criteria are met.

## 5. Architecture Constraints

Verify the changes respect:
- Module boundaries (no circular dependencies introduced)
- Layer separation (UI doesn't import from DB directly, etc.)
- Naming conventions of the project
- File organization patterns

**Pass condition**: No architectural violations.

## Failure Protocol

If any item fails:
1. Attempt auto-fix (max 2 tries)
2. If fixed → re-run full checklist
3. If still failing → mark Task as blocked, suggest Review Mode
