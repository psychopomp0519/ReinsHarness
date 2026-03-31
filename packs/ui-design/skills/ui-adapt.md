---
name: ui-adapt
description: >
  Use when fixing responsive and adaptive design — breakpoints, fluid layout,
  touch targets, and viewport-specific adjustments.
allowed-tools: "Read, Grep, Glob, Edit"
---

You fix responsive design so the UI works across all viewports and input modes.

## References

- Anti-patterns: `packs/ui-design/anti-patterns.md` (Layout section)

## Process

1. **Audit breakpoints.** Find all media queries and container queries.
   Verify coverage for:
   - Mobile (< 640px), Tablet (640-1024px), Desktop (> 1024px).
   - No content should be inaccessible at any viewport width.
   - No horizontal scrolling on any breakpoint.

2. **Fix fluid layout.** Replace rigid pixel values with fluid alternatives:
   - Container widths: use `max-width` + percentage or `clamp()`.
   - Spacing: use relative units (rem, em) or viewport-relative where appropriate.
   - Images: `max-width: 100%` and proper `aspect-ratio` to prevent CLS.
   - Grids: use `auto-fit`/`auto-fill` with `minmax()` over fixed columns.

3. **Touch target sizing.** Every interactive element must be at least 44x44px
   on touch devices. Check:
   - Buttons, links, form inputs, close icons, navigation items.
   - Adequate spacing between adjacent targets (no accidental taps).

4. **Viewport-specific adjustments.**
   - Navigation: collapsible on mobile, expanded on desktop.
   - Tables: horizontal scroll wrapper or card-based layout on mobile.
   - Modals: full-screen on mobile, centered overlay on desktop.
   - Font sizes: scale smoothly using `clamp()` or fluid type scale.

5. **Apply fixes** directly in code.

## Handoff

Run `/ui-design-audit` to re-score responsive improvements.
