---
name: reins-convert-plan
description: >
  Use when the user uploads a planning document,
  says "이 계획서 변환해줘", "convert this plan", "PRD를 Reins 형식으로",
  or provides a requirements file to be restructured.
allowed-tools: "Read, Bash, Write, Edit"
---

Convert external planning documents into Reins plan format.

## Commands

- `/convert-plan <filepath>` — Convert file to Reins plan
- `/convert-plan --preview <filepath>` — Preview without saving
- `/convert-plan --interactive` — Step-by-step conversion with confirmations

## Workflow

### Step 1: Parse Input

Read the source file and detect its format:
- `.md` — Parse markdown structure directly
- `.txt` — Infer structure from content
- `.docx` — Extract text (requires pandoc or similar)
- `.pdf` — Extract text (requires pdftotext)

### Step 2: Extract Elements

From the source document, extract:
- **Project overview**: What is being built?
- **Requirements**: Functional and non-functional
- **Tech stack**: Explicitly stated or inferred
- **Milestones**: Timeline or phase structure
- **Constraints**: Budget, time, technical limitations
- **References**: External docs, APIs, designs

### Step 3: Convert to Reins Format

Transform extracted elements into:
- Phase/Task breakdown (5~15 min per Task)
- Acceptance Criteria for each Task (auto-generated)
- Dependency graph between Tasks
- Checkpoints at Phase boundaries
- Risk analysis (from constraints + inferred risks)

### Step 4: User Review

Present the converted plan. Ask for:
- Correctness of interpretation
- Missing requirements
- Priority adjustments
- Phase ordering changes

### Step 5: Save

On approval, save to `docs/plans/PLAN-<n>.md`
Initialize `docs/progress.md`

## Output Format

The converted plan includes a "Changes from Original" section:

```markdown
## Original vs. Converted

| Change | Reason |
|--------|--------|
| Added acceptance criteria | Original had none — auto-generated |
| Split "Backend" into 3 phases | Original phase too large (>8 tasks) |
| Added risk: API rate limiting | Inferred from external API dependency |
```
