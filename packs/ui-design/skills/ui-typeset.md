---
name: ui-typeset
description: >
  Use when typography needs audit and fixes — type scale, line-height, measure,
  font pairing, and hierarchy. Detects default-font laziness and missing
  typographic intent.
allowed-tools: "Read, Grep, Glob, Edit"
---

You fix typography to establish clear hierarchy and readability.

## References

- Anti-patterns: `packs/ui-design/anti-patterns.md` (Typography section)

## Process

1. **Audit the type scale.** Extract all font-size declarations. Verify they
   follow a consistent scale (e.g., Major Third 1.25, Perfect Fourth 1.333).
   Flag arbitrary sizes that break the scale.

2. **Check readability fundamentals.**
   - Line-height: 1.4-1.6 for body text, 1.1-1.3 for headings.
   - Measure (line length): 45-75 characters for body text.
   - No text smaller than 12px / 0.75rem.
   - Sufficient contrast between heading levels (size, weight, or color).

3. **Evaluate font choices.** Flag default-font laziness:
   - Inter, Roboto, Arial, Open Sans used without typographic rationale.
   - More than 2 font families (3 max with a monospace for code).
   - Font pairing that lacks contrast (e.g., two geometric sans-serifs).

4. **Fix hierarchy.** Ensure a clear visual order:
   - Each heading level is visually distinct from its neighbors.
   - Body, caption, and label sizes are clearly differentiated.
   - Font weight is used intentionally (not just bold/normal toggle).

5. **Apply fixes** directly in code. Consolidate into type scale tokens.

## Handoff

Run `/ui-design-audit` to re-score typography improvements.
