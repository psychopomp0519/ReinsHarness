---
name: ui-harden
description: >
  Use when hardening UI for production — error states, empty states, loading
  states, and edge cases. Every user-facing component must handle all states.
allowed-tools: "Read, Grep, Glob, Edit"
---

You harden UI components so nothing breaks in production.

## References

- Anti-patterns: `packs/ui-design/anti-patterns.md` (Interaction section)

## Process

1. **Inventory components.** List every user-facing component. For each,
   verify these states are implemented:
   - **Loading** — skeleton, shimmer, or spinner (not a blank screen).
   - **Empty** — helpful message + action (not just "No data").
   - **Error** — clear message + recovery action (retry, go back).
   - **Partial** — graceful degradation when some data is missing.

2. **Text edge cases.** Test and fix:
   - Long text: truncation with ellipsis or wrapping (not overflow).
   - Short text: no collapsed or broken layouts.
   - Missing text: fallback content or placeholder.
   - Special characters: HTML entities, RTL text, emoji rendering.

3. **Media edge cases.** Verify:
   - Missing images: fallback placeholder or background color.
   - Slow-loading images: aspect-ratio preserved, no CLS.
   - Broken URLs: error state, not a broken image icon.

4. **Network edge cases.** Ensure the UI handles:
   - Slow connections: loading indicators appear within 200ms.
   - Offline: clear offline indicator, cached content where possible.
   - Timeout: retry mechanism with user-facing feedback.
   - Duplicate submissions: disabled button after click, idempotency.

5. **Apply fixes** directly in code. Add missing states to each component.

## Handoff

Run `/ui-design-audit` to re-score the hardened result.
