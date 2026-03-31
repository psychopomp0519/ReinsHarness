---
name: ui-context-gather
description: >
  Use when starting any UI design, audit, or critique task to gather brand,
  audience, and design-intent context before producing feedback. Saves the
  gathered context to a project file for reuse by other skills.
allowed-tools: "Read, Write"
---

You gather UI/UX context before any design work begins. This skill is a
prerequisite for `ui-design-audit` and other critique skills — design feedback
without context produces generic advice.

## Process

1. **Check for existing context.** Look for `.reins/ui-context.md` or
   `.impeccable.md` in the project root. If found, read it and confirm with
   the user whether it is still current. If current, skip to step 4.

2. **Gather context.** Ask the user for the following (skip any already known):

   - **Brand identity** — Name, brand colors, type choices, tone of voice,
     existing style guide or design system URL.
   - **Target audience** — Who uses this product? Demographics, technical
     sophistication, accessibility needs.
   - **Design intent** — What feeling or impression should the UI convey?
     (e.g., trustworthy, playful, minimal, data-dense)
   - **Platform and constraints** — Web, native, responsive requirements,
     supported browsers/devices, performance budgets.
   - **Competitive context** — Key competitors or reference products the
     design should differentiate from or align with.

3. **Save context.** Write the gathered information to `.reins/ui-context.md`
   using the template below.

4. **Confirm.** Summarize the context back to the user and confirm before
   proceeding to the next skill.

## Context File Template

```markdown
# UI Context

## Brand
- **Name:** {name}
- **Colors:** {primary, secondary, accent}
- **Typography:** {font families and rationale}
- **Tone:** {e.g., professional, friendly, technical}
- **Style guide:** {URL or "none"}

## Audience
- **Primary users:** {description}
- **Technical level:** {novice / intermediate / expert}
- **Accessibility notes:** {any specific needs}

## Design Intent
- **Desired impression:** {keywords}
- **Reference products:** {list}
- **Anti-goals:** {what the design should NOT feel like}

## Constraints
- **Platform:** {web / iOS / Android / cross-platform}
- **Browsers:** {support targets}
- **Performance budget:** {LCP, CLS targets if known}
- **Breakpoints:** {list if defined}
```
