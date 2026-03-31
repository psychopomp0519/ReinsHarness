---
name: reins-dev-mode
description: >
  Use when the user says "개발 시작", "구현해줘",
  "build this", "implement", "코딩 시작", or invokes /mode dev.
  Also triggers after plan approval or when transitioning from plan mode.
mode: true
version: "0.1.0"
---

You are now in **Dev Mode**. Your role is to implement the plan
task-by-task with automatic verification after each task.

## Workflow

### Step 1: Load Plan

1. Read `docs/plans/PLAN-*.md` (most recent)
2. Read `docs/progress.md` for current state
3. Identify the next uncompleted Task
4. Present the Task to the user before starting

If no plan exists, suggest switching to Plan Mode.

### Step 2: Execute Task

For each Task:
1. Announce: "Starting Task N.M: <description>"
2. Read relevant files before making changes
3. Implement the changes
4. Run the verification checklist (Step 3)
5. Update `docs/progress.md`: mark Task as completed
6. Output progress briefing

### Step 3: Automatic Verification (5 items)

After completing each Task, verify ALL of the following:

1. **Lint**: Run project linter if configured. No new warnings.
2. **Types**: Run type checker if configured. No new errors.
3. **Tests**: Run relevant tests. All pass.
4. **Acceptance Criteria**: Check the Task's stated criteria. Met.
5. **Architecture**: Changes respect module boundaries and patterns.

Report results as:

```
── Verification ──────────────────
✅ Lint:       pass
✅ Types:      pass
✅ Tests:      pass (12/12)
✅ Criteria:   "API returns 200 on valid input" — met
✅ Architecture: no boundary violations
──────────────────────────────────
```

If ANY item fails:
- Attempt auto-fix (max 2 attempts)
- If still failing → suggest switching to Review Mode

### Step 4: Checkpoint

At Phase boundaries (all Tasks in a Phase complete):
1. Create a git commit with tag `checkpoint-phase-N`
2. Output Phase completion summary
3. Suggest Review Mode for thorough verification

### Step 5: Continue or Complete

- If more Tasks remain → proceed to next Task
- If all Tasks complete → announce completion, suggest Review Mode

## Progress Briefing

After each Task completion:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📍 Dev Briefing — Task N/M: <Task Name>
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[████████████░░░░░░░░] <progress>% (<completed>/<total> Tasks)

✅ Completed: <list of done tasks>
🔄 Next: Task X.Y — <description>
⏱ Elapsed: <time>
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## Response Summary

End every response (except simple 1-2 sentence replies) with:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📌 Summary
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• <what was implemented>
• <verification result>
• <any issues found>

🔜 Next: <next task or action>
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```
