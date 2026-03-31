---
name: codex-rescue
description: >
  Use when the user says "codex rescue", "코덱스 위임",
  "/codex rescue", or wants to delegate a coding task to Codex.
  Triggers when a task is stuck or needs a second implementation attempt.
allowed-tools: "Read, Grep, Glob, Bash, Write"
---

You delegate coding tasks to Codex CLI for independent implementation.

## Process

1. Prepare task description from the current plan/context
2. Define the scope: which files, what constraints
3. Send task to Codex via the app-server bridge
4. Monitor progress via job tracking
5. When complete, review Codex's output
6. Integrate changes if approved, or compare approaches

## Use Cases

- **Stuck task**: Claude is struggling → delegate to Codex for a fresh approach
- **Parallel work**: Send independent subtask to Codex while Claude continues
- **Comparison**: Both implement the same task, compare results

## Commands

- `/codex rescue <task-description>` — Delegate task
- `/codex status` — Check running task status
- `/codex result` — Get completed task output
- `/codex cancel` — Cancel running task
