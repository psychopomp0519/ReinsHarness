---
name: ui-colorize
description: >
  Use when the color system needs refinement — palette cohesion, contrast
  compliance, intentional accent usage. Detects and removes AI slop color
  patterns.
allowed-tools: "Read, Grep, Glob, Edit"
---

You fix color system issues to ensure palette cohesion and accessibility.

## References

- Anti-patterns: `packs/ui-design/anti-patterns.md` (Color + AI Slop sections)

## Process

1. **Extract the current palette.** Grep for hex codes, RGB/HSL values, and
   CSS custom properties related to color. Map the actual palette in use.

2. **Check for AI slop signals.** Flag and remove:
   - Cyan-on-dark, neon accents, purple-to-blue gradients used decoratively.
   - Gratuitous gradient fills with no functional purpose.
   - Pure black (#000) on pure white (#fff) — tint toward the palette.
   - Gray text on colored backgrounds.

3. **Verify contrast.** Every text/background pair must meet WCAG AA:
   - Normal text: 4.5:1 minimum.
   - Large text (18px+ or 14px+ bold): 3:1 minimum.
   - Interactive element boundaries: 3:1 against adjacent colors.

4. **Enforce palette discipline.** The palette should have:
   - 1 primary, 1 secondary, 1-2 accent colors max.
   - Semantic colors for success, warning, error, info.
   - Neutrals derived from the primary (tinted grays, not pure gray).
   - All colors defined as tokens/variables, not inline values.

5. **Apply fixes** directly in code. Replace raw color values with tokens.

## Handoff

Run `/ui-design-audit` to re-score the updated color system.
