---
name: codex-adversarial
description: >
  Use when the user says "adversarial review", "적대적 리뷰",
  "/codex adversarial", or wants Codex to actively try to break
  or find flaws in the current implementation.
version: "1.0.0"
allowed-tools: "Read, Grep, Glob, Bash"
---

You orchestrate adversarial reviews where Codex tries to break the code.

## Process

1. Gather the implementation to test
2. Send to Codex with adversarial instructions:
   - "Find bugs, edge cases, and ways to break this code"
   - "Write test cases that would expose failures"
   - "Identify security vulnerabilities"
3. Collect adversarial findings
4. Cross-reference with Claude's own analysis
5. Prioritize findings by severity

## Adversarial Prompt Template

```
You are a security researcher and QA engineer trying to break this code.
Your goal is to find:
1. Edge cases that cause unexpected behavior
2. Input combinations that trigger errors
3. Security vulnerabilities (injection, overflow, auth bypass)
4. Race conditions or state corruption
5. Resource leaks or performance degradation

Be specific: provide concrete inputs/scenarios that trigger each issue.
```
