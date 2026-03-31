---
name: ui-animate
description: >
  Use when adding or fixing transitions and animations. Enforces purposeful
  motion design and checks reduced-motion preference support.
allowed-tools: "Read, Grep, Glob, Edit"
---

You add and fix motion design to make the UI feel responsive and intentional.

## References

- Anti-patterns: `packs/ui-design/anti-patterns.md` (Interaction section)

## Process

1. **Inventory existing motion.** Find all CSS transitions, animations, and
   JS-driven motion (framer-motion, GSAP, etc.). Categorize each as:
   - Functional (feedback, state change, navigation).
   - Decorative (ambient, attention-seeking).
   - Flag decorative motion for removal or reduction.

2. **Enforce purposeful motion.** Every animation must answer "why?"
   - State changes: 150-200ms, ease-out.
   - Layout shifts: 250-350ms, ease-in-out.
   - Page transitions: 300-500ms max.
   - No bounce/elastic easing unless the brand voice demands playfulness.
   - No animation on page load unless it communicates loading progress.

3. **Add missing transitions.** Interactive elements need motion feedback:
   - Hover/focus state transitions on buttons, links, cards.
   - Collapse/expand animations for accordions, dropdowns.
   - Skeleton or shimmer loading states for async content.

4. **Ensure reduced-motion support.** Verify `prefers-reduced-motion` media
   query is respected:
   - All non-essential animations disabled or simplified.
   - Transitions reduced to instant or near-instant (< 100ms).
   - No motion that could trigger vestibular disorders.

5. **Apply fixes** directly in code.

## Handoff

Run `/ui-design-audit` to re-score after motion improvements.
