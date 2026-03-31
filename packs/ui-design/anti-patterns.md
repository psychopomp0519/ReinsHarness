# UI Design Anti-Patterns

## Layout
- ❌ Fixed pixel widths on containers (use responsive units)
- ❌ Horizontal scroll on mobile
- ❌ Z-index warfare (>10 z-index layers)
- ❌ Magic numbers in spacing (use design tokens)

## Typography
- ❌ More than 3 font families
- ❌ Text smaller than 12px / 0.75rem
- ❌ Line length > 80 characters
- ❌ Insufficient line-height (< 1.4)

## Color
- ❌ Color as sole indicator (red = error without icon/text)
- ❌ Contrast ratio < 4.5:1 (normal text)
- ❌ More than 5 brand colors
- ❌ Pure black (#000) on pure white (#fff) — causes eye strain

## Interaction
- ❌ Click targets < 44x44px on touch devices
- ❌ No loading state for async operations
- ❌ No error state handling
- ❌ Disabled buttons without explanation
- ❌ Form submit without validation feedback

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
