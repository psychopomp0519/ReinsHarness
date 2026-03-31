---
name: ui-accessibility-check
description: >
  Checks UI components for WCAG 2.1 AA compliance.
  Use when the user asks about accessibility, a11y,
  or needs to verify inclusive design requirements.
version: "1.0.0"
allowed-tools: "Read, Grep, Glob, Bash"
---

You verify accessibility compliance.

## Checks

### Perceivable
- Alt text on images
- Color contrast ratios (≥ 4.5:1 normal, ≥ 3:1 large text)
- Text resizing support
- Content readable without styles

### Operable
- Keyboard navigation for all interactive elements
- Focus indicators visible
- No keyboard traps
- Skip navigation links

### Understandable
- Form labels associated with inputs
- Error messages descriptive
- Language attribute set
- Consistent navigation

### Robust
- Valid HTML
- ARIA roles used correctly
- Compatible with screen readers

## Output

```
Accessibility Audit:
  Perceivable:   ✅ pass / ⚠️ N issues
  Operable:      ✅ pass / ⚠️ N issues
  Understandable:✅ pass / ⚠️ N issues
  Robust:        ✅ pass / ⚠️ N issues

WCAG 2.1 AA: PASS / FAIL
```
