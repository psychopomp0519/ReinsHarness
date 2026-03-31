---
description: "Delegate a coding task to Codex CLI"
argument-hint: "<task-description>"
allowed-tools: "Read, Grep, Glob, Bash, Write"
---

Delegate a task to Codex for independent implementation.

Steps:
1. Parse the task description from the argument
2. Gather necessary context (relevant files, constraints)
3. Submit as a background job to Codex
4. Report job ID for status tracking
