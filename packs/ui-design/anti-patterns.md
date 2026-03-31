# UI Design Anti-Patterns

## AI Slop

Patterns that signal generic, AI-generated design. Avoid these aggressively.

- ❌ Cyan-on-dark, purple-to-blue gradients, neon accents on dark backgrounds
- ❌ Gradient text on headings or metrics
- ❌ Glassmorphism used decoratively (blur backgrounds, glow borders without functional purpose)
- ❌ Hero metric layout: big number + small label + gradient card — the "dashboard starter kit" look
- ❌ Identical card grids with no visual hierarchy; nested cards; cards wrapping everything
- ❌ Defaulting to Inter, Roboto, Arial, or Open Sans without typographic rationale
- ❌ Gray text on colored backgrounds; pure black/white without tinting toward the palette
- ❌ Bounce/elastic easing on every animation — prefer ease-out or spring with intent
- ❌ Dark mode as the default lazy choice (choose the mode that fits the product's context)
- ❌ Rounded rectangles with generic drop shadows as the only shape language
- ❌ Sparklines used as decoration rather than conveying real data

## Layout

- ❌ Fixed pixel widths on containers (use responsive units)
- ❌ Horizontal scroll on mobile
- ❌ Z-index warfare (>10 z-index layers)
- ❌ Magic numbers in spacing (use design tokens)
- ❌ Identical card grids with no size/emphasis variation
- ❌ Content buried inside nested card shells

## Typography

- ❌ More than 3 font families
- ❌ Text smaller than 12px / 0.75rem
- ❌ Line length > 80 characters
- ❌ Insufficient line-height (< 1.4)
- ❌ Gradient text on headings or key metrics
- ❌ Choosing a typeface by popularity rather than voice (Inter/Roboto/Open Sans as unexamined defaults)

## Color

- ❌ Color as sole indicator (red = error without icon/text)
- ❌ Contrast ratio < 4.5:1 (normal text)
- ❌ More than 5 brand colors
- ❌ Pure black (#000) on pure white (#fff) — causes eye strain; tint toward the palette
- ❌ Gray text on colored or gradient backgrounds
- ❌ Cyan/neon accent palette on dark backgrounds (AI slop signal)
- ❌ Purple-to-blue gradients as default decorative fills

## Interaction

- ❌ Click targets < 44x44px on touch devices
- ❌ No loading state for async operations
- ❌ No error state handling
- ❌ Disabled buttons without explanation
- ❌ Form submit without validation feedback
- ❌ Bounce/elastic easing on every transition — use purposeful motion

## Performance

- ❌ Unoptimized images (>500KB)
- ❌ Layout shifts during load (CLS > 0.1)
- ❌ Blocking JavaScript in <head>
- ❌ No lazy loading for below-fold content

## Accessibility

- ❌ Missing alt text on meaningful images
- ❌ No focus indicators
- ❌ Auto-playing media without pause control
- ❌ CAPTCHA without audio alternative
- ❌ Glassmorphism blur reducing text legibility for low-vision users

## UX Writing

- ❌ "Click here" or "Read more" as link text (non-descriptive, inaccessible)
- ❌ Vague error messages ("Something went wrong") without cause or recovery action
- ❌ Inconsistent terminology (mixing "delete"/"remove", "save"/"submit" arbitrarily)
- ❌ Technical jargon in user-facing messages (error codes, stack traces, field names)
- ❌ Wall-of-text instructions instead of progressive inline guidance
- ❌ Placeholder text as the only label (disappears on input, fails accessibility)
- ❌ Confirmation dialogs with "OK / Cancel" instead of verb-based actions ("Delete / Keep")

## Progressive Disclosure

- ❌ Everything visible at once — no information hierarchy or layering
- ❌ All form fields shown upfront instead of multi-step or conditional reveal
- ❌ Advanced settings at the same level as primary controls
- ❌ Dense data tables with no expand/collapse or detail-on-demand
- ❌ Tooltips containing critical information that should be visible by default
- ❌ No visual distinction between primary, secondary, and tertiary actions

## Modals

- ❌ Modal used for non-critical information that could be inline or a toast
- ❌ Nested modals (modal opening another modal)
- ❌ Modal as primary navigation pattern (modal chains to complete a flow)
- ❌ Modal without a clear dismiss mechanism (no close button, no backdrop click, no Escape key)
- ❌ Full-page modal on desktop that should be a page or panel
- ❌ Modal content requiring scrolling past two viewports
- ❌ Confirmation modal for every action regardless of severity
