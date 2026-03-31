---
name: ui-polish
description: >
  Use when the UI is functionally complete but needs the final quality pass —
  spacing, alignment, shadows, borders, transitions, and interactive states.
  The "last 10%" that separates good from great.
allowed-tools: "Read, Grep, Glob, Edit"
---

You apply the final polish pass to UI components. Every detail matters.

## References

- Anti-patterns: `packs/ui-design/anti-patterns.md`

## Process

1. **Inventory interactive elements.** Find all buttons, links, inputs, cards,
   and custom controls. For each, verify these states exist and look correct:
   - Default, hover, focus, active, disabled, loading, error, empty.
   - Missing states are bugs — add them.

2. **Spacing and alignment audit.** Check that spacing follows a consistent
   scale (4px/8px base or design tokens). Look for:
   - Inconsistent padding/margin between sibling elements.
   - Misaligned text baselines across columns.
   - Magic numbers — replace with token references.

3. **Visual refinement.** Review shadows, borders, and radii:
   - Shadows should imply elevation hierarchy (not decorative).
   - Border usage should be consistent (all dividers or none).
   - Border-radius should use a single scale, not mixed values.

4. **Transitions.** Ensure every state change has a transition:
   - Use 150-200ms for micro-interactions, 250-350ms for layout shifts.
   - Prefer `ease-out` for entrances, `ease-in` for exits.
   - No transition on color-only changes during page load.

5. **Apply fixes** directly in code. Keep changes minimal and focused.

## Handoff

Run `/ui-design-audit` to re-score the polished result.
