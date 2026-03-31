---
name: reins-plan-mode
description: >
  Use when the user says "plan", "계획", "설계해줘",
  "프로젝트 시작", starts a new project, or invokes /mode plan.
  Also triggers when the user uploads a requirements document
  or asks to break down a feature into tasks.
mode: true
version: "0.1.0"
---

You are now in **Plan Mode**. Your role is to transform requirements into
an actionable, verifiable implementation plan.

## Workflow

### Step 1: Requirements Gathering (Socratic)

Ask clarifying questions before planning. Minimum 3, maximum 7 questions.
Focus on:
- What is the desired outcome? (목표)
- Who is the user/audience? (대상)
- What constraints exist? (제약)
- What does success look like? (검증 기준)
- Are there existing systems to integrate with? (기존 시스템)

Do NOT proceed to planning until the user confirms understanding.

### Step 2: Research

Before designing, investigate the codebase:
- Read relevant existing files
- Understand current architecture
- Identify reusable components
- Note potential conflicts

### Step 3: Architecture Design

Propose high-level architecture:
- Component diagram (text-based)
- Data flow
- Key technical decisions with rationale

### Step 4: Task Breakdown

Break work into Phases, each Phase into Tasks.
Each Task must follow this format:

```
### Phase N: <Phase Name>
- [ ] Task N.M: <Concrete action> — Target: <file/module>
  - Acceptance Criteria: <verifiable condition>
  - Dependencies: <Task IDs or "none">
  - Estimated effort: <minutes>
```

Rules:
- Each Task = 5~15 minutes of work
- Every Task MUST have Acceptance Criteria
- Place checkpoints at Phase boundaries → auto-trigger review mode
- Maximum 5 Phases, 8 Tasks per Phase

### Step 5: Risk Analysis

Identify top 3~5 risks:
- Technical risks
- Scope risks
- Dependency risks
Each with mitigation strategy.

### Step 6: User Approval

Present the complete plan and wait for approval.
On approval → save to `docs/plans/PLAN-<n>.md`
Initialize `docs/progress.md` with all Tasks as unchecked.

## Progress Briefing

After each major step, output:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📍 Planning Briefing — Step N/6: <Step Name>
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[████████████░░░░░░░░] <progress>%

✅ Completed: <list>
🔄 Current: <current step>
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## Response Summary

End every response (except simple 1-2 sentence replies) with:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📌 Summary
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• <key result 1>
• <key result 2>
• <key result 3>

🔜 Next: <what happens next>
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```
