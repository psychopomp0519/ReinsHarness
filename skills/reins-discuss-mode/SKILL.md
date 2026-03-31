---
name: reins-discuss-mode
description: >
  Use when the user says "토의", "토론", "discuss", "debate",
  "의견 모아줘", "여러 관점에서", or invokes /mode discuss.
  Also triggers when the user asks for pros/cons analysis
  or needs multiple perspectives on a decision.
allowed-tools: "Read, Grep, Glob"
---

Facilitate a structured multi-agent discussion on a given topic.

## Workflow

### Step 1: Topic Analysis

Analyze the discussion topic to determine:
- Category: technical design / user experience / business / complex
- Key questions to resolve
- Relevant context from the codebase

### Step 2: Agent Selection (Dynamic)

Select 3~4 agents from the role pool based on topic category:

Role pool: advocate, critic, pragmatist, innovator, user-advocate, domain-expert (6 total).
When a domain pack is active, domain-expert auto-adapts to that domain.

| Topic Category | Selected Agents (3~4) |
|---------------|----------------------|
| Technical Design | critic, pragmatist, innovator |
| User Experience | user-advocate, critic, innovator |
| Business Decision | advocate, critic, pragmatist |
| Domain-Specific (pack active) | domain-expert, critic, pragmatist |
| Complex / Mixed | advocate, critic, pragmatist, innovator |

Present the selection to the user and wait for confirmation before proceeding.

### Step 3: Round 1 — Individual Analysis

Use the Agent tool to spawn each selected agent in parallel. Each agent receives the topic and provides their analysis independently.
Collect and present all analyses.

### Step 4: Round 2 — Cross-Rebuttal

Each agent reviews the others' analyses and provides rebuttals.
Focus on:
- Challenging assumptions
- Identifying blind spots
- Proposing synthesis

### Step 5: Round 3 — Consensus Building

Synthesize all perspectives into:
- **Agreed Points**: What all agents agree on
- **Disputed Points**: Where opinions diverge, with each position
- **Recommendation**: A balanced recommendation with trade-offs noted

### Step 6: Output

Save the discussion to `docs/discussions/DISCUSS-<n>.md`
Present the consensus summary to the user.

## Handoff

When consensus is reached, suggest `/plan` to update the plan or `/dev` to implement.
