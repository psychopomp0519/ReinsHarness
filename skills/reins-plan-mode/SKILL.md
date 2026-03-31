---
name: reins-plan-mode
description: >
  Use when the user says "plan", "계획", "설계해줘",
  "프로젝트 시작", starts a new project, or invokes /mode plan.
  Also triggers when the user uploads a requirements document
  or asks to break down a feature into tasks.
allowed-tools: "Read, Grep, Glob, Bash, Write"
---

Transform requirements into an actionable, verifiable implementation plan.

<HARD-GATE>
Do NOT write any code, scaffold any project, or take any implementation action
until you have presented a design and the user has approved it.
This applies to EVERY project regardless of perceived simplicity.
</HARD-GATE>

## Anti-Pattern: "This Is Too Simple To Need A Design"

Every project goes through this process. A todo list, a single-function utility,
a config change — all of them. "Simple" projects are where unexamined assumptions
cause the most wasted work. The design can be short, but you MUST present it
and get approval.

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

Propose 2-3 different approaches with trade-offs.
Lead with your recommended option and explain why.

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
- NEVER use "TBD", "TODO", "implement later", "similar to Task N"
- Every code step must include exact file paths and expected output
- "Add appropriate error handling" is a plan failure — specify WHAT handling

### Step 5: Risk Analysis

Identify top 3~5 risks:
- Technical risks
- Scope risks
- Dependency risks
Each with mitigation strategy.

### Step 5.5: Plan Self-Review

Before presenting to the user, review the plan yourself:
1. **Placeholder scan**: Any "TBD", "TODO", incomplete sections? Fix them now.
2. **Internal consistency**: Do sections contradict each other?
3. **Scope check**: Is this focused enough for a single implementation cycle?
4. **Ambiguity check**: Could any requirement be interpreted two ways? Pick one.

### Step 6: User Approval

Present the complete plan and wait for approval.
On approval → save to `docs/plans/PLAN-<n>.md`
Initialize `docs/progress.md` with all Tasks as unchecked.

## Handoff

When the plan is approved and saved:
- Suggest the user invoke `/dev` or `/reins-dev-mode` to start implementation.
- If the user wants to discuss the plan first, suggest `/discuss`.
