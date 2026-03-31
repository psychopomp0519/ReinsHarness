---
name: ui-design-audit
description: >
  Use when the user asks to review, audit, or critique a frontend design,
  UI component, or user interface. Produces a dual score: design heuristics
  plus technical quality.
allowed-tools: "Read, Grep, Glob, Bash"
---

You audit UI/UX design quality using a dual-scoring system.

## References

- Anti-patterns: `packs/ui-design/anti-patterns.md`
- Heuristics scoring rubric: `packs/ui-design/skills/reference/heuristics-scoring.md`
- Cognitive load: `reference/cognitive-load.md`
- Personas: `reference/personas.md`
- Typography: `reference/typography.md`
- Color: `reference/color.md`

## Process

1. Identify the UI components, pages, or flows to audit.
2. **Design Critique (Nielsen /40)** — Score each of the 10 Nielsen heuristics 0-4 using the rubric in `reference/heuristics-scoring.md`.
3. **Technical Audit (/20)** — Score each of the 5 categories below 0-4:
   - **Accessibility** — WCAG 2.1 AA compliance (contrast, semantics, keyboard, ARIA).
   - **Performance** — CLS, LCP, image optimization, lazy loading.
   - **Theming** — Design tokens, dark/light mode support, consistent spacing scale.
   - **Responsive** — Breakpoint coverage, fluid layout, touch targets.
   - **Anti-Patterns** — Check against `anti-patterns.md`; 4 = none found, 0 = pervasive.
4. **Cognitive Load Check** — Review against cognitive-load.md violations. Flag any of the 8 named violations found.
5. **Persona Walkthrough** — Select 2-3 relevant personas from personas.md. Walk through the interface from each perspective. Flag friction points.
6. Tag every finding with a priority:
   - **P0 Critical** — Blocks usability or accessibility; fix before ship.
   - **P1 Major** — Significant UX degradation; fix in current cycle.
   - **P2 Moderate** — Noticeable quality issue; schedule for next cycle.
   - **P3 Minor** — Polish item; address opportunistically.
7. Generate the audit report in the output format below.

## Output Format

### Design Critique — Nielsen Heuristics

| # | Heuristic | Score (0-4) | Findings | Priority |
|---|-----------|-------------|----------|----------|
| H1 | Visibility of system status | | | |
| H2 | Match between system and real world | | | |
| H3 | User control and freedom | | | |
| H4 | Consistency and standards | | | |
| H5 | Error prevention | | | |
| H6 | Recognition rather than recall | | | |
| H7 | Flexibility and efficiency of use | | | |
| H8 | Aesthetic and minimalist design | | | |
| H9 | Help users recognize, diagnose, recover from errors | | | |
| H10 | Help and documentation | | | |

**Design Score: X / 40** — {rating band from rubric}

### Technical Audit

| Category | Score (0-4) | Findings | Priority |
|----------|-------------|----------|----------|
| Accessibility | | | |
| Performance | | | |
| Theming | | | |
| Responsive | | | |
| Anti-Patterns | | | |

**Technical Score: X / 20**

### Summary

**Combined Score: X / 60**

- P0 issues: (count and list)
- P1 issues: (count and list)
- P2 issues: (count and list)
- P3 issues: (count and list)

**Recommendation:** {Ship / Ship with follow-ups / Fix before ship / Redesign needed}
